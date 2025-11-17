// FIX: Import React to make the React namespace available for types like React.Dispatch.
import React, { useCallback } from 'react';
import { fileToBase64 } from '../utils/fileUtils';
import { extractTableDataFromImages } from '../services/geminiService';
import { AppAction } from '../state/types';
import { TableRow } from '../types';

export const useOcr = (dispatch: React.Dispatch<AppAction>) => {
  const processImages = useCallback(async (files: File[]) => {
    if (files.length === 0) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { type: 'warning', title: 'No files', message: 'Please select at least one image file to process.' } 
      });
      return;
    }

    dispatch({ type: 'PROCESSING_START' });

    try {
      const promises = files.map(file => 
        fileToBase64(file)
          .then(base64Image => extractTableDataFromImages([base64Image]))
          .then(data => ({ fileName: file.name, data }))
          .catch(error => ({ fileName: file.name, error }))
      );

      const results = await Promise.all(promises);

      const allData: TableRow[] = [];
      const failedFiles: string[] = [];
      
      results.forEach(result => {
        if ('data' in result && result.data && result.data.length > 0) {
          const dataWithSource = result.data.map(row => ({ source_file: result.fileName, ...row }));
          allData.push(...dataWithSource);
        } else if ('error' in result) {
          console.error(`Failed to process ${result.fileName}:`, result.error);
          failedFiles.push(result.fileName);
        }
      });
      
      if (allData.length > 0) {
        // De-duplicate based on all values in a row, ignoring source_file
        const uniqueData = Array.from(new Map(allData.map(row => {
          const { source_file, ...rest } = row;
          return [JSON.stringify(rest), row];
        })).values());

        dispatch({ type: 'PROCESSING_SUCCESS', payload: uniqueData });
        
        if (failedFiles.length > 0) {
          dispatch({ 
            type: 'SET_ERROR', 
            payload: { type: 'warning', title: 'Partial success', message: `Data extracted, but failed to process ${failedFiles.length} file(s): ${failedFiles.join(', ')}.` } 
          });
        }
      } else if (failedFiles.length === files.length) {
        dispatch({
          type: 'PROCESSING_ERROR',
          payload: { type: 'error', title: 'Processing failed', message: 'Failed to process all images. Please try again or check the console for details.' }
        });
      } else {
        dispatch({
          type: 'PROCESSING_ERROR',
          payload: { type: 'info', title: 'No data found', message: 'No structured data could be extracted. The images might not contain recognizable tables, receipts, or notes.' }
        });
      }

    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "An unknown error occurred during processing.";
      dispatch({
        type: 'PROCESSING_ERROR',
        payload: { type: 'error', title: 'Error', message }
      });
    }
  }, [dispatch]);

  return { processImages };
};
// FIX: Import React to make the React namespace available for types like React.Dispatch.
import React, { useCallback } from 'react';
import { fileToBase64 } from '../utils/fileUtils';
import { extractDataFromImage } from '../services/geminiService';
import { AppAction, ProgressLogEntry, TableRow } from '../state/types';

const createLog = (message: string, type: ProgressLogEntry['type'] = 'info'): ProgressLogEntry => ({
  time: new Date().toLocaleTimeString(),
  message,
  type,
});

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

    const allData: TableRow[] = [];
    let processingError = null;

    for (const file of files) {
      try {
        dispatch({ type: 'ADD_PROGRESS_LOG', payload: createLog(`Starting to process "${file.name}"...`) });
        dispatch({ type: 'SET_FILE_STATUS', payload: { fileName: file.name, status: 'processing' } });

        dispatch({ type: 'ADD_PROGRESS_LOG', payload: createLog(`Converting "${file.name}" to base64...`) });
        const base64Image = await fileToBase64(file);
        
        dispatch({ type: 'ADD_PROGRESS_LOG', payload: createLog(`Sending "${file.name}" to Gemini API for data extraction...`) });
        const data = await extractDataFromImage(base64Image);
        
        if (data && data.length > 0) {
          const dataWithSource = data.map(row => ({ source_file: file.name, ...row }));
          allData.push(...dataWithSource);
          dispatch({ type: 'ADD_PROGRESS_LOG', payload: createLog(`Successfully extracted ${data.length} row(s) from "${file.name}".`, 'success') });
          dispatch({ type: 'SET_FILE_STATUS', payload: { fileName: file.name, status: 'success' } });
        } else {
          dispatch({ type: 'ADD_PROGRESS_LOG', payload: createLog(`No structured data found in "${file.name}".`, 'warning') });
          dispatch({ type: 'SET_FILE_STATUS', payload: { fileName: file.name, status: 'success' } }); // Success, but no data
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        console.error(`Failed to process ${file.name}:`, err);
        dispatch({ type: 'ADD_PROGRESS_LOG', payload: createLog(`Error processing "${file.name}": ${message}`, 'error') });
        dispatch({ type: 'SET_FILE_STATUS', payload: { fileName: file.name, status: 'error' } });
        if (!processingError) { // Keep the first error to show to the user
          processingError = err;
        }
      }
    }
    
    // After processing all files
    if (allData.length > 0) {
      const uniqueData = Array.from(new Map(allData.map(row => {
        const { source_file, ...rest } = row;
        return [JSON.stringify(rest), row];
      })).values());
      
      dispatch({ type: 'ADD_PROGRESS_LOG', payload: createLog(`De-duplication complete. Found ${uniqueData.length} unique rows.`, 'success') });
      dispatch({ type: 'PROCESSING_SUCCESS', payload: uniqueData });

    } else if (processingError) {
      const message = processingError instanceof Error ? processingError.message : "An unknown error occurred.";
       dispatch({
          type: 'PROCESSING_ERROR',
          payload: { type: 'error', title: 'Processing Failed', message: `Could not extract data from any files. Last error: ${message}` }
       });
    } else {
      dispatch({
        type: 'PROCESSING_ERROR',
        payload: { type: 'info', title: 'No Data Extracted', message: 'Finished processing, but no structured data could be extracted from the selected files.' }
      });
    }

  }, [dispatch]);

  return { processImages };
};
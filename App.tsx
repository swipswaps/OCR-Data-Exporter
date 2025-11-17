import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { ExportControls } from './components/ExportControls';
import { Loader } from './components/Loader';
import { extractTableDataFromImages } from './services/geminiService';
import { TableRow } from './types';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
  const [extractedData, setExtractedData] = useState<TableRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleProcessImages = useCallback(async () => {
    if (files.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedData([]);
    setHeaders([]);

    try {
      const allData: TableRow[] = [];
      const failedFiles: string[] = [];

      // Process files one by one for better error handling and resilience
      for (const file of files) {
        try {
          const base64Image = await fileToBase64(file);
          const data = await extractTableDataFromImages([base64Image]);
          
          if (data && data.length > 0) {
            // Add source file name to each row for context
            const dataWithSource = data.map(row => ({ source_file: file.name, ...row }));
            allData.push(...dataWithSource);
          }
        } catch (innerErr) {
          console.error(`Failed to process ${file.name}:`, innerErr);
          failedFiles.push(file.name);
        }
      }
      
      if (allData.length > 0) {
        // Create a union of all keys from all extracted objects to form the table headers
        const allKeys = [...new Set(allData.flatMap(obj => Object.keys(obj)))];
        setHeaders(allKeys);
        setExtractedData(allData);
      }

      // Set appropriate status/error message based on the outcome
      if (allData.length === 0 && failedFiles.length === files.length) {
        setError("Error: Failed to process all images. The API call may have failed for each image.");
      } else if (allData.length === 0) {
        setError("Info: Could not extract any structured data. Please try again with clearer images or different documents like receipts and notes.");
      } else if (failedFiles.length > 0) {
        setError(`Warning: Successfully extracted data from some images, but failed to process: ${failedFiles.join(', ')}.`);
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? `Error: ${err.message}` : "An unknown error occurred during processing.");
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  const handleReset = () => {
    setFiles([]);
    setExtractedData([]);
    setHeaders([]);
    setError(null);
    setIsLoading(false);
  }

  const getErrorAppearance = () => {
    if (!error) return {};
    if (error.startsWith('Error:')) {
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        border: 'border-red-400 dark:border-red-600',
        text: 'text-red-700 dark:text-red-300',
        title: 'Error'
      };
    }
    if (error.startsWith('Warning:')) {
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        border: 'border-yellow-400 dark:border-yellow-600',
        text: 'text-yellow-700 dark:text-yellow-300',
        title: 'Warning'
      };
    }
     return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-400 dark:border-blue-600',
        text: 'text-blue-700 dark:text-blue-300',
        title: 'Info'
      };
  }
  const errorAppearance = getErrorAppearance();

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3">Document Data Extractor</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Upload images of tables, receipts, or notes to instantly convert them into structured data.
            </p>
          </div>

          {!isLoading && extractedData.length === 0 && (
            <FileUpload 
              onFilesSelected={setFiles} 
              onProcess={handleProcessImages}
              isProcessing={isLoading}
              files={files}
            />
          )}

          {isLoading && <Loader />}

          {error && !isLoading && (
            <div className={`${errorAppearance.bg} ${errorAppearance.border} ${errorAppearance.text} px-4 py-3 rounded-lg relative my-6 text-center`} role="alert">
              <strong className="font-bold">{errorAppearance.title}: </strong>
              <span className="block sm:inline">{error.substring(error.indexOf(':') + 1).trim()}</span>
            </div>
          )}

          {extractedData.length > 0 && !isLoading && (
            <div className="space-y-8">
              <ExportControls data={extractedData} onReset={handleReset}/>
              <DataTable data={extractedData} headers={headers} />
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>&copy; {new Date().getFullYear()} OCR Data Exporter. Powered by Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
import React, { useReducer } from 'react';
import { Layout } from './components/Layout';
import { FileUpload } from './components/FileUpload';
import { Results } from './components/Results';
import { ProcessingStatus } from './components/ProcessingStatus';
import { Alert } from './components/Alert';
import { useOcr } from './hooks/useOcr';
import { initialState, reducer } from './state/reducer';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { processImages } = useOcr(dispatch);

  const handleFilesSelected = (files: File[]) => {
    dispatch({ type: 'SET_FILES', payload: files });
  };

  const handleProcess = () => {
    processImages(state.files);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  const renderContent = () => {
    if (state.status === 'processing') {
      return <ProcessingStatus files={state.files} log={state.progressLog} fileStatuses={state.fileStatuses} />;
    }

    if (state.view === 'results' && state.extractedData.length > 0) {
      return <Results data={state.extractedData} headers={state.headers} onReset={handleReset} />;
    }

    return (
      <div aria-live="polite">
        <FileUpload 
          onFilesSelected={handleFilesSelected} 
          onProcess={handleProcess}
          files={state.files}
          fileStatuses={state.fileStatuses}
          disabled={state.status === 'processing'}
        />
        {state.error && state.status !== 'processing' && (
          <Alert type={state.error.type} title={state.error.title}>
            {state.error.message}
          </Alert>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3">
          Document Data Extractor
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Upload images of tables, receipts, or notes to instantly convert them into structured data.
        </p>
      </div>

      <div className="mt-10">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
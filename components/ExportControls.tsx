
import React, { useState } from 'react';
import { useExport } from '../hooks/useExport';
import { TableRow } from '../types';

interface ExportControlsProps {
  data: TableRow[];
  onReset: () => void;
}

interface ExportButtonProps {
    onClick: () => void;
    children: React.ReactNode;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onClick, children }) => (
    <button onClick={onClick} className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm font-medium px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-900">
        {children}
    </button>
);

export const ExportControls: React.FC<ExportControlsProps> = ({ data, onReset }) => {
  const { exportToJson, exportToCsv, exportToXlsx, exportToSql } = useExport();
  const [tableName, setTableName] = useState<string>('imported_data');

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Export Data</h2>
             <button
                onClick={onReset}
                className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/><path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/></svg>
                Start Over
            </button>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <ExportButton onClick={() => exportToJson(data)}>JSON</ExportButton>
          <ExportButton onClick={() => exportToCsv(data)}>CSV</ExportButton>
          <ExportButton onClick={() => exportToXlsx(data)}>XLSX</ExportButton>
      </div>
      <div className="pt-2">
          <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SQL Table Name</label>
          <div className="flex flex-col sm:flex-row gap-3">
              <input
                  type="text"
                  id="tableName"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="flex-grow bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2"
                  placeholder="e.g., imported_data"
              />
              <ExportButton onClick={() => exportToSql(data, tableName)}>Export SQL</ExportButton>
          </div>
      </div>
    </div>
  );
};

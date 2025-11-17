import React, { useState } from 'react';
import { useExport } from '../hooks/useExport';
import { TableRow } from '../types';
import { Card } from './Card';
import { Button } from './Button';

interface ExportControlsProps {
  data: TableRow[];
  onReset: () => void;
}

export const ExportControls: React.FC<ExportControlsProps> = ({ data, onReset }) => {
  const { exportToJson, exportToCsv, exportToXlsx, exportToSql } = useExport();
  const [tableName, setTableName] = useState<string>('imported_data');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xlsx'>('json');

  const handleExport = () => {
    switch (exportFormat) {
      case 'json':
        exportToJson(data);
        break;
      case 'csv':
        exportToCsv(data);
        break;
      case 'xlsx':
        exportToXlsx(data);
        break;
    }
  };

  return (
    <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Results</h2>
            <Button onClick={onReset} variant="secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/><path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/></svg>
              Start Over
            </Button>
        </div>

        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Export Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">File Format</label>
                    <div className="flex rounded-lg shadow-sm">
                        {(['json', 'csv', 'xlsx'] as const).map((format, index) => (
                            <button
                                key={format}
                                onClick={() => setExportFormat(format)}
                                className={`px-4 py-2 text-sm font-semibold transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500
                                  ${index === 0 ? 'rounded-l-lg' : ''}
                                  ${index === 2 ? 'rounded-r-lg' : ''}
                                  ${exportFormat === format 
                                    ? 'bg-primary-600 text-white' 
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                                  } border border-slate-300 dark:border-slate-600 -ml-px first:ml-0`}
                            >
                                {format.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <Button onClick={handleExport} className="mt-3 w-full sm:w-auto">
                      Download .{exportFormat}
                    </Button>
                </div>

                <div>
                    <label htmlFor="tableName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SQL Export</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            id="tableName"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            className="flex-grow bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                            placeholder="e.g., imported_data"
                        />
                        <Button onClick={() => exportToSql(data, tableName)} variant="secondary" className="w-full sm:w-auto">
                          Export .sql
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </Card>
  );
};

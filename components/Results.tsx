import React, { useState } from 'react';
import { TableRow } from '../state/types';
import { Button } from './Button';
import { Card } from './Card';
import { DataTable } from './DataTable';
import { Tabs } from './Tabs';
import { CodePreview } from './CodePreview';
import { useExport } from '../hooks/useExport';

interface ResultsProps {
  data: TableRow[];
  headers: string[];
  onReset: () => void;
}

export const Results: React.FC<ResultsProps> = ({ data, headers, onReset }) => {
  const [tableName, setTableName] = useState('imported_data');
  const { generateJsonString, generateCsvString, generateSqlString, exportToXlsx } = useExport();

  const jsonContent = generateJsonString(data);
  const csvContent = generateCsvString(data);
  const sqlContent = generateSqlString(data, tableName);

  const tabs = [
    {
      id: 'table',
      label: 'Data Table',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A preview of your extracted data. Use the button below to download the full XLSX file.
          </p>
          <div className="max-h-[50vh] overflow-y-auto rounded-lg border dark:border-slate-700">
            <DataTable data={data} headers={headers} />
          </div>
          <Button onClick={() => exportToXlsx(data)} className="w-full sm:w-auto">
            Download .xlsx
          </Button>
        </div>
      )
    },
    {
      id: 'json',
      label: 'JSON',
      content: (
        <CodePreview
          language="json"
          content={jsonContent}
          fileName="data.json"
        />
      )
    },
    {
      id: 'csv',
      label: 'CSV',
      content: (
        <CodePreview
          language="csv"
          content={csvContent}
          fileName="data.csv"
        />
      )
    },
    {
      id: 'sql',
      label: 'SQL',
      content: (
        <div className="space-y-4">
           <div className="relative">
            <label htmlFor="tableName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Table Name</label>
            <input
              type="text"
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              placeholder="e.g., imported_data"
            />
          </div>
          <CodePreview
            language="sql"
            content={sqlContent}
            fileName={`${tableName}.sql`}
          />
        </div>
      )
    }
  ];

  return (
    <Card className="fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Extraction Results</h2>
        <Button onClick={onReset} variant="secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/><path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/></svg>
          Start Over
        </Button>
      </div>
      <Tabs tabs={tabs} />
    </Card>
  );
};
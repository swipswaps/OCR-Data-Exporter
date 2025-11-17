import React from 'react';
import { TableRow } from '../types';

interface DataTableProps {
  data: TableRow[];
  headers: string[];
}

export const DataTable: React.FC<DataTableProps> = ({ data, headers }) => {
  if (data.length === 0 || headers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-slate-700 dark:text-gray-300">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="px-6 py-3 whitespace-nowrap">
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/50">
                {headers.map((header) => (
                  <td key={`${rowIndex}-${header}`} className="px-6 py-4">
                    {String(row[header] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
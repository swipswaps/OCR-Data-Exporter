import React from 'react';
// FIX: Corrected import path for TableRow type.
import { TableRow } from '../state/types';

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
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="px-6 py-4 font-semibold tracking-wider whitespace-nowrap">
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                {headers.map((header) => (
                  <td key={`${rowIndex}-${header}`} className="px-6 py-4">
                    {row[header] === null || row[header] === undefined ? <span className="text-slate-400 dark:text-slate-500">—</span> : String(row[header])}
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
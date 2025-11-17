
import { useCallback } from 'react';
import { TableRow } from '../types';

declare const XLSX: any;
declare const Papa: any;

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const useExport = () => {
  const exportToJson = useCallback((data: TableRow[], filename = 'data.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
  }, []);

  const exportToCsv = useCallback((data: TableRow[], filename = 'data.csv') => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
  }, []);

  const exportToXlsx = useCallback((data: TableRow[], filename = 'data.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    downloadBlob(blob, filename);
  }, []);

  const exportToSql = useCallback((data: TableRow[], tableName = 'imported_data', filename = 'data.sql') => {
    if (data.length === 0) return;

    const columns = Object.keys(data[0]).map(col => `\`${col.replace(/`/g, '``')}\``).join(', ');
    const safeTableName = `\`${tableName.replace(/`/g, '``')}\``;
    
    let sql = `CREATE TABLE IF NOT EXISTS ${safeTableName} (\n`;
    sql += Object.keys(data[0]).map(col => `  \`${col.replace(/`/g, '``')}\` TEXT`).join(',\n');
    sql += '\n);\n\n';

    const insertStatements = data.map(row => {
      const values = Object.values(row).map(value => {
        if (value === null || value === undefined) return 'NULL';
        // Simple sanitization for SQL strings
        const strValue = String(value).replace(/'/g, "''");
        return `'${strValue}'`;
      }).join(', ');
      return `INSERT INTO ${safeTableName} (${columns}) VALUES (${values});`;
    }).join('\n');

    sql += insertStatements;

    const blob = new Blob([sql], { type: 'application/sql' });
    downloadBlob(blob, filename);
  }, []);

  return { exportToJson, exportToCsv, exportToXlsx, exportToSql };
};

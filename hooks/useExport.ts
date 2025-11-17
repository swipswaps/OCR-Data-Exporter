import { useCallback } from 'react';
import { TableRow } from '../state/types';

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
  const generateJsonString = useCallback((data: TableRow[]) => {
    return JSON.stringify(data, null, 2);
  }, []);
  
  const generateCsvString = useCallback((data: TableRow[]) => {
    return Papa.unparse(data);
  }, []);

  const generateSqlString = useCallback((data: TableRow[], tableName: string = 'imported_data') => {
    if (data.length === 0) return '';

    const columns = Object.keys(data[0]).map(col => `\`${col.replace(/`/g, '``')}\``).join(', ');
    const safeTableName = `\`${tableName.replace(/`/g, '``')}\``;
    
    let sql = `CREATE TABLE IF NOT EXISTS ${safeTableName} (\n`;
    sql += Object.keys(data[0]).map(col => `  \`${col.replace(/`/g, '``')}\` TEXT`).join(',\n');
    sql += '\n);\n\n';

    const insertStatements = data.map(row => {
      const values = Object.values(row).map(value => {
        if (value === null || value === undefined) return 'NULL';
        const strValue = String(value).replace(/'/g, "''");
        return `'${strValue}'`;
      }).join(', ');
      return `INSERT INTO ${safeTableName} (${columns}) VALUES (${values});`;
    }).join('\n');

    sql += insertStatements;
    return sql;
  }, []);

  const exportToJson = useCallback((data: TableRow[], filename = 'data.json') => {
    const jsonString = generateJsonString(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadBlob(blob, filename);
  }, [generateJsonString]);

  const exportToCsv = useCallback((data: TableRow[], filename = 'data.csv') => {
    const csvString = generateCsvString(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
  }, [generateCsvString]);

  const exportToXlsx = useCallback((data: TableRow[], filename = 'data.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    downloadBlob(blob, filename);
  }, []);

  const exportToSql = useCallback((data: TableRow[], tableName = 'imported_data', filename = 'data.sql') => {
    const sqlString = generateSqlString(data, tableName);
    if (sqlString) {
      const blob = new Blob([sqlString], { type: 'application/sql' });
      downloadBlob(blob, filename);
    }
  }, [generateSqlString]);

  return { 
    exportToJson, 
    exportToCsv, 
    exportToXlsx, 
    exportToSql,
    generateJsonString,
    generateCsvString,
    generateSqlString,
  };
};
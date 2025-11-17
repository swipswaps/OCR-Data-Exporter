import React, { useEffect, useRef, useState } from 'react';
import { Button } from './Button';

declare const hljs: any;

interface CodePreviewProps {
  language: string;
  content: string;
  fileName: string;
}

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

export const CodePreview: React.FC<CodePreviewProps> = ({ language, content, fileName }) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current && typeof hljs !== 'undefined') {
      hljs.highlightElement(codeRef.current);
    }
  }, [content]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    let mimeType = 'text/plain';
    if (language === 'json') mimeType = 'application/json';
    if (language === 'csv') mimeType = 'text/csv';
    if (language === 'sql') mimeType = 'application/sql';
    
    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, fileName);
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-[#282c34] rounded-lg">
        <div className="absolute top-2 right-2 flex gap-2">
            <button onClick={handleCopy} className="text-xs bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-md px-2 py-1 transition-colors">
              {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
        <pre className="max-h-[50vh] overflow-auto p-4 rounded-lg hljs-container">
          <code ref={codeRef} className={`language-${language}`}>
            {content}
          </code>
        </pre>
      </div>
       <Button onClick={handleDownload} className="w-full sm:w-auto">
        Download {fileName}
      </Button>
    </div>
  );
};
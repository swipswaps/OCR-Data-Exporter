import React, { useEffect, useRef } from 'react';
import { Card } from './Card';
import { FileStatus, ProgressLogEntry } from '../state/types';

interface ProcessingStatusProps {
  files: File[];
  log: ProgressLogEntry[];
  fileStatuses: Record<string, FileStatus>;
}

const StatusIcon: React.FC<{ status: FileStatus }> = ({ status }) => {
    switch (status) {
        case 'processing':
            return <div title="Processing..." className="w-4 h-4 rounded-full animate-spin border-2 border-dashed border-primary-500 border-t-transparent"></div>;
        case 'success':
            return <svg title="Success" className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>;
        case 'error':
            return <svg title="Error" className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>;
        case 'pending':
        default:
            return <div title="Pending..." className="w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-600"></div>;
    }
};

const LogTypeIndicator: React.FC<{type: ProgressLogEntry['type']}> = ({type}) => {
    const baseClass = "font-mono font-bold text-xs mr-2";
    switch (type) {
        case 'success': return <span className={`${baseClass} text-green-500`}>SUCCESS</span>
        case 'error': return <span className={`${baseClass} text-red-500`}>ERROR</span>
        case 'warning': return <span className={`${baseClass} text-yellow-500`}>WARN</span>
        case 'info':
        default:
            return <span className={`${baseClass} text-blue-500`}>INFO</span>
    }
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ files, log, fileStatuses }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [log]);

  return (
    <Card className="fade-in">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 text-center">Processing Files...</h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-6">Please wait while your documents are being analyzed. You can see the live progress below.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Files</h3>
                <ul className="space-y-2">
                    {files.map(file => (
                        <li key={file.name} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md text-sm">
                            <span className="truncate text-slate-700 dark:text-slate-300">{file.name}</span>
                            <StatusIcon status={fileStatuses[file.name] || 'pending'} />
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Live Log</h3>
                 <div ref={logContainerRef} className="bg-slate-900 text-white font-mono text-xs rounded-lg p-3 h-48 overflow-y-auto">
                    {log.map((entry, index) => (
                        <div key={index} className="flex">
                            <span className="text-slate-500 mr-2">{entry.time}</span>
                            <div className="flex-grow">
                               <LogTypeIndicator type={entry.type} />
                               <span className="text-slate-300">{entry.message}</span>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    </Card>
  );
};
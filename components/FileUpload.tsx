import React, { useCallback, useState, useEffect } from 'react';
import { getDisplayUrl } from '../utils/fileUtils';
import { Button } from './Button';
import { Card } from './Card';
import { FileStatus } from '../state/types';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onProcess: () => void;
  files: File[];
  fileStatuses: Record<string, FileStatus>;
  disabled: boolean;
}

const UploadIcon = () => (
    <svg className="w-10 h-10 mb-4 text-slate-500 dark:text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
    </svg>
);

const StatusIcon: React.FC<{ status: FileStatus }> = ({ status }) => {
    switch (status) {
        case 'processing':
            return <div title="Processing..." className="w-4 h-4 rounded-full animate-spin border-2 border-dashed border-white border-t-transparent"></div>;
        case 'success':
            return <svg title="Success" className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>;
        case 'error':
            return <svg title="Error" className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>;
        default:
            return null;
    }
};

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, onProcess, files, fileStatuses, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

    useEffect(() => {
        let isCancelled = false;
        
        const currentFileNames = new Set(files.map(f => f.name));
        const urlsToKeep: Record<string, string> = {};
        for (const name in previewUrls) {
            if (currentFileNames.has(name)) {
                urlsToKeep[name] = previewUrls[name];
            } else {
                URL.revokeObjectURL(previewUrls[name]);
            }
        }

        const generatePreviews = async () => {
            const newUrls: Record<string, string> = { ...urlsToKeep };
            const filesToPreview = files.filter(f => !urlsToKeep[f.name]);

            await Promise.all(
                filesToPreview.map(async (file) => {
                    try {
                        const url = await getDisplayUrl(file);
                        if (!isCancelled) newUrls[file.name] = url;
                    } catch (e) {
                        console.error("Could not generate preview for", file.name, e);
                    }
                })
            );

            if (!isCancelled) {
                setPreviewUrls(newUrls);
            }
        };

        if (files.length > 0) {
            generatePreviews();
        } else {
            setPreviewUrls({});
        }
        
        return () => {
            isCancelled = true;
        };
    }, [files]);
    
    useEffect(() => {
        return () => {
            // FIX: Address potential type inference issue by iterating over keys instead of values.
            // This ensures we're passing a string to URL.revokeObjectURL.
            for (const key in previewUrls) {
                if (Object.prototype.hasOwnProperty.call(previewUrls, key)) {
                    URL.revokeObjectURL(previewUrls[key]);
                }
            }
        }
    }, []);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onFilesSelected(Array.from(event.target.files));
        }
    };

    const handleDragEvent = useCallback((event: React.DragEvent<HTMLElement>, dragging: boolean) => {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(dragging);
    }, [disabled]);

    const handleDrop = useCallback((event: React.DragEvent<HTMLElement>) => {
        if (disabled) return;
        handleDragEvent(event, false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(event.dataTransfer.files));
            event.dataTransfer.clearData();
        }
    }, [handleDragEvent, onFilesSelected, disabled]);

    return (
        <Card>
            <div className="flex flex-col items-center justify-center w-full">
                <label
                    htmlFor="dropzone-file"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors
                        ${disabled ? 'cursor-not-allowed bg-slate-100 dark:bg-slate-800/50' : 'cursor-pointer'}
                        ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    onDragEnter={(e) => handleDragEvent(e, true)}
                    onDragLeave={(e) => handleDragEvent(e, false)}
                    onDragOver={(e) => handleDragEvent(e, true)}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon />
                        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-primary-600 dark:text-primary-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, HEIC, etc.</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*,.heic,.heif" onChange={handleFileChange} disabled={disabled} />
                </label>

                {files.length > 0 && (
                    <div className="mt-8 w-full">
                        <h3 className="font-semibold text-lg mb-4 text-slate-800 dark:text-slate-200 text-left">Selected Files:</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {files.map((file) => (
                                <div key={file.name} className="relative aspect-square border rounded-lg overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-700">
                                    {previewUrls[file.name] ? (
                                        <img src={previewUrls[file.name]} alt={file.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-xs text-slate-500">Loading...</div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 truncate backdrop-blur-sm flex justify-between items-center">
                                      <span className="truncate">{file.name}</span>
                                      {fileStatuses[file.name] && <StatusIcon status={fileStatuses[file.name]} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={onProcess}
                            className="mt-8 w-full"
                            disabled={disabled}
                        >
                            Extract Data from {files.length} File(s)
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};
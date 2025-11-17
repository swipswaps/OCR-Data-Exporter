import React, { useCallback, useState, useEffect } from 'react';
import { getDisplayUrl } from '../utils/fileUtils';
import { Button } from './Button';
import { Card } from './Card';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onProcess: () => void;
  files: File[];
}

const UploadIcon = () => (
    <svg className="w-10 h-10 mb-4 text-slate-500 dark:text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
    </svg>
);

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, onProcess, files }) => {
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

        generatePreviews();
        
        return () => {
            isCancelled = true;
        };
    }, [files]);
    
    useEffect(() => {
        return () => {
            Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
        }
    }, []);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onFilesSelected(Array.from(event.target.files));
        }
    };

    const handleDragEvent = useCallback((event: React.DragEvent<HTMLElement>, dragging: boolean) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(dragging);
    }, []);

    const handleDrop = useCallback((event: React.DragEvent<HTMLElement>) => {
        handleDragEvent(event, false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(event.dataTransfer.files));
            event.dataTransfer.clearData();
        }
    }, [handleDragEvent, onFilesSelected]);

    return (
        <Card>
            <div className="flex flex-col items-center justify-center w-full">
                <label
                    htmlFor="dropzone-file"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
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
                    <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*,.heic,.heif" onChange={handleFileChange} />
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
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 truncate backdrop-blur-sm">{file.name}</div>
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={onProcess}
                            className="mt-8 w-full"
                        >
                            Extract Data from {files.length} File(s)
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

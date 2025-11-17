import React, { useCallback, useState, useEffect } from 'react';
import { getDisplayUrl } from '../utils/fileUtils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onProcess: () => void;
  isProcessing: boolean;
  files: File[];
}

const UploadIcon = () => (
    <svg className="w-10 h-10 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
    </svg>
);

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, onProcess, isProcessing, files }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        let isCancelled = false;
        if (files.length > 0) {
            const generatePreviews = async () => {
                const urls = await Promise.all(
                    files.map(file => getDisplayUrl(file).catch(() => ''))
                );
                if (!isCancelled) {
                    setPreviewUrls(urls.filter(url => url));
                }
            };
            generatePreviews();
        } else {
            setPreviewUrls([]);
        }
        
        return () => {
            isCancelled = true;
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onFilesSelected(Array.from(event.target.files));
        }
    };

    const handleDragEvent = useCallback((event: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(dragging);
    }, []);

    const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        handleDragEvent(event, false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(event.dataTransfer.files));
            event.dataTransfer.clearData();
        }
    }, [handleDragEvent, onFilesSelected]);

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <label
                htmlFor="dropzone-file"
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                onDragOver={(e) => handleDragEvent(e, true)}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Images of tables, receipts, notes (PNG, JPG, HEIC, etc.)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*,.heic,.heif" onChange={handleFileChange} />
            </label>

            {files.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3 text-slate-700 dark:text-slate-300">Selected Files:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {files.map((file, index) => (
                            <div key={index} className="relative aspect-square border rounded-lg overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-700">
                                {previewUrls[index] ? (
                                    <img src={previewUrls[index]} alt={file.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-xs text-slate-500">Loading...</div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">{file.name}</div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={onProcess}
                        disabled={isProcessing}
                        className="mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : `Extract Data from ${files.length} File(s)`}
                    </button>
                </div>
            )}
        </div>
    );
};
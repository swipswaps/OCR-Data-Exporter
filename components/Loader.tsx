
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full animate-spin border-4 border-dashed border-primary-500 border-t-transparent"></div>
      <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">Extracting Data...</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">This may take a moment. Please wait.</p>
    </div>
  );
};

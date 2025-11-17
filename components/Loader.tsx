import React from 'react';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-10 h-10 rounded-full animate-spin border-4 border-dashed border-primary-500 border-t-transparent"></div>
      {message && (
        <p className="mt-4 text-md font-semibold text-slate-700 dark:text-slate-300">
          {message}
        </p>
      )}
    </div>
  );
};

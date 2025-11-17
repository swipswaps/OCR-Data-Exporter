import React from 'react';

export const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8 ${className}`}>
            {children}
        </div>
    );
};

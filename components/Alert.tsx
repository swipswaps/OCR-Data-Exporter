import React, { useMemo } from 'react';
import { ErrorType } from '../state/types';

interface AlertProps {
    type: ErrorType;
    title: string;
    children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ type, title, children }) => {
    const appearance = useMemo(() => {
        switch (type) {
            case 'error':
                return {
                    bg: 'bg-red-100 dark:bg-red-900/30',
                    border: 'border-red-400 dark:border-red-600',
                    text: 'text-red-700 dark:text-red-300',
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                    border: 'border-yellow-400 dark:border-yellow-600',
                    text: 'text-yellow-700 dark:text-yellow-300',
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    border: 'border-blue-400 dark:border-blue-600',
                    text: 'text-blue-700 dark:text-blue-300',
                };
        }
    }, [type]);

    return (
        <div className={`${appearance.bg} ${appearance.border} ${appearance.text} px-4 py-3 rounded-lg relative my-6 text-left border fade-in`} role="alert">
            <strong className="font-bold">{title}: </strong>
            <span className="block sm:inline sm:ml-1">{children}</span>
        </div>
    );
};

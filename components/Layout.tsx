import React from 'react';
import { Header } from './Header';

export const Layout: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
            <footer className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                <p>&copy; {new Date().getFullYear()} AI Data Extractor. Powered by the Gemini API.</p>
            </footer>
        </div>
    );
};

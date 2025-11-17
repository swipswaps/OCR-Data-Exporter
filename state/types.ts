import { TableRow } from '../types';

export type AppStatus = 'idle' | 'processing' | 'success' | 'error';
export type AppView = 'upload' | 'results';
export type ErrorType = 'error' | 'warning' | 'info';

export interface AppError {
  type: ErrorType;
  title: string;
  message: string;
}

export interface AppState {
  view: AppView;
  status: AppStatus;
  files: File[];
  extractedData: TableRow[];
  headers: string[];
  error: AppError | null;
}

export type AppAction =
  | { type: 'SET_FILES'; payload: File[] }
  | { type: 'PROCESSING_START' }
  | { type: 'PROCESSING_SUCCESS'; payload: TableRow[] }
  | { type: 'PROCESSING_ERROR'; payload: AppError }
  | { type: 'SET_ERROR'; payload: AppError }
  | { type: 'RESET' };

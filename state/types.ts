export type TableRow = Record<string, any>;

export type AppStatus = 'idle' | 'processing' | 'success' | 'error';
export type AppView = 'upload' | 'results';
export type ErrorType = 'error' | 'warning' | 'info';
export type FileStatus = 'pending' | 'processing' | 'success' | 'error';

export interface AppError {
  type: ErrorType;
  title: string;
  message: string;
}

export interface ProgressLogEntry {
  time: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

export interface AppState {
  view: AppView;
  status: AppStatus;
  files: File[];
  fileStatuses: Record<string, FileStatus>;
  progressLog: ProgressLogEntry[];
  extractedData: TableRow[];
  headers: string[];
  error: AppError | null;
}

export type AppAction =
  | { type: 'SET_FILES'; payload: File[] }
  | { type: 'PROCESSING_START' }
  | { type: 'ADD_PROGRESS_LOG'; payload: ProgressLogEntry }
  | { type: 'SET_FILE_STATUS'; payload: { fileName: string; status: FileStatus } }
  | { type: 'PROCESSING_SUCCESS'; payload: TableRow[] }
  | { type: 'PROCESSING_ERROR'; payload: AppError }
  | { type: 'SET_ERROR'; payload: AppError }
  | { type: 'RESET' };

import { AppState, AppAction } from './types';

export const initialState: AppState = {
  view: 'upload',
  status: 'idle',
  files: [],
  fileStatuses: {},
  progressLog: [],
  extractedData: [],
  headers: [],
  error: null,
};

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FILES':
      return {
        ...state,
        files: action.payload,
        fileStatuses: action.payload.reduce((acc, file) => {
          acc[file.name] = 'pending';
          return acc;
        }, {} as Record<string, 'pending'>),
        error: null,
      };
    case 'PROCESSING_START':
      return {
        ...state,
        status: 'processing',
        error: null,
        progressLog: [],
        extractedData: [],
        headers: [],
      };
    case 'ADD_PROGRESS_LOG':
      return {
        ...state,
        progressLog: [...state.progressLog, action.payload],
      };
    case 'SET_FILE_STATUS':
      return {
        ...state,
        fileStatuses: {
          ...state.fileStatuses,
          [action.payload.fileName]: action.payload.status,
        },
      };
    case 'PROCESSING_SUCCESS': {
      const allKeys = new Set(action.payload.flatMap(obj => Object.keys(obj)));
      const sortedHeaders = ['source_file', ...Array.from(allKeys).filter(key => key !== 'source_file').sort()];
      
      return {
        ...state,
        view: 'results',
        status: 'success',
        extractedData: action.payload,
        headers: sortedHeaders,
        error: null,
      };
    }
    case 'PROCESSING_ERROR':
      return {
        ...state,
        view: 'upload',
        status: 'error',
        error: action.payload,
        files: [],
        fileStatuses: {},
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
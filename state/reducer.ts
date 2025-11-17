import { AppState, AppAction } from './types';

export const initialState: AppState = {
  view: 'upload',
  status: 'idle',
  files: [],
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
        error: null,
      };
    case 'PROCESSING_START':
      return {
        ...state,
        status: 'processing',
        error: null,
        extractedData: [],
        headers: [],
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
        files: [], // Clear files after successful processing
      };
    }
    case 'PROCESSING_ERROR':
      return {
        ...state,
        view: 'upload', // Go back to upload screen on error
        status: 'error',
        error: action.payload,
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

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ValidationResult,
  ValidationError,
  FormattingOptions,
  JSONStatistics,
  TreeNode,
  ProcessingState,
} from '../types';
import { DEFAULT_FORMATTING_OPTIONS, DEFAULT_STATISTICS } from '../types';

interface JsonState {
  // Core JSON data
  inputJson: string;
  outputJson: string;
  isValid: boolean;
  validationErrors: ValidationError[];
  
  // Formatting options
  formattingOptions: FormattingOptions;
  
  // Processing state
  processingState: ProcessingState;
  statistics: JSONStatistics;
  
  // Tree view data
  treeViewData: TreeNode[];
  
  // UI state
  activeView: 'input' | 'output' | 'tree';
  showKeyboardShortcuts: boolean;
  showErrorPanel: boolean;
  
  // File info
  lastFileName: string;
  originalFileSize: number;
  
  // Actions
  setInputJson: (json: string) => void;
  setOutputJson: (json: string) => void;
  setValidationResult: (result: ValidationResult) => void;
  setFormattingOptions: (options: Partial<FormattingOptions>) => void;
  setProcessingState: (state: Partial<ProcessingState>) => void;
  setStatistics: (stats: Partial<JSONStatistics>) => void;
  setTreeViewData: (data: TreeNode[]) => void;
  setActiveView: (view: 'input' | 'output' | 'tree') => void;
  toggleKeyboardShortcuts: () => void;
  toggleErrorPanel: () => void;
  clearAll: () => void;
  loadFile: (fileName: string, content: string, size: number) => void;
  resetFormattingOptions: () => void;
}

export const useJsonStore = create<JsonState>()(
  persist(
    (set, get) => ({
      // Initial state
      inputJson: '',
      outputJson: '',
      isValid: true,
      validationErrors: [],
      
      formattingOptions: DEFAULT_FORMATTING_OPTIONS,
      
      processingState: {
        isProcessing: false,
        progress: 0,
        message: '',
      },
      
      statistics: DEFAULT_STATISTICS,
      
      treeViewData: [],
      
      activeView: 'input',
      showKeyboardShortcuts: false,
      showErrorPanel: false,
      
      lastFileName: '',
      originalFileSize: 0,
      
      // Actions
      setInputJson: (json: string) => {
        set({
          inputJson: json,
          isValid: true,
          validationErrors: [],
          processingState: { ...get().processingState, isProcessing: false },
        });
      },
      
      setOutputJson: (json: string) => {
        set({ outputJson: json });
      },
      
      setValidationResult: (result: ValidationResult) => {
        set({
          isValid: result.isValid,
          validationErrors: result.errors,
          outputJson: result.data ? JSON.stringify(result.data, null, get().formattingOptions.indentSize) : '',
          showErrorPanel: !result.isValid && result.errors.length > 0,
        });
      },
      
      setFormattingOptions: (options: Partial<FormattingOptions>) => {
        set({
          formattingOptions: { ...get().formattingOptions, ...options },
        });
      },
      
      setProcessingState: (state: Partial<ProcessingState>) => {
        set({
          processingState: { ...get().processingState, ...state },
        });
      },
      
      setStatistics: (stats: Partial<JSONStatistics>) => {
        set({
          statistics: { ...get().statistics, ...stats },
        });
      },
      
      setTreeViewData: (data: TreeNode[]) => {
        set({ treeViewData: data });
      },
      
      setActiveView: (view: 'input' | 'output' | 'tree') => {
        set({ activeView: view });
      },
      
      toggleKeyboardShortcuts: () => {
        set({ showKeyboardShortcuts: !get().showKeyboardShortcuts });
      },
      
      toggleErrorPanel: () => {
        set({ showErrorPanel: !get().showErrorPanel });
      },
      
      clearAll: () => {
        set({
          inputJson: '',
          outputJson: '',
          isValid: true,
          validationErrors: [],
          treeViewData: [],
          statistics: DEFAULT_STATISTICS,
          lastFileName: '',
          originalFileSize: 0,
          showErrorPanel: false,
        });
      },
      
      loadFile: (fileName: string, content: string, size: number) => {
        set({
          inputJson: content,
          lastFileName: fileName,
          originalFileSize: size,
          isValid: true,
          validationErrors: [],
        });
      },
      
      resetFormattingOptions: () => {
        set({ formattingOptions: DEFAULT_FORMATTING_OPTIONS });
      },
    }),
    {
      name: 'json-formatter-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        formattingOptions: state.formattingOptions,
        lastFileName: state.lastFileName,
      }),
    }
  )
);

// Computed selectors
export const useJsonStoreSelectors = () => {
  const state = useJsonStore();
  
  return {
    isEmpty: state.inputJson.length === 0,
    hasErrors: state.validationErrors.length > 0,
    errorCount: state.validationErrors.length,
    formattedSize: new Blob([state.outputJson]).size,
    compressionRatio: state.originalFileSize > 0
      ? ((state.originalFileSize - new Blob([state.outputJson]).size) / state.originalFileSize * 100)
      : 0,
    canFormat: state.inputJson.length > 0 && !state.processingState.isProcessing,
    canMinify: state.inputJson.length > 0 && state.isValid && !state.processingState.isProcessing,
    canCopy: state.outputJson.length > 0,
  };
};

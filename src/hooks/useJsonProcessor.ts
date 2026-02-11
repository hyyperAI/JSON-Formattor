import { useState, useCallback, useRef, useEffect } from 'react';
import { useJsonStore, useJsonStoreSelectors } from '../store/useJsonStore';
import { validateJSON } from '../utils/jsonValidator';
import { formatJSON, minifyJSON } from '../utils/jsonFormatter';
import { parseJSON5 } from '../utils/json5Parser';
import { buildTreeView } from '../utils/treeViewBuilder';
import { calculateStatistics } from '../utils/metricsCalculator';
import type { FormattingOptions, ValidationResult, TreeNode } from '../types';
import { ERROR_CODES } from '../types';

const DEBOUNCE_DELAY = 300; // ms
const LARGE_FILE_THRESHOLD = 1024 * 1024; // 1MB

interface UseJsonProcessorOptions {
  autoValidate?: boolean;
  autoFormat?: boolean;
  debounceMs?: number;
}

interface UseJsonProcessorReturn {
  // State
  inputJson: string;
  outputJson: string;
  isValid: boolean;
  validationErrors: Array<{
    line: number;
    column: number;
    message: string;
    code: string;
    position: number;
  }>;
  isProcessing: boolean;
  processingTime: number;
  statistics: {
    inputSize: number;
    outputSize: number;
    lineCount: number;
    keyCount: number;
    depthLevel: number;
    compressionRatio: number;
  };
  
  // Actions
  setInputJson: (json: string) => void;
  format: () => void;
  minify: () => void;
  validate: () => ValidationResult;
  clear: () => void;
  loadFile: (fileName: string, content: string, size: number) => void;
  setFormattingOptions: (options: Partial<FormattingOptions>) => void;
  
  // Utilities
  reset: () => void;
  getValidationResult: () => ValidationResult;
}

export function useJsonProcessor(options: UseJsonProcessorOptions = {}): UseJsonProcessorReturn {
  const {
    autoValidate = true,
    autoFormat = false,
    debounceMs = DEBOUNCE_DELAY,
  } = options;
  
  // Store state
  const store = useJsonStore();
  const selectors = useJsonStoreSelectors();
  
  // Local state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Format JSON
  const format = useCallback(() => {
    const startTime = performance.now();
    setIsProcessing(true);
    
    try {
      let result: string;
      
      if (store.formattingOptions.json5Mode) {
        // Parse as JSON5, then format as JSON
        const parsed = parseJSON5(store.inputJson, {
          allowComments: true,
          allowTrailingCommas: true,
          allowUnquotedKeys: true,
        });
        result = formatJSON(parsed, store.formattingOptions);
      } else {
        // Standard JSON parsing and formatting
        const parsed = JSON.parse(store.inputJson);
        result = formatJSON(parsed, store.formattingOptions);
      }
      
      const time = performance.now() - startTime;
      const stats = calculateStatistics(store.inputJson, result, time);
      
      store.setOutputJson(result);
      store.setValidationResult({
        isValid: true,
        errors: [],
        data: JSON.parse(result),
        parsedAt: time,
      });
      store.setStatistics(stats);
      store.setTreeViewData(buildTreeView(JSON.parse(result)));
      setProcessingTime(time);
    } catch (error) {
      // Validation failed during format
      const result = validateJSON(store.inputJson);
      store.setValidationResult(result);
      store.setStatistics({
        inputSize: new Blob([store.inputJson]).size,
        outputSize: 0,
        lineCount: store.inputJson.split('\n').length,
        keyCount: 0,
        depthLevel: 0,
        processingTime: performance.now() - startTime,
        compressionRatio: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [store.inputJson, store.formattingOptions]);
  
  // Minify JSON
  const minify = useCallback(() => {
    const startTime = performance.now();
    setIsProcessing(true);
    
    try {
      let result: string;
      
      if (store.formattingOptions.json5Mode) {
        const parsed = parseJSON5(store.inputJson, {
          allowComments: true,
          allowTrailingCommas: true,
          allowUnquotedKeys: true,
        });
        result = minifyJSON(parsed);
      } else {
        const parsed = JSON.parse(store.inputJson);
        result = minifyJSON(parsed);
      }
      
      const time = performance.now() - startTime;
      const stats = calculateStatistics(store.inputJson, result, time);
      
      store.setOutputJson(result);
      store.setValidationResult({
        isValid: true,
        errors: [],
        data: JSON.parse(result),
        parsedAt: time,
      });
      store.setStatistics(stats);
      store.setTreeViewData(buildTreeView(JSON.parse(result)));
      setProcessingTime(time);
    } catch (error) {
      const result = validateJSON(store.inputJson);
      store.setValidationResult(result);
    } finally {
      setIsProcessing(false);
    }
  }, [store.inputJson, store.formattingOptions]);
  
  // Validate JSON
  const validate = useCallback((): ValidationResult => {
    const startTime = performance.now();
    setIsProcessing(true);
    
    try {
      let result: ValidationResult;
      
      if (store.formattingOptions.json5Mode) {
        try {
          const parsed = parseJSON5(store.inputJson, {
            allowComments: true,
            allowTrailingCommas: true,
            allowUnquotedKeys: true,
          });
          
          result = {
            isValid: true,
            errors: [],
            data: parsed,
            parsedAt: performance.now() - startTime,
          };
        } catch {
          result = {
            isValid: false,
            errors: [{
              line: 1,
              column: 1,
              message: 'Invalid JSON5 syntax',
              code: ERROR_CODES.SYNTAX_ERROR,
              position: 0,
            }],
            parsedAt: performance.now() - startTime,
          };
        }
      } else {
        result = validateJSON(store.inputJson);
      }
      
      store.setValidationResult(result);
      setProcessingTime(result.parsedAt);
      
      if (result.isValid && result.data) {
        store.setOutputJson(JSON.stringify(result.data, null, store.formattingOptions.indentSize));
        store.setTreeViewData(buildTreeView(result.data));
      }
      
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [store.inputJson, store.formattingOptions]);
  
  // Set input JSON with optional debouncing
  const setInputJson = useCallback((json: string) => {
    store.setInputJson(json);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (autoValidate && json.length > 0) {
      debounceRef.current = setTimeout(() => {
        validate();
      }, debounceMs);
    }
    
    if (autoFormat && json.length > 0) {
      debounceRef.current = setTimeout(() => {
        format();
      }, debounceMs * 2);
    }
  }, [autoValidate, autoFormat, debounceMs, validate, format]);
  
  // Load file
  const loadFile = useCallback((fileName: string, content: string, size: number) => {
    store.loadFile(fileName, content, size);
    
    if (autoValidate) {
      validate();
    }
    
    if (autoFormat) {
      format();
    }
  }, [autoValidate, autoFormat, validate, format]);
  
  // Clear all
  const clear = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    store.clearAll();
    setProcessingTime(0);
  }, []);
  
  // Reset formatting options
  const reset = useCallback(() => {
    store.resetFormattingOptions();
  }, []);
  
  // Get validation result
  const getValidationResult = useCallback((): ValidationResult => {
    return validateJSON(store.inputJson);
  }, [store.inputJson]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  
  return {
    inputJson: store.inputJson,
    outputJson: store.outputJson,
    isValid: store.isValid,
    validationErrors: store.validationErrors,
    isProcessing: isProcessing || store.processingState.isProcessing,
    processingTime,
    statistics: store.statistics,
    
    setInputJson,
    format,
    minify,
    validate,
    clear,
    loadFile,
    setFormattingOptions: store.setFormattingOptions,
    
    reset,
    getValidationResult,
  };
}

// Specialized hook for large file processing
export function useLargeFileProcessor() {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const processLargeFile = useCallback(async (
    jsonString: string,
    options: FormattingOptions,
    onProgress?: (progress: number) => void
  ): Promise<{
    formatted: string;
    statistics: ReturnType<typeof calculateStatistics>;
  }> => {
    setIsProcessing(true);
    setProgress(0);
    
    abortControllerRef.current = new AbortController();
    
    try {
      // Simulate progress for large files
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
        onProgress?.(Math.min(progress + 10, 90));
      }, 100);
      
      // Process in chunks to avoid blocking
      const startTime = performance.now();
      
      // Parse in next tick to allow UI updates
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const parsed = JSON.parse(jsonString);
      const formatted = formatJSON(parsed, options);
      
      clearInterval(progressInterval);
      setProgress(100);
      onProgress?.(100);
      
      const statistics = calculateStatistics(jsonString, formatted, performance.now() - startTime);
      
      return { formatted, statistics };
    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Processing cancelled');
      }
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);
  
  const cancelProcessing = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsProcessing(false);
    setProgress(0);
  }, []);
  
  return {
    isProcessing,
    progress,
    processLargeFile,
    cancelProcessing,
  };
}

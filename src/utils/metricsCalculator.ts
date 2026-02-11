import type { JSONStatistics } from '../types';

export function calculateProcessingTime(startTime: number): number {
  return Math.round(performance.now() - startTime);
}

export function calculateStatistics(
  inputJson: string,
  outputJson: string,
  processingTime: number
): JSONStatistics {
  const inputSize = new Blob([inputJson]).size;
  const outputSize = new Blob([outputJson]).size;
  
  let lineCount = 0;
  let keyCount = 0;
  let depthLevel = 0;
  
  try {
    const parsed = JSON.parse(outputJson);
    lineCount = outputJson.split('\n').length;
    keyCount = countKeys(parsed);
    depthLevel = calculateDepth(parsed);
  } catch {
    // If parsing fails, estimate from string
    lineCount = outputJson.split('\n').length;
    keyCount = (outputJson.match(/"[^"]*"\s*:/g) || []).length;
  }
  
  const compressionRatio = inputSize > 0
    ? ((inputSize - outputSize) / inputSize) * 100
    : 0;
  
  return {
    inputSize,
    outputSize,
    lineCount,
    keyCount,
    depthLevel,
    processingTime,
    compressionRatio: Math.round(compressionRatio * 100) / 100,
  };
}

function countKeys(obj: any): number {
  if (obj === null || typeof obj !== 'object') return 0;
  
  if (Array.isArray(obj)) {
    return obj.reduce((sum, item) => sum + countKeys(item), 0);
  }
  
  let count = 0;
  for (const key of Object.keys(obj)) {
    count++;
    count += countKeys(obj[key]);
  }
  
  return count;
}

function calculateDepth(obj: any, currentDepth: number = 0): number {
  if (obj === null || typeof obj !== 'object') return currentDepth;
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return currentDepth;
    return Math.max(...obj.map(item => calculateDepth(item, currentDepth + 1)));
  }
  
  const keys = Object.keys(obj);
  if (keys.length === 0) return currentDepth;
  
  return Math.max(...keys.map(key => calculateDepth(obj[key], currentDepth + 1)));
}

export function measureMemoryUsage(): MemoryInfo | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  
  return null;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function calculateCompressionRatio(original: string, compressed: string): number {
  const originalSize = new Blob([original]).size;
  const compressedSize = new Blob([compressed]).size;
  
  if (originalSize === 0) return 0;
  
  return ((originalSize - compressedSize) / originalSize) * 100;
}

export function estimateParsingPerformance(jsonString: string): {
  estimatedParseTime: number;
  estimatedFormatTime: number;
  memoryEstimate: number;
} {
  const size = new Blob([jsonString]).size;
  
  // Simple estimation based on size
  // These are rough estimates in milliseconds
  const estimatedParseTime = Math.max(1, size / 10000);
  const estimatedFormatTime = Math.max(1, size / 5000);
  const memoryEstimate = size * 3; // Rough estimate: 3x the string size
  
  return {
    estimatedParseTime: Math.round(estimatedParseTime * 100) / 100,
    estimatedFormatTime: Math.round(estimatedFormatTime * 100) / 100,
    memoryEstimate,
  };
}

export function createPerformanceTracker(): {
  start: () => void;
  stop: () => number;
  mark: (name: string) => void;
  getMarks: () => Record<string, number>;
  getMeasure: (name: string) => number | null;
} {
  const marks: Record<string, number> = {};
  let startTime: number | null = null;
  
  return {
    start: () => {
      startTime = performance.now();
    },
    stop: () => {
      if (startTime === null) return 0;
      const duration = performance.now() - startTime;
      startTime = null;
      return Math.round(duration * 100) / 100;
    },
    mark: (name: string) => {
      marks[name] = performance.now();
    },
    getMarks: () => ({ ...marks }),
    getMeasure: (name: string) => {
      if (startTime === null || !marks[name]) return null;
      return Math.round((performance.now() - marks[name]) * 100) / 100;
    },
  };
}

export function validatePerformanceRequirements(
  processingTime: number,
  fileSize: number
): {
  meetsTarget: boolean;
  meetsMaximum: boolean;
  rating: 'excellent' | 'good' | 'acceptable' | 'poor';
} {
  const isSmallFile = fileSize < 1024; // 1KB
  const isMediumFile = fileSize < 1024 * 1024; // 1MB
  const isLargeFile = fileSize >= 1024 * 1024;
  
  const targetTime = isSmallFile ? 100 : isMediumFile ? 1000 : 5000;
  const maximumTime = isSmallFile ? 200 : isMediumFile ? 2000 : 10000;
  
  return {
    meetsTarget: processingTime < targetTime,
    meetsMaximum: processingTime < maximumTime,
    rating: processingTime < targetTime ? 'excellent' :
            processingTime < targetTime * 1.5 ? 'good' :
            processingTime < maximumTime ? 'acceptable' : 'poor',
  };
}

import type { FileInfo } from '../types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/json', 'text/plain'];
const ALLOWED_EXTENSIONS = ['.json', '.txt'];

export async function readFile(file: File): Promise<string> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${formatFileSize(MAX_FILE_SIZE)}`);
  }
  
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.some(ext => file.name.endsWith(ext))) {
    throw new Error('Invalid file type. Only .json files are supported');
  }
  
  // Read file content
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file content'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        // Could emit progress events here if needed
      }
    };
    
    reader.readAsText(file);
  });
}

export function downloadJSON(jsonString: string, filename: string = 'formatted.json'): void {
  try {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download file:', error);
    throw new Error('Failed to download file. Please try again.');
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };
}

export function createFileDropHandler(
  onFileLoad: (file: File, content: string) => void,
  options?: {
    maxSize?: number;
    allowedTypes?: string[];
    onError?: (error: Error) => void;
  }
): {
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  isDragging: boolean;
} {
  let isDragging = false;
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragging = true;
  };
  
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragging = false;
  };
  
  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragging = false;
    
    const files = event.dataTransfer.files;
    
    if (files.length === 0) return;
    
    const file = files[0];
    
    try {
      // Validate file
      if (options?.maxSize && file.size > options.maxSize) {
        throw new Error(`File size exceeds maximum allowed size of ${formatFileSize(options.maxSize)}`);
      }
      
      if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type');
      }
      
      // Read file
      const content = await readFile(file);
      onFileLoad(file, content);
    } catch (error) {
      if (options?.onError && error instanceof Error) {
        options.onError(error);
      } else {
        console.error('File load error:', error);
      }
    }
  };
  
  return {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    isDragging,
  };
}

export async function readLargeFile(file: File, chunkSize: number = 1024 * 1024): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${formatFileSize(MAX_FILE_SIZE)}`);
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    let offset = 0;
    let content = '';
    
    reader.onload = (event) => {
      content += event.target?.result;
      offset += chunkSize;
      
      if (offset < file.size) {
        // Read next chunk
        const slice = file.slice(offset, offset + chunkSize);
        reader.readAsText(slice);
      } else {
        resolve(content);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Read first chunk
    const slice = file.slice(offset, offset + chunkSize);
    reader.readAsText(slice);
  });
}

export function validateJSONFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    readFile(file)
      .then(content => {
        try {
          JSON.parse(content);
          resolve(true);
        } catch {
          resolve(false);
        }
      })
      .catch(() => {
        resolve(false);
      });
  });
}

export function createDownloadLink(jsonString: string, filename: string): string {
  const blob = new Blob([jsonString], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
      resolve();
    } catch (error) {
      textArea.remove();
      reject(error);
    }
  });
}

export function estimateJSONLineCount(jsonString: string): number {
  return jsonString.split('\n').length;
}

export function estimateJSONKeyCount(jsonString: string): number {
  const matches = jsonString.match(/"[^"]*"\s*:/g);
  return matches ? matches.length : 0;
}

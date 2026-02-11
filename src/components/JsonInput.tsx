import React, { useRef, useEffect, useCallback } from 'react';
import { FileUp, X } from 'lucide-react';
import { useJsonStore } from '../store/useJsonStore';
import { formatFileSize } from '../utils/fileHandler';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  onFileDrop: (file: File, content: string) => void;
  placeholder?: string;
}

export const JsonInput: React.FC<JsonInputProps> = ({
  value,
  onChange,
  onFileDrop,
  placeholder = 'Paste your JSON here or drag and drop a file...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const store = useJsonStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const [errorLine, setErrorLine] = React.useState<number | null>(null);
  
  // Update error line highlight
  useEffect(() => {
    if (store.validationErrors.length > 0 && store.validationErrors[0]) {
      setErrorLine(store.validationErrors[0].line);
    } else {
      setErrorLine(null);
    }
  }, [store.validationErrors]);
  
  // Handle text change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);
  
  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      try {
        const text = await file.text();
        onFileDrop(file, text);
      } catch (error) {
        console.error('Failed to read file:', error);
      }
    }
  }, [onFileDrop]);
  
  // Get line count
  const lineCount = value.split('\n').length;
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+A to select all
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        textareaRef.current?.select();
      }
    };
    
    textareaRef.current?.addEventListener('keydown', handleKeyDown);
    return () => {
      textareaRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Auto-resize height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);
  
  return (
    <div className="relative flex flex-col h-full bg-canvas rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-secondary border-b border-surface-tertiary">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text-secondary">Input</span>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>{lineCount} lines</span>
            <span>•</span>
            <span>{formatFileSize(new Blob([value]).size)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {value && (
            <button
              onClick={() => onChange('')}
              className="btn-icon"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Drop Zone Overlay */}
      {isDragging && (
        <div
          className="absolute inset-0 z-10 drop-zone active flex items-center justify-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <FileUp className="w-12 h-12 mx-auto mb-3 text-accent-primary" />
            <p className="text-lg font-medium text-text-primary">Drop JSON file here</p>
            <p className="text-sm text-text-tertiary mt-1">or click to browse</p>
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="flex-shrink-0 py-4 px-2 bg-surface-primary text-right select-none">
          {Array.from({ length: Math.max(lineCount, 10) }, (_, i) => (
            <div
              key={i}
              className={`h-6 leading-6 text-xs font-mono ${
                i + 1 === errorLine
                  ? 'text-accent-error'
                  : 'text-text-tertiary'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          placeholder={placeholder}
          className="flex-1 py-4 pr-4 bg-canvas text-text-primary font-mono text-sm leading-6 resize-none outline-none overflow-auto"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
        />
      </div>
      
      {/* File Drop Hint */}
      {!value && !isDragging && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-text-tertiary text-sm pointer-events-none">
          <span className="flex items-center gap-2">
            <FileUp className="w-4 h-4" />
            Drag & drop a JSON file or paste code
          </span>
        </div>
      )}
    </div>
  );
};

export default JsonInput;

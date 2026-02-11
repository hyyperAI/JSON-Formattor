import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Copy, Check, Download, Eye, EyeOff } from 'lucide-react';
import { highlightJSON } from '../utils/syntaxHighlighter';
import { formatFileSize } from '../utils/fileHandler';

interface JsonOutputProps {
  value: string;
  onCopy?: () => void;
  onDownload?: () => void;
  copied?: boolean;
}

export const JsonOutput: React.FC<JsonOutputProps> = ({
  value,
  onCopy,
  onDownload,
  copied = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightedHtml, setHighlightedHtml] = useState('');
  const [lineCount, setLineCount] = useState(0);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  
  // Generate syntax highlighting
  useEffect(() => {
    if (value) {
      const html = highlightJSON(value);
      setHighlightedHtml(html);
      setLineCount(value.split('\n').length);
    } else {
      setHighlightedHtml('');
      setLineCount(0);
    }
  }, [value]);
  
  // Handle copy
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      onCopy?.();
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [value, onCopy]);
  
  // Handle download
  const handleDownload = useCallback(() => {
    const blob = new Blob([value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onDownload?.();
  }, [value, onDownload]);
  
  // Auto-scroll to top on value change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [value]);
  
  if (!value) {
    return (
      <div className="flex flex-col h-full bg-canvas rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface-secondary border-b border-surface-tertiary">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-secondary">Output</span>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center text-text-tertiary">
          <div className="text-center">
            <p className="text-sm">Formatted JSON will appear here</p>
            <p className="text-xs mt-1">Click "Format" to process your input</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full bg-canvas rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-secondary border-b border-surface-tertiary">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text-secondary">Output</span>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>{lineCount} lines</span>
            <span>•</span>
            <span>{formatFileSize(new Blob([value]).size)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Toggle Line Numbers */}
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="btn-icon"
            title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
          >
            {showLineNumbers ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
          
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="btn-icon"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-accent-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="btn-icon"
            title="Download as JSON file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Syntax Highlighted Output */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        {showLineNumbers && (
          <div className="flex-shrink-0 py-4 px-2 bg-surface-primary text-right select-none">
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i}
                className="h-6 leading-6 text-xs font-mono text-text-tertiary"
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}
        
        {/* Code Display */}
        <div
          ref={containerRef}
          className="flex-1 py-4 pr-4 overflow-auto font-mono text-sm leading-6"
        >
          <pre
            className="m-0 whitespace-pre-wrap break-all"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      </div>
    </div>
  );
};

export default JsonOutput;

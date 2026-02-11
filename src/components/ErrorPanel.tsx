import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import { useJsonStore } from '../store/useJsonStore';
import { getErrorContext } from '../utils/jsonValidator';

interface ErrorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ isOpen, onClose }) => {
  const store = useJsonStore();
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set([0]));
  
  if (!isOpen || store.validationErrors.length === 0) {
    return null;
  }
  
  const toggleErrorExpansion = (index: number) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedErrors(newExpanded);
  };
  
  const handleErrorClick = (error: typeof store.validationErrors[0]) => {
    // In a real implementation, this would scroll the input to the error line
    console.log('Navigate to error:', error.line, error.column);
  };
  
  return (
    <div className="flex flex-col h-full bg-surface-primary border-l border-surface-tertiary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-accent-error/10 border-b border-surface-tertiary">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-accent-error" />
          <span className="text-sm font-medium text-text-primary">
            Validation Errors
          </span>
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-accent-error/20 text-accent-error">
            {store.validationErrors.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="btn-icon"
          title="Close error panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Error List */}
      <div className="flex-1 overflow-y-auto">
        {store.validationErrors.map((error, index) => (
          <div
            key={index}
            className="border-b border-surface-tertiary last:border-b-0"
          >
            {/* Error Summary */}
            <button
              onClick={() => toggleErrorExpansion(index)}
              className="w-full px-4 py-3 text-left hover:bg-surface-secondary transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-accent-error/20 text-accent-error text-xs font-medium">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">
                      {error.message}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                      <span>Line {error.line}</span>
                      <span>•</span>
                      <span>Column {error.column}</span>
                      <span>•</span>
                      <span>Position {error.position}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {expandedErrors.has(index) ? (
                    <ChevronUp className="w-4 h-4 text-text-tertiary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-tertiary" />
                  )}
                </div>
              </div>
            </button>
            
            {/* Error Details */}
            {expandedErrors.has(index) && (
              <div className="px-4 pb-4 pl-11">
                {/* Error Code */}
                <div className="mb-3">
                  <span className="text-xs text-text-tertiary">Error Code: </span>
                  <code className="text-xs px-1.5 py-0.5 rounded bg-surface-secondary text-accent-warning">
                    {error.code}
                  </code>
                </div>
                
                {/* Context */}
                {error.position !== undefined && (
                  <div className="mb-3">
                    <div className="text-xs text-text-tertiary mb-1">Context:</div>
                    <pre className="p-2 rounded bg-surface-secondary text-xs font-mono text-text-secondary overflow-x-auto">
                      {getErrorContext(store.inputJson, error, 2)}
                    </pre>
                  </div>
                )}
                
                {/* Suggestion */}
                {error.suggestion && (
                  <div className="p-3 rounded bg-accent-info/10 border border-accent-info/20">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-accent-info flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-accent-info mb-1">
                          Suggestion
                        </div>
                        <p className="text-xs text-text-secondary">
                          {error.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Jump to Error */}
                <button
                  onClick={() => handleErrorClick(error)}
                  className="mt-3 w-full btn-secondary text-xs"
                >
                  Jump to error location
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorPanel;

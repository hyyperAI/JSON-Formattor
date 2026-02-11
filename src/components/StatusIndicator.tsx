import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { useJsonStore } from '../store/useJsonStore';
import { formatDuration } from '../utils/metricsCalculator';

interface StatusIndicatorProps {
  compact?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ compact = false }) => {
  const store = useJsonStore();
  
  if (store.processingState.isProcessing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-warning/10 text-accent-warning">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">Processing...</span>
      </div>
    );
  }
  
  if (!store.inputJson) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-tertiary/50 text-text-tertiary">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Ready</span>
      </div>
    );
  }
  
  if (store.isValid) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-success/10 text-accent-success">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Valid JSON</span>
        {store.statistics.processingTime > 0 && (
          <>
            <span className="text-xs text-accent-success/70">•</span>
            <span className="text-xs text-accent-success/70">
              {formatDuration(store.statistics.processingTime)}
            </span>
          </>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-error/10 text-accent-error">
      <XCircle className="w-4 h-4" />
      <span className="text-sm font-medium">
        Invalid JSON
        {store.validationErrors.length > 0 && (
          <span className="ml-1 text-xs opacity-70">
            ({store.validationErrors.length} error{store.validationErrors.length > 1 ? 's' : ''})
          </span>
        )}
      </span>
    </div>
  );
};

export const CompactStatusIndicator: React.FC = () => {
  const store = useJsonStore();
  
  if (store.processingState.isProcessing) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent-warning/10 text-accent-warning">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs">Processing</span>
      </div>
    );
  }
  
  if (!store.inputJson) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-tertiary/50 text-text-tertiary">
        <AlertCircle className="w-3 h-3" />
        <span className="text-xs">Ready</span>
      </div>
    );
  }
  
  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
        store.isValid
          ? 'bg-accent-success/10 text-accent-success'
          : 'bg-accent-error/10 text-accent-error'
      }`}
    >
      {store.isValid ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      <span className="text-xs">
        {store.isValid ? 'Valid' : `Invalid (${store.validationErrors.length})`}
      </span>
    </div>
  );
};

export default StatusIndicator;

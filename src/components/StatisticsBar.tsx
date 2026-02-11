import React from 'react';
import { ArrowDown, ArrowUp, Minus, Clock, FileText, Hash, Layers } from 'lucide-react';
import { useJsonStore } from '../store/useJsonStore';
import { formatBytes, formatDuration } from '../utils/metricsCalculator';

export const StatisticsBar: React.FC = () => {
  const store = useJsonStore();
  const stats = store.statistics;
  
  if (!store.inputJson) {
    return null;
  }
  
  const sizeChange = stats.outputSize - stats.inputSize;
  const sizeChangePercent = stats.inputSize > 0
    ? ((sizeChange / stats.inputSize) * 100)
    : 0;
  
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-surface-secondary border-t border-surface-tertiary text-xs">
      {/* Size Comparison */}
      <div className="flex items-center gap-1.5">
        <FileText className="w-3.5 h-3.5 text-text-tertiary" />
        <span className="text-text-secondary">Size:</span>
        <span className="text-text-primary font-mono">
          {formatBytes(stats.inputSize)}
        </span>
        {sizeChange !== 0 && (
          <>
            {sizeChange < 0 ? (
              <ArrowDown className="w-3 h-3 text-accent-success" />
            ) : (
              <ArrowUp className="w-3 h-3 text-accent-error" />
            )}
            <span className={`font-mono ${sizeChange < 0 ? 'text-accent-success' : 'text-accent-error'}`}>
              {formatBytes(Math.abs(sizeChange))} ({sizeChangePercent.toFixed(1)}%)
            </span>
          </>
        )}
      </div>
      
      {/* Line Count */}
      <div className="flex items-center gap-1.5">
        <Hash className="w-3.5 h-3.5 text-text-tertiary" />
        <span className="text-text-secondary">Lines:</span>
        <span className="text-text-primary font-mono">{stats.lineCount}</span>
      </div>
      
      {/* Key Count */}
      <div className="hidden md:flex items-center gap-1.5">
        <span className="text-text-secondary">Keys:</span>
        <span className="text-text-primary font-mono">{stats.keyCount}</span>
      </div>
      
      {/* Depth Level */}
      <div className="hidden lg:flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5 text-text-tertiary" />
        <span className="text-text-secondary">Depth:</span>
        <span className="text-text-primary font-mono">{stats.depthLevel}</span>
      </div>
      
      {/* Processing Time */}
      {stats.processingTime > 0 && (
        <div className="flex items-center gap-1.5 ml-auto">
          <Clock className="w-3.5 h-3.5 text-text-tertiary" />
          <span className="text-text-secondary">Processed in:</span>
          <span className="text-text-primary font-mono">
            {formatDuration(stats.processingTime)}
          </span>
        </div>
      )}
      
      {/* Compression Indicator */}
      {stats.compressionRatio !== 0 && (
        <div className={`flex items-center gap-1 ${
          stats.compressionRatio > 0 ? 'text-accent-success' : 'text-accent-error'
        }`}>
          {stats.compressionRatio > 0 ? (
            <>
              <ArrowDown className="w-3 h-3" />
              <span className="font-mono">{stats.compressionRatio.toFixed(1)}%</span>
            </>
          ) : (
            <>
              <ArrowUp className="w-3 h-3" />
              <span className="font-mono">{Math.abs(stats.compressionRatio).toFixed(1)}%</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StatisticsBar;

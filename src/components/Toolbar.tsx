import React, { useState } from 'react';
import {
  Wand2,
  Trash2,
  FileCode,
  ChevronDown,
  Keyboard,
  Sparkles,
  Loader2,
  Minimize2,
} from 'lucide-react';
import { useJsonStore, useJsonStoreSelectors } from '../store/useJsonStore';
import { SAMPLE_JSONS, getAllSampleJSONs } from '../utils/sampleGenerator';
import type { FormattingOptions } from '../types';

interface ToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onClear: () => void;
  onLoadSample: (sampleId: string) => void;
  onShowShortcuts: () => void;
  isProcessing?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onMinify,
  onClear,
  onLoadSample,
  onShowShortcuts,
  isProcessing = false,
}) => {
  const store = useJsonStore();
  const selectors = useJsonStoreSelectors();
  
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);
  const [showIndentDropdown, setShowIndentDropdown] = useState(false);
  
  const indentOptions = [
    { value: 2, label: '2 spaces', icon: '··' },
    { value: 4, label: '4 spaces', icon: '····' },
    { value: 8, label: '8 spaces', icon: '········' },
    { value: 'tab', label: 'Tab', icon: '→' },
  ] as const;
  
  const handleIndentChange = (indent: FormattingOptions['indentSize'], useTabs: boolean) => {
    store.setFormattingOptions({ indentSize: indent, useTabs });
    setShowIndentDropdown(false);
  };
  
  const samples = getAllSampleJSONs();
  
  return (
    <div className="flex items-center gap-1 px-3 h-12 bg-surface-secondary border-b border-surface-tertiary">
      {/* Indentation Selector */}
      <div className="relative">
        <button
          onClick={() => setShowIndentDropdown(!showIndentDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
        >
          <span className="font-mono text-xs">
            {store.formattingOptions.useTabs ? '→' : ' '.repeat(store.formattingOptions.indentSize)}
          </span>
          <ChevronDown className="w-3 h-3" />
        </button>
        
        {showIndentDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowIndentDropdown(false)} 
            />
            <div className="absolute top-full left-0 mt-1 py-1 w-36 bg-surface-primary border border-surface-tertiary rounded-md shadow-lg z-20">
              {indentOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleIndentChange(option.value as any, option.value === 'tab')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-tertiary transition-colors ${
                    (typeof option.value === 'number' && option.value === store.formattingOptions.indentSize && !store.formattingOptions.useTabs) ||
                    (option.value === 'tab' && store.formattingOptions.useTabs)
                      ? 'text-accent-primary bg-accent-primary/10'
                      : 'text-text-secondary'
                  }`}
                >
                  <span className="font-mono text-xs w-8">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Divider */}
      <div className="w-px h-6 bg-surface-tertiary mx-2" />
      
      {/* JSON5 Toggle */}
      <button
        onClick={() => store.setFormattingOptions({ json5Mode: !store.formattingOptions.json5Mode })}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
          store.formattingOptions.json5Mode
            ? 'text-accent-primary bg-accent-primary/10'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary'
        }`}
        title="Toggle JSON5 mode (allows comments and trailing commas)"
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">JSON5</span>
      </button>
      
      {/* Divider */}
      <div className="w-px h-6 bg-surface-tertiary mx-2" />
      
      {/* Format Button */}
      <button
        onClick={onFormat}
        disabled={!selectors.canFormat || isProcessing}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Format</span>
        <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-xs text-text-tertiary bg-surface-tertiary rounded ml-1">
          Ctrl+Enter
        </kbd>
      </button>
      
      {/* Minify Button */}
      <button
        onClick={onMinify}
        disabled={!selectors.canMinify || isProcessing}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Minimize2 className="w-4 h-4" />
        <span className="hidden sm:inline">Minify</span>
      </button>
      
      {/* Clear Button */}
      <button
        onClick={onClear}
        disabled={selectors.isEmpty || isProcessing}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-accent-error hover:bg-accent-error/10 hover:border-accent-error/50"
      >
        <Trash2 className="w-4 h-4 text-accent-error" />
        <span className="hidden sm:inline">Clear</span>
      </button>
      
      {/* Divider */}
      <div className="w-px h-6 bg-surface-tertiary mx-2" />
      
      {/* Sample Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowSampleDropdown(!showSampleDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
        >
          <FileCode className="w-4 h-4" />
          <span className="hidden sm:inline">Sample</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        
        {showSampleDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowSampleDropdown(false)} 
            />
            <div className="absolute top-full left-0 mt-1 w-56 max-h-64 overflow-y-auto bg-surface-primary border border-surface-tertiary rounded-md shadow-lg z-20">
              <div className="py-1">
                {samples.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      onLoadSample(sample.id);
                      setShowSampleDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-surface-tertiary transition-colors"
                  >
                    <div className="text-text-primary">{sample.name}</div>
                    <div className="text-xs text-text-tertiary truncate">{sample.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Keyboard Shortcuts Button */}
      <button
        onClick={onShowShortcuts}
        className="btn-icon ml-auto"
        title="Keyboard shortcuts"
      >
        <Keyboard className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toolbar;

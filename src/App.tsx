import React, { useState, useCallback, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { JsonInput } from './components/JsonInput';
import { JsonOutput } from './components/JsonOutput';
import { StatusIndicator, CompactStatusIndicator } from './components/StatusIndicator';
import { ErrorPanel } from './components/ErrorPanel';
import { StatisticsBar } from './components/StatisticsBar';
import { useJsonProcessor } from './hooks/useJsonProcessor';
import { useKeyboardShortcuts, formatShortcutDisplay } from './hooks/useKeyboardShortcuts';
import { useJsonStore } from './store/useJsonStore';
import { getSampleJSONById } from './utils/sampleGenerator';
import { DEFAULT_SHORTCUTS } from './utils/keyboardShortcuts';

function App() {
  const store = useJsonStore();
  
  const [showErrorPanel, setShowErrorPanel] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Initialize JSON processor
  const processor = useJsonProcessor({
    autoValidate: true,
    autoFormat: false,
  });
  
  // Handle copy
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(processor.outputJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [processor.outputJson]);
  
  // Handle download
  const handleDownload = useCallback(() => {
    const blob = new Blob([processor.outputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [processor.outputJson]);
  
  // Handle keyboard shortcuts
  const shortcuts = useKeyboardShortcuts({
    format: processor.format,
    minify: processor.minify,
    validate: processor.validate,
    clear: processor.clear,
    copy: handleCopy,
    save: handleDownload,
    'toggle-json5': () => {
      store.setFormattingOptions({ json5Mode: !store.formattingOptions.json5Mode });
    },
    shortcuts: () => setShowShortcutsModal(true),
    escape: () => {
      setShowShortcutsModal(false);
    },
  });
  
  // Event handlers
  const handleFileDrop = useCallback((file: File, content: string) => {
    processor.loadFile(file.name, content, file.size);
  }, [processor]);
  
  const handleLoadSample = useCallback((sampleId: string) => {
    const jsonString = getSampleJSONById(sampleId);
    if (jsonString) {
      processor.setInputJson(jsonString);
    }
  }, [processor]);
  
  // Show error panel when validation fails
  useEffect(() => {
    if (!store.isValid && store.validationErrors.length > 0) {
      setShowErrorPanel(true);
    }
  }, [store.isValid, store.validationErrors.length]);
  
  return (
    <div className="h-screen flex flex-col bg-canvas text-text-primary overflow-hidden">
      {/* Header */}
      <Header
        onShowShortcuts={() => setShowShortcutsModal(true)}
        version="1.0.0"
      />
      
      {/* Toolbar */}
      <Toolbar
        onFormat={processor.format}
        onMinify={processor.minify}
        onClear={processor.clear}
        onLoadSample={handleLoadSample}
        onShowShortcuts={() => setShowShortcutsModal(true)}
        isProcessing={processor.isProcessing}
      />
      
      {/* Status Bar (Desktop) */}
      <div className="hidden md:flex items-center justify-between px-4 py-2 bg-surface-secondary border-b border-surface-tertiary">
        <StatusIndicator />
        <CompactStatusIndicator />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Input Pane */}
        <div className={`flex-1 flex flex-col ${showErrorPanel ? 'border-r border-surface-tertiary' : ''} min-w-0`}>
          <JsonInput
            value={processor.inputJson}
            onChange={processor.setInputJson}
            onFileDrop={handleFileDrop}
            placeholder="Paste your JSON here or drag & drop a file..."
          />
          <StatisticsBar />
        </div>
        
        {/* Error Panel */}
        {showErrorPanel && (
          <ErrorPanel
            isOpen={showErrorPanel}
            onClose={() => setShowErrorPanel(false)}
          />
        )}
        
        {/* Output Pane */}
        <div className="flex-1 flex flex-col min-w-0 hidden lg:flex">
          <JsonOutput
            value={processor.outputJson}
            onCopy={handleCopy}
            onDownload={handleDownload}
            copied={copied}
          />
        </div>
      </div>
      
      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowShortcutsModal(false)}
          />
          <div className="fixed inset-x-4 top-20 mx-auto w-full max-w-lg bg-surface-primary rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-tertiary">
              <div className="flex items-center gap-3">
                <Keyboard className="w-5 h-5 text-accent-primary" />
                <h2 className="text-lg font-semibold text-text-primary">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="btn-icon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-2">
                    Formatting
                  </h3>
                  <div className="space-y-1">
                    {DEFAULT_SHORTCUTS.filter(s => 
                      ['format', 'minify', 'validate', 'clear'].includes(s.action)
                    ).map(shortcut => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-sm text-text-primary">
                          {shortcut.description}
                        </span>
                        <kbd className="px-2 py-0.5 text-xs rounded bg-surface-secondary font-mono text-text-secondary">
                          {formatShortcutDisplay(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-2">
                    Indentation
                  </h3>
                  <div className="space-y-1">
                    {DEFAULT_SHORTCUTS.filter(s => 
                      s.action.startsWith('indent')
                    ).map(shortcut => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-sm text-text-primary">
                          {shortcut.description}
                        </span>
                        <kbd className="px-2 py-0.5 text-xs rounded bg-surface-secondary font-mono text-text-secondary">
                          {formatShortcutDisplay(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-2">
                    Other
                  </h3>
                  <div className="space-y-1">
                    {DEFAULT_SHORTCUTS.filter(s => 
                      ['copy', 'save', 'toggle-json5', 'shortcuts', 'escape'].includes(s.action)
                    ).map(shortcut => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-sm text-text-primary">
                          {shortcut.description}
                        </span>
                        <kbd className="px-2 py-0.5 text-xs rounded bg-surface-secondary font-mono text-text-secondary">
                          {formatShortcutDisplay(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-3 bg-surface-secondary border-t border-surface-tertiary text-xs text-text-tertiary">
              Press <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary font-mono">Ctrl + /</kbd> to toggle this dialog
            </div>
          </div>
        </>
      )}
      
      {/* Mobile View Toggle */}
      <div className="md:hidden fixed bottom-4 right-4 flex gap-2 z-30">
        <button
          onClick={() => store.setActiveView('input')}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${
            store.activeView === 'input'
              ? 'bg-accent-primary text-canvas'
              : 'bg-surface-secondary text-text-secondary'
          }`}
        >
          Input
        </button>
        <button
          onClick={() => store.setActiveView('output')}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${
            store.activeView === 'output'
              ? 'bg-accent-primary text-canvas'
              : 'bg-surface-secondary text-text-secondary'
          }`}
        >
          Output
        </button>
      </div>
    </div>
  );
}

export default App;

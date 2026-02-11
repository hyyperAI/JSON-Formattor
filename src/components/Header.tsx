import React from 'react';
import { HelpCircle, Settings, Download, Copy, Check } from 'lucide-react';
import { useJsonStore } from '../store/useJsonStore';
import { formatFileSize } from '../utils/fileHandler';

interface HeaderProps {
  onShowShortcuts: () => void;
  version?: string;
}

export const Header: React.FC<HeaderProps> = ({ onShowShortcuts, version = '1.0.0' }) => {
  const store = useJsonStore();
  const [copied, setCopied] = React.useState(false);
  
  const handleCopyInfo = async () => {
    const info = `JSON Formatter Pro v${version}\nProcessed locally - no data leaves your browser\n\nFeatures:\n• JSON formatting and validation\n• JSON5 support with comments and trailing commas\n• Tree view navigation\n• Drag and drop file support\n• Keyboard shortcuts\n• Dark theme`;
    
    try {
      await navigator.clipboard.writeText(info);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  return (
    <header className="flex items-center justify-between px-4 h-14 bg-canvas-light border-b border-surface-tertiary">
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-primary/10">
          <span className="text-accent-primary font-bold text-sm"></span>
        </div>
        <div>
          <h1 className="text-body font-semibold text-text-primary">JSON Formatter Pro</h1>
          <p className="text-xs text-text-tertiary hidden sm:block">Local JSON Processing</p>
        </div>
      </div>
      
      {/* Usman Sajid - Center */}
      <div className="hidden md:flex items-center">
        <span className="text-sm font-medium text-text-secondary px-4 py-1 rounded-full bg-surface-secondary border border-surface-tertiary">
          Usman Sajid
        </span>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* File Info */}
        {store.lastFileName && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-secondary text-xs text-text-secondary">
            <span className="truncate max-w-32">{store.lastFileName}</span>
            <span className="text-text-tertiary">{formatFileSize(store.originalFileSize)}</span>
          </div>
        )}
        
        {/* Copy Info Button */}
        <button
          onClick={handleCopyInfo}
          className="btn-icon"
          title="Copy app info"
        >
          {copied ? (
            <Check className="w-4 h-4 text-accent-success" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        
        {/* Keyboard Shortcuts Button */}
        <button
          onClick={onShowShortcuts}
          className="btn-icon"
          title="Keyboard shortcuts (Ctrl + /)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        
        {/* Version */}
        <span className="hidden lg:block text-xs text-text-tertiary px-2">
          v{version}
        </span>
      </div>
    </header>
  );
};

export default Header;

import { useEffect, useCallback, useRef } from 'react';
import type { KeyboardShortcut } from '../types';
import { useJsonStore } from '../store/useJsonStore';

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'format',
    key: 'Enter',
    modifiers: ['ctrl'],
    action: 'format',
    description: 'Format JSON',
    enabled: true,
  },
  {
    id: 'validate',
    key: 'l',
    modifiers: ['ctrl'],
    action: 'validate',
    description: 'Validate JSON',
    enabled: true,
  },
  {
    id: 'minify',
    key: 'm',
    modifiers: ['ctrl', 'shift'],
    action: 'minify',
    description: 'Minify JSON',
    enabled: true,
  },
  {
    id: 'copy',
    key: 'c',
    modifiers: ['ctrl'],
    action: 'copy',
    description: 'Copy to clipboard',
    enabled: true,
  },
  {
    id: 'clear',
    key: 'k',
    modifiers: ['ctrl'],
    action: 'clear',
    description: 'Clear all',
    enabled: true,
  },
  {
    id: 'save',
    key: 's',
    modifiers: ['ctrl'],
    action: 'save',
    description: 'Download JSON',
    enabled: true,
  },
  {
    id: 'toggle-json5',
    key: '5',
    modifiers: ['ctrl', 'shift'],
    action: 'toggle-json5',
    description: 'Toggle JSON5 mode',
    enabled: true,
  },
  {
    id: 'indent-2',
    key: '2',
    modifiers: ['ctrl', 'shift'],
    action: 'indent-2',
    description: 'Set 2-space indent',
    enabled: true,
  },
  {
    id: 'indent-4',
    key: '4',
    modifiers: ['ctrl', 'shift'],
    action: 'indent-4',
    description: 'Set 4-space indent',
    enabled: true,
  },
  {
    id: 'indent-tab',
    key: 't',
    modifiers: ['ctrl', 'shift'],
    action: 'indent-tab',
    description: 'Set tab indent',
    enabled: true,
  },
  {
    id: 'focus-input',
    key: 'i',
    modifiers: ['ctrl'],
    action: 'focus-input',
    description: 'Focus input area',
    enabled: true,
  },
  {
    id: 'focus-output',
    key: 'o',
    modifiers: ['ctrl'],
    action: 'focus-output',
    description: 'Focus output area',
    enabled: true,
  },
  {
    id: 'shortcuts',
    key: '/',
    modifiers: ['ctrl'],
    action: 'shortcuts',
    description: 'Show keyboard shortcuts',
    enabled: true,
  },
  {
    id: 'escape',
    key: 'Escape',
    modifiers: [],
    action: 'escape',
    description: 'Close modal/panel',
    enabled: true,
  },
];

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  target?: HTMLElement | Window | Document;
}

interface UseKeyboardShortcutsReturn {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (shortcutId: string) => void;
  enableShortcut: (shortcutId: string) => void;
  disableShortcut: (shortcutId: string) => void;
  resetShortcuts: () => void;
  getShortcutForAction: (action: string) => KeyboardShortcut | undefined;
}

export function useKeyboardShortcuts(
  handlers: Record<string, () => void>,
  options: UseKeyboardShortcutsOptions = {}
): UseKeyboardShortcutsReturn {
  const {
    enabled = true,
    preventDefault = true,
    target = window,
  } = options;
  
  const shortcutsRef = useRef<KeyboardShortcut[]>([...DEFAULT_SHORTCUTS]);
  const handlersRef = useRef(handlers);
  
  // Update handlers when they change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);
  
  // Get shortcut for action
  const getShortcutForAction = useCallback((action: string) => {
    return shortcutsRef.current.find(s => s.action === action);
  }, []);
  
  // Register a new shortcut
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    const existingIndex = shortcutsRef.current.findIndex(s => s.id === shortcut.id);
    
    if (existingIndex >= 0) {
      shortcutsRef.current[existingIndex] = shortcut;
    } else {
      shortcutsRef.current.push(shortcut);
    }
  }, []);
  
  // Unregister a shortcut
  const unregisterShortcut = useCallback((shortcutId: string) => {
    shortcutsRef.current = shortcutsRef.current.filter(s => s.id !== shortcutId);
  }, []);
  
  // Enable a shortcut
  const enableShortcut = useCallback((shortcutId: string) => {
    const shortcut = shortcutsRef.current.find(s => s.id === shortcutId);
    if (shortcut) {
      shortcut.enabled = true;
    }
  }, []);
  
  // Disable a shortcut
  const disableShortcut = useCallback((shortcutId: string) => {
    const shortcut = shortcutsRef.current.find(s => s.id === shortcutId);
    if (shortcut) {
      shortcut.enabled = false;
    }
  }, []);
  
  // Reset to default shortcuts
  const resetShortcuts = useCallback(() => {
    shortcutsRef.current = [...DEFAULT_SHORTCUTS];
  }, []);
  
  // Handle keyboard event
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Ignore if user is typing in an input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow only certain shortcuts in inputs
      const allowedInInput = ['Escape', 'Enter'];
      if (!allowedInInput.includes(event.key) || !event.ctrlKey) {
        return;
      }
    }
    
    // Build the pressed key combination
    const modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[] = [];
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    if (event.metaKey) modifiers.push('meta');
    
    const key = event.key.toLowerCase();
    
    // Find matching shortcut
    const shortcut = shortcutsRef.current.find(s => {
      if (!s.enabled) return false;
      if (s.key.toLowerCase() !== key) return false;
      if (s.modifiers.length !== modifiers.length) return false;
      
      return s.modifiers.every(m => modifiers.includes(m));
    });
    
    if (shortcut && handlersRef.current[shortcut.action]) {
      if (preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      handlersRef.current[shortcut.action]();
    }
  }, [enabled, preventDefault]);
  
  // Set up event listener
  useEffect(() => {
    const element = target as HTMLElement | Window | Document;
    element.addEventListener('keydown', handleKeyDown);
    
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [target, handleKeyDown]);
  
  return {
    shortcuts: shortcutsRef.current,
    registerShortcut,
    unregisterShortcut,
    enableShortcut,
    disableShortcut,
    resetShortcuts,
    getShortcutForAction,
  };
}

// Specialized hook for JSON formatter shortcuts
export function useJsonFormatterShortcuts(processor: {
  format: () => void;
  minify: () => void;
  validate: () => void;
  clear: () => void;
  copy: () => void;
  save: () => void;
}) {
  const store = useJsonStore();
  
  const handlers = {
    format: processor.format,
    minify: processor.minify,
    validate: processor.validate,
    clear: () => {
      processor.clear();
      store.clearAll();
    },
    copy: processor.copy,
    save: processor.save,
    'toggle-json5': () => {
      store.setFormattingOptions({ json5Mode: !store.formattingOptions.json5Mode });
    },
    'indent-2': () => {
      store.setFormattingOptions({ indentSize: 2, useTabs: false });
    },
    'indent-4': () => {
      store.setFormattingOptions({ indentSize: 4, useTabs: false });
    },
    'indent-tab': () => {
      store.setFormattingOptions({ useTabs: true });
    },
    shortcuts: () => {
      store.toggleKeyboardShortcuts();
    },
    escape: () => {
      if (store.showKeyboardShortcuts) {
        store.toggleKeyboardShortcuts();
      }
    },
  };
  
  return useKeyboardShortcuts(handlers, { enabled: true });
}

// Helper to format shortcut for display
export function formatShortcutDisplay(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.modifiers.includes('ctrl')) {
    parts.push('Ctrl');
  }
  if (shortcut.modifiers.includes('alt')) {
    parts.push('Alt');
  }
  if (shortcut.modifiers.includes('shift')) {
    parts.push('Shift');
  }
  if (shortcut.modifiers.includes('meta')) {
    parts.push('Cmd');
  }
  
  // Format the key
  let key = shortcut.key;
  
  // Common key names
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    'enter': 'Enter',
    'escape': 'Esc',
    'backspace': 'Backspace',
    'tab': 'Tab',
    'delete': 'Del',
    'arrowup': '↑',
    'arrowdown': '↓',
    'arrowleft': '←',
    'arrowright': '→',
  };
  
  if (keyMap[key.toLowerCase()]) {
    key = keyMap[key.toLowerCase()];
  }
  
  parts.push(key);
  
  return parts.join(' + ');
}

// Get all enabled shortcuts as a formatted list
export function getFormattedShortcutsList(shortcuts: KeyboardShortcut[]): string[] {
  return shortcuts
    .filter(s => s.enabled)
    .sort((a, b) => {
      // Sort by modifier count, then by key
      const aMods = a.modifiers.length;
      const bMods = b.modifiers.length;
      
      if (aMods !== bMods) return bMods - aMods;
      return a.key.localeCompare(b.key);
    })
    .map(s => `${formatShortcutDisplay(s)}: ${s.description}`);
}

import type { KeyboardShortcut } from '../types';

export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
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
    'Enter': 'Enter',
    'Escape': 'Esc',
    'Backspace': 'Backspace',
    'Tab': 'Tab',
    'Delete': 'Del',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
  };
  
  if (keyMap[key]) {
    key = keyMap[key];
  }
  
  parts.push(key);
  
  return parts.join(' + ');
}

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

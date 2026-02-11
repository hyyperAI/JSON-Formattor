// Core Types for JSON Formatter & Validator

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: any;
  parsedAt: number;
}

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  code: string;
  suggestion?: string;
  position: number;
}

export interface FormattingOptions {
  indentSize: 2 | 4 | 8;
  useTabs: boolean;
  json5Mode: boolean;
  lineWidth: number;
}

export interface JSONStatistics {
  inputSize: number;
  outputSize: number;
  lineCount: number;
  keyCount: number;
  depthLevel: number;
  processingTime: number;
  compressionRatio: number;
}

export interface TreeNode {
  id: string;
  key: string;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  depth: number;
  expanded: boolean;
  children?: TreeNode[];
  path: string[];
  size?: number;
  parent?: TreeNode | null;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: string;
  description: string;
  enabled: boolean;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  message: string;
  startTime?: number;
}

export interface SyntaxToken {
  type: 'key' | 'string' | 'number' | 'boolean' | 'null' | 'bracket' | 'operator' | 'whitespace';
  value: string;
  position: {
    start: number;
    end: number;
    line: number;
    column: number;
  };
}

export interface PasteEvent {
  data: string;
  file?: File;
}

export interface DragDropEvent {
  files: File[];
  position?: { x: number; y: number };
}

export interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface JsonInputProps extends ComponentProps {
  value: string;
  onChange: (value: string) => void;
  onFileDrop: (file: File, content: string) => void;
  placeholder?: string;
  errorCount?: number;
  isValid?: boolean;
}

export interface JsonOutputProps extends ComponentProps {
  value: string;
  onCopy?: () => void;
  copied?: boolean;
}

export interface ToolbarProps extends ComponentProps {
  onFormat: () => void;
  onMinify: () => void;
  onClear: () => void;
  onLoadSample: (sampleId: string) => void;
  onToggleJson5: () => void;
  onShowShortcuts: () => void;
  formattingOptions: FormattingOptions;
  isProcessing: boolean;
  isValid?: boolean;
}

export interface StatusIndicatorProps extends ComponentProps {
  isValid: boolean;
  errorCount: number;
  processingTime?: number;
  status: 'idle' | 'processing' | 'success' | 'error';
}

export interface ErrorPanelProps extends ComponentProps {
  errors: ValidationError[];
  onErrorClick: (error: ValidationError) => void;
  isOpen: boolean;
}

export interface StatisticsBarProps extends ComponentProps {
  statistics: JSONStatistics;
  showDetails?: boolean;
}

export interface TreeViewProps extends ComponentProps {
  data: TreeNode[];
  onNodeToggle: (nodeId: string) => void;
  onNodeSelect: (node: TreeNode) => void;
  selectedNode?: string;
}

export interface FileDropZoneProps extends ComponentProps {
  onFileDrop: (file: File) => void;
  isActive: boolean;
}

export interface HeaderProps extends ComponentProps {
  onShowShortcuts: () => void;
  version?: string;
}

// Default Values
export const DEFAULT_FORMATTING_OPTIONS: FormattingOptions = {
  indentSize: 2,
  useTabs: false,
  json5Mode: false,
  lineWidth: 80,
};

export const DEFAULT_STATISTICS: JSONStatistics = {
  inputSize: 0,
  outputSize: 0,
  lineCount: 0,
  keyCount: 0,
  depthLevel: 0,
  processingTime: 0,
  compressionRatio: 0,
};

// Error Codes
export const ERROR_CODES = {
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  UNEXPECTED_TOKEN: 'UNEXPECTED_TOKEN',
  UNTERMINATED_STRING: 'UNTERMINATED_STRING',
  INVALID_NUMBER: 'INVALID_NUMBER',
  MISSING_COMMA: 'MISSING_COMMA',
  MISSING_COLON: 'MISSING_COLON',
  UNEXPECTED_CHARACTER: 'UNEXPECTED_CHARACTER',
  INVALID_ESCAPE: 'INVALID_ESCAPE',
  JSON5_COMMENT_NOT_SUPPORTED: 'JSON5_COMMENT_NOT_SUPPORTED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

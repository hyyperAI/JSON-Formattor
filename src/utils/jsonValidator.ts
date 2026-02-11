import type { ValidationResult, ValidationError } from '../types';
import { ERROR_CODES } from '../types';

export function validateJSON(jsonString: string): ValidationResult {
  const startTime = performance.now();
  
  if (!jsonString || jsonString.trim().length === 0) {
    return {
      isValid: false,
      errors: [{
        line: 1,
        column: 1,
        message: 'Empty JSON input',
        code: ERROR_CODES.SYNTAX_ERROR,
        position: 0,
      }],
      parsedAt: performance.now() - startTime,
    };
  }
  
  const errors: ValidationError[] = [];
  
  try {
    const parsed = JSON.parse(jsonString);
    
    return {
      isValid: true,
      errors: [],
      data: parsed,
      parsedAt: performance.now() - startTime,
    };
  } catch (error) {
    const parseError = error as SyntaxError;
    const errorDetails = parseErrorWithPosition(parseError, jsonString);
    
    errors.push({
      line: errorDetails.line,
      column: errorDetails.column,
      message: parseError.message,
      code: ERROR_CODES.SYNTAX_ERROR,
      position: errorDetails.position,
      suggestion: getErrorSuggestion(errorDetails, jsonString),
    });
    
    // Try to find additional errors for better UX
    const additionalErrors = findAdditionalErrors(jsonString, errorDetails.position);
    errors.push(...additionalErrors);
    
    return {
      isValid: false,
      errors,
      parsedAt: performance.now() - startTime,
    };
  }
}

interface ParseErrorDetails {
  line: number;
  column: number;
  position: number;
}

function parseErrorWithPosition(error: SyntaxError, jsonString: string): ParseErrorDetails {
  const message = error.message;
  
  // Extract position from error message if available
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const position = parseInt(positionMatch[1], 10);
    const lineCol = getLineAndColumn(jsonString, position);
    return {
      line: lineCol.line,
      column: lineCol.column,
      position,
    };
  }
  
  // Try to find the problematic position
  const position = getApproximateErrorPosition(message, jsonString);
  
  if (position !== -1) {
    const lineCol = getLineAndColumn(jsonString, position);
    return {
      line: lineCol.line,
      column: lineCol.column,
      position,
    };
  }
  
  // Default to beginning
  return {
    line: 1,
    column: 1,
    position: 0,
  };
}

function getLineAndColumn(jsonString: string, position: number): { line: number; column: number } {
  const lines = jsonString.substring(0, position).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

function getApproximateErrorPosition(errorMessage: string, jsonString: string): number {
  // Common error patterns
  const patterns = [
    { regex: /unexpected/i, message: 'Unexpected token' },
    { regex: /end of string/i, message: 'End of string' },
    { regex: /expected/i, message: 'Expected' },
  ];
  
  for (const pattern of patterns) {
    if (pattern.regex.test(errorMessage)) {
      // Find where the error likely occurred
      const words = errorMessage.split(' ');
      for (let i = jsonString.length - 1; i >= 0; i--) {
        let found = true;
        for (let j = 0; j < words.length && found; j++) {
          const word = words[j].toLowerCase();
          if (!jsonString.substring(i, i + word.length).toLowerCase().includes(word)) {
            found = false;
          }
        }
        if (found) {
          return i;
        }
      }
    }
  }
  
  return -1;
}

function getErrorSuggestion(errorDetails: ParseErrorDetails, jsonString: string): string {
  const charBefore = jsonString[errorDetails.position - 1];
  const charAt = jsonString[errorDetails.position];
  const charAfter = jsonString[errorDetails.position + 1];
  
  // Missing comma between items
  if (charBefore === ',' || charBefore === '}' || charBefore === ']') {
    return 'Check for missing comma or extra comma';
  }
  
  // Unterminated string
  if (charAt === '"' && charAfter && !['}', ']', ',', ' '].includes(charAfter)) {
    return 'String is not properly terminated. Check for unescaped quotes or special characters';
  }
  
  // Missing colon
  if (charBefore === '"' && charAfter === '"') {
    return 'Missing colon after object key';
  }
  
  // Unexpected token
  if (charAt === ',' || charAt === ':') {
    return 'Unexpected token. Check for missing value or extra comma';
  }
  
  return 'Review the JSON structure around this position';
}

function findAdditionalErrors(jsonString: string, startPosition: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Look for common patterns after the first error
  const substr = jsonString.substring(startPosition + 1);
  
  // Find trailing commas
  const trailingCommaRegex = /,\s*([}\]])/g;
  let match;
  
  while ((match = trailingCommaRegex.exec(substr)) !== null) {
    const position = startPosition + match.index + 1;
    const lineCol = getLineAndColumn(jsonString, position);
    
    errors.push({
      line: lineCol.line,
      column: lineCol.column,
      message: 'Trailing comma is not allowed in standard JSON',
      code: ERROR_CODES.MISSING_COMMA,
      position,
      suggestion: 'Remove the trailing comma before the closing bracket',
    });
  }
  
  return errors.slice(0, 3); // Limit to 3 additional errors
}

export function parseWithLineNumbers(jsonString: string): {
  data?: any;
  errors: ValidationError[];
  tokens: Array<{
    value: string;
    line: number;
    column: number;
    type: string;
  }>;
} {
  const errors: ValidationError[] = [];
  const tokens: Array<{
    value: string;
    line: number;
    column: number;
    type: string;
  }> = [];
  
  // Basic tokenization for error reporting
  let currentLine = 1;
  let currentColumn = 0;
  
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];
    
    if (char === '\n') {
      currentLine++;
      currentColumn = 0;
    } else {
      currentColumn++;
    }
    
    // Capture key tokens
    if (char === '"') {
      const tokenStart = i;
      let inEscape = false;
      i++;
      
      while (i < jsonString.length && (jsonString[i] !== '"' || inEscape)) {
        if (jsonString[i] === '\\') {
          inEscape = !inEscape;
        } else {
          inEscape = false;
        }
        i++;
      }
      
      const value = jsonString.substring(tokenStart, i + 1);
      tokens.push({
        value,
        line: currentLine,
        column: currentColumn - (i - tokenStart),
        type: 'string',
      });
    } else if (/[\d-]/.test(char)) {
      const tokenStart = i;
      while (i < jsonString.length && /[\d.eE+-]/.test(jsonString[i])) {
        i++;
      }
      const value = jsonString.substring(tokenStart, i);
      tokens.push({
        value,
        line: currentLine,
        column: currentColumn - (i - tokenStart),
        type: 'number',
      });
      i--; // Adjust for loop increment
    } else if (jsonString.substring(i, i + 4) === 'true') {
      tokens.push({
        value: 'true',
        line: currentLine,
        column: currentColumn,
        type: 'boolean',
      });
      i += 3;
    } else if (jsonString.substring(i, i + 5) === 'false') {
      tokens.push({
        value: 'false',
        line: currentLine,
        column: currentColumn,
        type: 'boolean',
      });
      i += 4;
    } else if (jsonString.substring(i, i + 4) === 'null') {
      tokens.push({
        value: 'null',
        line: currentLine,
        column: currentColumn,
        type: 'null',
      });
      i += 3;
    }
  }
  
  try {
    return {
      data: JSON.parse(jsonString),
      errors,
      tokens,
    };
  } catch (error) {
    const result = validateJSON(jsonString);
    return {
      errors: result.errors,
      tokens,
    };
  }
}

export function getErrorContext(jsonString: string, error: ValidationError, contextLines: number = 2): string {
  const lines = jsonString.split('\n');
  const startLine = Math.max(0, error.line - 1 - contextLines);
  const endLine = Math.min(lines.length, error.line + contextLines);
  
  const context = lines.slice(startLine, endLine).map((line, index) => {
    const lineNumber = startLine + index + 1;
    const prefix = lineNumber === error.line ? '→ ' : '  ';
    const lineNumStr = `${lineNumber}`.padStart(4);
    return `${prefix}${lineNumStr} │ ${line}`;
  });
  
  return context.join('\n');
}

export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

export function isValidJSON5(jsonString: string): boolean {
  try {
    // Basic check - try to parse as JSON first
    JSON.parse(jsonString);
    return true;
  } catch {
    // Could be JSON5 with comments/trailing commas
    // Try to strip common JSON5 features and parse
    const stripped = stripJSON5Comments(jsonString);
    try {
      JSON.parse(stripped);
      return true;
    } catch {
      return false;
    }
  }
}

function stripJSON5Comments(jsonString: string): string {
  let result = '';
  let i = 0;
  
  while (i < jsonString.length) {
    if (jsonString[i] === '/' && jsonString[i + 1] === '/') {
      // Single-line comment
      while (i < jsonString.length && jsonString[i] !== '\n') {
        i++;
      }
    } else if (jsonString[i] === '/' && jsonString[i + 1] === '*') {
      // Multi-line comment
      i += 2;
      while (i < jsonString.length - 1) {
        if (jsonString[i] === '*' && jsonString[i + 1] === '/') {
          i += 2;
          break;
        }
        i++;
      }
    } else {
      result += jsonString[i];
      i++;
    }
  }
  
  return result;
}

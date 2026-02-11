// JSON5 Parser - Supports comments, trailing commas, unquoted keys

export interface JSON5ParseOptions {
  allowComments?: boolean;
  allowTrailingCommas?: boolean;
  allowUnquotedKeys?: boolean;
}

export function parseJSON5(json5String: string, options: JSON5ParseOptions = {}): any {
  const {
    allowComments = true,
    allowTrailingCommas = true,
    allowUnquotedKeys = true,
  } = options;
  
  // Pre-process to handle JSON5 features
  let processed = json5String;
  
  if (allowComments) {
    processed = stripComments(processed);
  }
  
  if (allowTrailingCommas) {
    processed = stripTrailingCommas(processed);
  }
  
  if (allowUnquotedKeys) {
    processed = unquoteKeys(processed);
  }
  
  // Parse as regular JSON
  try {
    return JSON.parse(processed);
  } catch (error) {
    // Provide better error messages for JSON5-specific issues
    const parseError = error as SyntaxError;
    
    if (allowComments && parseError.message.includes('position')) {
      throw new Error(`Invalid JSON5 syntax: ${parseError.message}. Check for unterminated comments.`);
    }
    
    if (allowTrailingCommas && parseError.message.includes('position')) {
      throw new Error(`Invalid JSON5 syntax: ${parseError.message}. Trailing commas might be causing issues.`);
    }
    
    throw error;
  }
}

function stripComments(json5String: string): string {
  let result = '';
  let i = 0;
  
  while (i < json5String.length) {
    const char = json5String[i];
    const nextChar = json5String[i + 1];
    
    // Single-line comment //
    if (char === '/' && nextChar === '/') {
      // Skip until end of line
      while (i < json5String.length && json5String[i] !== '\n') {
        i++;
      }
      // Include the newline
      if (i < json5String.length && json5String[i] === '\n') {
        result += json5String[i];
        i++;
      }
      continue;
    }
    
    // Multi-line comment /* */
    if (char === '/' && nextChar === '*') {
      i += 2;
      while (i < json5String.length - 1) {
        if (json5String[i] === '*' && json5String[i + 1] === '/') {
          i += 2;
          break;
        }
        i++;
      }
      continue;
    }
    
    // Preserve strings (don't process comments inside strings)
    if (char === '"') {
      let inEscape = false;
      result += char;
      i++;
      
      while (i < json5String.length) {
        if (json5String[i] === '\\' && !inEscape) {
          inEscape = true;
        } else {
          inEscape = false;
        }
        
        result += json5String[i];
        
        if (json5String[i] === '"' && !inEscape) {
          break;
        }
        
        i++;
      }
      continue;
    }
    
    // Preserve character literals
    if (char === "'") {
      let inEscape = false;
      result += char;
      i++;
      
      while (i < json5String.length) {
        if (json5String[i] === '\\' && !inEscape) {
          inEscape = true;
        } else {
          inEscape = false;
        }
        
        result += json5String[i];
        
        if (json5String[i] === "'" && !inEscape) {
          break;
        }
        
        i++;
      }
      continue;
    }
    
    result += char;
    i++;
  }
  
  return result;
}

function stripTrailingCommas(json5String: string): string {
  let result = '';
  let i = 0;
  
  while (i < json5String.length) {
    // Skip strings
    if (json5String[i] === '"') {
      let inEscape = false;
      result += json5String[i];
      i++;
      
      while (i < json5String.length) {
        if (json5String[i] === '\\' && !inEscape) {
          inEscape = true;
        } else {
          inEscape = false;
        }
        
        result += json5String[i];
        
        if (json5String[i] === '"' && !inEscape) {
          break;
        }
        
        i++;
      }
      continue;
    }
    
    // Check for trailing comma before } or ]
    if (json5String[i] === ',' && (json5String[i + 1] === '}' || json5String[i + 1] === ']')) {
      i++; // Skip the comma
      continue;
    }
    
    result += json5String[i];
    i++;
  }
  
  return result;
}

function unquoteKeys(json5String: string): string {
  let result = '';
  let i = 0;
  
  while (i < json5String.length) {
    // Check for unquoted identifier followed by colon
    const unquotedKeyMatch = json5String.substring(i).match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/);
    
    if (unquotedKeyMatch) {
      const key = unquotedKeyMatch[1];
      result += `"${key}":`;
      i += key.length;
      
      // Skip the colon and any whitespace
      while (i < json5String.length && json5String[i] !== ':') {
        i++;
      }
      if (json5String[i] === ':') {
        i++;
      }
      continue;
    }
    
    // Preserve strings (don't modify quoted keys)
    if (json5String[i] === '"') {
      let inEscape = false;
      result += json5String[i];
      i++;
      
      while (i < json5String.length) {
        if (json5String[i] === '\\' && !inEscape) {
          inEscape = true;
        } else {
          inEscape = false;
        }
        
        result += json5String[i];
        
        if (json5String[i] === '"' && !inEscape) {
          break;
        }
        
        i++;
      }
      continue;
    }
    
    // Preserve character literals
    if (json5String[i] === "'") {
      let inEscape = false;
      result += json5String[i];
      i++;
      
      while (i < json5String.length) {
        if (json5String[i] === '\\' && !inEscape) {
          inEscape = true;
        } else {
          inEscape = false;
        }
        
        result += json5String[i];
        
        if (json5String[i] === "'" && !inEscape) {
          break;
        }
        
        i++;
      }
      continue;
    }
    
    result += json5String[i];
    i++;
  }
  
  return result;
}

export function formatJSON5(data: any, indentSize: number = 2): string {
  return JSON.stringify(data, null, ' '.repeat(indentSize));
}

export function stringifyJSON5(
  obj: any,
  options: {
    indent?: number | string;
    singleQuotes?: boolean;
    trailingCommas?: boolean;
  } = {}
): string {
  const { indent = 2, singleQuotes = false, trailingCommas = false } = options;
  
  const indentStr = typeof indent === 'number' ? ' '.repeat(indent) : indent;
  
  return JSON.stringify(obj, null, indentStr)
    .replace(/"/g, singleQuotes ? "'" : '"')
    .replace(/'/g, '"');
}

export function convertJSONtoJSON5(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return stringifyJSON5(parsed, { trailingCommas: true });
  } catch (error) {
    console.error('JSON to JSON5 conversion failed:', error);
    return jsonString;
  }
}

export function convertJSON5toJSON(json5String: string): string {
  try {
    const parsed = parseJSON5(json5String, {
      allowComments: true,
      allowTrailingCommas: true,
      allowUnquotedKeys: true,
    });
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    console.error('JSON5 to JSON conversion failed:', error);
    return json5String;
  }
}

export function stripJSON5Comments(json5String: string): string {
  return stripComments(json5String);
}

export function validateJSON5(json5String: string): {
  isValid: boolean;
  errors: string[];
  cleaned?: string;
} {
  const errors: string[] = [];
  
  try {
    const parsed = parseJSON5(json5String, {
      allowComments: true,
      allowTrailingCommas: true,
      allowUnquotedKeys: true,
    });
    
    const cleaned = JSON.stringify(parsed, null, 2);
    
    return {
      isValid: true,
      errors: [],
      cleaned,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMessage);
    
    return {
      isValid: false,
      errors,
    };
  }
}

export function removeJSON5Features(json5String: string): string {
  // Step 1: Remove comments
  let cleaned = stripComments(json5String);
  
  // Step 2: Remove trailing commas
  cleaned = stripTrailingCommas(cleaned);
  
  // Step 3: Quote unquoted keys
  cleaned = unquoteKeys(cleaned);
  
  // Step 4: Ensure valid JSON
  try {
    const parsed = JSON.parse(cleaned);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    console.error('Failed to clean JSON5:', error);
    return cleaned;
  }
}

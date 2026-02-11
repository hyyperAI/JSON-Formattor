import type { SyntaxToken } from '../types';

export function highlightJSON(jsonString: string): string {
  if (!jsonString) return '';
  
  const tokens = tokenizeJSON(jsonString);
  return tokens.map(token => applySyntaxHighlighting(token)).join('');
}

export function tokenizeJSON(jsonString: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let line = 1;
  let column = 1;
  let i = 0;
  
  while (i < jsonString.length) {
    const char = jsonString[i];
    const startPosition = i;
    const startLine = line;
    const startColumn = column;
    
    // Whitespace
    if (/\s/.test(char)) {
      let value = '';
      while (i < jsonString.length && /\s/.test(jsonString[i]) && jsonString[i] !== '\n') {
        value += jsonString[i];
        i++;
        column++;
      }
      
      if (jsonString[i] === '\n') {
        value += '\n';
        line++;
        column = 1;
        i++;
      }
      
      if (value) {
        tokens.push({
          type: 'whitespace',
          value,
          position: {
            start: startPosition,
            end: i,
            line: startLine,
            column: startColumn,
          },
        });
      }
      continue;
    }
    
    // Newline
    if (char === '\n') {
      tokens.push({
        type: 'whitespace',
        value: '\n',
        position: {
          start: startPosition,
          end: startPosition + 1,
          line: startLine,
          column: startColumn,
        },
      });
      line++;
      column = 1;
      i++;
      continue;
    }
    
    // String
    if (char === '"') {
      let inEscape = false;
      let value = '"';
      i++;
      column++;
      
      while (i < jsonString.length && (jsonString[i] !== '"' || inEscape)) {
        if (jsonString[i] === '\\' && !inEscape) {
          inEscape = true;
        } else {
          inEscape = false;
        }
        value += jsonString[i];
        i++;
        column++;
      }
      
      if (i < jsonString.length && jsonString[i] === '"') {
        value += '"';
        i++;
        column++;
      }
      
      tokens.push({
        type: 'string',
        value,
        position: {
          start: startPosition,
          end: i,
          line: startLine,
          column: startColumn,
        },
      });
      continue;
    }
    
    // Number
    if (/[\d-]/.test(char)) {
      let hasDecimal = false;
      let hasExponent = false;
      let value = char;
      i++;
      column++;
      
      while (i < jsonString.length && /[\d.eE+-]/.test(jsonString[i])) {
        if (jsonString[i] === '.' && !hasDecimal) {
          hasDecimal = true;
        } else if ((jsonString[i] === 'e' || jsonString[i] === 'E') && !hasExponent) {
          hasExponent = true;
        } else if (jsonString[i] === '-' && jsonString[i - 1] !== 'e' && jsonString[i - 1] !== 'E') {
          break;
        }
        value += jsonString[i];
        i++;
        column++;
      }
      
      tokens.push({
        type: 'number',
        value,
        position: {
          start: startPosition,
          end: i,
          line: startLine,
          column: startColumn,
        },
      });
      continue;
    }
    
    // Boolean and Null
    if (jsonString.substring(i, i + 4) === 'true') {
      tokens.push({
        type: 'boolean',
        value: 'true',
        position: {
          start: startPosition,
          end: startPosition + 4,
          line: startLine,
          column: startColumn,
        },
      });
      i += 4;
      column += 4;
      continue;
    }
    
    if (jsonString.substring(i, i + 5) === 'false') {
      tokens.push({
        type: 'boolean',
        value: 'false',
        position: {
          start: startPosition,
          end: startPosition + 5,
          line: startLine,
          column: startColumn,
        },
      });
      i += 5;
      column += 5;
      continue;
    }
    
    if (jsonString.substring(i, i + 4) === 'null') {
      tokens.push({
        type: 'null',
        value: 'null',
        position: {
          start: startPosition,
          end: startPosition + 4,
          line: startLine,
          column: startColumn,
        },
      });
      i += 4;
      column += 4;
      continue;
    }
    
    // Brackets and Operators
    if ('{}[]:, '.includes(char)) {
      tokens.push({
        type: 'bracket',
        value: char,
        position: {
          start: startPosition,
          end: startPosition + 1,
          line: startLine,
          column: startColumn,
        },
      });
      i++;
      column++;
      continue;
    }
    
    // Unknown character
    tokens.push({
      type: 'operator',
      value: char,
      position: {
        start: startPosition,
        end: startPosition + 1,
        line: startLine,
        column: startColumn,
      },
    });
    i++;
    column++;
  }
  
  return tokens;
}

function applySyntaxHighlighting(token: SyntaxToken): string {
  const { type, value } = token;
  
  switch (type) {
    case 'key':
      return `<span class="syntax-key">${escapeHtml(value)}</span>`;
    case 'string':
      return `<span class="syntax-string">${escapeHtml(value)}</span>`;
    case 'number':
      return `<span class="syntax-number">${escapeHtml(value)}</span>`;
    case 'boolean':
      return `<span class="syntax-boolean">${escapeHtml(value)}</span>`;
    case 'null':
      return `<span class="syntax-null">${escapeHtml(value)}</span>`;
    case 'bracket':
      return `<span class="syntax-brackets">${escapeHtml(value)}</span>`;
    case 'operator':
      return `<span class="syntax-operator">${escapeHtml(value)}</span>`;
    case 'whitespace':
      return escapeHtml(value);
    default:
      return escapeHtml(value);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateLineNumbers(jsonString: string): string[] {
  return jsonString.split('\n').map((_, index) => String(index + 1));
}

export function highlightKeyValuePairs(jsonString: string): string {
  if (!jsonString) return '';
  
  const tokens = tokenizeJSON(jsonString);
  const highlighted: string[] = [];
  let expectKey = true;
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.type === 'string' && expectKey) {
      highlighted.push(`<span class="syntax-key">${escapeHtml(token.value)}</span>`);
      expectKey = false;
    } else if (token.type === 'string' && !expectKey) {
      highlighted.push(`<span class="syntax-string">${escapeHtml(token.value)}</span>`);
    } else if (token.type === 'number') {
      highlighted.push(`<span class="syntax-number">${escapeHtml(token.value)}</span>`);
    } else if (token.type === 'boolean') {
      highlighted.push(`<span class="syntax-boolean">${escapeHtml(token.value)}</span>`);
    } else if (token.type === 'null') {
      highlighted.push(`<span class="syntax-null">${escapeHtml(token.value)}</span>`);
    } else {
      highlighted.push(applySyntaxHighlighting(token));
    }
    
    if (token.type === 'bracket' && (token.value === ':' || token.value === ',')) {
      expectKey = token.value === ':';
    }
  }
  
  return highlighted.join('');
}

export function getSyntaxColor(tokenType: string): string {
  const colors: Record<string, string> = {
    key: '#79C0FF',
    string: '#A5D6FF',
    number: '#79C0FF',
    boolean: '#FF7B72',
    null: '#FF7B72',
    brackets: '#E6EDF3',
    operator: '#8B949E',
    whitespace: 'inherit',
  };
  
  return colors[tokenType] || colors.operator;
}

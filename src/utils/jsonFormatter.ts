import type { FormattingOptions } from '../types';

export function formatJSON(data: any, options: FormattingOptions): string {
  if (data === undefined) return '';
  
  const indent = options.useTabs ? '\t' : ' '.repeat(options.indentSize);
  
  try {
    return JSON.stringify(data, null, indent);
  } catch (error) {
    console.error('JSON formatting failed:', error);
    return '';
  }
}

export function minifyJSON(data: any): string {
  if (data === undefined) return '';
  
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('JSON minification failed:', error);
    return '';
  }
}

export function prettyPrintJSON(jsonString: string, indentSize: number = 2): string {
  if (!jsonString || jsonString.trim().length === 0) return '';
  
  try {
    const parsed = JSON.parse(jsonString);
    const indent = ' '.repeat(indentSize);
    return JSON.stringify(parsed, null, indent);
  } catch (error) {
    console.error('JSON pretty print failed:', error);
    return jsonString;
  }
}

export function compressJSON(jsonString: string): string {
  if (!jsonString || jsonString.trim().length === 0) return '';
  
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch (error) {
    console.error('JSON compression failed:', error);
    return jsonString;
  }
}

export function getIndentationString(indentSize: number, useTabs: boolean): string {
  return useTabs ? '\t' : ' '.repeat(indentSize);
}

export function convertIndentation(jsonString: string, fromIndent: number | '\t', toIndent: number | '\t'): string {
  if (!jsonString || jsonString.trim().length === 0) return jsonString;
  
  try {
    const parsed = JSON.parse(jsonString);
    const toIndentStr = toIndent === '\t' ? '\t' : ' '.repeat(toIndent as number);
    return JSON.stringify(parsed, null, toIndentStr);
  } catch (error) {
    console.error('Indentation conversion failed:', error);
    return jsonString;
  }
}

export function sortJSONKeys(jsonString: string, options: FormattingOptions): string {
  if (!jsonString || jsonString.trim().length === 0) return jsonString;
  
  try {
    const parsed = JSON.parse(jsonString);
    const sorted = sortObjectKeys(parsed);
    return formatJSON(sorted, options);
  } catch (error) {
    console.error('JSON key sorting failed:', error);
    return jsonString;
  }
}

function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  const sorted: any = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    sorted[key] = sortObjectKeys(obj[key]);
  }
  
  return sorted;
}

export function filterJSONKeys(jsonString: string, allowedKeys: string[], options: FormattingOptions): string {
  if (!jsonString || jsonString.trim().length === 0) return jsonString;
  
  try {
    const parsed = JSON.parse(jsonString);
    const filtered = filterObjectKeys(parsed, allowedKeys);
    return formatJSON(filtered, options);
  } catch (error) {
    console.error('JSON key filtering failed:', error);
    return jsonString;
  }
}

function filterObjectKeys(obj: any, allowedKeys: string[]): any {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => filterObjectKeys(item, allowedKeys));
  }
  
  const filtered: any = {};
  const allowedSet = new Set(allowedKeys);
  
  for (const key of Object.keys(obj)) {
    if (allowedSet.has(key)) {
      filtered[key] = filterObjectKeys(obj[key], allowedKeys);
    }
  }
  
  return filtered;
}

export function flattenJSON(jsonString: string): string {
  if (!jsonString || jsonString.trim().length === 0) return jsonString;
  
  try {
    const parsed = JSON.parse(jsonString);
    const flattened: Record<string, any> = {};
    
    flattenObject('', parsed, flattened);
    
    return JSON.stringify(flattened, null, 2);
  } catch (error) {
    console.error('JSON flattening failed:', error);
    return jsonString;
  }
}

function flattenObject(prefix: string, obj: any, result: Record<string, any>): void {
  if (obj === null || typeof obj !== 'object') {
    result[prefix] = obj;
    return;
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      result[prefix] = [];
    } else {
      obj.forEach((item, index) => {
        flattenObject(`${prefix}[${index}]`, item, result);
      });
    }
    return;
  }
  
  const keys = Object.keys(obj);
  
  if (keys.length === 0) {
    result[prefix] = {};
  } else {
    keys.forEach(key => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      flattenObject(newKey, obj[key], result);
    });
  }
}

export function unflattenJSON(jsonString: string): string {
  if (!jsonString || jsonString.trim().length === 0) return jsonString;
  
  try {
    const flattened = JSON.parse(jsonString);
    const unflattened = unflattenObject(flattened);
    return JSON.stringify(unflattened, null, 2);
  } catch (error) {
    console.error('JSON unflattening failed:', error);
    return jsonString;
  }
}

function unflattenObject(flattened: Record<string, any>): any {
  const result: any = {};
  
  for (const [path, value] of Object.entries(flattened)) {
    setNestedValue(result, path.split('.'), value);
  }
  
  return result;
}

function setNestedValue(obj: any, path: string[], value: any): void {
  let current = obj;
  
  for (let i = 0; i < path.length; i++) {
    const part = path[i];
    const isArrayIndex = part.endsWith(']') && part.includes('[');
    
    if (i === path.length - 1) {
      current[part] = value;
    } else {
      const nextPart = path[i + 1];
      let next = current[part];
      
      if (next === undefined) {
        if (nextPart && /^\d+$/.test(nextPart)) {
          current[part] = [];
        } else {
          current[part] = {};
        }
        next = current[part];
      }
      
      current = next;
    }
  }
}

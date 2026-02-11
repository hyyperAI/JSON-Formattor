import { describe, it, expect } from 'vitest';
import { formatJSON, minifyJSON } from '../utils/jsonFormatter';
import { validateJSON } from '../utils/jsonValidator';
import { parseJSON5 } from '../utils/json5Parser';

describe('JSON Formatter Basic Tests', () => {
  it('should format simple JSON object', () => {
    const input = { name: 'John', age: 30 };
    const result = formatJSON(input, { indentSize: 2, useTabs: false, json5Mode: false, lineWidth: 80 });
    expect(result).toContain('"name": "John"');
    expect(result).toContain('"age": 30');
  });

  it('should minify JSON object', () => {
    const input = { name: 'John', age: 30, hobbies: ['reading', 'coding'] };
    const result = minifyJSON(input);
    expect(result).toBe('{"name":"John","age":30,"hobbies":["reading","coding"]}');
  });

  it('should validate correct JSON', () => {
    const input = '{"name": "John", "age": 30}';
    const result = validateJSON(input);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect invalid JSON', () => {
    const input = '{"name": "John", age: 30}';
    const result = validateJSON(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should format JSON5 without comments', () => {
    const json5 = '{"name": "John", "age": 30}';
    const result = parseJSON5(json5, {
      allowComments: false,
      allowTrailingCommas: false,
      allowUnquotedKeys: false,
    });
    expect(result.name).toBe('John');
    expect(result.age).toBe(30);
  });

  it('should handle nested objects', () => {
    const input = {
      user: {
        profile: {
          name: 'John',
          email: 'john@example.com'
        }
      }
    };
    const result = formatJSON(input, { indentSize: 2, useTabs: false, json5Mode: false, lineWidth: 80 });
    expect(result).toContain('"user"');
    expect(result).toContain('"profile"');
    expect(result).toContain('"name"');
  });

  it('should handle empty objects and arrays', () => {
    const input = { emptyObj: {}, emptyArr: [], nullValue: null };
    const result = formatJSON(input, { indentSize: 2, useTabs: false, json5Mode: false, lineWidth: 80 });
    expect(result).toContain('"emptyObj": {}');
    expect(result).toContain('"emptyArr": []');
    expect(result).toContain('"nullValue": null');
  });

  it('should handle special characters in strings', () => {
    const input = { message: 'Hello "World"', path: 'C:\\Users\\John' };
    const result = formatJSON(input, { indentSize: 2, useTabs: false, json5Mode: false, lineWidth: 80 });
    expect(result).toContain('Hello \\"World\\"');
    expect(result).toContain('C:\\\\Users\\\\John');
  });
});

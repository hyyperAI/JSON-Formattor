import type { TreeNode } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function buildTreeView(data: any, path: string[] = [], parent: TreeNode | null = null): TreeNode[] {
  if (data === null) {
    return [{
      id: uuidv4(),
      key: '',
      value: null,
      type: 'null',
      depth: path.length,
      expanded: true,
      path,
      parent,
    }];
  }
  
  if (typeof data === 'object') {
    const isArray = Array.isArray(data);
    const nodes: TreeNode[] = [];
    
    if (isArray) {
      // Array
      for (let i = 0; i < data.length; i++) {
        const currentPath = [...path, `[${i}]`];
        const child = data[i];
        
        if (typeof child === 'object' && child !== null) {
          const node: TreeNode = {
            id: uuidv4(),
            key: `[${i}]`,
            value: child,
            type: Array.isArray(child) ? 'array' : 'object',
            depth: currentPath.length,
            expanded: false,
            children: buildTreeView(child, currentPath, null),
            path: currentPath,
            size: Array.isArray(child) ? child.length : Object.keys(child).length,
            parent,
          };
          node.children = buildTreeView(child, currentPath, node);
          nodes.push(node);
        } else {
          nodes.push({
            id: uuidv4(),
            key: `[${i}]`,
            value: child,
            type: getValueType(child),
            depth: currentPath.length,
            expanded: true,
            path: currentPath,
            parent,
          });
        }
      }
    } else {
      // Object
      const keys = Object.keys(data);
      
      for (const key of keys) {
        const currentPath = [...path, key];
        const child = data[key];
        
        if (typeof child === 'object' && child !== null) {
          const node: TreeNode = {
            id: uuidv4(),
            key,
            value: child,
            type: Array.isArray(child) ? 'array' : 'object',
            depth: currentPath.length,
            expanded: false,
            children: buildTreeView(child, currentPath, null),
            path: currentPath,
            size: Array.isArray(child) ? child.length : Object.keys(child).length,
            parent,
          };
          node.children = buildTreeView(child, currentPath, node);
          nodes.push(node);
        } else {
          nodes.push({
            id: uuidv4(),
            key,
            value: child,
            type: getValueType(child),
            depth: currentPath.length,
            expanded: true,
            path: currentPath,
            parent,
          });
        }
      }
    }
    
    return nodes;
  }
  
  // Primitive value
  return [{
    id: uuidv4(),
    key: '',
    value: data,
    type: getValueType(data),
    depth: path.length,
    expanded: true,
    path,
    parent,
  }];
}

function getValueType(value: any): 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array' {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'object';
}

export function flattenTreeView(nodes: TreeNode[]): TreeNode[] {
  const flattened: TreeNode[] = [];
  
  function traverse(node: TreeNode) {
    flattened.push(node);
    
    if (node.expanded && node.children) {
      node.children.forEach(traverse);
    }
  }
  
  nodes.forEach(traverse);
  
  return flattened;
}

export function findNodeById(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function findNodeByPath(nodes: TreeNode[], path: string[]): TreeNode | null {
  if (path.length === 0) return null;
  
  let currentNodes = nodes;
  
  for (const pathPart of path) {
    let foundNode: TreeNode | null = null;
    
    for (const node of currentNodes) {
      if (node.key === pathPart || node.path.join('.') === path.join('.')) {
        foundNode = node;
        break;
      }
    }
    
    if (!foundNode) return null;
    if (foundNode.children) {
      currentNodes = foundNode.children;
    } else {
      return foundNode;
    }
  }
  
  return currentNodes[0] || null;
}

export function toggleNode(nodes: TreeNode[], nodeId: string): TreeNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return { ...node, expanded: !node.expanded };
    }
    if (node.children) {
      return { ...node, children: toggleNode(node.children, nodeId) };
    }
    return node;
  });
}

export function expandAll(nodes: TreeNode[]): TreeNode[] {
  return nodes.map(node => ({
    ...node,
    expanded: true,
    children: node.children ? expandAll(node.children) : undefined,
  }));
}

export function collapseAll(nodes: TreeNode[]): TreeNode[] {
  return nodes.map(node => ({
    ...node,
    expanded: false,
    children: node.children ? collapseAll(node.children) : undefined,
  }));
}

export function getNodeDepth(nodes: TreeNode[], nodeId: string): number {
  const node = findNodeById(nodes, nodeId);
  return node ? node.depth : 0;
}

export function getMaxDepth(nodes: TreeNode[]): number {
  let maxDepth = 0;
  
  for (const node of nodes) {
    if (node.depth > maxDepth) {
      maxDepth = node.depth;
    }
    if (node.children) {
      const childMaxDepth = getMaxDepth(node.children);
      if (childMaxDepth > maxDepth) {
        maxDepth = childMaxDepth;
      }
    }
  }
  
  return maxDepth;
}

export function countNodes(nodes: TreeNode[]): number {
  let count = nodes.length;
  
  for (const node of nodes) {
    if (node.children) {
      count += countNodes(node.children);
    }
  }
  
  return count;
}

export function getNodePathString(node: TreeNode): string {
  if (node.path.length === 0) return '(root)';
  return node.path.join(' → ');
}

export function searchNodes(nodes: TreeNode[], searchTerm: string): TreeNode[] {
  const term = searchTerm.toLowerCase();
  const results: TreeNode[] = [];
  
  function traverse(node: TreeNode) {
    const keyMatch = node.key.toLowerCase().includes(term);
    const valueMatch = typeof node.value === 'string' && 
                       node.value.toLowerCase().includes(term);
    
    if (keyMatch || valueMatch) {
      results.push(node);
    }
    
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  nodes.forEach(traverse);
  
  return results;
}

export function filterVisibleNodes(nodes: TreeNode[], expandedNodes: Set<string>): TreeNode[] {
  return nodes.filter(node => {
    if (node.depth === 0) return true;
    
    // Check if all ancestors are expanded
    let currentNode = node;
    while (currentNode.parent) {
      if (!expandedNodes.has(currentNode.parent.id)) {
        return false;
      }
      currentNode = currentNode.parent;
    }
    
    return true;
  });
}

export function formatNodeValue(node: TreeNode): string {
  switch (node.type) {
    case 'string':
      return `"${node.value}"`;
    case 'number':
      return String(node.value);
    case 'boolean':
      return String(node.value);
    case 'null':
      return 'null';
    default:
      return node.type;
  }
}

export function getTreeStatistics(nodes: TreeNode[]): {
  totalNodes: number;
  objectCount: number;
  arrayCount: number;
  stringCount: number;
  numberCount: number;
  booleanCount: number;
  nullCount: number;
  maxDepth: number;
} {
  const stats = {
    totalNodes: 0,
    objectCount: 0,
    arrayCount: 0,
    stringCount: 0,
    numberCount: 0,
    booleanCount: 0,
    nullCount: 0,
    maxDepth: 0,
  };
  
  function traverse(node: TreeNode) {
    stats.totalNodes++;
    
    switch (node.type) {
      case 'object':
        stats.objectCount++;
        break;
      case 'array':
        stats.arrayCount++;
        break;
      case 'string':
        stats.stringCount++;
        break;
      case 'number':
        stats.numberCount++;
        break;
      case 'boolean':
        stats.booleanCount++;
        break;
      case 'null':
        stats.nullCount++;
        break;
    }
    
    if (node.depth > stats.maxDepth) {
      stats.maxDepth = node.depth;
    }
    
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  nodes.forEach(traverse);
  
  return stats;
}

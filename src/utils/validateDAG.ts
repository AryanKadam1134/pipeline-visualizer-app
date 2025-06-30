
import { Node, Edge } from '@xyflow/react';

export interface DAGValidationResult {
  isValid: boolean;
  errors: string[];
  hasMinNodes: boolean;
  hasCycles: boolean;
  allNodesConnected: boolean;
}

export function validateDAG(nodes: Node[], edges: Edge[]): DAGValidationResult {
  const errors: string[] = [];
  
  // Check minimum nodes requirement
  const hasMinNodes = nodes.length >= 2;
  if (!hasMinNodes) {
    errors.push('At least 2 nodes are required');
  }
  
  // Check for cycles using DFS
  const hasCycles = detectCycles(nodes, edges);
  if (hasCycles) {
    errors.push('Graph contains cycles - not a valid DAG');
  }
  
  // Check if all nodes are connected (weakly connected)
  const allNodesConnected = isWeaklyConnected(nodes, edges);
  if (!allNodesConnected && nodes.length > 1) {
    errors.push('All nodes must be connected');
  }
  
  const isValid = hasMinNodes && !hasCycles && allNodesConnected;
  
  return {
    isValid,
    errors,
    hasMinNodes,
    hasCycles,
    allNodesConnected
  };
}

function detectCycles(nodes: Node[], edges: Edge[]): boolean {
  const nodeIds = nodes.map(n => n.id);
  const adjList = buildAdjacencyList(nodeIds, edges);
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  for (const nodeId of nodeIds) {
    if (!visited.has(nodeId)) {
      if (dfsHasCycle(nodeId, adjList, visited, recursionStack)) {
        return true;
      }
    }
  }
  
  return false;
}

function dfsHasCycle(
  nodeId: string,
  adjList: Map<string, string[]>,
  visited: Set<string>,
  recursionStack: Set<string>
): boolean {
  visited.add(nodeId);
  recursionStack.add(nodeId);
  
  const neighbors = adjList.get(nodeId) || [];
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      if (dfsHasCycle(neighbor, adjList, visited, recursionStack)) {
        return true;
      }
    } else if (recursionStack.has(neighbor)) {
      return true;
    }
  }
  
  recursionStack.delete(nodeId);
  return false;
}

function isWeaklyConnected(nodes: Node[], edges: Edge[]): boolean {
  if (nodes.length <= 1) return true;
  
  const nodeIds = nodes.map(n => n.id);
  const undirectedAdjList = buildUndirectedAdjacencyList(nodeIds, edges);
  
  const visited = new Set<string>();
  const startNode = nodeIds[0];
  
  // DFS from first node
  function dfs(nodeId: string) {
    visited.add(nodeId);
    const neighbors = undirectedAdjList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  }
  
  dfs(startNode);
  
  return visited.size === nodeIds.length;
}

function buildAdjacencyList(nodeIds: string[], edges: Edge[]): Map<string, string[]> {
  const adjList = new Map<string, string[]>();
  
  for (const nodeId of nodeIds) {
    adjList.set(nodeId, []);
  }
  
  for (const edge of edges) {
    const sourceList = adjList.get(edge.source) || [];
    sourceList.push(edge.target);
    adjList.set(edge.source, sourceList);
  }
  
  return adjList;
}

function buildUndirectedAdjacencyList(nodeIds: string[], edges: Edge[]): Map<string, string[]> {
  const adjList = new Map<string, string[]>();
  
  for (const nodeId of nodeIds) {
    adjList.set(nodeId, []);
  }
  
  for (const edge of edges) {
    const sourceList = adjList.get(edge.source) || [];
    const targetList = adjList.get(edge.target) || [];
    
    sourceList.push(edge.target);
    targetList.push(edge.source);
    
    adjList.set(edge.source, sourceList);
    adjList.set(edge.target, targetList);
  }
  
  return adjList;
}

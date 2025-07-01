
import { Node, Edge } from '@xyflow/react';

export interface DAGValidationResult {
  isValid: boolean;
  errors: string[];
  hasMinNodes: boolean;
  hasCycles: boolean;
  allNodesConnected: boolean;
  hasSelfLoops?: boolean;
}

export function validateDAG(nodes: Node[], edges: Edge[]): DAGValidationResult {
  const errors: string[] = [];
  
  // Check minimum nodes requirement
  const hasMinNodes = nodes.length >= 2;
  if (!hasMinNodes) {
    if (nodes.length === 0) {
      errors.push('No nodes present - click on canvas to add nodes');
    } else if (nodes.length === 1) {
      errors.push('Add at least 1 more node for a valid DAG');
    }
  }
  
  // Check for self-loops first (this is always invalid)
  const hasSelfLoops = edges.some(edge => edge.source === edge.target);
  if (hasSelfLoops) {
    errors.push('Self-loops detected - nodes cannot connect to themselves');
  }
  
  // Check for cycles using DFS (only if we have edges and more than 1 node)
  const hasCycles = (edges.length > 0 && nodes.length > 1) ? detectCycles(nodes, edges) : false;
  if (hasCycles) {
    errors.push('Cycle detected - remove connections that create loops');
  }
  
  // Check if all nodes are connected (weakly connected)
  // For a DAG to be valid, all nodes should be reachable from each other
  const allNodesConnected = isWeaklyConnected(nodes, edges);
  if (!allNodesConnected && nodes.length > 1) {
    if (edges.length === 0) {
      errors.push('No connections between nodes - drag to connect nodes');
    } else {
      errors.push('Some nodes are isolated - ensure all nodes are connected');
    }
  }
  
  // A DAG is valid if: has minimum nodes, no cycles, all connected, no self-loops
  const isValid = hasMinNodes && !hasCycles && allNodesConnected && !hasSelfLoops;
  
  return {
    isValid,
    errors,
    hasMinNodes,
    hasCycles,
    allNodesConnected,
    hasSelfLoops
  };
}

function detectCycles(nodes: Node[], edges: Edge[]): boolean {
  if (nodes.length === 0 || edges.length === 0) return false;
  
  const nodeIds = nodes.map(n => n.id);
  const adjList = buildAdjacencyList(nodeIds, edges);
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  // Check for cycles starting from each unvisited node
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
  if (edges.length === 0) return false; // No edges means nodes are disconnected
  
  const nodeIds = nodes.map(n => n.id);
  const undirectedAdjList = buildUndirectedAdjacencyList(nodeIds, edges);
  
  const visited = new Set<string>();
  const startNode = nodeIds[0];
  
  // DFS from first node to see if all nodes are reachable
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
  
  // All nodes should be visited for the graph to be weakly connected
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


import { Node, Edge, Position } from '@xyflow/react';
import dagre from 'dagre';

export function generateNodeId(): string {
  return `node_${Math.random().toString(36).substr(2, 9)}`;
}

export function createNode(id: string, name: string, position: { x: number; y: number }): Node {
  return {
    id,
    type: 'default',
    position,
    data: { 
      label: name 
    },
    style: {
      background: '#ffffff',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      minWidth: '120px',
      textAlign: 'center'
    }
  };
}

export function autoLayoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 80 });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Update node positions
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 75, // Center the node
        y: nodeWithPosition.y - 25
      }
    };
  });
}

export function canConnectNodes(
  sourceNodeId: string, 
  targetNodeId: string, 
  edges: Edge[]
): { canConnect: boolean; reason?: string } {
  // No self-loops
  if (sourceNodeId === targetNodeId) {
    return { canConnect: false, reason: 'Cannot connect node to itself' };
  }
  
  // Check if connection already exists
  const connectionExists = edges.some(
    edge => edge.source === sourceNodeId && edge.target === targetNodeId
  );
  
  if (connectionExists) {
    return { canConnect: false, reason: 'Connection already exists' };
  }
  
  // Create temporary edge to test for cycles
  const tempEdges = [...edges, { 
    id: 'temp', 
    source: sourceNodeId, 
    target: targetNodeId 
  }];
  
  // Simple cycle detection for this specific connection
  if (wouldCreateCycle(sourceNodeId, targetNodeId, edges)) {
    return { canConnect: false, reason: 'Would create a cycle' };
  }
  
  return { canConnect: true };
}

function wouldCreateCycle(sourceId: string, targetId: string, edges: Edge[]): boolean {
  // Check if there's already a path from target to source
  const visited = new Set<string>();
  
  function hasPath(from: string, to: string): boolean {
    if (from === to) return true;
    if (visited.has(from)) return false;
    
    visited.add(from);
    
    const outgoingEdges = edges.filter(edge => edge.source === from);
    for (const edge of outgoingEdges) {
      if (hasPath(edge.target, to)) {
        return true;
      }
    }
    
    return false;
  }
  
  return hasPath(targetId, sourceId);
}

export function getDAGAsJSON(nodes: Node[], edges: Edge[]) {
  return {
    nodes: nodes.map(node => ({
      id: node.id,
      name: node.data.label,
      position: node.position
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target
    })),
    metadata: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      timestamp: new Date().toISOString()
    }
  };
}

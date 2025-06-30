
import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { canConnectNodes } from '../utils/graphHelpers';
import { toast } from 'sonner';

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onAddNode: (position: { x: number; y: number }) => void;
  onAutoLayout: () => void;
}

function CanvasInner({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onAddNode,
  onAutoLayout
}: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  // Use React Flow's built-in state management
  const [internalNodes, setInternalNodes, onInternalNodesChange] = useNodesState(nodes);
  const [internalEdges, setInternalEdges, onInternalEdgesChange] = useEdgesState(edges);

  // Only sync when external state changes significantly (like adding/removing nodes)
  const prevNodesLength = React.useRef(nodes.length);
  const prevEdgesLength = React.useRef(edges.length);
  const prevNodeIds = React.useRef(new Set(nodes.map(n => n.id)));
  const prevEdgeIds = React.useRef(new Set(edges.map(e => e.id)));
  
  React.useEffect(() => {
    const currentNodeIds = new Set(nodes.map(n => n.id));
    const hasNewNodes = nodes.some(node => !prevNodeIds.current.has(node.id));
    const hasRemovedNodes = Array.from(prevNodeIds.current).some(id => !currentNodeIds.has(id));
    
    if (hasNewNodes || hasRemovedNodes) {
      setInternalNodes(nodes);
      prevNodesLength.current = nodes.length;
      prevNodeIds.current = currentNodeIds;
    }
  }, [nodes, setInternalNodes]);

  React.useEffect(() => {
    const currentEdgeIds = new Set(edges.map(e => e.id));
    const hasNewEdges = edges.some(edge => !prevEdgeIds.current.has(edge.id));
    const hasRemovedEdges = Array.from(prevEdgeIds.current).some(id => !currentEdgeIds.has(id));
    
    if (hasNewEdges || hasRemovedEdges) {
      setInternalEdges(edges);
      prevEdgesLength.current = edges.length;
      prevEdgeIds.current = currentEdgeIds;
    }
  }, [edges, setInternalEdges]);

  // Handle node and edge changes and sync selection immediately
  const handleNodesChange = React.useCallback((changes: NodeChange[]) => {
    onInternalNodesChange(changes);
    
    // Check if this is a selection change
    const hasSelectionChange = changes.some(change => change.type === 'select');
    if (hasSelectionChange) {
      // Update the parent state immediately with the new selection
      setTimeout(() => {
        const updatedNodes = internalNodes.map(node => {
          const change = changes.find(c => c.type === 'select' && c.id === node.id);
          if (change && 'selected' in change) {
            return { ...node, selected: change.selected };
          }
          return node;
        });
        onNodesChange(updatedNodes);
      }, 0);
    }
  }, [onInternalNodesChange, onNodesChange, internalNodes]);

  const handleEdgesChange = React.useCallback((changes: EdgeChange[]) => {
    onInternalEdgesChange(changes);
    
    // Check if this is a selection change
    const hasSelectionChange = changes.some(change => change.type === 'select');
    if (hasSelectionChange) {
      // Update the parent state immediately with the new selection
      setTimeout(() => {
        const updatedEdges = internalEdges.map(edge => {
          const change = changes.find(c => c.type === 'select' && c.id === edge.id);
          if (change && 'selected' in change) {
            return { ...edge, selected: change.selected };
          }
          return edge;
        });
        onEdgesChange(updatedEdges);
      }, 0);
    }
  }, [onInternalEdgesChange, onEdgesChange, internalEdges]);

  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    
    const validation = canConnectNodes(params.source, params.target, internalEdges);
    if (!validation.canConnect) {
      toast.error(validation.reason || 'Cannot create connection');
      return;
    }
    
    const newEdge: Edge = {
      ...params,
      id: `edge_${params.source}_${params.target}`,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 }
    };
    
    setInternalEdges(edges => addEdge(newEdge, edges));
    toast.success('Connection created');
  }, [internalEdges, setInternalEdges]);

  const onCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!reactFlowWrapper.current) return;
    
    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = screenToFlowPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    
    onAddNode(position);
  }, [onAddNode, screenToFlowPosition]);

  const deleteSelected = React.useCallback(() => {
    const selectedNodes = internalNodes.filter(node => node.selected);
    const selectedEdges = internalEdges.filter(edge => edge.selected);
    
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      const selectedNodeIds = selectedNodes.map(node => node.id);
      
      const remainingNodes = internalNodes.filter(node => !selectedNodeIds.includes(node.id));
      const remainingEdges = internalEdges.filter(edge => 
        !selectedEdges.some(selectedEdge => selectedEdge.id === edge.id) &&
        !selectedNodeIds.includes(edge.source) &&
        !selectedNodeIds.includes(edge.target)
      );
      
      setInternalNodes(remainingNodes);
      setInternalEdges(remainingEdges);
      
      const deletedCount = selectedNodes.length + selectedEdges.length;
      toast.success(`Deleted ${deletedCount} item(s)`);
      return true;
    }
    return false;
  }, [internalNodes, internalEdges, setInternalNodes, setInternalEdges]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      deleteSelected();
    }
  }, [deleteSelected]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={internalNodes}
        edges={internalEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onPaneClick={onCanvasClick}
        connectionMode={ConnectionMode.Strict}
        fitView
        deleteKeyCode={['Delete', 'Backspace']}
        multiSelectionKeyCode={['Meta', 'Ctrl']}
        style={{ background: '#f8fafc' }}
      >
        <Controls />
        <MiniMap 
          style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0'
          }}
          nodeColor="#6366f1"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  );
}

export default function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}


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
  React.useEffect(() => {
    if (nodes.length !== internalNodes.length || 
        nodes.some(node => !internalNodes.find(n => n.id === node.id))) {
      setInternalNodes(nodes);
    }
  }, [nodes.length, setInternalNodes]);

  React.useEffect(() => {
    if (edges.length !== internalEdges.length ||
        edges.some(edge => !internalEdges.find(e => e.id === edge.id))) {
      setInternalEdges(edges);
    }
  }, [edges.length, setInternalEdges]);

  // Only sync back to parent when nodes/edges are added or removed, not when positions change
  React.useEffect(() => {
    if (internalNodes.length !== nodes.length) {
      onNodesChange(internalNodes);
    }
  }, [internalNodes.length, onNodesChange]);

  React.useEffect(() => {
    if (internalEdges.length !== edges.length) {
      onEdgesChange(internalEdges);
    }
  }, [internalEdges.length, onEdgesChange]);

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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
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
      }
    }
  }, [internalNodes, internalEdges, setInternalNodes, setInternalEdges]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={internalNodes}
        edges={internalEdges}
        onNodesChange={onInternalNodesChange}
        onEdgesChange={onInternalEdgesChange}
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

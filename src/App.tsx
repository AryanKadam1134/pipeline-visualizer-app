
import React, { useState, useCallback, useMemo } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Toaster } from "@/components/ui/sonner";
import Canvas from './components/Canvas';
import Sidebar from './components/Sidebar';
import JSONPreview from './components/JSONPreview';
import { validateDAG } from './utils/validateDAG';
import { generateNodeId, createNode, autoLayoutNodes, getDAGAsJSON } from './utils/graphHelpers';
import { toast } from 'sonner';

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Validation results
  const validation = useMemo(() => validateDAG(nodes, edges), [nodes, edges]);
  
  // JSON representation
  const jsonData = useMemo(() => getDAGAsJSON(nodes, edges), [nodes, edges]);

  const handleAddNode = useCallback((position: { x: number; y: number }) => {
    const nodeName = prompt('Enter node name:');
    if (!nodeName || nodeName.trim() === '') {
      toast.error('Node name is required');
      return;
    }

    const nodeId = generateNodeId();
    const newNode = createNode(nodeId, nodeName.trim(), position);
    setNodes(prev => [...prev, newNode]);
    toast.success(`Node "${nodeName}" added`);
  }, []);

  const handleAddRandomNode = useCallback(() => {
    const nodeName = prompt('Enter node name:');
    if (!nodeName || nodeName.trim() === '') {
      toast.error('Node name is required');
      return;
    }

    const nodeId = generateNodeId();
    const randomPosition = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100
    };
    const newNode = createNode(nodeId, nodeName.trim(), randomPosition);
    setNodes(prev => [...prev, newNode]);
    toast.success(`Node "${nodeName}" added`);
  }, []);

  const handleAutoLayout = useCallback(() => {
    if (nodes.length < 2) {
      toast.error('At least 2 nodes required for auto layout');
      return;
    }
    
    const layoutedNodes = autoLayoutNodes(nodes, edges);
    setNodes(layoutedNodes);
    toast.success('Auto layout applied');
  }, [nodes, edges]);

  const handleClearGraph = useCallback(() => {
    const confirmed = window.confirm('Are you sure you want to clear the entire graph?');
    if (confirmed) {
      setNodes([]);
      setEdges([]);
      toast.success('Graph cleared');
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline Editor</h1>
            <p className="text-sm text-gray-600">Visual DAG Builder & Validator</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              validation.isValid 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {validation.isValid ? 'Valid DAG' : 'Invalid DAG'}
            </div>
            <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
              {nodes.length} nodes, {edges.length} edges
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative">
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onAddNode={handleAddNode}
            onAutoLayout={handleAutoLayout}
          />
        </div>

        {/* Sidebar */}
        <Sidebar
          validation={validation}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          onAddRandomNode={handleAddRandomNode}
          onAutoLayout={handleAutoLayout}
          onClearGraph={handleClearGraph}
        />
      </div>

      {/* Bottom Panel - JSON Preview */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <JSONPreview data={jsonData} />
      </div>

      <Toaster />
    </div>
  );
}

export default App;

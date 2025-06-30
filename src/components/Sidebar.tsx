
import React from 'react';
import { Plus, Layout, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DAGValidationResult } from '../utils/validateDAG';

interface SidebarProps {
  validation: DAGValidationResult;
  nodeCount: number;
  edgeCount: number;
  onAddRandomNode: () => void;
  onAutoLayout: () => void;
  onClearGraph: () => void;
}

export default function Sidebar({ 
  validation, 
  nodeCount, 
  edgeCount, 
  onAddRandomNode, 
  onAutoLayout,
  onClearGraph 
}: SidebarProps) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Pipeline Editor</h2>
        <p className="text-sm text-gray-600">Build and validate DAGs visually</p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            onClick={onAddRandomNode}
            className="w-full justify-start"
            variant="outline"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Node
          </Button>
          <Button 
            onClick={onAutoLayout}
            className="w-full justify-start"
            variant="outline"
            size="sm"
            disabled={nodeCount < 2}
          >
            <Layout className="mr-2 h-4 w-4" />
            Auto Layout
          </Button>
          <Button 
            onClick={onClearGraph}
            className="w-full justify-start"
            variant="destructive"
            size="sm"
            disabled={nodeCount === 0}
          >
            Clear Graph
          </Button>
        </CardContent>
      </Card>

      {/* Graph Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Graph Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Nodes:</span>
            <Badge variant="secondary">{nodeCount}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Edges:</span>
            <Badge variant="secondary">{edgeCount}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Validation Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            DAG Validation
            {validation.isValid ? (
              <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="ml-2 h-4 w-4 text-red-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Valid DAG:</span>
              <Badge variant={validation.isValid ? "default" : "destructive"}>
                {validation.isValid ? "Yes" : "No"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Min Nodes (≥2):</span>
              <Badge variant={validation.hasMinNodes ? "default" : "secondary"}>
                {validation.hasMinNodes ? "✓" : "✗"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">No Cycles:</span>
              <Badge variant={!validation.hasCycles ? "default" : "destructive"}>
                {!validation.hasCycles ? "✓" : "✗"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">All Connected:</span>
              <Badge variant={validation.allNodesConnected ? "default" : "secondary"}>
                {validation.allNodesConnected ? "✓" : "✗"}
              </Badge>
            </div>
          </div>

          {validation.errors.length > 0 && (
            <div className="mt-3 p-2 bg-red-50 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  {validation.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-700">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600 space-y-2">
          <p>• Click anywhere on canvas to add a node</p>
          <p>• Drag from node edges to create connections</p>
          <p>• Select nodes/edges and press Delete to remove</p>
          <p>• Use Auto Layout to organize nodes</p>
          <p>• DAG rules prevent cycles and ensure connectivity</p>
        </CardContent>
      </Card>
    </div>
  );
}

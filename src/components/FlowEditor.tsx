"use client";

import { useCallback, useState, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  type Connection, 
  type Edge, 
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Play, Settings, Download, Upload } from 'lucide-react';

interface FlowEditorProps {
  flowId: string;
  flowName: string;
  driverName: string;
  onBack: () => void;
  onSave: (flowId: string, nodes: Node[], edges: Edge[]) => void;
}

// Sample initial nodes and edges
const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 250, y: 100 },
    data: { label: 'Start: Customer Contact' },
    type: 'input',
    style: { background: '#e1f5fe', border: '2px solid #0277bd' }
  },
  {
    id: '2',
    position: { x: 250, y: 200 },
    data: { label: 'Identify Issue Type' },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2' }
  },
  {
    id: '3',
    position: { x: 100, y: 300 },
    data: { label: 'Technical Support' },
    style: { background: '#e8f5e8', border: '2px solid #388e3c' }
  },
  {
    id: '4',
    position: { x: 400, y: 300 },
    data: { label: 'Account Services' },
    style: { background: '#e8f5e8', border: '2px solid #388e3c' }
  },
  {
    id: '5',
    position: { x: 250, y: 400 },
    data: { label: 'Resolution Complete' },
    type: 'output',
    style: { background: '#ffebee', border: '2px solid #d32f2f' }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', label: 'Technical Issue' },
  { id: 'e2-4', source: '2', target: '4', label: 'Account Issue' },
  { id: 'e3-5', source: '3', target: '5' },
  { id: 'e4-5', source: '4', target: '5' }
];

export function FlowEditor({ flowId, flowName, driverName, onBack, onSave }: FlowEditorProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = useCallback(() => {
    setIsSaving(true);
    // Simulate save delay
    setTimeout(() => {
      onSave(flowId, nodes, edges);
      setLastSaved(new Date());
      setIsSaving(false);
    }, 1000);
  }, [flowId, nodes, edges, onSave]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [handleSave]);

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Top Bar */}
      <div className="border-b bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/50 flex-shrink-0">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to drivers</span>
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Driver:</span>
              <Badge variant="outline">{driverName}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Flow:</span>
              <Badge variant="secondary">{flowName}</Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Test Flow
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {isSaving ? 'Saving...' : `Saved • ${formatLastSaved(lastSaved)}`}
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          className="bg-gray-50"
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              if (node.type === 'input') return '#0277bd';
              if (node.type === 'output') return '#d32f2f';
              return '#7b1fa2';
            }}
            className="bg-white"
          />
        </ReactFlow>
      </div>
    </div>
  );
} 
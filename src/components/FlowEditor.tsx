"use client";

import { useCallback, useState, useEffect, useRef } from 'react';
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
  type Node,
  ControlButton,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, Grid3X3 } from 'lucide-react';

interface FlowEditorProps {
  flowId: string;
  flowName: string;
  driverName: string;
  onBack: () => void;
  onSave: (flowId: string, nodes: Node[], edges: Edge[]) => void;
  updateFlow: (flowId: string, updates: Partial<{ name: string; description: string }>) => void;
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

function FlowEditorInner({ flowId, flowName: initialFlowName, driverName, onBack, onSave, updateFlow }: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [flowName, setFlowName] = useState(initialFlowName);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditingFlowName, setIsEditingFlowName] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      onSave(flowId, nodes, edges);
      setLastSaved(new Date());
      setIsDirty(false);
    }, 2000); // 2 second delay
  }, [flowId, nodes, edges, onSave]);

  // Track changes to nodes/edges
  useEffect(() => {
    setIsDirty(true);
    triggerAutoSave();
  }, [nodes, edges, triggerAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleFlowNameChange = (newName: string) => {
    setFlowName(newName);
  };

  const handleFlowNameBlur = () => {
    setIsEditingFlowName(false);
    // Update the flow name in the global state when the user finishes editing
    updateFlow(flowId, { name: flowName });
  };

  const handleFlowNameClick = () => {
    setIsEditingFlowName(true);
  };

  // View state toggles
  const [showLegend, setShowLegend] = useState(true);
  const [showSwimLanes, setShowSwimLanes] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [scenarioLens, setScenarioLens] = useState('all');

  const { fitView } = useReactFlow();

  const handleAutoLayout = () => {
    // Simple auto-layout algorithm: arrange nodes in a hierarchical layout
    const layoutedNodes = nodes.map((node) => {
      const level = getNodeLevel(node.id, edges);
      const nodesAtLevel = nodes.filter(n => getNodeLevel(n.id, edges) === level);
      const indexAtLevel = nodesAtLevel.findIndex(n => n.id === node.id);
      
      return {
        ...node,
        position: {
          x: 150 + indexAtLevel * 300, // Horizontal spacing
          y: 100 + level * 150 // Vertical spacing by level
        }
      };
    });

    setNodes(layoutedNodes);
    setIsDirty(true);
    
    // Fit view after layout
    setTimeout(() => {
      fitView({ duration: 800 });
    }, 100);
  };

  // Helper function to determine node level (depth from start nodes)
  const getNodeLevel = (nodeId: string, edges: Edge[]): number => {
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    if (incomingEdges.length === 0) {
      return 0; // Start node
    }
    
    const parentLevels = incomingEdges.map(edge => getNodeLevel(edge.source, edges));
    return Math.max(...parentLevels) + 1;
  };

  const handleAddStep = (stepType: string) => {
    // TODO: Implement add step functionality
    console.log('Add step:', stepType);
  };

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
          {/* Left side - Breadcrumb rail */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Driver:</span>
              <span className="text-sm font-medium">{driverName}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Flow:</span>
              {isEditingFlowName ? (
                <input
                  type="text"
                  value={flowName}
                  onChange={(e) => handleFlowNameChange(e.target.value)}
                  onBlur={handleFlowNameBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFlowNameBlur();
                    if (e.key === 'Escape') {
                      setFlowName(initialFlowName);
                      setIsEditingFlowName(false);
                    }
                  }}
                  className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <button
                  onClick={handleFlowNameClick}
                  className="text-sm font-medium hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                >
                  {flowName}
                </button>
              )}
            </div>
          </div>
          
          {/* Right side - Primary actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {/* Add Step Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleAddStep('self-service')}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                      <span>Self-Service</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddStep('channel')}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                      <span>Contact Channel</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddStep('agent')}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                      <span>Agent Step</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddStep('outcome')}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-black rounded-sm"></div>
                      <span>Outcome</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAddStep('router')}>
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Router
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddStep('cluster')}>
                    <div className="w-4 h-4 mr-2 border-2 border-gray-400 rounded"></div>
                    Cluster
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {isDirty ? 'Unsaved changes' : `Auto-saved ${formatLastSaved(lastSaved || new Date())}`}
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(changes) => {
            onNodesChange(changes);
            setIsDirty(true);
          }}
          onEdgesChange={(changes) => {
            onEdgesChange(changes);
            setIsDirty(true);
          }}
          onConnect={onConnect}
          fitView
          className="bg-gray-50"
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls>
            <ControlButton onClick={handleAutoLayout} title="Auto Layout">
              <span style={{ fontSize: '14px' }}>🔄</span>
            </ControlButton>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ControlButton title="View Options">
                  <span style={{ fontSize: '14px' }}>🖥️</span>
                </ControlButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right">
                <DropdownMenuItem onClick={() => setShowLegend(!showLegend)}>
                  <div className="flex items-center justify-between w-full">
                    <span>Show Legend</span>
                    <div className={`w-2 h-2 rounded-full ${showLegend ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSwimLanes(!showSwimLanes)}>
                  <div className="flex items-center justify-between w-full">
                    <span>Show Swim-lanes</span>
                    <div className={`w-2 h-2 rounded-full ${showSwimLanes ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowMiniMap(!showMiniMap)}>
                  <div className="flex items-center justify-between w-full">
                    <span>Mini-map</span>
                    <div className={`w-2 h-2 rounded-full ${showMiniMap ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setScenarioLens('segment')}>
                  <div className="flex items-center justify-between w-full">
                    <span>Scenario Lens: Segment</span>
                    <div className={`w-2 h-2 rounded-full ${scenarioLens === 'segment' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setScenarioLens('issue')}>
                  <div className="flex items-center justify-between w-full">
                    <span>Scenario Lens: Issue</span>
                    <div className={`w-2 h-2 rounded-full ${scenarioLens === 'issue' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setScenarioLens('all')}>
                  <div className="flex items-center justify-between w-full">
                    <span>Scenario Lens: All</span>
                    <div className={`w-2 h-2 rounded-full ${scenarioLens === 'all' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Controls>
          {showMiniMap && (
            <MiniMap 
              nodeColor={(node) => {
                if (node.type === 'input') return '#0277bd';
                if (node.type === 'output') return '#d32f2f';
                return '#7b1fa2';
              }}
              className="bg-white"
            />
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

export function FlowEditor(props: FlowEditorProps) {
  return (
    <ReactFlowProvider>
      <FlowEditorInner {...props} />
    </ReactFlowProvider>
  );
} 
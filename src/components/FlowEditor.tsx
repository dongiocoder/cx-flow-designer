"use client";

import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
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
import { ArrowLeft, Plus } from 'lucide-react';
import { PillNode, StepNode, RouterNode, type CustomNodeData } from './FlowNodes';
import { CustomEdge } from './CustomEdge';

interface FlowEditorProps {
  flowId: string;
  flowName: string;
  driverName: string;
  onBack: () => void;
  onSave: (flowId: string, nodes: Node[], edges: Edge[]) => void;
  updateFlow: (flowId: string, updates: Partial<{ name: string; description: string }>) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  storageStatus?: 'github' | 'localStorage' | 'none';
}

// Start with empty canvas
const initialNodes: Node<CustomNodeData>[] = [];

const initialEdges: Edge[] = [];

function FlowEditorInner({ flowId, flowName: initialFlowName, driverName, onBack, onSave, updateFlow, initialNodes: propsInitialNodes = [], initialEdges: propsInitialEdges = [], storageStatus = 'localStorage' }: FlowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [flowName, setFlowName] = useState(initialFlowName);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditingFlowName, setIsEditingFlowName] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedInitialData = useRef(false);
  const currentFlowId = useRef(flowId);

  // Sync flow name when initialFlowName prop changes
  useEffect(() => {
    setFlowName(initialFlowName);
  }, [initialFlowName]);

  // Load initial flow data when flowId or data changes
  useEffect(() => {
    // Reset if this is a different flow
    if (currentFlowId.current !== flowId) {
      hasLoadedInitialData.current = false;
      currentFlowId.current = flowId;
    }

         // Load the flow data
     setNodes(propsInitialNodes as Node<CustomNodeData>[]);
     setEdges(propsInitialEdges);
    
    if (propsInitialNodes.length > 0 || propsInitialEdges.length > 0) {
      setLastSaved(new Date());
      setIsDirty(false);
    } else {
      setLastSaved(null);
      setIsDirty(false);
    }
    
    hasLoadedInitialData.current = true;
  }, [flowId, propsInitialNodes, propsInitialEdges, setNodes, setEdges]);

  // Auto-save functionality with faster timing
  const triggerAutoSave = useCallback(() => {
    // Don't auto-save immediately after loading initial data
    if (!hasLoadedInitialData.current) {
      hasLoadedInitialData.current = true;
      setIsDirty(false);
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      onSave(flowId, nodes, edges);
      setLastSaved(new Date());
      setIsDirty(false);
    }, 1000); // Reduced to 1 second for faster saves
  }, [flowId, nodes, edges, onSave]);

  // Track changes to nodes/edges
  useEffect(() => {
    if (hasLoadedInitialData.current) {
      setIsDirty(true);
      triggerAutoSave();
    }
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

  // Handle node deletion
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setIsDirty(true);
  }, [setNodes, setEdges]);

  // Handle node editing
  const handleNodeEdit = useCallback((nodeId: string, newData: Partial<CustomNodeData>) => {
    setNodes((nds) => nds.map((node) => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    ));
    setIsDirty(true);
  }, [setNodes]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
        setIsDirty(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setNodes, setEdges]);

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

  const { fitView, getViewport } = useReactFlow();

  // Create node types with delete and edit functionality
  const nodeTypesWithCallbacks = useMemo(() => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pill: (props: any) => <PillNode {...props} onDelete={handleDeleteNode} onNodeEdit={handleNodeEdit} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    step: (props: any) => <StepNode {...props} onDelete={handleDeleteNode} onNodeEdit={handleNodeEdit} />,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router: (props: any) => <RouterNode {...props} onDelete={handleDeleteNode} onNodeEdit={handleNodeEdit} />,
  }), [handleDeleteNode, handleNodeEdit]);

  // Create edge types with delete functionality
  const edgeTypes = useMemo(() => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: (props: any) => <CustomEdge {...props} data={{ ...props.data, onDelete: (id: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
      setIsDirty(true);
    }}} />,
  }), [setEdges]);

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
    const viewport = getViewport();
    
    // Get the actual viewport dimensions (fallback to reasonable defaults)
    const viewportWidth = window.innerWidth || 800;
    const viewportHeight = window.innerHeight || 600;
    
    // Transform viewport center to canvas coordinates
    // The viewport gives us the current pan (x, y) and zoom level
    const canvasCenterX = -viewport.x / viewport.zoom + (viewportWidth / 2) / viewport.zoom;
    const canvasCenterY = -viewport.y / viewport.zoom + (viewportHeight / 2) / viewport.zoom;
    
    // Add some randomness around the viewport center (smaller area for better UX)
    const randomOffsetX = (Math.random() - 0.5) * 150;
    const randomOffsetY = (Math.random() - 0.5) * 100;
    
    const newNode: Node<CustomNodeData> = {
      id: `${Date.now()}`, // Simple ID generation
      position: { 
        x: canvasCenterX + randomOffsetX,
        y: canvasCenterY + randomOffsetY
      },
      data: {
        label: getDefaultLabelForStepType(stepType),
        category: getCategoryForStepType(stepType),
        stepType: getDefaultStepTypeForCategory(stepType),
        description: getDefaultDescriptionForStepType(stepType)
      },
      type: getNodeTypeForStepType(stepType)
    };

    setNodes((nds) => [...nds, newNode]);
    setIsDirty(true);
  };

  // Helper functions for step creation
  const getDefaultLabelForStepType = (stepType: string): string => {
    switch (stepType) {
      case 'start': return 'Start';
      case 'self-service': return 'Self-Service Step';
      case 'channel': return 'Contact Channel';
      case 'agent': return 'Agent Step';
      case 'outcome': return 'Outcome';
      case 'router': return 'Decision Router';
      case 'cluster': return 'Process Cluster';
      default: return 'New Step';
    }
  };

  const getCategoryForStepType = (stepType: string): CustomNodeData['category'] => {
    switch (stepType) {
      case 'start': return 'start';
      case 'self-service': return 'self-service';
      case 'channel': return 'contact-channel';
      case 'agent': return 'agent';
      case 'outcome': return 'outcome';
      case 'router': return 'agent'; // Routers are typically handled by system/agent
      case 'cluster': return 'self-service'; // Default for clusters
      default: return 'self-service';
    }
  };

  const getDefaultStepTypeForCategory = (stepType: string): CustomNodeData['stepType'] => {
    switch (stepType) {
      case 'start': return 'website';
      case 'self-service': return 'website';
      case 'channel': return 'phone';
      case 'agent': return 'greeting';
      case 'outcome': return 'resolved';
      case 'router': return 'diagnosis';
      case 'cluster': return 'website';
      default: return 'website';
    }
  };

  const getDefaultDescriptionForStepType = (stepType: string): string => {
    switch (stepType) {
      case 'start': return 'Initial entry point for customer journey';
      case 'self-service': return 'Customer self-serves through digital channels';
      case 'channel': return 'Customer contacts through this channel';
      case 'agent': return 'Agent handles customer interaction';
      case 'outcome': return 'Process reaches a conclusion';
      case 'router': return 'Decision point with multiple routing rules';
      case 'cluster': return 'Group of related process steps';
      default: return 'Process step description';
    }
  };

  const getNodeTypeForStepType = (stepType: string): string => {
    switch (stepType) {
      case 'start': return 'pill';
      case 'outcome': return 'pill';
      case 'router': return 'router';
      default: return 'step';
    }
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
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleAddStep('start')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                      <span>Start Point</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddStep('self-service')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                      <span>Self-Service</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddStep('agent')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                      <span>Agent Step</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddStep('outcome')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                      <span>Outcome</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAddStep('channel')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                      <span>Contact Channel</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddStep('router')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                      <span>Router</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddStep('cluster')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
                      <span>Cluster</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {isDirty ? 'Unsaved changes' : lastSaved ? `Auto-saved ${formatLastSaved(lastSaved)}` : 'No changes yet'}
            </div>
            
            {/* Storage status indicator */}
            <div className="text-xs text-muted-foreground flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                storageStatus === 'github' ? 'bg-green-500' : 
                storageStatus === 'localStorage' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span>
                {storageStatus === 'github' ? 'GitHub' : 
                 storageStatus === 'localStorage' ? 'Local' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypesWithCallbacks}
          edgeTypes={edgeTypes}
          onNodesChange={(changes) => {
            onNodesChange(changes);
            setIsDirty(true);
          }}
          onEdgesChange={(changes) => {
            onEdgesChange(changes);
            setIsDirty(true);
          }}
          onConnect={onConnect}
          deleteKeyCode={['Backspace', 'Delete']}
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
                if (node.type === 'pill') {
                  const data = node.data as CustomNodeData;
                  if (data.category === 'start') return '#22c55e';
                  if (data.stepType === 'resolved') return '#22c55e';
                  if (data.stepType === 'abandoned') return '#ef4444';
                  return '#6b7280';
                }
                if (node.type === 'step') {
                  const data = node.data as CustomNodeData;
                  if (data.category === 'self-service') return '#3b82f6';
                  if (data.category === 'contact-channel') return '#8b5cf6';
                  if (data.category === 'agent') return '#eab308';
                  if (data.category === 'outcome') return '#ef4444';
                  return '#6b7280';
                }
                if (node.type === 'router') return '#f97316';
                return '#6b7280';
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
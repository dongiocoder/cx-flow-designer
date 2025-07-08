import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { Play, CheckCircle, AlertTriangle, Bot, Phone, Mail, MessageCircle, User, Settings, Target, Globe, HelpCircle, Video, MessageSquare, UserCheck, Search, ClipboardCheck, BarChart3, ChevronDown } from 'lucide-react';

// Node data interface
export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  category?: 'self-service' | 'contact-channel' | 'agent' | 'outcome' | 'start';
  stepType?: string;
  description?: string;
  icon?: string;
}

interface CustomNodeProps {
  data: CustomNodeData;
  selected?: boolean;
  id: string;
  onDelete?: (nodeId: string) => void;
  onNodeEdit?: (nodeId: string, newData: Partial<CustomNodeData>) => void;
}

interface NodeEditingProps {
  onNodeEdit?: (nodeId: string, newData: Partial<CustomNodeData>) => void;
}

// Step type presets based on flow-canvas-1.md spec
const STEP_TYPE_PRESETS = {
  'self-service': [
    { value: 'website', label: 'Website Page', icon: Globe },
    { value: 'faq', label: 'FAQ Check', icon: HelpCircle },
    { value: 'chatbot', label: 'Chatbot', icon: Bot },
    { value: 'knowledge-base', label: 'Knowledge Base', icon: Search },
    { value: 'self-diagnosis', label: 'Self-Diagnosis Tool', icon: ClipboardCheck }
  ],
  'contact-channel': [
    { value: 'phone', label: 'Phone', icon: Phone },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'chat', label: 'Live Chat', icon: MessageCircle },
    { value: 'messaging', label: 'Messaging', icon: MessageSquare },
    { value: 'social-dm', label: 'Social DM', icon: MessageCircle },
    { value: 'forum', label: 'Community Forum', icon: MessageSquare },
    { value: 'video', label: 'Video Call', icon: Video }
  ],
  'agent': [
    { value: 'greeting', label: 'Greeting', icon: User },
    { value: 'verification', label: 'Verification', icon: UserCheck },
    { value: 'diagnosis', label: 'Diagnosis', icon: Search },
    { value: 'resolution', label: 'Resolution', icon: ClipboardCheck },
    { value: 'survey', label: 'Survey', icon: BarChart3 },
    { value: 'escalation', label: 'Escalation', icon: AlertTriangle }
  ],
  'outcome': [
    { value: 'resolved', label: 'Issue Resolved', icon: CheckCircle },
    { value: 'csat-sent', label: 'CSAT Sent', icon: BarChart3 },
    { value: 'ticket-created', label: 'Ticket Created', icon: ClipboardCheck },
    { value: 'escalated', label: 'Escalated', icon: AlertTriangle },
    { value: 'abandoned', label: 'Abandoned', icon: AlertTriangle }
  ],
  'start': [
    { value: 'website', label: 'Website Entry', icon: Globe },
    { value: 'phone', label: 'Phone Call', icon: Phone },
    { value: 'email', label: 'Email Contact', icon: Mail },
    { value: 'chat', label: 'Chat Start', icon: MessageCircle }
  ]
};

// Color mapping for categories
const getCategoryColors = (category: string) => {
  switch (category) {
    case 'self-service':
      return { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-900' };
    case 'contact-channel':
      return { border: 'border-l-purple-500', bg: 'bg-purple-50', text: 'text-purple-900' };
    case 'agent':
      return { border: 'border-l-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-900' };
    case 'outcome':
      return { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-900' };
    case 'start':
      return { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-900' };
    default:
      return { border: 'border-l-gray-300', bg: 'bg-gray-50', text: 'text-gray-900' };
  }
};

// Get step icon based on step type
const getStepIcon = (stepType: string) => {
  const iconMap: Record<string, any> = {
    website: Globe,
    faq: HelpCircle,
    chatbot: Bot,
    'knowledge-base': Search,
    'self-diagnosis': ClipboardCheck,
    phone: Phone,
    email: Mail,
    chat: MessageCircle,
    messaging: MessageSquare,
    'social-dm': MessageCircle,
    forum: MessageSquare,
    video: Video,
    greeting: User,
    verification: UserCheck,
    diagnosis: Search,
    resolution: ClipboardCheck,
    survey: BarChart3,
    escalation: AlertTriangle,
    resolved: CheckCircle,
    'csat-sent': BarChart3,
    'ticket-created': ClipboardCheck,
    escalated: AlertTriangle,
    abandoned: AlertTriangle
  };
  return iconMap[stepType] || Settings;
};

// Inline editable text component
const EditableText = ({ 
  value, 
  onChange, 
  className, 
  style, 
  placeholder = "Click to edit...",
  multiline = false
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    const Component = multiline ? 'textarea' : 'input';
    return (
      <Component
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`${className} bg-white border border-blue-300 rounded px-1 outline-none ring-1 ring-blue-200 resize-none`}
        style={style}
        placeholder={placeholder}
        rows={multiline ? 2 : undefined}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`${className} cursor-text hover:bg-gray-100 rounded px-1 transition-colors duration-150`}
      style={style}
    >
      {value || placeholder}
    </span>
  );
};

// Inline editable dropdown
const EditableDropdown = ({
  value,
  onChange,
  options,
  className,
  style,
  placeholder = "Select..."
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; icon: any }>;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && event.target && !dropdownRef.current.contains(event.target as HTMLElement)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} className="relative">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`${className} cursor-pointer hover:bg-gray-100 rounded px-1 transition-colors duration-150 flex items-center justify-between`}
        style={style}
      >
        <span className="flex-1">{selectedOption?.label || placeholder}</span>
        <ChevronDown className="w-2 h-2 ml-1" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-full">
          {options.map((option) => {
            const OptionIcon = option.icon;
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer"
                style={{ fontSize: '9px' }}
              >
                <OptionIcon className="w-2.5 h-2.5" />
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Pill-shaped node for Start/Outcome
export function PillNode({ data, selected, id, onDelete, onNodeEdit }: CustomNodeProps) {
  const colors = getCategoryColors(data.category || 'start');
  const isStart = data.category === 'start';
  const isSuccess = data.stepType === 'resolved';
  const isAbandoned = data.stepType === 'abandoned';
  
  let pillColors = colors;
  if (isSuccess) {
    pillColors = { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-900' };
  } else if (isAbandoned) {
    pillColors = { border: 'border-red-500', bg: 'bg-red-100', text: 'text-red-900' };
  }

  const Icon = isStart ? Play : isSuccess ? CheckCircle : AlertTriangle;
  const stepTypeOptions = STEP_TYPE_PRESETS[data.category || 'outcome'] || [];

  const handleLabelChange = (newLabel: string) => {
    if (onNodeEdit) {
      onNodeEdit(id, { label: newLabel });
    }
  };

  const handleStepTypeChange = (newStepType: string) => {
    if (onNodeEdit) {
      onNodeEdit(id, { stepType: newStepType });
    }
  };

  return (
    <div 
      className={`
        relative px-1.5 py-0.5 rounded-full border min-w-[80px] group
        ${pillColors.bg} ${pillColors.border} ${pillColors.text}
        shadow-sm hover:shadow transition-all duration-200
        flex items-center justify-center space-x-0.5
      `}
    >
      <Icon className="w-2 h-2" />
      
      {/* For Start nodes, just show "Start" - no editing */}
      {isStart ? (
        <span className="font-medium" style={{ fontSize: '10px' }}>Start</span>
      ) : (
        <>
          <EditableText
            value={data.label}
            onChange={handleLabelChange}
            className="font-medium"
            style={{ fontSize: '10px' }}
            placeholder="Label..."
          />
          
          {/* Step type dropdown for outcome nodes only */}
          {stepTypeOptions.length > 0 && (
            <EditableDropdown
              value={data.stepType || ''}
              onChange={handleStepTypeChange}
              options={stepTypeOptions}
              style={{ fontSize: '9px' }}
              className="text-xs"
            />
          )}
        </>
      )}
      
      {/* Delete button - appears on hover */}
      {onDelete && (
        <button
          className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 text-white rounded-full 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     flex items-center justify-center hover:bg-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          title="Delete node"
          style={{ fontSize: '8px' }}
        >
          ×
        </button>
      )}
      
      {/* Handles - different configurations for start vs end nodes */}
      {isStart ? (
        // Start node: left, right, bottom handles
        <>
          <Handle
            type="source"
            position={Position.Left}
            id="left"
            className="w-1.5 h-1.5 border border-white bg-gray-400 hover:bg-gray-600"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            className="w-1.5 h-1.5 border border-white bg-gray-400 hover:bg-gray-600"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            className="w-1.5 h-1.5 border border-white bg-gray-400 hover:bg-gray-600"
          />
        </>
      ) : (
        // End node: top, left, right handles
        <>
          <Handle
            type="target"
            position={Position.Top}
            id="top"
            className="w-1.5 h-1.5 border border-white bg-gray-400 hover:bg-gray-600"
          />
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            className="w-1.5 h-1.5 border border-white bg-gray-400 hover:bg-gray-600"
          />
          <Handle
            type="target"
            position={Position.Right}
            id="right"
            className="w-1.5 h-1.5 border border-white bg-gray-400 hover:bg-gray-600"
          />
        </>
      )}
    </div>
  );
}

// Rectangular node for regular steps
export function StepNode({ data, selected, id, onDelete, onNodeEdit }: CustomNodeProps) {
  const colors = getCategoryColors(data.category || 'self-service');
  const stepTypeOptions = STEP_TYPE_PRESETS[data.category || 'self-service'] || [];
  
  // Get icon based on selected step type
  const Icon = getStepIcon(data.stepType || 'website');

  const handleDescriptionChange = (newDescription: string) => {
    if (onNodeEdit) {
      onNodeEdit(id, { description: newDescription });
    }
  };

  const handleStepTypeChange = (newStepType: string) => {
    if (onNodeEdit) {
      onNodeEdit(id, { stepType: newStepType });
    }
  };

  // Get the display label for the selected step type
  const selectedOption = stepTypeOptions.find(opt => opt.value === data.stepType);
  const displayLabel = selectedOption?.label || 'Select Step Type';

  return (
    <div 
      className={`
        relative bg-white rounded border-l-2 border-r border-t border-b border-gray-200 group
        ${colors.border} min-w-[120px] max-w-[160px]
        shadow-sm hover:shadow transition-all duration-200
      `}
    >
      <div className="p-1.5">
        <div className="flex items-start space-x-1">
          <div className={`p-0.5 rounded ${colors.bg}`}>
            <Icon className={`w-2.5 h-2.5 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            {/* Step type dropdown as the title */}
            <EditableDropdown
              value={data.stepType || ''}
              onChange={handleStepTypeChange}
              options={stepTypeOptions}
              style={{ fontSize: '10px' }}
              className="font-medium text-gray-900 w-full"
              placeholder="Select Step Type"
            />
            
            {/* Description field */}
            <EditableText
              value={data.description || ''}
              onChange={handleDescriptionChange}
              className="text-gray-500 block w-full"
              style={{ fontSize: '9px' }}
              placeholder="Description..."
              multiline
            />
          </div>
        </div>
      </div>

      {/* Category indicator */}
      <div className={`absolute top-0.5 right-0.5 w-1 h-1 rounded-full ${colors.bg}`} />

      {/* Delete button - appears on hover */}
      {onDelete && (
        <button
          className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 text-white rounded-full 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     flex items-center justify-center hover:bg-red-600 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          title="Delete node"
          style={{ fontSize: '8px' }}
        >
          ×
        </button>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-1.5 h-1.5 border border-white bg-gray-400 hover:bg-gray-600"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-1.5 h-1.5 border border-white bg-gray-400 hover:bg-gray-600"
      />
      
      {/* Side handles for more complex connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-1.5 h-1.5 border border-white bg-gray-400 hover:bg-gray-600"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-1.5 h-1.5 border border-white bg-gray-400 hover:bg-gray-600"
      />
    </div>
  );
}

// Router node for complex branching
export function RouterNode({ data, selected, id, onDelete, onNodeEdit }: CustomNodeProps) {
  const handleLabelChange = (newLabel: string) => {
    if (onNodeEdit) {
      onNodeEdit(id, { label: newLabel });
    }
  };

  return (
    <div 
      className={`
        relative bg-white rounded border border-orange-300 min-w-[120px] max-w-[150px] group
        shadow-sm hover:shadow transition-all duration-200
      `}
    >
      <div className="p-1.5">
        <div className="flex items-center space-x-1 mb-1">
          <Target className="w-2.5 h-2.5 text-orange-600" />
          <EditableText
            value={data.label || 'Router'}
            onChange={handleLabelChange}
            className="font-medium text-gray-900 flex-1"
            style={{ fontSize: '10px' }}
            placeholder="Router name..."
          />
        </div>
        
        {/* Rule stack visualization */}
        <div className="space-y-0.5">
          <div className="h-1 bg-orange-100 rounded flex items-center px-0.5">
            <span className="text-orange-700 leading-none" style={{ fontSize: '8px' }}>Rule 1</span>
          </div>
          <div className="h-1 bg-orange-100 rounded flex items-center px-0.5">
            <span className="text-orange-700 leading-none" style={{ fontSize: '8px' }}>Rule 2</span>
          </div>
          <div className="h-1 bg-orange-100 rounded flex items-center px-0.5">
            <span className="text-orange-700 leading-none" style={{ fontSize: '8px' }}>+3 more</span>
          </div>
        </div>
      </div>

      {/* Delete button - appears on hover */}
      {onDelete && (
        <button
          className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 text-white rounded-full 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     flex items-center justify-center hover:bg-red-600 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          title="Delete node"
          style={{ fontSize: '8px' }}
        >
          ×
        </button>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-1.5 h-1.5 border border-white bg-orange-400 hover:bg-orange-600"
      />
      
      {/* Multiple source handles for different rules */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="rule1"
        className="w-1.5 h-1.5 border border-white bg-orange-400 hover:bg-orange-600"
        style={{ left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="rule2"
        className="w-1.5 h-1.5 border border-white bg-orange-400 hover:bg-orange-600"
        style={{ left: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="rule3"
        className="w-1.5 h-1.5 border border-white bg-orange-400 hover:bg-orange-600"
        style={{ left: '75%' }}
      />
    </div>
  );
}

// Export node types for React Flow
export const nodeTypes = {
  pill: PillNode,
  step: StepNode,
  router: RouterNode,
}; 
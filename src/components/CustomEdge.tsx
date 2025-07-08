import React, { useState } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import { X } from 'lucide-react';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  label,
  selected,
  data,
}: EdgeProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    setShowDelete(true);
    setTimeout(() => setShowDelete(false), 3000); // Auto-hide after 3 seconds
  };

  const onDelete = () => {
    if (data?.onDelete && typeof data.onDelete === 'function') {
      (data.onDelete as (id: string) => void)(id);
    }
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={style}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            cursor: 'pointer',
          }}
          onClick={onEdgeClick}
          className="group"
        >
          {label && (
            <div className="text-xs bg-white px-1 py-0.5 rounded border border-gray-200">
              {label}
            </div>
          )}
          
          {/* Invisible click area - always present */}
          <div className="absolute -inset-x-8 -inset-y-4 w-16 h-8" />
          
          {/* Delete button */}
          {showDelete && (
            <button
              className="absolute -top-3 left-1/2 transform -translate-x-1/2 
                         w-5 h-5 bg-red-500 text-white rounded-full 
                         flex items-center justify-center text-xs hover:bg-red-600
                         shadow-md z-10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete connection"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
} 
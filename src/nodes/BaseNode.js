// BaseNode.js
// Shared shell for all pipeline node types.

import React from 'react';
import { Handle } from 'reactflow';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Slider } from '../ui/slider';
import { nodeConfigs } from './nodeConfigs';

/**
 * BaseNode — shared shell for all pipeline node types.
 * It can be used directly for simple nodes or as a wrapper for complex ones.
 */
export const BaseNode = (props) => {
  const { id, data, nodeConfig: manualConfig, selected, style, type } = props;
  const updateNodeField = useStore((state) => state.updateNodeField);

  // Use manual config if provided (e.g. for dynamic nodes), otherwise look up by type
  const nodeConfig = manualConfig || nodeConfigs[type] || {};
  const { label, color, fields = [], handles = { inputs: [], outputs: [] }, icon: Icon } = nodeConfig;

  const handleFieldChange = (name, value) => {
    updateNodeField(id, name, value);
  };

  const renderHandles = (handleList, handleType) => {
    const isTarget = handleType === 'target';
    const sideClass = isTarget ? "left-0" : "right-0";
    const containerClass = isTarget ? "-translate-x-1/2" : "translate-x-1/2";
    
    return (
      <div className={cn("absolute top-0 bottom-0 pointer-events-none", sideClass, containerClass)}>
        {handleList.map((h, i) => {
          // If no style is provided, space them evenly
          const defaultStyle = {
            top: `${((i + 1) / (handleList.length + 1)) * 100}%`
          };
          const handleStyle = h.style || defaultStyle;

          return (
            <div 
              key={h.id} 
              className={cn("absolute flex items-center group pointer-events-auto", isTarget ? "left-0" : "right-0 justify-end")}
              style={handleStyle}
            >
              {isTarget && (
                <Handle
                  type="target"
                  position={h.position}
                  id={`${id}-${h.id}`}
                  className="!w-3 !h-3 !border-2 !border-surface !bg-[#60a5fa] hover:!scale-150 !transition-transform"
                />
              )}
              <span className={cn(
                "absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-[10px] text-white px-1.5 py-0.5 rounded whitespace-nowrap border border-border/50",
                isTarget ? "left-4" : "right-4"
              )}>
                {h.label || h.id}
              </span>
              {!isTarget && (
                <Handle
                  type="source"
                  position={h.position}
                  id={`${id}-${h.id}`}
                  className="!w-3 !h-3 !border-2 !border-surface !bg-[#34d399] hover:!scale-150 !transition-transform"
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative min-w-[240px] bg-surface/90 backdrop-blur-md border border-border rounded-xl shadow-2xl transition-all duration-200 overflow-visible",
        selected && "border-accent ring-2 ring-accent/30 scale-[1.02] z-10",
      )}
      style={style}
    >
      {/* Header */}
      <div 
        className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 rounded-t-xl bg-white/[0.03]"
        style={{ borderTop: `3px solid ${color || 'var(--color-accent)'}` }}
      >
        {Icon && <Icon size={16} className="text-accent shrink-0" />}
        <span className="font-bold text-[11px] uppercase tracking-wider text-white truncate">
          {label || 'Node'}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-4">
        {/* Render Configured Fields */}
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-tighter text-text-muted">
              {field.label}
            </label>
            
            {field.type === 'text' && (
              <Input
                value={data?.[field.name] ?? field.default}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="h-8 bg-black/20 border-border/40 focus:border-accent text-white text-xs nodrag"
              />
            )}

            {field.type === 'select' && (
              <Select 
                value={data?.[field.name] ?? field.default} 
                onValueChange={(val) => handleFieldChange(field.name, val)}
              >
                <SelectTrigger className="h-8 bg-black/20 border-border/40 focus:ring-accent text-white text-xs nodrag">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border text-white text-xs">
                  {field.options.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === 'slider' && (
              <div className="flex items-center gap-3">
                <Slider
                  value={[data?.[field.name] ?? field.default]}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  onValueChange={([val]) => handleFieldChange(field.name, val)}
                  className="flex-1 nodrag"
                />
                <span className="text-[10px] font-mono text-accent min-w-[24px]">
                  {data?.[field.name] ?? field.default}
                </span>
              </div>
            )}
          </div>
        ))}

        {props.children}
      </div>

      {renderHandles(handles.inputs, 'target')}
      {renderHandles(handles.outputs, 'source')}
    </div>
  );
};

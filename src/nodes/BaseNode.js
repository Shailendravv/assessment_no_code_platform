// BaseNode.js
// Shared shell for all pipeline node types.

import { Handle } from 'reactflow';
import { theme } from '../styles/theme';
import { cn } from '../lib/utils';

/**
 * BaseNode — shared shell for all pipeline node types.
 *
 * Props:
 *   id        {string}            — ReactFlow node id (passed through automatically)
 *   label     {string}            — displayed in the header
 *   icon      {ReactNode}         — optional icon for the header
 *   handles   {HandleDescriptor[]} — array of handle descriptors
 *   className {string}            — optional class overrides for the outer container
 *   style     {object}            — optional inline style overrides
 *   selected  {boolean}           — injected by ReactFlow; drives selected state styling
 *   children  {ReactNode}         — node-specific body content
 */
export const BaseNode = ({ id, label, icon, handles = [], className, style, selected, children }) => {
  return (
    <div
      className={cn(
        "relative min-w-[220px] bg-surface/80 backdrop-blur-md border border-border rounded-xl shadow-xl transition-all duration-200 overflow-hidden",
        selected && "border-accent ring-2 ring-accent/30 node-selected",
        className
      )}
      style={style}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-border/50">
        {icon && <span className="text-accent">{icon}</span>}
        <span className="font-semibold text-sm tracking-tight text-text-primary">
          {label}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-4">
        {children}
      </div>

      {/* Handles */}
      {handles.map((descriptor) => (
        <Handle
          key={descriptor.id}
          id={descriptor.id}
          type={descriptor.type}
          position={descriptor.position}
          className={cn(
            "!w-3 !h-3 !border-2 !border-surface !bg-accent !transition-transform hover:!scale-125",
            descriptor.className
          )}
          style={descriptor.style}
        />
      ))}
    </div>
  );
};

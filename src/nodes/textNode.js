// textNode.js

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import useAutoResize from '../hooks/useAutoResize';
import useVariableHandles from '../hooks/useVariableHandles';
import { Textarea } from '../ui/textarea';
import { FileText } from 'lucide-react';

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');

  const { width, height, textareaRef } = useAutoResize(currText, { minWidth: 220, minHeight: 100 });
  const variableHandles = useVariableHandles(id, currText);

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
  };

  const handles = [
    ...variableHandles,
    { id: `${id}-output`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode 
      label="Text" 
      id={id} 
      icon={<FileText size={16} />}
      handles={handles} 
      style={{ width, height }}
    >
      <div className="flex flex-col gap-2 h-full">
        <label className="text-[11px] font-bold uppercase tracking-wider text-white">
          Content
        </label>
        <Textarea
          ref={textareaRef}
          value={currText}
          onChange={handleTextChange}
          className="flex-1 bg-black/40 border-border/40 focus:border-accent text-white text-xs resize-none min-h-[60px]"
        />
      </div>
    </BaseNode>
  );
}

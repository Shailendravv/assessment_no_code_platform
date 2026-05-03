// textNode.js

import { useState } from 'react';
import { BaseNode } from './BaseNode';
import useAutoResize from '../hooks/useAutoResize';
import useVariableHandles from '../hooks/useVariableHandles';
import { Textarea } from '../ui/textarea';
import { FileText } from 'lucide-react';
import { useStore } from '../store';
import { nodeConfigs } from './nodeConfigs';

export const TextNode = (props) => {
  const { id, data } = props;
  const updateNodeField = useStore((state) => state.updateNodeField);
  const [currText, setCurrText] = useState(data?.text || '');

  // Custom hooks for auto-resizing and variable handle extraction
  const { width, height, textareaRef } = useAutoResize(currText, { minWidth: 250, minHeight: 180 });
  const variableHandles = useVariableHandles(id, currText);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setCurrText(newText);
    updateNodeField(id, 'text', newText);
  };

  // Combine static output handle with dynamic variable input handles
  const handles = {
    inputs: variableHandles,
    outputs: nodeConfigs.text.handles.outputs
  };

  return (
    <BaseNode
      {...props}
      nodeConfig={{ ...nodeConfigs.text, handles }}
      icon={<FileText size={16} />}
      style={{ width, height }}
    >
      <div className="flex flex-col gap-2 flex-1 min-h-0 h-full">
        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
          Content
        </label>
        <div className="flex-1 min-h-0 relative h-full">
          <Textarea
            ref={textareaRef}
            value={currText}
            onChange={handleTextChange}
            className="w-full h-full bg-black/20 border-border/50 hover:border-border focus:border-accent text-white text-[13px] resize-none transition-all duration-200 rounded-lg p-3 nodrag"
            placeholder="Type your prompt here... use {{variable}} for dynamic inputs"
          />
        </div>
      </div>
    </BaseNode>
  );
}

// llmNode.js

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { Cpu } from 'lucide-react';

export const LLMNode = ({ id, data }) => {
  const handles = [
    { id: `${id}-system`, type: 'target', position: Position.Left, style: { top: '33%' } },
    { id: `${id}-prompt`, type: 'target', position: Position.Left, style: { top: '67%' } },
    { id: `${id}-response`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode 
      label="LLM" 
      id={id} 
      icon={<Cpu size={16} />}
      handles={handles}
    >
      <div className="py-2">
        <p className="text-xs text-text-primary/80 leading-relaxed">
          This is a Large Language Model. It processes system messages and prompts to generate responses.
        </p>
      </div>
    </BaseNode>
  );
}

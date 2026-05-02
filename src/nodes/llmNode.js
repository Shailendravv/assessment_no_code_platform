// llmNode.js

import { BaseNode } from './BaseNode';
import { Cpu } from 'lucide-react';
import { nodeConfigs } from './nodeConfigs';

export const LLMNode = (props) => {
  return (
    <BaseNode 
      {...props}
      nodeConfig={nodeConfigs.llm}
      icon={<Cpu size={16} />}
    >
      <div className="py-1">
        <p className="text-[10px] text-text-muted leading-relaxed italic">
          Large Language Model for processing system prompts and variables.
        </p>
      </div>
    </BaseNode>
  );
}


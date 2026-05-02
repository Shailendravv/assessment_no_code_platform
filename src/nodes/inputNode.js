// inputNode.js

import { BaseNode } from './BaseNode';
import { LogIn } from 'lucide-react';
import { nodeConfigs } from './nodeConfigs';

export const InputNode = (props) => {
  return (
    <BaseNode 
      {...props}
      nodeConfig={nodeConfigs.customInput}
      icon={<LogIn size={16} />}
    />
  );
};


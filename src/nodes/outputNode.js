// outputNode.js

import { BaseNode } from './BaseNode';
import { LogOut } from 'lucide-react';
import { nodeConfigs } from './nodeConfigs';

export const OutputNode = (props) => {
  return (
    <BaseNode 
      {...props}
      nodeConfig={nodeConfigs.customOutput}
      icon={<LogOut size={16} />}
    />
  );
};


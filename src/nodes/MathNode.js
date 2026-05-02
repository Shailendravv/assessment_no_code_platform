// MathNode.js

import { BaseNode } from './BaseNode';
import { Sigma } from 'lucide-react';
import { nodeConfigs } from './nodeConfigs';

export const MathNode = (props) => {
  return (
    <BaseNode 
      {...props}
      nodeConfig={nodeConfigs.math}
      icon={<Sigma size={16} />}
    />
  );
}


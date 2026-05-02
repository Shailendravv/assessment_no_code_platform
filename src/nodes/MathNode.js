// MathNode.js

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { Input } from '../ui/input';
import { Sigma } from 'lucide-react';

export const MathNode = ({ id, data }) => {
  const [expression, setExpression] = useState(data?.expression || 'x + y');

  const handles = [
    { id: `${id}-x`, type: 'target', position: Position.Left, style: { top: '33%' } },
    { id: `${id}-y`, type: 'target', position: Position.Left, style: { top: '67%' } },
    { id: `${id}-result`, type: 'source', position: Position.Right },
  ];

  return (
    <BaseNode 
      label="Math" 
      id={id} 
      icon={<Sigma size={16} />}
      handles={handles}
    >
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-white">
          Expression
        </label>
        <Input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className="h-8 bg-black/40 border-border/40 focus:border-accent text-white text-xs"
        />
      </div>
    </BaseNode>
  );
}

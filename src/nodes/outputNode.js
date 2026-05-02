// outputNode.js

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { LogOut } from 'lucide-react';

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(
    data?.outputName || id.replace('customOutput-', 'output_')
  );
  const [outputType, setOutputType] = useState(data.outputType || 'Text');

  const handles = [
    { id: `${id}-value`, type: 'target', position: Position.Left },
  ];

  return (
    <BaseNode 
      label="Output" 
      id={id} 
      icon={<LogOut size={16} />}
      handles={handles}
    >
      <div className="flex flex-col gap-4">
        {/* Name Field */}
        <div className="flex items-center gap-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white w-12 shrink-0">
            Name
          </label>
          <Input
            type="text"
            value={currName}
            onChange={(e) => setCurrName(e.target.value)}
            className="h-8 bg-black/40 border-border/40 focus:border-accent text-white text-xs"
          />
        </div>

        {/* Type Field */}
        <div className="flex items-center gap-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white w-12 shrink-0">
            Type
          </label>
          <Select value={outputType} onValueChange={setOutputType}>
            <SelectTrigger className="h-8 bg-black/40 border-border/40 focus:ring-accent text-white text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border text-white text-xs">
              <SelectItem value="Text">Text</SelectItem>
              <SelectItem value="Image">Image</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </BaseNode>
  );
};

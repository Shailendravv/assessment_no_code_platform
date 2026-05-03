// src/nodes/nodeConfigs.js
import { Position } from 'reactflow';
import { 
  LogIn, 
  LogOut, 
  Cpu, 
  FileText, 
  PlusSquare, 
  Globe, 
  Database, 
  Code, 
  Zap, 
  Split, 
  Download 
} from 'lucide-react';

export const nodeConfigs = {
  customInput: {
    label: 'Input',
    color: '#6366f1',
    icon: LogIn,
    fields: [
      { name: 'inputName', type: 'text', label: 'Name', default: 'input_1' },
      { name: 'inputType', type: 'select', label: 'Type', default: 'Text', options: ['Text', 'File'] },
    ],
    handles: {
      inputs: [],
      outputs: [{ id: 'value', label: 'Value', position: Position.Right }],
    },
  },
  customOutput: {
    label: 'Output',
    color: '#f43f5e',
    icon: LogOut,
    fields: [
      { name: 'outputName', type: 'text', label: 'Name', default: 'output_1' },
      { name: 'outputType', type: 'select', label: 'Type', default: 'Text', options: ['Text', 'Image'] },
    ],
    handles: {
      inputs: [{ id: 'value', label: 'Value', position: Position.Left }],
      outputs: [],
    },
  },
  llm: {
    label: 'LLM',
    color: '#a855f7',
    icon: Cpu,
    fields: [
      { name: 'model', type: 'select', label: 'Model', default: 'gpt-4o', options: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'] },
      { name: 'temperature', type: 'slider', label: 'Temperature', default: 0.7, min: 0, max: 1, step: 0.1 },
    ],
    handles: {
      inputs: [
        { id: 'system', label: 'System', position: Position.Left },
        { id: 'prompt', label: 'Prompt', position: Position.Left },
      ],
      outputs: [{ id: 'response', label: 'Response', position: Position.Right }],
    },
  },
  text: {
    label: 'Text',
    color: '#10b981',
    icon: FileText,
    fields: [], // TextNode handles its own textarea
    handles: {
      inputs: [], // TextNode handles dynamic variable handles
      outputs: [{ id: 'output', label: 'Output', position: Position.Right }],
    },
  },
  math: {
    label: 'Math',
    color: '#3b82f6',
    icon: PlusSquare,
    fields: [
      { name: 'expression', type: 'text', label: 'Expression', default: 'x + y' },
    ],
    handles: {
      inputs: [
        { id: 'x', label: 'X', position: Position.Left },
        { id: 'y', label: 'Y', position: Position.Left },
      ],
      outputs: [{ id: 'result', label: 'Result', position: Position.Right }],
    },
  },
  
  // --- New Nodes demonstrating the abstraction ---

  vectorStore: {
    label: 'Vector Store',
    color: '#ec4899',
    icon: Database,
    fields: [
      { name: 'collection', type: 'text', label: 'Collection Name', default: 'documents' },
      { name: 'topK', type: 'slider', label: 'Top K Results', default: 5, min: 1, max: 20, step: 1 },
    ],
    handles: {
      inputs: [{ id: 'query', label: 'Query Vector', position: Position.Left }],
      outputs: [{ id: 'results', label: 'Matches', position: Position.Right }],
    },
  },

  codeBlock: {
    label: 'JS Code',
    color: '#fbbf24',
    icon: Code,
    fields: [
      { name: 'language', type: 'select', label: 'Language', default: 'javascript', options: ['javascript', 'python', 'typescript'] },
    ],
    handles: {
      inputs: [{ id: 'input', label: 'Input Data', position: Position.Left }],
      outputs: [{ id: 'output', label: 'Return Value', position: Position.Right }],
    },
  },

  webhook: {
    label: 'Webhook',
    color: '#06b6d4',
    icon: Zap,
    fields: [
      { name: 'endpoint', type: 'text', label: 'URL', default: 'https://hooks.slack.com/...' },
      { name: 'method', type: 'select', label: 'Method', default: 'POST', options: ['POST', 'GET'] },
    ],
    handles: {
      inputs: [{ id: 'payload', label: 'Payload', position: Position.Left }],
      outputs: [{ id: 'status', label: 'Status', position: Position.Right }],
    },
  },

  router: {
    label: 'Router',
    color: '#8b5cf6',
    icon: Split,
    fields: [
      { name: 'condition', type: 'text', label: 'Condition', default: 'data.value > 10' },
    ],
    handles: {
      inputs: [{ id: 'input', label: 'Data', position: Position.Left }],
      outputs: [
        { id: 'true', label: 'True', position: Position.Right },
        { id: 'false', label: 'False', position: Position.Right },
      ],
    },
  },

  dataFetcher: {
    label: 'Data Fetcher',
    color: '#f97316',
    icon: Download,
    fields: [
      { name: 'source', type: 'select', label: 'Source', default: 'Alpha Vantage', options: ['Alpha Vantage', 'CoinGecko', 'NewsAPI'] },
    ],
    handles: {
      inputs: [{ id: 'params', label: 'Parameters', position: Position.Left }],
      outputs: [{ id: 'data', label: 'Fetched Data', position: Position.Right }],
    },
  },
};



// src/nodes/nodeConfigs.js
import { Position } from 'reactflow';

export const nodeConfigs = {
  customInput: {
    label: 'Input',
    color: '#6366f1',
    fields: [
      {
        name: 'inputName',
        type: 'text',
        label: 'Name',
        default: 'input_1',
      },
      {
        name: 'inputType',
        type: 'select',
        label: 'Type',
        default: 'Text',
        options: ['Text', 'File'],
      },
    ],
    handles: {
      inputs: [],
      outputs: [{ id: 'value', label: 'Value', position: Position.Right }],
    },
  },
  customOutput: {
    label: 'Output',
    color: '#f43f5e',
    fields: [
      {
        name: 'outputName',
        type: 'text',
        label: 'Name',
        default: 'output_1',
      },
      {
        name: 'outputType',
        type: 'select',
        label: 'Type',
        default: 'Text',
        options: ['Text', 'Image'],
      },
    ],
    handles: {
      inputs: [{ id: 'value', label: 'Value', position: Position.Left }],
      outputs: [],
    },
  },
  llm: {
    label: 'LLM',
    color: '#a855f7',
    fields: [
      {
        name: 'model',
        type: 'select',
        label: 'Model',
        default: 'gpt-4o',
        options: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
      },
      {
        name: 'temperature',
        type: 'slider',
        label: 'Temperature',
        default: 0.7,
        min: 0,
        max: 1,
        step: 0.1,
      },
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
    fields: [], // TextNode handles its own textarea
    handles: {
      inputs: [], // TextNode handles dynamic variable handles
      outputs: [{ id: 'output', label: 'Output', position: Position.Right }],
    },
  },
  httpRequest: {
    label: 'HTTP Request',
    color: '#f59e0b',
    fields: [
      {
        name: 'url',
        type: 'text',
        label: 'URL',
        default: 'https://api.example.com',
      },
      {
        name: 'method',
        type: 'select',
        label: 'Method',
        default: 'GET',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
      },
    ],
    handles: {
      inputs: [{ id: 'body', label: 'Body', position: Position.Left }],
      outputs: [
        { id: 'response', label: 'Response', position: Position.Right },
        { id: 'statusCode', label: 'Status', position: Position.Right },
      ],
    },
  },
  math: {
    label: 'Math',
    color: '#3b82f6',
    fields: [
      {
        name: 'expression',
        type: 'text',
        label: 'Expression',
        default: 'x + y',
      },
    ],
    handles: {
      inputs: [
        // { id: 'x', label: 'X', position: Position.Left },
        { id: 'y', label: 'Y', position: Position.Left },
      ],
      outputs: [{ id: 'result', label: 'Result', position: Position.Right }],
    },
  },
};


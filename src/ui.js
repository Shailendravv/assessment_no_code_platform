// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { theme } from './styles/theme';
import { BaseNode } from './nodes/BaseNode';
import { TextNode } from './nodes/textNode';
import { nodeConfigs } from './nodes/nodeConfigs';

import 'reactflow/dist/style.css';


const gridSize = 20;
const proOptions = { hideAttribution: true };

// Build nodeTypes dynamically from nodeConfigs
// If a custom component exists (like TextNode), use it. Otherwise, use BaseNode.
const nodeTypes = Object.keys(nodeConfigs).reduce((acc, type) => {
  if (type === 'text') {
    acc[type] = TextNode;
  } else {
    acc[type] = BaseNode;
  }
  return acc;
}, {});


const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  interactMode: state.interactMode,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  copy: state.copy,
  paste: state.paste,
  selectAll: state.selectAll,
  deleteSelected: state.deleteSelected,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {
      nodes,
      edges,
      interactMode,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      copy,
      paste,
      selectAll,
      deleteSelected,
    } = useStore(selector, shallow);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const isCtrl = event.ctrlKey || event.metaKey;
            
            // Delete / Backspace
            if (event.key === 'Delete' || event.key === 'Backspace') {
                // Only delete if not typing in an input
                if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
                    deleteSelected();
                }
            }

            // Ctrl + C (Copy)
            if (isCtrl && event.key === 'c') {
                copy();
            }

            // Ctrl + V (Paste)
            if (isCtrl && event.key === 'v') {
                paste();
            }

            // Ctrl + A (Select All)
            if (isCtrl && event.key === 'a') {
                if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
                    event.preventDefault();
                    selectAll();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [copy, paste, selectAll, deleteSelected]);

    const getInitNodeData = (nodeID, type) => {
      const config = nodeConfigs[type];
      let nodeData = { id: nodeID, nodeType: `${type}` };
      
      // Initialize with defaults from config
      if (config && config.fields) {
        config.fields.forEach(field => {
          nodeData[field.name] = field.default;
        });
      }
      
      return nodeData;
    }

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );


    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    return (
        <>
        <div ref={reactFlowWrapper} className='w-full h-full'>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
                panOnDrag={interactMode === 'pan'}
                selectionOnDrag={interactMode === 'select'}
                selectionMode="box"
                style={{ background: 'var(--color-surface)' }}
            >
                <Background color='var(--color-border)' gap={gridSize} />
                <Controls className='bg-background border-border text-text-primary' />
                <MiniMap style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
            </ReactFlow>
        </div>
        </>
    )
}

// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    interactMode: 'pan',
    setInteractMode: (mode) => set({ interactMode: mode }),
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
  
          return node;
        }),
      });
    },
    clearCanvas: () => {
      set({ nodes: [], edges: [] });
    },
    deleteSelected: () => {
      const selectedNodes = get().nodes.filter((n) => n.selected);
      const selectedEdges = get().edges.filter((e) => e.selected);
      
      if (selectedNodes.length > 0) {
        set({
          nodes: applyNodeChanges(selectedNodes.map(n => ({ id: n.id, type: 'remove' })), get().nodes),
        });
      }
      if (selectedEdges.length > 0) {
        set({
          edges: applyEdgeChanges(selectedEdges.map(e => ({ id: e.id, type: 'remove' })), get().edges),
        });
      }
    },
  }));

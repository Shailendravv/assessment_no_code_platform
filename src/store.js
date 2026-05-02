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
    clipboard: { nodes: [], edges: [] },
    copy: () => {
      const selectedNodes = get().nodes.filter((n) => n.selected);
      const selectedEdges = get().edges.filter((e) => e.selected);
      set({ clipboard: { nodes: JSON.parse(JSON.stringify(selectedNodes)), edges: JSON.parse(JSON.stringify(selectedEdges)) } });
    },
    paste: () => {
      const { nodes: cbNodes, edges: cbEdges } = get().clipboard;
      if (cbNodes.length === 0) return;

      const idMap = {};
      const newNodes = cbNodes.map((node) => {
        const newId = get().getNodeID(node.type);
        idMap[node.id] = newId;
        return {
          ...node,
          id: newId,
          position: { x: node.position.x + 20, y: node.position.y + 20 },
          selected: true,
          data: { ...node.data, id: newId },
        };
      });

      const newEdges = cbEdges.map((edge) => {
        const newId = `e-${idMap[edge.source]}-${idMap[edge.target]}`;
        return {
          ...edge,
          id: newId,
          source: idMap[edge.source],
          target: idMap[edge.target],
          selected: true,
        };
      });

      // Deselect current selection
      const deselectedNodes = get().nodes.map(n => ({ ...n, selected: false }));
      const deselectedEdges = get().edges.map(e => ({ ...e, selected: false }));

      set({
        nodes: [...deselectedNodes, ...newNodes],
        edges: [...deselectedEdges, ...newEdges],
      });
    },
    selectAll: () => {
      set({
        nodes: get().nodes.map(n => ({ ...n, selected: true })),
        edges: get().edges.map(e => ({ ...e, selected: true })),
      });
    },
  }));

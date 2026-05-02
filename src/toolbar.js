// toolbar.js

import { DraggableNode } from "./draggableNode";
import { useStore } from "./store";
import { Hand, MousePointer2 } from "lucide-react";

export const PipelineToolbar = () => {
  const clearCanvas = useStore((state) => state.clearCanvas);
  const deleteSelected = useStore((state) => state.deleteSelected);
  const interactMode = useStore((state) => state.interactMode);
  const setInteractMode = useStore((state) => state.setInteractMode);
  const hasSelection = useStore(
    (state) =>
      state.nodes.some((n) => n.selected) ||
      state.edges.some((e) => e.selected),
  );

  return (
    <div className="p-2.5 bg-background text-text-primary font-sans flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setInteractMode("pan")}
          className={`w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-150
                        ${
                          interactMode === "pan"
                            ? "bg-[#3b3d54] text-white"
                            : "text-[#8892a4] hover:text-white hover:bg-white/5"
                        }`}
          title="Hand Tool (Pan)"
        >
          <Hand size={15} strokeWidth={interactMode === "pan" ? 2.5 : 2} />
        </button>
        <button
          onClick={() => setInteractMode("select")}
          className={`w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-150
                        ${
                          interactMode === "select"
                            ? "bg-[#3b3d54] text-white"
                            : "text-[#8892a4] hover:text-white hover:bg-white/5"
                        }`}
          title="Selection Tool"
        >
          <MousePointer2
            size={15}
            strokeWidth={interactMode === "select" ? 2.5 : 2}
          />
        </button>
      </div>

      <div className="h-6 w-px bg-border mx-1" />

      <div className="flex flex-wrap gap-2.5 items-center">
        <DraggableNode type="customInput" label="Input" />
        <DraggableNode type="llm" label="LLM" />
        <DraggableNode type="customOutput" label="Output" />
        <DraggableNode type="text" label="Text" />
        <DraggableNode type="math" label="Math" />
      </div>

      <div className="h-6 w-px bg-border mx-2" />

      <div className="flex gap-2">
        <button
          onClick={deleteSelected}
          disabled={!hasSelection}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 border
                        ${
                          hasSelection
                            ? "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                            : "bg-surface border-border text-text-muted cursor-not-allowed opacity-50"
                        }`}
        >
          Delete Selected
        </button>
        <button
          onClick={clearCanvas}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 border border-border bg-surface text-text-primary hover:bg-border"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

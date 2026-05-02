# VectorShift Pipeline Builder — Implementation Plan

> **Stack:** React 18 + React Flow (frontend) · Python 3.11 + FastAPI (backend)  
> **Parts covered:** Node Abstraction · Styling · Text Node Logic · Backend Integration

---

## How to use this document

Each step contains:
- **What to do** — the goal in plain English
- **Files to touch** — exact paths you will create or edit
- **Prompt to give AI** — copy-paste this directly; add your file contents after the prompt when indicated
- **Done when** — how you know the step is complete before moving on

Work through phases in order. Phases 3 and 4 can run in parallel once Phase 2 is done.

---

## Phase 1 — Project Setup

*Goal: get both servers running and talking to each other before writing any features.*

---

### Step 1 — Run the frontend dev server

**What to do:**  
Navigate to `/frontend`, install dependencies, and start the React app.

**Files to touch:**  
- `/frontend/package.json` (read-only at this step)

**Commands to run:**

```bash
cd frontend
npm install
npm start
```

**Done when:** Browser opens `http://localhost:3000` and the canvas loads without errors.

---

### Step 2 — Run the FastAPI backend

**What to do:**  
Navigate to `/backend` and start the uvicorn dev server.

**Commands to run:**

```bash
cd backend
pip install -r requirements.txt   # or: pip install fastapi uvicorn
uvicorn main:app --reload
```

**Done when:** `http://localhost:8000/docs` opens the auto-generated Swagger UI.

---

### Step 3 — Add CORS middleware to FastAPI

**What to do:**  
Allow the React dev server on port 3000 to call the FastAPI server on port 8000. Without this, every fetch from the frontend will be blocked by the browser.

**Files to touch:**  
- `/backend/main.py`

**Prompt to give AI:**

> Add FastAPI CORSMiddleware to my `main.py` that allows requests from `http://localhost:3000` with all HTTP methods and all headers. Show me the complete updated `main.py`.
>
> Here is my current `main.py`:
> ```
> [paste your current main.py here]
> ```

**Done when:** A `fetch('http://localhost:8000')` call from the browser console on `localhost:3000` does not throw a CORS error.

---

## Phase 2 — Node Abstraction (Part 1)

*Goal: replace copy-paste node files with a single `BaseNode` component driven by a config object.*

---

### Step 4 — Audit existing nodes for shared patterns

**What to do:**  
Read all four existing node files and list every piece of code that is repeated. This list becomes the props interface for `BaseNode`.

**Files to touch (read only):**  
- `/frontend/src/nodes/inputNode.js`
- `/frontend/src/nodes/outputNode.js`
- `/frontend/src/nodes/llmNode.js`
- `/frontend/src/nodes/textNode.js`

**Prompt to give AI:**

> I have four React Flow node files below. Analyze them and:
> 1. List every piece of code that is duplicated across two or more files
> 2. Propose a unified `nodeConfig` object shape that could drive all four nodes from a single `BaseNode` component
> 3. Show what the `nodeConfig` for the LLM node would look like using your proposed shape
>
> [paste all four node files, separated by filename headers]

**Done when:** You have a written list of shared patterns and an agreed config shape before writing any code.

---

### Step 5 — Create `BaseNode.jsx`

**What to do:**  
Write a single React component that accepts a `nodeConfig` prop and renders: a colored title bar, input Handles on the left, output Handles on the right, and a list of field inputs.

**Files to create:**  
- `/frontend/src/nodes/BaseNode.jsx`

**Prompt to give AI:**

> Write a `BaseNode.jsx` React Flow component. It receives a `nodeConfig` prop with this exact shape:
>
> ```js
> {
>   label: string,
>   color: string,           // hex — used for the title bar background
>   fields: [
>     {
>       name: string,        // key for state
>       type: 'text' | 'select' | 'slider' | 'textarea',
>       label: string,
>       default: any,
>       options: string[],   // only for type: 'select'
>       min: number,         // only for type: 'slider'
>       max: number,
>       step: number,
>     }
>   ],
>   handles: {
>     inputs:  [{ id: string, label: string }],
>     outputs: [{ id: string, label: string }]
>   }
> }
> ```
>
> Requirements:
> - Use `useState` to track each field's value
> - Render input Handles (`type="target"`) on the left side, spaced evenly
> - Render output Handles (`type="source"`) on the right side, spaced evenly
> - Render each field using the correct HTML element for its type
> - The title bar should use `nodeConfig.color` as its background
> - The outer wrapper must have `className="react-flow__node-default"` removed and use a plain div with `nodrag` class on fields so text inputs don't trigger drag

**Done when:** `BaseNode.jsx` renders without errors when you temporarily drop it into `App.js` with a hardcoded config.

---

### Step 6 — Create `nodeConfigs.js`

**What to do:**  
Write one config entry per node type. Start with the four existing types: `customInput`, `customOutput`, `llm`, `text` (text gets its own special component later; add a placeholder config here for completeness).

**Files to create:**  
- `/frontend/src/nodes/nodeConfigs.js`

**Prompt to give AI:**

> Write a `nodeConfigs.js` file that exports a `nodeConfigs` object. It should contain config entries for these node types, matching the shape I'm using in `BaseNode.jsx`:
>
> - `customInput`: fields for `inputName` (text) and `inputType` (select: Text, File, Image); one output handle `value`
> - `customOutput`: fields for `outputName` (text) and `outputType` (select: Text, Image); one input handle `value`
> - `llm`: fields for `model` (select: gpt-4o, claude-3-5-sonnet, gemini-1.5-pro) and `temperature` (slider 0–1); two input handles `system` and `prompt`; one output handle `response`
> - `text`: no fields (TextNode handles its own fields separately); no handles in the config (TextNode manages its own dynamic handles)
>
> [paste your BaseNode.jsx so the AI can see the expected shape]

**Done when:** `nodeConfigs.js` exports an object with four keys, each matching the shape `BaseNode.jsx` expects.

---

### Step 7 — Migrate existing node files to use BaseNode

**What to do:**  
Rewrite `inputNode.js`, `outputNode.js`, and `llmNode.js` so each is just a thin wrapper that imports `BaseNode` and passes the matching config. Delete all the old duplicated JSX.

**Files to edit:**  
- `/frontend/src/nodes/inputNode.js`
- `/frontend/src/nodes/outputNode.js`
- `/frontend/src/nodes/llmNode.js`

**Prompt to give AI:**

> Rewrite `inputNode.js` so it is a thin wrapper around `BaseNode`. It should import `BaseNode` and the `customInput` config from `nodeConfigs.js` and export a component that calls `<BaseNode nodeConfig={customInput} {...props} />`. Show me the full rewritten file.
>
> [paste inputNode.js and BaseNode.jsx]

*Repeat this prompt for `outputNode.js` and `llmNode.js`.*

**Done when:** All three node types still render on the canvas and look identical to before.

---

### Step 8 — Add 5 new node types

**What to do:**  
Add five new config entries to `nodeConfigs.js` and create a one-line component file for each. No new JSX logic — just a config object and a wrapper component.

**New nodes to add:**

| Node name | Fields | Input handles | Output handles |
|---|---|---|---|
| `httpRequest` | `method` (select: GET, POST, PUT, DELETE), `url` (text) | `body` | `response`, `statusCode` |
| `jsonParser` | `jsonPath` (text) | `json` | `value` |
| `conditionalRouter` | `condition` (text) | `value` | `truePort`, `falsePort` |
| `promptTemplate` | `template` (textarea) | `variables` | `prompt` |
| `outputFormatter` | `format` (select: JSON, Markdown, Plain Text) | `data` | `formatted` |

**Files to edit/create:**  
- `/frontend/src/nodes/nodeConfigs.js` (add 5 entries)
- `/frontend/src/nodes/httpRequestNode.js` (new — thin wrapper)
- `/frontend/src/nodes/jsonParserNode.js` (new — thin wrapper)
- `/frontend/src/nodes/conditionalRouterNode.js` (new — thin wrapper)
- `/frontend/src/nodes/promptTemplateNode.js` (new — thin wrapper)
- `/frontend/src/nodes/outputFormatterNode.js` (new — thin wrapper)

**Prompt to give AI:**

> Add 5 new config entries to my `nodeConfigs.js` file for these node types: `httpRequest`, `jsonParser`, `conditionalRouter`, `promptTemplate`, `outputFormatter`. Use the table below for their fields and handles. Then show me one example thin-wrapper component file (e.g. `httpRequestNode.js`) following the same pattern as my existing migrated nodes.
>
> [paste nodeConfigs.js and inputNode.js as the pattern reference]

**Done when:** All 5 new nodes appear in the toolbar and can be dragged onto the canvas.

---

### Step 9 — Register all node types in `App.js`

**What to do:**  
React Flow requires a `nodeTypes` object mapping type strings to components. Add all 9 types to this map and pass it to `<ReactFlow nodeTypes={nodeTypes} />`.

**Files to edit:**  
- `/frontend/src/App.js`
- `/frontend/src/nodes/nodeTypes.js` (create if it doesn't exist)

**Prompt to give AI:**

> Write a `nodeTypes.js` file that imports all 9 of my node components and exports a `nodeTypes` object in the format React Flow expects: `{ customInput: InputNode, llm: LLMNode, ... }`. Then show me how to pass `nodeTypes` to the `<ReactFlow>` component in `App.js`.
>
> [paste your current App.js]

**Done when:** No "node type not found" warnings appear in the browser console.

---

## Phase 3 — Text Node Dynamic Logic (Part 3)

*Text node keeps its own file because it has custom behavior not covered by BaseNode.*

---

### Step 10 — Auto-resize the textarea

**What to do:**  
When the user types in the Text node, the textarea height should grow to fit the content, and the node width should expand based on the longest line.

**Files to edit:**  
- `/frontend/src/nodes/textNode.js` (rename to `TextNode.jsx` if needed)

**Prompt to give AI:**

> Update my `TextNode.jsx` to auto-resize based on user input:
>
> 1. Use a `ref` on the textarea. In a `useEffect` that runs when the text changes, reset `height` to `'auto'` then set it to `scrollHeight + 'px'`
> 2. Calculate node width: split text on `\n`, find the longest line's character count, multiply by 8, clamp to min 200px. Store in `useState` and apply as `style={{ width }}` on the outer wrapper div
> 3. The textarea must have `className="nodrag"` so typing doesn't trigger node drag
>
> [paste your current textNode.js]

**Done when:** Typing in the Text node makes it grow taller and wider in real time.

---

### Step 11 — Extract `{{variable}}` names and render dynamic Handles

**What to do:**  
As the user types, scan the text for `{{varName}}` patterns. For each unique valid JS identifier found, render a Handle on the left side of the node labeled with the variable name. Remove handles whose variable was deleted.

**Files to edit:**  
- `/frontend/src/nodes/TextNode.jsx`

**Prompt to give AI:**

> Add dynamic Handle generation to my `TextNode.jsx`:
>
> 1. After every text change, run this extraction: find all `{{varName}}` occurrences where `varName` matches `/^[a-zA-Z_$][a-zA-Z0-9_$]*$/`, deduplicate them, and store in a `useState` array called `variables`
> 2. Render one `<Handle type="target" position={Position.Left} id={\`var-\${name}\`} />` per variable, positioned evenly down the left side. Add a small text label next to each handle showing the variable name
> 3. Keep the existing `system` input handle (if any) below the variable handles
> 4. Also keep the auto-resize logic from the previous step intact
>
> [paste your current TextNode.jsx with the auto-resize already added]

**Done when:** Typing `Hello {{name}}, your score is {{score}}` creates two labeled handles on the left side of the node.

---

## Phase 4 — Styling (Part 2)

*Style after logic is working — visual bugs are easier to spot on functional components.*

---

### Step 12 — Style `BaseNode` — card, header, fields

**What to do:**  
Give every node a clean white card appearance with a colored top bar, readable field labels, and subtle handle indicators. Styles should apply consistently to all node types without per-type CSS.

**Files to edit:**  
- `/frontend/src/nodes/BaseNode.jsx`
- `/frontend/src/index.css` (global overrides for React Flow elements)

**Prompt to give AI:**

> Style my `BaseNode.jsx` component so it looks like a clean UI card:
>
> - Outer wrapper: white background, `1px solid #e2e8f0` border, `8px` border-radius, min-width `200px`, `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`
> - Title bar: uses `nodeConfig.color` as background, white bold text, `12px 16px` padding, `8px 8px 0 0` border-radius (top corners only)
> - Fields area: `12px 16px` padding, `gap: 10px` between fields
> - Field labels: `11px`, `#64748b` color, `font-weight: 500`, uppercase letter-spacing
> - Text inputs and selects: `100%` width, `32px` height, `6px` border-radius, `#e2e8f0` border, `13px` font size
> - Handle dots: `8px` diameter, border `2px solid white`, input handles use `#60a5fa`, output handles use `#34d399`
>
> Use inline styles or a CSS module — no external library needed. Show the full updated `BaseNode.jsx`.

**Done when:** All nodes look visually consistent with clear labels, proper spacing, and visible handle dots.

---

### Step 13 — Style the canvas, toolbar, and edges

**What to do:**  
The canvas should have a dot-grid background. The toolbar should be a floating left-side panel. Edges should use smoothstep curves and highlight when selected.

**Files to edit:**  
- `/frontend/src/App.js`
- `/frontend/src/toolbar.js`
- `/frontend/src/index.css`

**Prompt to give AI:**

> Style the React Flow canvas and surrounding UI:
>
> 1. **Canvas background**: Use the React Flow `<Background variant="dots" gap={16} size={1} color="#cbd5e1" />` component
> 2. **Controls and minimap**: Add `<Controls />` and `<MiniMap />` with neutral styling
> 3. **Toolbar**: Make it a fixed left-side panel (`position: fixed; left: 16px; top: 50%; transform: translateY(-50%)`) with a white card background, rounded corners, and vertical list of draggable node chips. Each chip shows the node type name and is draggable via `onDragStart`
> 4. **Edges**: Set `defaultEdgeOptions={{ type: 'smoothstep', animated: false, style: { stroke: '#94a3b8', strokeWidth: 2 } }}` on `<ReactFlow>`. Selected edges should be `stroke: #6366f1`
> 5. **Submit button**: Fixed bottom-right, indigo background, white text, `48px` height, `12px 24px` padding, `8px` border-radius
>
> [paste your current App.js and toolbar.js]

**Done when:** The canvas looks polished — dot grid, floating toolbar on the left, clean edges, and a prominent submit button.

---

## Phase 5 — Backend Integration (Part 4)

*The frontend and backend are independent until this phase. You can work on this in parallel with Phase 4.*

---

### Step 14 — Add Pydantic models to the backend

**What to do:**  
Define the request and response shapes FastAPI will validate. This locks the contract between frontend and backend before writing any logic.

**Files to edit:**  
- `/backend/main.py`

**Prompt to give AI:**

> Add Pydantic models to my FastAPI `main.py` for the pipeline parse endpoint:
>
> - `NodeModel`: fields `id: str`, `type: str`, `data: dict`
> - `EdgeModel`: fields `id: str`, `source: str`, `target: str`, `sourceHandle: Optional[str]`, `targetHandle: Optional[str]`
> - `PipelineRequest`: fields `nodes: List[NodeModel]`, `edges: List[EdgeModel]`
> - `PipelineResponse`: fields `num_nodes: int`, `num_edges: int`, `is_dag: bool`
>
> Show the complete updated `main.py` with all imports.
>
> [paste your current main.py]

**Done when:** The `/docs` Swagger UI shows the `/pipelines/parse` endpoint with the correct request schema.

---

### Step 15 — Implement the DAG cycle detection function

**What to do:**  
Write a pure Python function `is_dag(nodes, edges)` that builds a directed graph and uses depth-first search to detect cycles. No external libraries required.

**Files to edit:**  
- `/backend/main.py`

**Prompt to give AI:**

> Write a Python function `is_dag(nodes: list, edges: list) -> bool` that:
>
> 1. Builds an adjacency list from `edges` (each edge has `.source` and `.target` attributes)
> 2. Uses DFS with a `visited` set and a `rec_stack` set (recursion stack) to detect back edges (cycles)
> 3. Returns `True` if no cycle is found (the graph is a DAG), `False` if any cycle exists
> 4. Handles these edge cases correctly:
>    - Isolated nodes (no edges) → still a DAG
>    - Self-loops (edge where source == target) → NOT a DAG
>    - Disconnected subgraphs → check all components
>    - Edges that reference node IDs not in the nodes list → skip those edges safely
>
> Show only the function, with no external dependencies.

**Done when:** You can call `is_dag(nodes=[], edges=[])` and get `True`. Manual test: three nodes A→B→C→A returns `False`.

---

### Step 16 — Wire up the `/pipelines/parse` endpoint

**What to do:**  
Connect the Pydantic models and the DAG function into a single endpoint that counts nodes and edges and returns the result.

**Files to edit:**  
- `/backend/main.py`

**Prompt to give AI:**

> Write the complete `/pipelines/parse` POST endpoint for FastAPI using my existing Pydantic models and `is_dag` function. It should:
>
> 1. Accept a `PipelineRequest` body
> 2. Compute `num_nodes = len(pipeline.nodes)`
> 3. Compute `num_edges = len(pipeline.edges)`
> 4. Call `is_dag(pipeline.nodes, pipeline.edges)`
> 5. Return a `PipelineResponse`
>
> Show the full updated `main.py` with CORS, models, the is_dag function, and the endpoint all together.
>
> [paste your current main.py]

**Done when:** Posting this JSON to `http://localhost:8000/pipelines/parse` via Swagger UI returns `{"num_nodes": 2, "num_edges": 1, "is_dag": true}`:

```json
{
  "nodes": [{"id": "1", "type": "customInput", "data": {}}, {"id": "2", "type": "customOutput", "data": {}}],
  "edges": [{"id": "e1", "source": "1", "target": "2", "sourceHandle": null, "targetHandle": null}]
}
```

---

### Step 17 — Update `submit.js` to POST and show the alert

**What to do:**  
Read the current pipeline state from the Zustand store, POST it to the backend, parse the JSON response, and show a readable `window.alert` to the user.

**Files to edit:**  
- `/frontend/src/submit.js`

**Prompt to give AI:**

> Write the complete `submit.js` file for my pipeline builder. It should:
>
> 1. Export a `SubmitButton` React component
> 2. Read `nodes` and `edges` from the Zustand store using `useStore`
> 3. On button click, POST `{ nodes, edges }` as JSON to `http://localhost:8000/pipelines/parse`
> 4. On success, call `window.alert` with a message formatted like this:
>    ```
>    Pipeline Analysis
>    ─────────────────
>    Nodes:     3
>    Edges:     2
>    Valid DAG: Yes ✓
>    ```
>    If `is_dag` is false, show `No — contains a cycle ✗` instead
> 5. On any error (network failure, non-2xx status), show `window.alert('Submission failed: [error message]')`
> 6. While the request is in flight, disable the button and change its label to "Submitting…"
>
> [paste your current submit.js and your Zustand store file]

**Done when:** Clicking Submit on a valid pipeline shows the alert with correct counts. Clicking Submit on a pipeline with a cycle (A→B→C→A) shows `Valid DAG: No — contains a cycle ✗`.

---

## Phase 6 — Verification

*Test every part together before calling the implementation complete.*

---

### Step 18 — Test the node abstraction

**Checklist:**
- [ ] Drag each of the 9 node types onto the canvas — all render without errors
- [ ] Every node shows the correct fields (correct type: text input, select, slider, textarea)
- [ ] Every node shows the correct handles in the correct positions
- [ ] Changing a field value within a node works without the node being dragged away
- [ ] Connecting an output handle to an input handle draws an edge

**If handles don't connect:**

**Prompt to give AI:**

> My React Flow Handles render visually but dragging from one to another does not create an edge. What are the most common causes of this in React Flow and how do I debug each one?

---

### Step 19 — Test the Text node dynamic behavior

**Checklist:**
- [ ] Typing a short sentence: node stays at minimum width (~200px)
- [ ] Typing a very long line: node expands wider to fit
- [ ] Pressing Enter multiple times: node grows taller
- [ ] Typing `{{name}}`: one new input Handle appears on the left labeled `name`
- [ ] Typing `{{name}} and {{score}}`: two handles appear
- [ ] Deleting `{{score}}` from the text: the `score` handle disappears
- [ ] Handles from variables can be connected to other nodes' output handles

---

### Step 20 — Test the full submit loop

**Scenario A — Valid DAG:**
1. Drag an Input node, an LLM node, and an Output node onto the canvas
2. Connect: Input → LLM → Output
3. Click Submit
4. Expected alert: `Nodes: 3, Edges: 2, Valid DAG: Yes ✓`

**Scenario B — Cycle (not a DAG):**
1. Add three nodes and connect them A → B → C → A
2. Click Submit
3. Expected alert: `Nodes: 3, Edges: 3, Valid DAG: No — contains a cycle ✗`

**Scenario C — Empty canvas:**
1. Clear all nodes
2. Click Submit
3. Expected alert: `Nodes: 0, Edges: 0, Valid DAG: Yes ✓`

**If the backend returns wrong results:**

**Prompt to give AI:**

> My `/pipelines/parse` endpoint returns `is_dag: true` even when I submit a graph with a clear cycle (A→B, B→C, C→A). Here is my `is_dag` function and a sample payload that should return false. Find the bug.
>
> [paste your is_dag function and the JSON payload]

---

### Step 21 — Write backend tests

**What to do:**  
Write pytest tests for the three scenarios above so regressions are caught automatically.

**Files to create:**  
- `/backend/test_main.py`

**Prompt to give AI:**

> Write pytest tests for my FastAPI `/pipelines/parse` endpoint using `TestClient`. Cover these cases:
>
> 1. Three-node linear pipeline (A→B→C) → `is_dag: true`, `num_nodes: 3`, `num_edges: 2`
> 2. Three-node cycle (A→B→C→A) → `is_dag: false`
> 3. Single node, no edges → `is_dag: true`, `num_nodes: 1`, `num_edges: 0`
> 4. Empty pipeline → `is_dag: true`, `num_nodes: 0`, `num_edges: 0`
> 5. Node with a self-loop (edge where source == target) → `is_dag: false`
>
> [paste your current main.py]

**Done when:** `pytest` passes all 5 tests with `5 passed` output.

---

## Quick Reference — File Map

```
frontend/src/
├── App.js                         edited in Steps 9, 13
├── submit.js                      edited in Step 17
├── toolbar.js                     edited in Step 13
├── index.css                      edited in Steps 12, 13
└── nodes/
    ├── BaseNode.jsx               created in Step 5, styled in Step 12
    ├── nodeConfigs.js             created in Step 6, extended in Step 8
    ├── nodeTypes.js               created in Step 9
    ├── inputNode.js               migrated in Step 7
    ├── outputNode.js              migrated in Step 7
    ├── llmNode.js                 migrated in Step 7
    ├── TextNode.jsx               edited in Steps 10, 11
    ├── httpRequestNode.js         created in Step 8
    ├── jsonParserNode.js          created in Step 8
    ├── conditionalRouterNode.js   created in Step 8
    ├── promptTemplateNode.js      created in Step 8
    └── outputFormatterNode.js     created in Step 8

backend/
├── main.py                        edited in Steps 3, 14, 15, 16
└── test_main.py                   created in Step 21
```

---

## Common Errors and Fixes

| Symptom | Most likely cause | Prompt to ask AI |
|---|---|---|
| Handles render but won't connect | `nodeTypes` not passed to `<ReactFlow>` | "Why won't my React Flow Handles connect when I drag between them?" |
| Node drags when I try to type | Missing `className="nodrag"` on inputs | "How do I prevent a React Flow node from being dragged when the user types in a text field?" |
| CORS error on fetch | CORS middleware missing or wrong origin | "FastAPI is returning a CORS error when called from localhost:3000. Here is my main.py" |
| `is_dag` always returns true | Adjacency list built from wrong key | "My DFS cycle detection returns True even for A→B→C→A. Here is my is_dag function." |
| Alert doesn't appear | `fetch` response not awaited correctly | "My fetch to FastAPI succeeds (200 status) but window.alert never fires. Here is my submit.js" |
| `{{var}}` handle doesn't update | `useEffect` missing `currText` in deps | "My TextNode variable handles don't update when I type. The useEffect runs but variables state doesn't change." |
| New node type shows blank | Not added to `nodeTypes` map | "I added a new node config but the node renders blank on the canvas." |

---

*Implementation plan version 1.0 — covers all four assessment parts.*

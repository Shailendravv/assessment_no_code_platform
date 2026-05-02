# Design Document: Pipeline Builder UI

## Overview

This design covers four coordinated enhancements to the existing React/ReactFlow pipeline builder:

1. **Base Node Abstraction** — a `BaseNode` component that all node types extend, eliminating duplicated layout/handle/style code.
2. **Unified Styling** — a single shared style source (CSS variables + a JS theme object) applied consistently across every component.
3. **Smart Text Node** — `<textarea>`-based dynamic resizing and automatic `Variable_Handle` generation from `{{ variableName }}` syntax.
4. **Backend Submission** — wiring the Submit button to `POST /pipelines/parse` with loading state, result display, and empty-canvas guard.

The application is a Create React App project (React 18, ReactFlow 11, Zustand). No new runtime dependencies are required; the existing stack is sufficient for all four areas.

---

## Architecture

The current architecture is flat: each node file is self-contained with its own inline styles and handle declarations. After this change the architecture becomes layered:

```
App
├── PipelineToolbar          ← reads theme tokens
│   └── DraggableNode        ← reads theme tokens
├── PipelineUI               ← ReactFlow canvas
│   └── nodeTypes registry   ← all nodes via BaseNode
│       ├── InputNode
│       ├── OutputNode
│       ├── LLMNode
│       ├── TextNode          ← adds dynamic resize + variable handles
│       └── MathNode          ← fifth node type (new)
└── SubmitButton             ← calls backend, shows result
    └── useStore (nodes, edges)
```

### Data flow

```
Zustand store (nodes, edges)
        │
        ▼
  PipelineUI ──onConnect/onNodesChange/onEdgesChange──▶ store
        │
        ▼
  SubmitButton ──POST /pipelines/parse──▶ Backend API
                                               │
                                               ▼
                                        ValidationResult
                                               │
                                               ▼
                                        ResultBanner (UI)
```

### Key design decisions

- **CSS variables for theming** — a single `:root` block in `index.css` defines all palette tokens. A companion `src/styles/theme.js` re-exports the same values as a JS object for use in inline styles and ReactFlow prop overrides. This satisfies Requirement 2.6 without introducing a CSS-in-JS library.
- **`BaseNode` as a pure presentational wrapper** — it accepts `handles`, `label`, `style` overrides, and `children`. It does not touch Zustand. Node-specific logic (state, callbacks) lives in each concrete node component.
- **`useVariableHandles` custom hook** — isolates the regex parsing and deduplication logic for Text Node variable handles, making it independently testable.
- **`useAutoResize` custom hook** — isolates the textarea dimension calculation logic.

---

## Components and Interfaces

### `src/styles/theme.js`

```js
export const theme = {
  colors: {
    bg:        'var(--color-bg)',
    surface:   'var(--color-surface)',
    border:    'var(--color-border)',
    accent:    'var(--color-accent)',
    accentHover: 'var(--color-accent-hover)',
    textPrimary: 'var(--color-text-primary)',
    textMuted:   'var(--color-text-muted)',
    selected:    'var(--color-selected)',
  },
  radii: { node: '8px', button: '6px' },
  font:  { family: 'Inter, system-ui, sans-serif', sizeBase: '13px' },
};
```

CSS variables are declared in `src/index.css`:

```css
:root {
  --color-bg:           #0f1117;
  --color-surface:      #1c2536;
  --color-border:       #2e3a50;
  --color-accent:       #4f8ef7;
  --color-accent-hover: #3a7ae0;
  --color-text-primary: #e8eaf0;
  --color-text-muted:   #8892a4;
  --color-selected:     #4f8ef7;
}
```

---

### `src/nodes/BaseNode.js`

```js
/**
 * BaseNode — shared shell for all pipeline node types.
 *
 * Props:
 *   id        {string}   — ReactFlow node id (passed through automatically)
 *   label     {string}   — displayed in the header
 *   handles   {HandleDescriptor[]}  — see type below
 *   style     {object}   — optional style overrides for the outer container
 *   selected  {boolean}  — injected by ReactFlow; drives selected state styling
 *   children  {ReactNode} — node-specific body content
 */

/**
 * HandleDescriptor:
 * {
 *   id:       string,           // e.g. `${nodeId}-system`
 *   type:     'source'|'target',
 *   position: Position,         // ReactFlow Position enum
 *   style?:   object,           // optional inline style overrides
 * }
 */
```

`BaseNode` renders:

```
┌─────────────────────────────┐
│  [●] Label            [type]│  ← header
├─────────────────────────────┤
│  {children}                 │  ← body
└─────────────────────────────┘
   ↑ handles rendered via ReactFlow <Handle> components
```

The outer `<div>` receives a `data-selected` attribute when `selected === true`, enabling CSS-variable-driven selected styling without JS style merging.

---

### `src/nodes/InputNode.js` (refactored)

Renders a `BaseNode` with:
- `label="Input"`
- `handles={[{ id: `${id}-value`, type: 'source', position: Position.Right }]}`
- Body: name text input + type select (unchanged logic)

---

### `src/nodes/OutputNode.js` (refactored)

Renders a `BaseNode` with:
- `label="Output"`
- `handles={[{ id: `${id}-value`, type: 'target', position: Position.Left }]}`
- Body: name text input + type select (unchanged logic)

---

### `src/nodes/LLMNode.js` (refactored)

Renders a `BaseNode` with:
- `label="LLM"`
- `handles` array: two left-side targets (`system` at 33%, `prompt` at 67%) + one right-side source (`response`)
- Body: descriptive text (unchanged)

---

### `src/nodes/TextNode.js` (refactored + enhanced)

Uses two custom hooks:

```js
const { width, height, textareaRef } = useAutoResize(currText, { minWidth: 200, minHeight: 80 });
const variableHandles = useVariableHandles(id, currText);
```

Renders a `BaseNode` with:
- `label="Text"`
- `handles={[...variableHandles, { id: `${id}-output`, type: 'source', position: Position.Right }]}`
- Body: `<textarea>` bound to `currText`
- The `BaseNode` outer container receives `style={{ width, height }}` so handles stay aligned

---

### `src/nodes/MathNode.js` (new — fifth node type)

A simple expression node that accepts two numeric inputs and outputs a result.

- `label="Math"`
- `handles`: two left-side targets (`a`, `b`) + one right-side source (`result`)
- Body: operator select (`+`, `-`, `×`, `÷`)

---

### `src/hooks/useAutoResize.js`

```js
/**
 * useAutoResize(text, { minWidth, minHeight })
 *
 * Returns { width, height, textareaRef }.
 *
 * Strategy: a hidden <div> (the "mirror") with identical font/padding
 * settings is kept in sync with the textarea content. Its scrollWidth
 * and scrollHeight drive the node dimensions, clamped to the minimums.
 */
```

The mirror div approach avoids the `scrollHeight` reset problem that occurs when shrinking a textarea by setting `height: 0` first.

---

### `src/hooks/useVariableHandles.js`

```js
/**
 * useVariableHandles(nodeId, text)
 *
 * Parses `text` for {{ variableName }} patterns where variableName
 * is a valid JS identifier. Returns a deduplicated, evenly-spaced
 * array of HandleDescriptor objects for use in BaseNode's `handles` prop.
 *
 * Valid JS identifier regex: /^[A-Za-z_$][A-Za-z0-9_$]*$/
 * Extraction regex:          /\{\{\s*([^}]+?)\s*\}\}/g
 */
```

Spacing calculation: given `n` variable handles, handle `i` (0-indexed) is placed at `top: ((i + 1) / (n + 1)) * 100 + '%'`.

---

### `src/submit.js` (refactored)

```js
/**
 * SubmitButton reads nodes and edges from Zustand.
 * On click:
 *   1. Guard: if nodes.length === 0, show warning, return.
 *   2. Set loading = true, disable button.
 *   3. POST to REACT_APP_BACKEND_URL + '/pipelines/parse'
 *      with body { nodes: serializedNodes, edges: serializedEdges }.
 *   4a. On success: set result state, clear error.
 *   4b. On error: set error state, clear result.
 *   5. Set loading = false.
 */
```

The component renders:
- The submit button (accent-colored, disabled + spinner while loading)
- A `ResultBanner` sub-component that shows success info or error message below the button

---

### `src/toolbar.js` (restyled)

No logic changes. Applies theme tokens to the toolbar container and passes them down to `DraggableNode`. Adds a fifth tile for `MathNode`.

---

## Data Models

### HandleDescriptor

```ts
interface HandleDescriptor {
  id:        string;          // unique within the node, e.g. "llm-1-system"
  type:      'source' | 'target';
  position:  Position;        // ReactFlow Position enum
  style?:    React.CSSProperties;
}
```

### PipelinePayload (sent to backend)

```ts
interface PipelinePayload {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
}

interface SerializedNode {
  id:   string;
  type: string;
  data: Record<string, unknown>;
}

interface SerializedEdge {
  id:           string;
  source:       string;
  target:       string;
  sourceHandle: string | null;
  targetHandle: string | null;
}
```

### ValidationResult (received from backend)

```ts
interface ValidationResult {
  num_nodes: number;
  num_edges: number;
  is_dag:    boolean;
}
```

### SubmitState (local component state)

```ts
interface SubmitState {
  loading: boolean;
  result:  ValidationResult | null;
  error:   string | null;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property reflection notes:**
- Requirements 1.2 and 1.6 both concern handle rendering fidelity in `BaseNode`; they are combined into Property 1.
- Requirements 4.1 and 4.2 both concern valid-identifier handle creation and deduplication; they are combined into Property 2 (a single comprehensive property is stronger than two separate ones).
- Requirements 3.1 and 3.2 both concern the minimum-dimension clamp in `useAutoResize`; they are combined into Property 6.

---

### Property 1: BaseNode renders exactly the declared handles

*For any* array of `HandleDescriptor` objects passed to `BaseNode`, the rendered output SHALL contain exactly one ReactFlow `Handle` element per descriptor — no more, no fewer — with each handle's `id`, `type`, and `position` matching the corresponding descriptor.

**Validates: Requirements 1.2, 1.6**

---

### Property 2: Variable handles — one per unique valid identifier

*For any* text string, `useVariableHandles` SHALL return exactly one handle for each unique valid JavaScript identifier found inside `{{ }}` patterns, regardless of how many times that identifier appears in the text.

**Validates: Requirements 4.1, 4.2**

---

### Property 3: Invalid identifiers produce no handles

*For any* string inside `{{ }}` that is not a valid JavaScript identifier (contains spaces, starts with a digit, is empty, or contains special characters), `useVariableHandles` SHALL not include a handle for that string in its output.

**Validates: Requirements 4.5**

---

### Property 4: Variable handle removal on deletion

*For any* text string, if all occurrences of a `{{ variableName }}` pattern are removed so that zero occurrences remain, `useVariableHandles` SHALL not include a handle for that variable name in its output.

**Validates: Requirements 4.3**

---

### Property 5: Source handle always present

*For any* text content in the `TextNode`, the full handles array SHALL always contain exactly one source handle on the right side (with id `${nodeId}-output`), regardless of how many variable handles are present.

**Validates: Requirements 4.6**

---

### Property 6: Auto-resize respects minimum dimensions

*For any* text content (including the empty string and arbitrarily long strings), `useAutoResize` SHALL return `width >= 200` and `height >= 80`.

**Validates: Requirements 3.1, 3.2**

---

### Property 7: Payload serialization preserves all required fields

*For any* array of nodes and edges, serializing them into a `PipelinePayload` SHALL produce an object where every node entry contains `id`, `type`, and `data` fields equal to the originals, and every edge entry contains `id`, `source`, `target`, `sourceHandle`, and `targetHandle` fields equal to the originals.

**Validates: Requirements 5.2**

---

### Property 8: Variable handles are evenly spaced

*For any* set of N distinct valid JavaScript identifiers extracted from the text, the `top` style of handle at index `i` (0-indexed) SHALL equal `((i + 1) / (N + 1)) * 100%`, distributing all handles evenly along the left side of the node.

**Validates: Requirements 4.4**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Empty canvas on submit | Show inline warning; do not send request |
| Network error (fetch throws) | Catch in try/catch; display "Network error — please try again" |
| HTTP 4xx from backend | Parse response body if JSON; display `error` field or generic "Bad request" |
| HTTP 5xx from backend | Display "Server error — please try again later" |
| Invalid `{{ }}` content | Silently ignored; no handle created, no error shown to user |
| `BaseNode` receives empty `handles` array | Renders no handles; node is still functional |

Loading state is tracked with a boolean flag in `SubmitButton` local state. The flag is set to `false` in a `finally` block to ensure it clears on both success and error paths.

---

## Testing Strategy

### Unit tests (Jest + React Testing Library)

Existing test infrastructure (`@testing-library/react`, `@testing-library/jest-dom`) is already present in `package.json`.

Focus areas:
- `useVariableHandles`: specific examples (valid identifier, invalid identifier, duplicate, removal, empty string, mixed valid/invalid)
- `useAutoResize`: minimum dimension clamping with empty and short strings
- `BaseNode`: renders correct number of handles for a given descriptor array
- `SubmitButton`: empty-canvas guard, loading state, success display, error display (mock `fetch`)
- `PipelinePayload` serialization: correct field mapping from store nodes/edges

### Property-based tests (fast-check)

The project uses Create React App / Jest. [fast-check](https://github.com/dubzzz/fast-check) integrates directly with Jest and requires no configuration changes.

Install: `npm install --save-dev fast-check`

Each property test runs a minimum of **100 iterations**.

Tag format: `// Feature: pipeline-builder-ui, Property {N}: {property_text}`

| Property | Test file | Arbitraries |
|---|---|---|
| P1 — BaseNode renders exactly declared handles | `src/nodes/BaseNode.test.js` | `fc.array(handleDescriptorArb)` |
| P2 — One handle per unique valid identifier | `src/hooks/useVariableHandles.test.js` | `fc.string()` with embedded `{{ id }}` patterns, repetition count |
| P3 — Invalid identifiers produce no handles | `src/hooks/useVariableHandles.test.js` | `fc.string()` with invalid identifier patterns |
| P4 — Variable handle removal | `src/hooks/useVariableHandles.test.js` | `fc.string()` with removable variable patterns |
| P5 — Source handle always present | `src/nodes/TextNode.test.js` | `fc.string()` |
| P6 — Auto-resize minimum dimensions | `src/hooks/useAutoResize.test.js` | `fc.string()` |
| P7 — Payload serialization preserves fields | `src/submit.test.js` | `fc.array(nodeArb)`, `fc.array(edgeArb)` |
| P8 — Variable handles evenly spaced | `src/hooks/useVariableHandles.test.js` | `fc.array(validIdentifierArb, { minLength: 1 })` |

### Integration tests

- Submit flow: mount `SubmitButton` with a populated store, mock `fetch`, verify POST body shape and result display.
- Empty canvas guard: mount with empty store, click submit, verify no fetch call and warning visible.

### Manual / visual checks

- Unified styling: visual review across all node types, toolbar, and canvas in both light and dark OS themes.
- Text node resize: type multi-line content; verify node grows and handles stay aligned.
- Drag-and-drop: verify all five node types drop correctly onto the canvas.

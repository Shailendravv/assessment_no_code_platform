# Implementation Plan: Pipeline Builder UI

## Overview

Implement four coordinated enhancements to the existing React/ReactFlow pipeline builder: a shared `BaseNode` abstraction, unified CSS-variable-driven styling, a smart `TextNode` with dynamic resize and variable handles, and a wired `SubmitButton` that POSTs to the backend. Each task builds incrementally on the previous, ending with full integration.

## Tasks

- [x] 1. Install fast-check and set up shared style tokens
  - Run `npm install --save-dev fast-check` to add the property-based testing library
  - Add CSS variable declarations to `src/index.css` under a `:root` block (bg, surface, border, accent, accent-hover, text-primary, text-muted, selected)
  - Create `src/styles/theme.js` that re-exports the same values as a JS object (`theme.colors`, `theme.radii`, `theme.font`)
  - _Requirements: 2.6_

- [x] 2. Implement `BaseNode` component
  - [x] 2.1 Create `src/nodes/BaseNode.js`
    - Accept `id`, `label`, `handles` (array of `HandleDescriptor`), `style`, `selected`, and `children` props
    - Render a header div with the label and a body div with children
    - Map over `handles` and render a ReactFlow `<Handle>` for each descriptor using its `id`, `type`, `position`, and optional `style`
    - Apply theme tokens from `src/styles/theme.js` for border, background, border-radius, and font
    - Set `data-selected` attribute on the outer container when `selected === true` and add a CSS rule in `index.css` for the selected highlight
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 2.4_

  - [x] 2.2 Write property test for BaseNode handle rendering
    - **Property 1: BaseNode renders exactly the declared handles**
    - **Validates: Requirements 1.2, 1.6**
    - In `src/nodes/BaseNode.test.js`, use `fc.array(handleDescriptorArb)` to generate random handle descriptor arrays and assert the rendered output contains exactly one `Handle` per descriptor with matching `id`, `type`, and `position`

  - [x] 2.3 Write unit tests for BaseNode
    - Test header renders the correct label
    - Test children are rendered in the body area
    - Test selected state sets `data-selected` attribute
    - Test empty `handles` array renders no handles
    - _Requirements: 1.1, 1.3_

- [x] 3. Refactor existing node types to use `BaseNode`
  - [x] 3.1 Refactor `src/nodes/inputNode.js`
    - Replace the raw `<div>` shell with `<BaseNode label="Input" handles={[...]} ...>`
    - Pass `[{ id: \`${id}-value\`, type: 'source', position: Position.Right }]` as handles
    - Keep existing name input and type select as children
    - _Requirements: 1.3, 1.6, 2.1_

  - [x] 3.2 Refactor `src/nodes/outputNode.js`
    - Replace the raw `<div>` shell with `<BaseNode label="Output" handles={[...]} ...>`
    - Pass `[{ id: \`${id}-value\`, type: 'target', position: Position.Left }]` as handles
    - Keep existing name input and type select as children
    - _Requirements: 1.3, 1.6, 2.1_

  - [x] 3.3 Refactor `src/nodes/llmNode.js`
    - Replace the raw `<div>` shell with `<BaseNode label="LLM" handles={[...]} ...>`
    - Pass three handles: `system` target at 33%, `prompt` target at 67% (both left), `response` source (right)
    - Keep existing body text as children
    - _Requirements: 1.3, 1.6, 2.1_

  - [x] 3.4 Refactor `src/nodes/textNode.js` (shell only — hooks added in Task 5)
    - Replace the raw `<div>` shell with `<BaseNode label="Text" handles={[...]} ...>`
    - Pass the existing source handle `{ id: \`${id}-output\`, type: 'source', position: Position.Right }` as handles
    - Replace the `<input type="text">` with a `<textarea>` element bound to `currText`
    - _Requirements: 1.3, 1.6, 2.1, 3.3_

- [x] 4. Create `MathNode` and register all five node types
  - [x] 4.1 Create `src/nodes/MathNode.js`
    - Use `BaseNode` with `label="Math"`
    - Handles: two left-side targets (`${id}-a`, `${id}-b`) and one right-side source (`${id}-result`)
    - Body: a `<select>` for operator (`+`, `-`, `×`, `÷`) stored in local state
    - _Requirements: 1.4, 1.5_

  - [x] 4.2 Register `MathNode` in `src/ui.js` and add tile to `src/toolbar.js`
    - Add `math: MathNode` to the `nodeTypes` object in `ui.js`
    - Add `<DraggableNode type='math' label='Math' />` to `PipelineToolbar` in `toolbar.js`
    - _Requirements: 1.4, 1.5_

  - [x] 4.3 Write unit tests for MathNode
    - Test that the correct handles are rendered (two targets, one source)
    - Test operator select renders all four options
    - _Requirements: 1.4, 1.5_

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Apply unified styling to toolbar, canvas, and submit button
  - [x] 6.1 Restyle `src/draggableNode.js`
    - Replace hardcoded inline style values with `theme` token references
    - Add hover/active CSS class in `index.css` using CSS variables for the distinct hover state
    - _Requirements: 2.1, 2.2_

  - [x] 6.2 Restyle `src/toolbar.js`
    - Apply theme tokens to the toolbar container background and spacing
    - _Requirements: 2.1, 2.2_

  - [x] 6.3 Restyle `src/ui.js` (canvas)
    - Pass `style` prop to `<ReactFlow>` using theme surface color for the canvas background
    - Pass `style` overrides to `<Controls>` and `<MiniMap>` using theme tokens
    - _Requirements: 2.1, 2.3_

  - [x] 6.4 Restyle `src/submit.js`
    - Apply accent color, hover state, and disabled state styles to the submit button using theme tokens
    - _Requirements: 2.1, 2.5_

- [x] 7. Implement `useAutoResize` hook
  - [x] 7.1 Create `src/hooks/useAutoResize.js`
    - Accept `text` and `{ minWidth, minHeight }` options
    - Use a hidden mirror `<div>` with identical font/padding to measure content dimensions
    - Return `{ width, height, textareaRef }` where `width >= minWidth` and `height >= minHeight`
    - _Requirements: 3.1, 3.2_

  - [x] 7.2 Write property test for useAutoResize minimum dimensions
    - **Property 6: Auto-resize respects minimum dimensions**
    - **Validates: Requirements 3.1, 3.2**
    - In `src/hooks/useAutoResize.test.js`, use `fc.string()` to generate arbitrary text and assert `width >= 200` and `height >= 80` for all inputs

  - [x] 7.3 Write unit tests for useAutoResize
    - Test empty string returns minimum dimensions
    - Test very long string returns dimensions larger than minimums
    - _Requirements: 3.1, 3.2_

- [x] 8. Implement `useVariableHandles` hook
  - [x] 8.1 Create `src/hooks/useVariableHandles.js`
    - Accept `nodeId` and `text` parameters
    - Extract all `{{ variableName }}` patterns using regex `/\{\{\s*([^}]+?)\s*\}\}/g`
    - Filter to valid JS identifiers using `/^[A-Za-z_$][A-Za-z0-9_$]*$/`
    - Deduplicate variable names
    - Compute evenly-spaced `top` style: `((i + 1) / (n + 1)) * 100 + '%'` for handle at index `i` of `n` total
    - Return array of `HandleDescriptor` objects with `type: 'target'`, `position: Position.Left`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 8.2 Write property test for unique valid identifier handles
    - **Property 2: Variable handles — one per unique valid identifier**
    - **Validates: Requirements 4.1, 4.2**
    - In `src/hooks/useVariableHandles.test.js`, use `fc.string()` with embedded `{{ id }}` patterns and repetition count; assert output length equals number of unique valid identifiers

  - [x] 8.3 Write property test for invalid identifier filtering
    - **Property 3: Invalid identifiers produce no handles**
    - **Validates: Requirements 4.5**
    - Use `fc.string()` with invalid identifier patterns inside `{{ }}`; assert no handle is returned for those strings

  - [x] 8.4 Write property test for variable handle removal
    - **Property 4: Variable handle removal on deletion**
    - **Validates: Requirements 4.3**
    - Use `fc.string()` with removable variable patterns; assert that after removing all occurrences of a variable, no handle for that variable name is present

  - [x] 8.5 Write property test for evenly-spaced handles
    - **Property 8: Variable handles are evenly spaced**
    - **Validates: Requirements 4.4**
    - Use `fc.array(validIdentifierArb, { minLength: 1 })`; assert handle at index `i` has `top` equal to `((i + 1) / (n + 1)) * 100 + '%'`

  - [x] 8.6 Write unit tests for useVariableHandles
    - Test single valid identifier creates one handle
    - Test duplicate identifier creates exactly one handle
    - Test invalid identifier (starts with digit, contains space, empty) creates no handle
    - Test mixed valid and invalid identifiers in same text
    - _Requirements: 4.1, 4.2, 4.5_

- [x] 9. Wire `useAutoResize` and `useVariableHandles` into `TextNode`
  - [x] 9.1 Update `src/nodes/textNode.js` to use both hooks
    - Call `useAutoResize(currText, { minWidth: 200, minHeight: 80 })` and apply `{ width, height }` to the `BaseNode` style prop
    - Attach `textareaRef` to the `<textarea>` element
    - Call `useVariableHandles(id, currText)` and merge the result with the static source handle into the `handles` prop
    - _Requirements: 3.1, 3.2, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 9.2 Write property test for source handle always present
    - **Property 5: Source handle always present**
    - **Validates: Requirements 4.6**
    - In `src/nodes/TextNode.test.js`, use `fc.string()` as text content; assert the rendered handles always include exactly one source handle with id `${nodeId}-output` on the right side

  - [x] 9.3 Write unit tests for TextNode
    - Test textarea is rendered (not an input)
    - Test variable handle appears when `{{ varName }}` is typed
    - Test variable handle disappears when variable is removed
    - Test source handle is always present
    - _Requirements: 3.3, 4.1, 4.3, 4.6_

- [x] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement `SubmitButton` with backend integration
  - [x] 11.1 Refactor `src/submit.js` with Zustand store connection and submission logic
    - Read `nodes` and `edges` from Zustand store using `useStore`
    - Implement empty-canvas guard: if `nodes.length === 0`, display a warning message and return without fetching
    - Serialize nodes to `{ id, type, data }` and edges to `{ id, source, target, sourceHandle, targetHandle }`
    - POST to `process.env.REACT_APP_BACKEND_URL + '/pipelines/parse'` with `Content-Type: application/json`
    - Manage `loading`, `result`, and `error` local state; set `loading = false` in a `finally` block
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

  - [x] 11.2 Add `ResultBanner` sub-component in `src/submit.js`
    - On success: display `num_nodes`, `num_edges`, and `is_dag` from the `ValidationResult`
    - On HTTP 4xx: parse response body if JSON and display `error` field, otherwise display "Bad request"
    - On HTTP 5xx: display "Server error — please try again later"
    - On network error (fetch throws): display "Network error — please try again"
    - _Requirements: 5.3, 5.4_

  - [x] 11.3 Write property test for payload serialization
    - **Property 7: Payload serialization preserves all required fields**
    - **Validates: Requirements 5.2**
    - In `src/submit.test.js`, use `fc.array(nodeArb)` and `fc.array(edgeArb)`; assert every serialized node has `id`, `type`, `data` equal to originals and every serialized edge has `id`, `source`, `target`, `sourceHandle`, `targetHandle` equal to originals

  - [x] 11.4 Write unit tests for SubmitButton
    - Test empty-canvas guard: no fetch call and warning visible when nodes is empty
    - Test loading state: button is disabled and shows spinner while request is in-flight (mock fetch with delayed response)
    - Test success display: `num_nodes`, `num_edges`, `is_dag` shown after successful response
    - Test error display: error message shown on 4xx and 5xx responses
    - Test network error display: "Network error" message shown when fetch throws
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` (installed in Task 1) and run with Jest — no extra configuration needed in CRA
- Checkpoints at Tasks 5, 10, and 12 ensure incremental validation before moving to the next area
- The `REACT_APP_BACKEND_URL` environment variable must be set in `.env` for backend submission to work

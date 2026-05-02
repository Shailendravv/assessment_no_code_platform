# Requirements Document

## Introduction

This feature enhances the existing React/ReactFlow pipeline builder application across four areas:

1. **Node Abstraction** — a shared base component that eliminates duplicated boilerplate across node files, accelerates creation of new node types, and enables consistent styling from a single location.
2. **Unified Styling** — a cohesive visual design applied to all pipeline components (toolbar, canvas, nodes, submit button) using a consistent color palette, typography, and spacing system.
3. **Smart Text Node** — dynamic resizing of the Text node as the user types, plus automatic Handle generation for variables declared with `{{ variableName }}` syntax.
4. **Backend Integration** — wiring the Submit button to the existing backend API so the pipeline graph can be submitted and validated, with results surfaced to the user.

The application is a Create React App project using ReactFlow 11, Zustand for state, and currently has four node types: Input, Output, LLM, and Text.

---

## Glossary

- **Pipeline_Builder**: The overall React application that lets users construct directed acyclic graphs (DAGs) of processing nodes.
- **Node**: A single unit of computation or data in the pipeline graph, rendered as a ReactFlow custom node component.
- **Base_Node**: The shared abstraction component that wraps common node structure (header, body, handles) and is extended by all concrete node types.
- **Node_Registry**: The mapping object (`nodeTypes`) passed to ReactFlow that associates type strings with React components.
- **Text_Node**: The node type that holds a free-form text value and supports `{{ variable }}` syntax.
- **Variable_Handle**: A ReactFlow `Handle` of type `target` on the left side of the Text_Node, auto-generated for each valid variable extracted from the text content.
- **Variable**: A JavaScript-identifier-compliant name enclosed in double curly braces (e.g., `{{ myVar }}`).
- **Toolbar**: The `PipelineToolbar` component that displays draggable node tiles the user can drop onto the canvas.
- **Canvas**: The ReactFlow viewport rendered by `PipelineUI` where nodes and edges are displayed and manipulated.
- **Submit_Button**: The `SubmitButton` component that triggers pipeline submission to the backend.
- **Backend_API**: The HTTP server (already implemented) that accepts a pipeline payload and returns a validation result.
- **Pipeline_Payload**: A JSON object containing the list of nodes and edges representing the current graph state.
- **Validation_Result**: The JSON response from the Backend_API indicating whether the pipeline is valid and any associated messages.

---

## Requirements

### Requirement 1: Base Node Abstraction

**User Story:** As a frontend developer, I want a shared base node component, so that I can create new node types quickly without duplicating layout, handle, and styling code.

#### Acceptance Criteria

1. THE `Base_Node` SHALL render a consistent node shell containing a header area (displaying the node type label) and a body area (displaying node-specific content passed as children).
2. THE `Base_Node` SHALL accept a `handles` prop — an array of handle descriptor objects — and render each as a ReactFlow `Handle` with the specified `type`, `position`, `id`, and optional `style` overrides.
3. THE `Base_Node` SHALL apply a unified visual style (border, background, border-radius, font) sourced from a shared style definition, so that changing the shared definition updates all node types simultaneously.
4. WHEN a new node type is created using `Base_Node`, THE `Pipeline_Builder` SHALL register it in the `Node_Registry` and make it available for drag-and-drop from the `Toolbar` without modifying any other existing node files.
5. THE `Pipeline_Builder` SHALL include at least five distinct node types (including the four existing ones) all built on top of `Base_Node`.
6. FOR ALL node types built on `Base_Node`, the rendered output SHALL contain the same header structure and handle layout contract defined by `Base_Node`, confirming the abstraction is consistently applied.

---

### Requirement 2: Unified Styling

**User Story:** As a user, I want the pipeline builder to have a polished, cohesive visual design, so that the application feels professional and is pleasant to use.

#### Acceptance Criteria

1. THE `Pipeline_Builder` SHALL apply a consistent color palette (background, surface, accent, text) across the `Toolbar`, `Canvas`, all `Node` types, and the `Submit_Button`.
2. THE `Toolbar` SHALL display node tiles with a uniform size, spacing, icon or label treatment, and hover/active state that is visually distinct from the resting state.
3. THE `Canvas` SHALL use a styled background (e.g., dot or grid pattern) and the ReactFlow `Controls` and `MiniMap` components SHALL be styled to match the overall palette.
4. WHEN a `Node` is selected on the `Canvas`, THE `Node` SHALL display a visually distinct selected state (e.g., highlighted border or shadow) consistent across all node types.
5. THE `Submit_Button` SHALL be styled with the application's accent color, a hover state, and a disabled state that is visually distinct from the active state.
6. THE `Pipeline_Builder` SHALL use a single shared style source (CSS variables, a theme object, or a design-token file) so that palette changes propagate to all components without per-component edits.

---

### Requirement 3: Text Node Dynamic Resize

**User Story:** As a user, I want the Text node to grow as I type, so that I can see my full text without scrolling inside a fixed-size box.

#### Acceptance Criteria

1. WHEN the user types in the Text_Node textarea, THE `Text_Node` SHALL increase its width and height to fit the current text content without clipping or requiring internal scroll.
2. WHEN the user deletes text in the Text_Node textarea, THE `Text_Node` SHALL decrease its width and height to fit the reduced content, subject to a defined minimum width of 200px and minimum height of 80px.
3. THE `Text_Node` SHALL use a `<textarea>` element (not a single-line `<input>`) to allow multi-line text entry.
4. WHEN the Text_Node resizes, THE `Pipeline_Builder` SHALL keep all existing `Handle` positions correctly aligned relative to the node boundaries.

---

### Requirement 4: Text Node Variable Handles

**User Story:** As a user, I want to define input variables in my text using `{{ variableName }}` syntax, so that I can connect other nodes to those variables as data sources.

#### Acceptance Criteria

1. WHEN the user types `{{ variableName }}` in the Text_Node textarea where `variableName` is a valid JavaScript identifier, THE `Text_Node` SHALL create a `Variable_Handle` of type `target` on the left side of the node labeled with `variableName`.
2. WHEN the same variable name appears multiple times in the text content, THE `Text_Node` SHALL render exactly one `Variable_Handle` for that variable name (deduplication).
3. WHEN a variable is removed from the text content (no remaining `{{ variableName }}` occurrences), THE `Text_Node` SHALL remove the corresponding `Variable_Handle`.
4. WHEN multiple variables are defined in the text content, THE `Text_Node` SHALL space the `Variable_Handle` elements evenly along the left side of the node.
5. IF a string inside `{{ }}` is not a valid JavaScript identifier (e.g., contains spaces, starts with a digit, or is empty), THEN THE `Text_Node` SHALL NOT create a `Variable_Handle` for that string.
6. THE `Text_Node` SHALL continue to render its existing source `Handle` on the right side regardless of the number of variable handles present.

---

### Requirement 5: Backend Pipeline Submission

**User Story:** As a user, I want to submit my pipeline to the backend for validation, so that I can know whether my pipeline is correctly structured before running it.

#### Acceptance Criteria

1. WHEN the user clicks the `Submit_Button`, THE `Pipeline_Builder` SHALL collect the current nodes and edges from the Zustand store and send them to the Backend_API as a `Pipeline_Payload` via an HTTP POST request.
2. THE `Pipeline_Payload` SHALL be a JSON object with the shape `{ "nodes": [...], "edges": [...] }` where each node includes its `id`, `type`, and `data` fields, and each edge includes its `id`, `source`, `target`, `sourceHandle`, and `targetHandle` fields.
3. WHEN the Backend_API returns a successful Validation_Result, THE `Pipeline_Builder` SHALL display the result (number of nodes, number of edges, and whether the graph is a DAG) to the user in a visible UI element.
4. IF the Backend_API returns an error response (HTTP 4xx or 5xx), THEN THE `Pipeline_Builder` SHALL display a human-readable error message to the user.
5. WHILE a submission request is in-flight, THE `Submit_Button` SHALL display a loading indicator and SHALL be disabled to prevent duplicate submissions.
6. IF the `Canvas` contains no nodes, THEN THE `Pipeline_Builder` SHALL display a warning to the user and SHALL NOT send a request to the Backend_API.

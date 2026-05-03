# VectorShift Pipeline Builder

A professional, node-based pipeline builder built with **React** and **React Flow**. This application allows users to design complex workflows by dragging and dropping various node types, connecting them, and analyzing the resulting graph structure for validity (DAG detection).

The project is initialized with **Create React App (CRA)** and utilizes a modern tech stack focused on performance, accessibility, and developer experience.

---

## Features

- **Dynamic Node System**: Config-driven architecture using a `BaseNode` component for easy extension.
- **Interactive Canvas**: Powered by React Flow with support for zooming, panning, and edge animations.
- **Smart Text Nodes**: Real-time auto-resizing textareas and dynamic input handle generation based on `{{variable}}` syntax.
- **Global State Management**: Centralized store using Zustand for efficient updates across the canvas and toolbar.
- **Graph Analysis**: Integration with a FastAPI backend to calculate node/edge counts and detect cycles (DAG verification).
- **Modern UI/UX**: Premium glassmorphism design elements, Tailwind CSS styling, and Radix UI components for accessible interactive elements.

---

## Project Structure

```bash
src/
├── nodes/               # Node components and configurations
│   ├── BaseNode.jsx     # Reusable base component for all nodes
│   ├── TextNode.jsx     # Specialized node with dynamic logic
│   ├── nodeConfigs.js   # Configuration objects for node types
│   └── nodeTypes.js     # React Flow node registration
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and helper functions
├── ui/                  # Reusable UI components (Radix UI wrappers)
├── styles/              # Global styles and Tailwind configurations
├── App.js               # Main application entry point and canvas setup
├── store.js             # Zustand state management
├── toolbar.js           # Draggable node sidebar
├── submit.js            # Pipeline submission and analysis logic
└── index.js             # React DOM rendering
```

### Folder Responsibilities

- **`nodes/`**: Contains the logic for different functional blocks of the pipeline. `BaseNode.jsx` handles standard inputs/outputs, while `TextNode.jsx` manages specialized dynamic behavior.
- **`store.js`**: Manages the state of all nodes and edges on the canvas, providing actions to add, move, and connect elements.
- **`ui/`**: Houses design-system components like Selects and Sliders, ensuring consistent styling across the platform.
- **`submit.js`**: Handles the communication with the backend, sending the current graph state for validation.

---

## Prerequisites

- **Node.js**: `v16.x` or higher
- **npm**: `v8.x` or higher (or Yarn equivalent)

---

## Installation and Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Shailendravv/assessment_no_code_platform.git
   cd assessment_no_code_platform/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory if you need to point to a specific backend URL:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

4. **Start the Development Server**
   ```bash
   npm start
   ```

---

## Running the Application

| Command | Description |
| :--- | :--- |
| `npm start` | Runs the app in development mode at `http://localhost:3000`. |
| `npm run build` | Bundles the app for production in the `build` folder. |
| `npm test` | Launches the test runner in interactive watch mode. |
| `npm run eject` | **Note: One-way operation.** Removes the build tool and copies configuration files. |

---

## Environment Variables

| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `REACT_APP_BACKEND_URL` | Base URL for the FastAPI backend service | `http://localhost:8000` |

---

## Architecture Overview

- **Entry Point**: `App.js` initializes the React Flow provider and renders the `PipelineCanvas`.
- **Routing**: This is a single-page application (SPA) focused on the workspace interface.
- **State Management**: Zustand is used to store `nodes` and `edges`. It provides a flat state structure that is easily accessible by both the canvas and the submission logic.
- **Component Hierarchy**:
  - `App` → `Layout` → `Toolbar` & `ReactFlowCanvas`
  - `ReactFlowCanvas` → `CustomNodes` (managed by `nodeTypes.js`)
- **API Layer**: `submit.js` uses the Fetch API to send the pipeline JSON to the `/pipelines/parse` endpoint.

---

## Styling

The project uses a hybrid styling approach:
- **Tailwind CSS**: For utility-first styling of layout and standard components.
- **Vanilla CSS**: Global overrides for React Flow internal classes (`.react-flow__handle`, `.react-flow__node`) are located in `src/index.css`.
- **Glassmorphism**: Custom styles in `src/nodes/BaseNode.jsx` provide a modern, premium feel with subtle shadows and borders.

---

## Testing

Tests are written using **Jest** and **React Testing Library**.
- **Unit Tests**: Found alongside components (e.g., `submit.test.js`).
- **Execution**: Run `npm test` to execute all tests.

---

## Production Build

To create a production-ready bundle:
```bash
npm run build
```
The optimized files will be generated in the `build/` directory, ready to be deployed to platforms like Vercel, Netlify, or AWS S3.

---

## Tech Stack

- **React 18**: Core UI library.
- **React Flow**: Node-based UI framework.
- **Zustand**: Lightweight state management.
- **Tailwind CSS**: Modern styling.
- **Radix UI**: Accessible UI primitives.
- **Lucide React**: Iconography.
- **Fast-Check**: Property-based testing for graph logic.

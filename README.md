
# Pipeline Editor - Visual DAG Builder

A modern React + TypeScript web application for building and managing Directed Acyclic Graphs (DAGs) visually. Perfect for designing data pipelines, workflow orchestration, and process modeling.

## 🚀 Features

### Core Functionality
- **Visual Node Creation**: Click anywhere on the canvas to add nodes with custom names
- **Drag & Connect**: Create directional edges by dragging between node connection points
- **Smart Validation**: Real-time DAG validation with cycle detection and connectivity checks
- **Delete Support**: Select nodes/edges and press Delete key to remove them
- **Auto Layout**: Automatic top-down node arrangement using the Dagre algorithm

### DAG Validation Rules
- ✅ Minimum 2 nodes required
- ✅ No cycles allowed (maintains DAG property)
- ✅ No self-loops permitted
- ✅ All nodes must be connected (weakly connected graph)
- ✅ Real-time validation feedback

### User Experience
- **JSON Viewer**: Live preview of DAG structure in JSON format
- **Statistics Panel**: Node/edge count and validation status
- **Toast Notifications**: User-friendly feedback for all actions
- **Keyboard Shortcuts**: Delete key for removing selected elements
- **Responsive Design**: Works on desktop and tablet devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Canvas**: React Flow ([@xyflow/react](https://reactflow.dev/))
- **Layout**: Dagre for automatic graph layout
- **Styling**: Tailwind CSS + shadcn/ui components
- **Notifications**: Sonner for toast messages
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Vercel-ready

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser with ES6+ support

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pipeline-editor
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:8080`

### Building for Production
```bash
npm run build
```

## 📖 Usage Guide

### Creating Your First DAG

1. **Add Nodes**: Click anywhere on the canvas and enter a node name
2. **Connect Nodes**: Drag from the edge of one node to another to create connections
3. **Validate**: Check the sidebar for real-time validation status
4. **Layout**: Use "Auto Layout" button to organize nodes automatically
5. **Export**: Copy or download the JSON representation

### Keyboard Shortcuts
- `Delete` / `Backspace`: Remove selected nodes and edges
- `Ctrl/Cmd + Click`: Multi-select nodes and edges

### Validation Rules Explained

The editor enforces strict DAG properties:

- **Acyclic**: No circular dependencies allowed
- **Directed**: All connections have a clear source → target direction
- **Connected**: All nodes must be reachable from each other
- **Minimum Size**: At least 2 nodes required for meaningful graphs

## 🏗️ Architecture

### Project Structure
```
src/
├── components/
│   ├── Canvas.tsx          # Main React Flow canvas
│   ├── Sidebar.tsx         # Control panel and validation
│   └── JSONPreview.tsx     # JSON structure viewer
├── utils/
│   ├── validateDAG.ts      # DAG validation logic
│   └── graphHelpers.ts     # Graph manipulation utilities
├── App.tsx                 # Main application component
└── pages/Index.tsx         # Route handler
```

### Key Components

**Canvas Component**
- React Flow integration
- Node/edge management
- User interaction handling
- Real-time validation feedback

**Validation System**
- Cycle detection using DFS
- Connectivity analysis
- Real-time feedback
- Error message generation

**Graph Utilities**
- Node creation and positioning
- Auto-layout with Dagre
- JSON serialization
- Connection validation

## 🧪 Testing the Application

### Test Scenarios

1. **Basic DAG Creation**
   - Add 3+ nodes
   - Connect them in a linear chain
   - Verify validation shows "Valid DAG"

2. **Cycle Detection**
   - Create nodes A → B → C
   - Try to connect C → A
   - Should prevent connection and show error

3. **Auto Layout**
   - Create a complex graph
   - Click "Auto Layout"
   - Nodes should arrange in hierarchical order

4. **JSON Export**
   - Build any valid DAG
   - Check JSON preview updates in real-time
   - Use copy/download functions

## 🚢 Deployment

### Vercel Deployment
---

**Built with ❤️ using React, TypeScript, and React Flow**

[Demo](https://pipeline-visualizer-app.vercel.app/) | [Source Code](https://github.com/AryanKadam1134/pipeline-visualizer-app.git)

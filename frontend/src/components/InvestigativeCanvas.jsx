import React, { useState, useEffect, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  useReactFlow,
  ReactFlowProvider 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PolaroidNode from './PolaroidNode';

const nodeTypes = { polaroid: PolaroidNode };

void function CanvasCore() { return null; }; 

function CanvasBoard({ caseList, selectedCaseId, setSelectedCaseId, nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange }) {
  const { fitView } = useReactFlow();
  const [searchTerm, setSearchTerm] = useState(''); // NEW: Search state

  useEffect(() => {
    if (nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.3, duration: 400 });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [nodes, fitView]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, style: { stroke: '#dc2626', strokeWidth: 3 } }, eds)),
    [setEdges]
  );

  // NEW: Filter logic for the sidebar
  const filteredCases = caseList.filter(c =>
    c.case_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.location && c.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex w-full h-screen bg-[#1c1917]">
      
      {/* CASE SELECTOR SIDEBAR (Now with Search!) */}
      <div className="w-80 h-full bg-[#0c0a09] border-r border-[#292524] flex flex-col z-20">
        <div className="p-4 border-b border-[#292524] bg-[#141210]">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#ef4444] font-mono">Case Files Index</h2>
          <p className="text-xs text-[#a8a29e] mt-1 mb-3">Select from {caseList.length} parsed profiles</p>
          
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search name or location..."
            className="w-full p-2 bg-[#1c1917] text-[#e7e5e4] border border-[#44403c] rounded text-xs focus:outline-none focus:border-[#ef4444] transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-[#0c0a09]">
          {filteredCases.map((c) => (
            <button
              key={c.case_id}
              onClick={() => setSelectedCaseId(c.case_id)}
              className={`w-full text-left p-3 rounded text-xs transition-all duration-150 border block ${
                selectedCaseId === c.case_id
                  ? 'bg-[#451a03] border-[#b45309] text-[#f59e0b] font-bold'
                  : 'bg-[#141210] border-transparent text-[#d6d3d1] hover:bg-[#292524] hover:text-[#fafaf9]'
              }`}
            >
              <div className="truncate font-serif text-sm block">{c.case_title}</div>
              <div className="text-[10px] text-[#a8a29e] mt-0.5 truncate font-mono block">{c.location}</div>
            </button>
          ))}
          {filteredCases.length === 0 && (
            <div className="p-4 text-center text-xs text-[#78716c] italic">No cases match your search.</div>
          )}
        </div>
      </div>

      {/* CORE GRAPH VISUALIZATION FRAME */}
      <div className="flex-1 h-full relative bg-[#1c1917]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="#44403c" gap={30} size={2} />
          <Controls className="bg-[#141210] border border-[#292524] text-white fill-white rounded shadow-2xl" />
        </ReactFlow>

        <div className="absolute top-4 left-4 bg-[#0c0a09]/90 p-4 border border-[#292524] rounded shadow-2xl pointer-events-none z-10">
          <h1 className="text-md font-bold uppercase tracking-wider text-[#fafaf9] font-mono">OSINT Investigation Engine</h1>
          <p className="text-xs text-[#22c55e] font-mono mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block animate-pulse" /> 
            Live Pipeline Connection Stabilized
          </p>
        </div>
      </div>

    </div>
  );
}

export default function InvestigativeCanvas() {
  const [caseList, setCaseList] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/cases')
      .then((res) => res.json())
      .then((data) => {
        setCaseList(data);
        if (data.length > 0) {
          setSelectedCaseId(data[0].case_id);
        }
      })
      .catch((err) => console.error("Error connecting to FastAPI registry:", err));
  }, []);

  useEffect(() => {
    if (!selectedCaseId) return;

    fetch(`http://127.0.0.1:8000/api/graph/${selectedCaseId}`)
      .then((res) => res.json())
      .then((data) => {
        setNodes(data.nodes);
        setEdges(data.edges);
      })
      .catch((err) => console.error("Error streaming graph:", err));
  }, [selectedCaseId, setNodes, setEdges]);

  return (
    <ReactFlowProvider>
      <CanvasBoard 
        caseList={caseList}
        selectedCaseId={selectedCaseId}
        setSelectedCaseId={setSelectedCaseId}
        nodes={nodes}
        setNodes={setNodes}
        onNodesChange={onNodesChange}
        edges={edges}
        setEdges={setEdges}
        onEdgesChange={onEdgesChange}
      />
    </ReactFlowProvider>
  );
}
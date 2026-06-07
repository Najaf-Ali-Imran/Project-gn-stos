import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import DetectiveBoardNode from './DetectiveBoardNode';
import RedStringEdge from './RedStringEdge';
import MagnifyingGlass from './MagnifyingGlass';
import DeskLamp from './DeskLamp';
import CaseFileDrawer from './CaseFileDrawer';

/* ── Custom types ─────────────────────────────────────────── */
const nodeTypes = { polaroid: DetectiveBoardNode };
const edgeTypes = { redstring: RedStringEdge };

let stickyCounter = 1000;

/* ════════════════════════════════════════════════════════════
   DRAGGABLE STICKY NOTE (plain DOM, not React Flow node)
   ════════════════════════════════════════════════════════════ */
function StickyNoteOverlay({ note, onRemove }) {
  const noteRef = useRef(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: note.x, y: note.y });
  const [text, setText] = useState('New Note');
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef(null);

  const onMouseDown = useCallback((e) => {
    if (editing) return;
    if (e.target.closest('.sticky-remove-btn')) return;
    isDragging.current = true;
    const rect = noteRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  }, [editing]);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const board = document.getElementById('board-container');
      if (!board) return;
      const br = board.getBoundingClientRect();
      setPos({
        x: e.clientX - br.left - offset.current.x,
        y: e.clientY - br.top - offset.current.y,
      });
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleDoubleClick = () => {
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 10);
  };

  const pinColors = ['red', 'blue', 'silver', 'gold', 'green'];
  const pinColor = pinColors[note.id % pinColors.length];

  return (
    <div
      ref={noteRef}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: 160,
        minHeight: 150,
        background: 'linear-gradient(135deg, #fef08a 0%, #eab308 100%)',
        boxShadow: '3px 6px 12px rgba(0,0,0,0.45), 6px 18px 28px rgba(0,0,0,0.35)',
        cursor: editing ? 'text' : 'grab',
        userSelect: 'none',
        transform: `rotate(${note.rotation}deg)`,
        zIndex: 80,
        padding: '28px 10px 12px 10px',
        borderBottom: '4px solid rgba(0,0,0,0.2)',
        borderRight: '4px solid rgba(0,0,0,0.15)',
      }}
    >
      {/* Pin */}
      <div className={`pin ${pinColor}`} style={{ position: 'absolute', top: 10, left: '50%' }} />

      {/* Remove X */}
      <button
        className="sticky-remove-btn"
        onClick={onRemove}
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          background: 'none',
          border: 'none',
          color: 'rgba(0,0,0,0.3)',
          fontSize: 14,
          cursor: 'pointer',
          lineHeight: 1,
          padding: '2px 4px',
          borderRadius: 2,
          fontFamily: 'monospace',
          zIndex: 2,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(180,0,0,0.7)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.3)'; }}
        title="Remove note"
      >
        ✕
      </button>

      {/* Text content */}
      {editing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setEditing(false)}
          style={{
            width: '100%',
            minHeight: 100,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: "'Permanent Marker', cursive",
            fontSize: 15,
            color: '#1c1917',
            lineHeight: 1.35,
            cursor: 'text',
          }}
        />
      ) : (
        <p
          style={{
            fontFamily: "'Permanent Marker', cursive",
            fontSize: 15,
            color: '#1c1917',
            lineHeight: 1.35,
            margin: 0,
            minHeight: 80,
            wordBreak: 'break-word',
          }}
          title="Double-click to edit"
        >
          {text || <span style={{ color: 'rgba(0,0,0,0.3)', fontStyle: 'italic' }}>Tap to write...</span>}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DRAGGABLE FOUNTAIN PEN
   ════════════════════════════════════════════════════════════ */
function FountainPen({ boardRef }) {
  // Default: in the cup (bottom-left area)
  const [pos, setPos] = useState({ x: 28, y: null });
  const penRef = useRef(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const [inCup, setInCup] = useState(true);

  // Set default y based on board height
  useEffect(() => {
    if (boardRef.current && pos.y === null) {
      const h = boardRef.current.getBoundingClientRect().height;
      setPos({ x: 28, y: h - 180 });
    }
  }, [boardRef, pos.y]);

  const CUP_ZONE = { x: 0, y_from_bottom: 90, w: 90, h: 90 };

  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    const rect = penRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setInCup(false);
    e.preventDefault();
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current || !boardRef.current) return;
      const br = boardRef.current.getBoundingClientRect();
      const newX = e.clientX - br.left - offset.current.x;
      const newY = e.clientY - br.top - offset.current.y;
      setPos({ x: newX, y: newY });
    };
    const onUp = () => {
      if (!isDragging.current || !boardRef.current) return;
      isDragging.current = false;
      const br = boardRef.current.getBoundingClientRect();
      // Snap back into cup if dropped near bottom-left
      if (pos.x < CUP_ZONE.w && pos.y > br.height - CUP_ZONE.y_from_bottom - CUP_ZONE.h) {
        setPos({ x: 28, y: br.height - 180 });
        setInCup(true);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [boardRef, pos]);

  if (pos.y === null) return null;

  return (
    <div
      ref={penRef}
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: 30,
        height: 150,
        cursor: 'grab',
        zIndex: inCup ? 44 : 90,
        transform: inCup ? 'rotate(10deg)' : 'rotate(45deg)',
        transition: inCup ? 'transform 0.3s ease' : 'none',
        filter: 'drop-shadow(3px 3px 5px rgba(0,0,0,0.8))',
        userSelect: 'none',
      }}
      title="Drag the pen"
    >
      <svg viewBox="0 0 40 200" style={{ width: '100%', height: '100%' }}>
        <path d="M10 180 L30 180 L35 40 Q20 10 5 40 Z" fill="#1a1a1a" />
        <path d="M15 180 L25 180 L25 195 L20 200 L15 195 Z" fill="#444" />
        <rect fill="#d4af37" height="10" width="16" x="12" y="50" />
        <path d="M20 10 L20 30" stroke="#555" strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   STICKY PAD — drag to peel a note
   ════════════════════════════════════════════════════════════ */
function StickyPad({ onDropNote, boardRef }) {
  const isDragging = useRef(false);
  const [ghost, setGhost] = useState(null); // {x, y} for ghost preview

  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current || !boardRef.current) return;
      const br = boardRef.current.getBoundingClientRect();
      setGhost({
        x: e.clientX - br.left - 80,
        y: e.clientY - br.top - 75,
      });
    };
    const onUp = (e) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (ghost && boardRef.current) {
        onDropNote(ghost.x, ghost.y);
      }
      setGhost(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [boardRef, ghost, onDropNote]);

  return (
    <>
      {/* The pad itself */}
      <div
        onMouseDown={onMouseDown}
        className="sticky-pad"
        title="Drag to peel a sticky note"
        style={{ cursor: 'grab' }}
      >
        <span style={{
          fontFamily: "'Special Elite', monospace",
          color: 'rgba(0,0,0,0.4)',
          textTransform: 'uppercase',
          fontSize: 10,
          letterSpacing: '0.05em',
          pointerEvents: 'none',
        }}>
          Sticky Pad
        </span>
      </div>

      {/* Ghost note following cursor */}
      {ghost && (
        <div
          style={{
            position: 'fixed',
            left: ghost.x + (boardRef.current?.getBoundingClientRect().left || 0),
            top: ghost.y + (boardRef.current?.getBoundingClientRect().top || 0),
            width: 140,
            height: 130,
            background: 'linear-gradient(135deg, #fef08a 0%, #eab308 100%)',
            opacity: 0.75,
            pointerEvents: 'none',
            zIndex: 9999,
            transform: 'rotate(-3deg)',
            boxShadow: '3px 6px 16px rgba(0,0,0,0.4)',
            borderBottom: '3px solid rgba(0,0,0,0.18)',
          }}
        />
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   CANVAS BOARD INNER
   ════════════════════════════════════════════════════════════ */
function CanvasBoard({
  caseList,
  selectedCaseId,
  setSelectedCaseId,
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
  caseTitle,
  isLoading,
}) {
  const { fitView } = useReactFlow();
  const boardRef = useRef(null);
  const spotlightRef = useRef(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stickyNotes, setStickyNotes] = useState([]);

  // Auto-fit on node change
  useEffect(() => {
    if (nodes.length > 0) {
      const t = setTimeout(() => fitView({ padding: 0.25, duration: 500 }), 300);
      return () => clearTimeout(t);
    }
  }, [nodes, fitView]);

  // Red string connections via handle drag
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: 'redstring', data: { label: 'Connected' } },
          eds
        )
      ),
    [setEdges]
  );

  // Drop a sticky note onto the board
  const handleDropNote = useCallback((x, y) => {
    stickyCounter++;
    setStickyNotes((prev) => [
      ...prev,
      {
        id: stickyCounter,
        x,
        y,
        rotation: (Math.random() * 10 - 5).toFixed(1),
      },
    ]);
  }, []);

  const removeNote = useCallback((id) => {
    setStickyNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const minimapNodeColor = (node) => {
    const colors = {
      victim: '#f59e0b',
      suspect: '#ef4444',
      witness: '#facc15',
      evidence: '#22c55e',
      vehicle: '#64748b',
      location: '#8b5cf6',
      digital: '#3b82f6',
    };
    return colors[node.data?.type] || '#78716c';
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050201', position: 'relative' }}>

      {/* ══════════════════════════════════════════════════════
          FULL-SCREEN CORK BOARD
          ══════════════════════════════════════════════════════ */}
      <div
        ref={boardRef}
        id="board-container"
        className="cork-texture"
        style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
      >
        {/* SVG Cable layer */}
        <svg
          id="cable-layer"
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 55,
            filter: 'drop-shadow(2px 5px 3px rgba(0,0,0,0.6))',
          }}
        >
          <path
            id="lamp-cable-path"
            fill="none"
            stroke="#111"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Desk lamp */}
        <DeskLamp boardRef={boardRef} spotlightRef={spotlightRef} />

        {/* Spotlight overlay */}
        <div
          ref={spotlightRef}
          className="spotlight-overlay"
          style={{ position: 'absolute', inset: 0, zIndex: 40, pointerEvents: 'none' }}
        />

        {/* Case title watermark */}
        <header style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', padding: '16px 24px',
          zIndex: 30, pointerEvents: 'none',
          opacity: 0.4, mixBlendMode: 'overlay',
        }}>
          <h1
            id="case-title"
            className="case-header"
            style={{ fontSize: 'clamp(24px, 3.5vw, 50px)', color: '#000', textTransform: 'uppercase', margin: 0 }}
          >
            {caseTitle || 'CASE FILE: LOADING...'}
          </h1>
        </header>

        {/* Loading overlay */}
        {isLoading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 45,
            background: 'rgba(5,2,1,0.78)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 14,
            fontFamily: "'Courier Prime', monospace",
          }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 48, color: '#ef4444', display: 'block', animation: 'spin 1.2s linear infinite' }}
            >
              fingerprint
            </span>
            <p style={{ color: '#fadcd5', fontSize: 13, letterSpacing: '0.12em', margin: 0 }}>
              LOADING CASE FILE...
            </p>
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
          </div>
        )}

        {/* React Flow graph */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          minZoom={0.07}
          maxZoom={2.5}
          style={{ background: 'transparent', zIndex: 20, position: 'relative' }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(0,0,0,0.3)" gap={20} size={1.2} />
          <Controls style={{ bottom: 20, left: 16 }} />
          <MiniMap
            nodeColor={minimapNodeColor}
            maskColor="rgba(5,2,1,0.75)"
            style={{
              background: '#0c0a09',
              border: '1px solid #3d3026',
              borderRadius: 4,
              bottom: 20,
              right: 230,
            }}
          />
        </ReactFlow>

        {/* ── Sticky notes (plain DOM overlays) ────────── */}
        {stickyNotes.map((note) => (
          <StickyNoteOverlay
            key={note.id}
            note={note}
            onRemove={() => removeNote(note.id)}
          />
        ))}

        {/* ── Draggable Fountain Pen ────────────────────── */}
        <FountainPen boardRef={boardRef} />

        {/* ── Magnifying Glass ─────────────────────────── */}
        <MagnifyingGlass boardRef={boardRef} />

        {/* ── Pin Cup (bottom-left) ─────────────────────── */}
        <div
          id="pin-cup"
          className="pin-cup"
          title="Pin cup"
          style={{ cursor: 'default' }}
        >
          <div className="pin-cup-pins" />
        </div>

        {/* ── Sticky Note Pad (drag to peel) ───────────── */}
        <StickyPad onDropNote={handleDropNote} boardRef={boardRef} />

        {/* ══════════════════════════════════════════════
            CASE FOLDER — bottom-right, click to open drawer
            ══════════════════════════════════════════════ */}

        {/* Decorative stacked folders behind */}
        <div className="case-folder folder-stack-2" style={{ zIndex: 44 }} />
        <div className="case-folder folder-stack-1" style={{ zIndex: 44 }} />

        {/* Active / clickable top folder */}
        <div
          id="case-folder-btn"
          className="case-folder"
          onClick={() => setDrawerOpen(true)}
          title="Open Case Files"
          style={{ zIndex: 46, cursor: 'pointer' }}
        />

        {/* Small label above folders */}
        <div style={{
          position: 'absolute',
          bottom: 165,
          right: 20,
          fontFamily: "'Special Elite', monospace",
          fontSize: 9,
          color: 'rgba(255,255,220,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          pointerEvents: 'none',
          zIndex: 47,
          textAlign: 'center',
          width: 200,
        }}>
          ▲ Click to open files
        </div>
      </div>

      {/* ── Case File Drawer popup ────────────────────── */}
      {drawerOpen && (
        <CaseFileDrawer
          caseList={caseList}
          selectedCaseId={selectedCaseId}
          setSelectedCaseId={setSelectedCaseId}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ROOT WRAPPER — API state management
   ════════════════════════════════════════════════════════════ */
export default function DetectiveBoard() {
  const [caseList, setCaseList] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all cases
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    fetch(`${apiUrl}/api/cases`)
      .then((r) => r.json())
      .then((data) => {
        setCaseList(data);
        if (data.length > 0) setSelectedCaseId(data[0].case_id);
      })
      .catch((err) => console.error('Backend connection failed:', err));
  }, []);

  // Load graph for selected case
  useEffect(() => {
    if (!selectedCaseId) return;
    setIsLoading(true);
    const found = caseList.find((c) => c.case_id === selectedCaseId);
    if (found) setCaseTitle(found.case_title);

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    fetch(`${apiUrl}/api/graph/${selectedCaseId}`)
      .then((r) => r.json())
      .then((data) => {
        const remappedEdges = (data.edges || []).map((e) => ({
          ...e,
          type: 'redstring',
          animated: false,
          data: { label: e.label || e.data?.label || '' },
        }));
        setNodes(data.nodes || []);
        setEdges(remappedEdges);
      })
      .catch((err) => console.error('Graph fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [selectedCaseId, caseList, setNodes, setEdges]);

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
        caseTitle={caseTitle}
        isLoading={isLoading}
      />
    </ReactFlowProvider>
  );
}

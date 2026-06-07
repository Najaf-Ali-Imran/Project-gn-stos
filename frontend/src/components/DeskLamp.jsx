import React, { useRef, useState, useCallback, useEffect } from 'react';

/**
 * DeskLamp — draggable lamp with SVG cable + dynamic spotlight cone overlay.
 * Ported from code.html's lamp + spotlight logic.
 */
export default function DeskLamp({ boardRef, spotlightRef }) {
  const lampRef = useRef(null);
  const [lampPos, setLampPos] = useState({ x: null, y: null });
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  // Initial placement: center-top of board
  useEffect(() => {
    if (boardRef.current && lampPos.x === null) {
      const r = boardRef.current.getBoundingClientRect();
      setLampPos({ x: r.width / 2, y: -20 });
    }
  }, [boardRef, lampPos.x]);

  const updateSpotlight = useCallback((x, y) => {
    if (!boardRef.current || !spotlightRef?.current) return;
    const r = boardRef.current.getBoundingClientRect();
    const pctX = ((x) / r.width) * 100;
    const pctY = ((y + 60) / r.height) * 100;
    spotlightRef.current.style.background =
      `conic-gradient(from 150deg at ${pctX}% ${pctY}%, rgba(0,0,0,0.92) 0deg, rgba(255,255,230,0.22) 30deg, rgba(255,255,240,0.28) 60deg, rgba(0,0,0,0.9) 90deg, rgba(0,0,0,0.97) 360deg)`;
  }, [boardRef, spotlightRef]);

  const updateCable = useCallback((x, y) => {
    if (!boardRef.current) return;
    const r = boardRef.current.getBoundingClientRect();
    const startX = r.width / 2;
    const startY = 0;
    const dx = x - startX;
    const dy = y - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const sag = Math.max(50, dist * 0.3);
    const mx = (startX + x) / 2;
    const my = (startY + y) / 2 + sag;
    const cable = document.getElementById('lamp-cable-path');
    if (cable) {
      cable.setAttribute('d', `M ${startX} ${startY} Q ${mx} ${my} ${x} ${y + 10}`);
    }
  }, [boardRef]);

  const onMouseDown = useCallback((e) => {
    if (!lampRef.current) return;
    isDragging.current = true;
    const r = lampRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !boardRef.current) return;
    const containerRect = boardRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - offset.current.x + 60; // +60 = half lamp width
    const newY = e.clientY - containerRect.top - offset.current.y;
    setLampPos({ x: newX, y: newY });
    updateSpotlight(newX, newY);
    updateCable(newX, newY);
  }, [boardRef, updateSpotlight, updateCable]);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  useEffect(() => {
    if (lampPos.x !== null) {
      updateCable(lampPos.x, lampPos.y);
      updateSpotlight(lampPos.x, lampPos.y);
    }
  }, [lampPos, updateCable, updateSpotlight]);

  if (lampPos.x === null) return null;

  return (
    <div
      ref={lampRef}
      className="desk-lamp"
      onMouseDown={onMouseDown}
      style={{
        left: lampPos.x - 60, // compensate for lamp width
        top: lampPos.y,
        transform: 'none',
      }}
      title="Drag the lamp"
    />
  );
}

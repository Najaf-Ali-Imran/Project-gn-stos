import React, { useRef, useState, useCallback, useEffect } from 'react';

/**
 * MagnifyingGlass — draggable magnifying glass overlay.
 * Clones and scales the board content under the lens position.
 */
export default function MagnifyingGlass({ boardRef }) {
  const glassRef = useRef(null);
  const lensRef = useRef(null);
  const cloneRef = useRef(null);
  const [pos, setPos] = useState({ x: null, y: null }); // null = not mounted yet
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const SCALE = 1.65;
  const DIAMETER = 150;

  // Place glass at a sensible default once boardRef is available
  useEffect(() => {
    if (boardRef.current && pos.x === null) {
      const r = boardRef.current.getBoundingClientRect();
      setPos({ x: r.width * 0.78, y: r.height * 0.10 });
    }
  }, [boardRef, pos.x]);

  const updateClone = useCallback(() => {
    if (!boardRef.current || !glassRef.current || !cloneRef.current) return;

    const containerRect = boardRef.current.getBoundingClientRect();
    const glassRect = glassRef.current.getBoundingClientRect();

    const magCenterX = glassRect.left - containerRect.left + glassRect.width / 2;
    const magCenterY = glassRect.top - containerRect.top + glassRect.height / 2;

    const tx = -magCenterX * SCALE + DIAMETER / 2;
    const ty = -magCenterY * SCALE + DIAMETER / 2;

    // Clone the board content for magnification
    const boardEl = boardRef.current;
    cloneRef.current.innerHTML = '';

    // We only clone a snapshot element to avoid re-rendering React
    const clone = boardEl.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.width = boardEl.offsetWidth + 'px';
    clone.style.height = boardEl.offsetHeight + 'px';
    clone.style.transform = `translate(${tx}px, ${ty}px) scale(${SCALE})`;
    clone.style.transformOrigin = '0 0';
    clone.style.pointerEvents = 'none';
    clone.style.userSelect = 'none';
    // Remove interactive attributes from clone
    clone.querySelectorAll('[data-reactroot], script').forEach(el => el.remove());
    cloneRef.current.appendChild(clone);
  }, [boardRef, SCALE, DIAMETER]);

  const onMouseDown = useCallback((e) => {
    if (!glassRef.current || !boardRef.current) return;
    dragging.current = true;
    const r = glassRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    e.preventDefault();
  }, [boardRef]);

  const onMouseMove = useCallback((e) => {
    if (!dragging.current || !boardRef.current) return;
    const containerRect = boardRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - offset.current.x;
    const newY = e.clientY - containerRect.top - offset.current.y;
    setPos({ x: newX, y: newY });
    requestAnimationFrame(updateClone);
  }, [boardRef, updateClone]);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // Re-render clone whenever position changes
  useEffect(() => {
    if (pos.x !== null) {
      const t = setTimeout(updateClone, 50);
      return () => clearTimeout(t);
    }
  }, [pos, updateClone]);

  if (pos.x === null) return null;

  return (
    <div
      ref={glassRef}
      className="magnifying-glass"
      onMouseDown={onMouseDown}
      style={{
        left: pos.x,
        top: pos.y,
        width: DIAMETER,
        height: DIAMETER,
      }}
      title="Drag me to magnify"
    >
      {/* Wooden handle */}
      <div className="magnifying-glass-handle" />

      {/* Lens with cloned board content */}
      <div className="magnifying-glass-lens" ref={lensRef}>
        <div ref={cloneRef} className="magnifying-glass-clone-container" />
      </div>
    </div>
  );
}

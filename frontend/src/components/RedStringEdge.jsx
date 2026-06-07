import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';

/**
 * RedStringEdge — renders a sagging red yarn / string between two pins.
 * Uses a quadratic bezier with a sag offset to mimic physical string gravity.
 */
export default function RedStringEdge({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
}) {
  // Calculate sag
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const sag = Math.min(dist * 0.22, 60);

  const mx = (sourceX + targetX) / 2;
  const my = (sourceY + targetY) / 2 + sag;

  const pathD = `M ${sourceX} ${sourceY} Q ${mx} ${my} ${targetX} ${targetY}`;

  // Label midpoint along the bezier (approx t=0.5)
  const labelX = 0.25 * sourceX + 0.5 * mx + 0.25 * targetX;
  const labelY = 0.25 * sourceY + 0.5 * my + 0.25 * targetY;

  const strokeColor = selected ? '#ff4444' : (data?.color || '#b22222');
  const strokeWidth = selected ? 4 : 3;

  return (
    <>
      {/* Shadow path for depth */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(0,0,0,0.5)"
        strokeWidth={strokeWidth + 3}
        strokeLinecap="round"
        style={{ transform: 'translate(2px, 4px)', filter: 'blur(2px)' }}
      />
      {/* Main string */}
      <path
        id={id}
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray="8 2"
        strokeLinecap="round"
        opacity={0.92}
        style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' }}
      />

      {/* Relationship label as a tiny paper tag */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
            className="nodrag nopan"
          >
            <span
              className="string-label"
              style={{
                display: 'inline-block',
                transform: `rotate(${Math.atan2(dy, dx) * (180 / Math.PI) * 0.15}deg)`,
              }}
            >
              {data.label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

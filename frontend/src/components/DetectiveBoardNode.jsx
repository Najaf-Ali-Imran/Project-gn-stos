import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

/** Map node types to pin color, polaroid style, icon, and label */
const NODE_CONFIG = {
  victim: {
    pin: 'red',
    bg: '#f9f5ef',
    borderColor: '#c2a05d',
    accent: '#dc2626',
    label: 'VICTIM',
    labelColor: '#991b1b',
    icon: 'person_off',
    fontStyle: 'Courier Prime',
    tape: false,
  },
  suspect: {
    pin: 'red',
    bg: '#fef2f2',
    borderColor: '#dc2626',
    accent: '#dc2626',
    label: 'SUSPECT',
    labelColor: '#991b1b',
    icon: 'person_search',
    fontStyle: 'Courier Prime',
    tape: false,
  },
  witness: {
    pin: 'blue',
    bg: '#fefce8',
    borderColor: '#ca8a04',
    accent: '#b45309',
    label: 'WITNESS',
    labelColor: '#92400e',
    icon: 'visibility',
    fontStyle: 'Caveat',
    tape: true,
    stickyNote: true,
  },
  evidence: {
    pin: 'silver',
    bg: '#f5f5f0',
    borderColor: '#9ca3af',
    accent: '#16a34a',
    label: 'EVIDENCE',
    labelColor: '#166534',
    icon: 'search',
    fontStyle: 'Courier Prime',
    tape: true,
    newspaper: true,
  },
  vehicle: {
    pin: 'silver',
    bg: '#f1f5f9',
    borderColor: '#64748b',
    accent: '#475569',
    label: 'VEHICLE',
    labelColor: '#334155',
    icon: 'directions_car',
    fontStyle: 'Courier Prime',
    tape: false,
  },
  location: {
    pin: 'blue',
    bg: '#f5f3ff',
    borderColor: '#7c3aed',
    accent: '#7c3aed',
    label: 'LOCATION',
    labelColor: '#5b21b6',
    icon: 'location_on',
    fontStyle: 'Special Elite',
    tape: true,
  },
  digital: {
    pin: 'blue',
    bg: '#0f172a',
    borderColor: '#3b82f6',
    accent: '#3b82f6',
    label: 'DIGITAL',
    labelColor: '#60a5fa',
    icon: 'wifi_tethering',
    fontStyle: 'Courier Prime',
    tape: false,
    dark: true,
  },
};

const DEFAULT_CONFIG = {
  pin: 'silver',
  bg: '#fff',
  borderColor: '#d1d5db',
  accent: '#78716c',
  label: 'DETAILS',
  labelColor: '#44403c',
  icon: 'description',
  fontStyle: 'Courier Prime',
  tape: false,
};

export default function DetectiveBoardNode({ data, selected }) {
  const cfg = NODE_CONFIG[data.type] || DEFAULT_CONFIG;
  const isDark = !!cfg.dark;
  const textColor = isDark ? '#e2e8f0' : '#1c1917';
  const subTextColor = isDark ? '#94a3b8' : '#57534e';
  const [imgError, setImgError] = useState(false);

  const proxyUrl = data.imageUrl
    ? `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/image-proxy?url=${encodeURIComponent(data.imageUrl)}`
    : null;

  return (
    <div
      className="detective-node-card"
      style={{
        position: 'relative',
        background: cfg.bg,
        border: `2px solid ${selected ? cfg.accent : cfg.borderColor}`,
        padding: cfg.newspaper ? '0' : '10px 10px 34px 10px',
        width: cfg.stickyNote ? '160px' : '200px',
        minWidth: cfg.stickyNote ? '160px' : '200px',
        boxShadow: selected
          ? `0 0 0 2px ${cfg.accent}, 4px 12px 24px rgba(0,0,0,0.6)`
          : '2px 4px 8px rgba(0,0,0,0.35), 6px 16px 24px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        fontFamily: "'Courier Prime', monospace",
        cursor: 'grab',
      }}
    >
      {/* React Flow handles (invisible grab points) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'transparent', border: 'none', top: 8, width: 1, height: 1 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'transparent', border: 'none', bottom: 8, width: 1, height: 1 }}
      />

      {/* Red/Blue/Silver thumbtack pin */}
      <div
        className={`pin ${cfg.pin}`}
        style={{ position: 'absolute', top: 10, left: '50%' }}
      />

      {/* Masking tape for newspaper/location/witness */}
      {cfg.tape && (
        <div className="masking-tape" style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%) rotate(-2deg)' }} />
      )}

      {/* === NEWSPAPER STYLE === */}
      {cfg.newspaper ? (
        <div style={{ padding: '16px 10px 10px 10px' }}>
          <h3 style={{
            fontFamily: "'Special Elite', monospace",
            fontSize: '12px',
            fontWeight: 'bold',
            textAlign: 'center',
            borderBottom: '2px double #555',
            paddingBottom: '4px',
            marginBottom: '6px',
            marginTop: '14px',
            textTransform: 'uppercase',
            color: '#111',
            letterSpacing: '0.05em',
          }}>
            {data.label}
          </h3>
          <p style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: '10px',
            color: '#333',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {data.detail || 'No details on record.'}
          </p>
          <p style={{
            fontFamily: "'Special Elite', monospace",
            fontSize: '9px',
            color: cfg.accent,
            marginTop: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            ▸ {cfg.label}
          </p>
        </div>
      ) : cfg.stickyNote ? (
        /* === STICKY NOTE STYLE (Witness) === */
        <div style={{
          background: 'linear-gradient(135deg, #fef08a 0%, #eab308 100%)',
          padding: '24px 10px 10px 10px',
          minHeight: '140px',
        }}>
          <p style={{
            fontFamily: "'Permanent Marker', cursive",
            fontSize: '15px',
            color: '#1c1917',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {data.label}
          </p>
          {data.detail && (
            <p style={{
              fontFamily: "'Caveat', cursive",
              fontSize: '12px',
              color: '#44403c',
              marginTop: 6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {data.detail}
            </p>
          )}
          <span style={{
            display: 'block',
            marginTop: 8,
            fontFamily: "'Special Elite', monospace",
            fontSize: '9px',
            color: '#92400e',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>WITNESS</span>
        </div>
      ) : (
        /* === POLAROID STYLE (default: victim, suspect, vehicle, location, digital) === */
        <>
          {/* Photo / image frame */}
          <div className="polaroid-img" style={{ marginBottom: '8px', marginTop: '10px', height: 140 }}>
            {proxyUrl && !imgError ? (
              <img
                src={proxyUrl}
                alt={data.label}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%) contrast(1.1)' }}
              />
            ) : (
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 48, color: isDark ? '#60a5fa' : '#6b7280' }}
              >
                {cfg.icon}
              </span>
            )}
            {/* Polaroid film grain overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Label */}
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <p style={{
              fontFamily: cfg.fontStyle === 'Caveat' ? "'Caveat', cursive" : "'Courier Prime', monospace",
              fontSize: cfg.fontStyle === 'Caveat' ? '16px' : '13px',
              fontWeight: 'bold',
              color: textColor,
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {data.label}
            </p>
            <p style={{
              fontFamily: "'Special Elite', monospace",
              fontSize: '9px',
              color: cfg.labelColor,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: 3,
            }}>
              ▸ {cfg.label}
            </p>
            {data.detail && (
              <p
                title={data.detail}
                style={{
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: '9px',
                  color: subTextColor,
                  marginTop: 5,
                  lineHeight: 1.4,
                  borderTop: `1px solid ${cfg.borderColor}`,
                  paddingTop: 4,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textAlign: 'left',
                }}
              >
                {data.detail}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

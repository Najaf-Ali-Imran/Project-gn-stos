import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, MapPin, Car, Eye, Activity, Search } from 'lucide-react';

export default function PolaroidNode({ data }) {
  const getStyles = () => {
    switch (data.type) {
      case 'suspect': 
        return { bg: '#fef2f2', border: '#dc2626', text: '#991b1b', label: 'Suspect', icon: <User size={20}/>, glow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)' };
      case 'victim': 
        return { bg: '#f5f5f4', border: '#dc2626', text: '#1c1917', label: 'Victim', icon: <User size={20}/>, glow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' };
      case 'witness': 
        return { bg: '#fefce8', border: '#facc15', text: '#854d0e', label: 'Witness', icon: <Eye size={20}/>, glow: '0 10px 15px -3px rgba(250, 204, 21, 0.2)' };
      case 'digital': 
        return { bg: '#0f172a', border: '#3b82f6', text: '#bfdbfe', label: 'Digital Telemetry', icon: <Activity size={20}/>, glow: '0 0 20px rgba(59, 130, 246, 0.8)' };
      case 'vehicle': 
        return { bg: '#f3f4f6', border: '#6b7280', text: '#374151', label: 'Vehicle', icon: <Car size={20}/>, glow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' };
      case 'location': 
        return { bg: '#f5f5f4', border: '#a8a29e', text: '#2563eb', label: 'Location', icon: <MapPin size={20}/>, glow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' };
      case 'evidence': 
        return { bg: '#f0fdf4', border: '#22c55e', text: '#166534', label: 'Physical Evidence', icon: <Search size={20}/>, glow: '0 10px 15px -3px rgba(34, 197, 94, 0.2)' };
      default: 
        return { bg: '#ffffff', border: '#d1d5db', text: '#374151', label: 'Details', icon: <Search size={20}/>, glow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' };
    }
  };

  const s = getStyles();

  return (
    <div style={{ backgroundColor: s.bg, borderColor: s.border, boxShadow: s.glow }} className="p-3 w-52 rounded-sm border-2 transform transition-transform duration-150">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#ef4444] border-2 border-white" />
      
      <div style={{ backgroundColor: data.type === 'digital' ? '#1e293b' : '#e7e5e4', borderColor: data.type === 'digital' ? '#334155' : '#d6d3d1' }} className="w-full h-28 mb-2 flex items-center justify-center overflow-hidden rounded-sm border">
        {data.imageUrl ? (
          <img src={data.imageUrl} alt={data.label} className="object-cover w-full h-full block grayscale contrast-125" />
        ) : (
          <div style={{ color: data.type === 'digital' ? '#60a5fa' : '#78716c' }}>
            {s.icon}
          </div>
        )}
      </div>

      <div className="text-center">
        <p style={{ color: s.text }} className="font-bold font-serif text-sm leading-tight block">
          {data.label}
        </p>
        <p style={{ color: s.border }} className="text-[10px] tracking-widest uppercase mt-0.5 block font-bold">
          {s.label}
        </p>
        {data.detail && (
          <p 
            title={data.detail} /* THIS GIVES YOU THE HOVER TOOLTIP */
            style={{ color: data.type === 'digital' ? '#93c5fd' : '#44403c', borderColor: data.type === 'digital' ? '#334155' : '#e7e5e4' }} 
            className="text-[11px] mt-1.5 text-left leading-tight border-t pt-1 block font-sans opacity-90 line-clamp-4 overflow-hidden" /* LINE-CLAMP ADDED HERE */
          >
            {data.detail}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#ef4444] border-2 border-white" />
    </div>
  );
}
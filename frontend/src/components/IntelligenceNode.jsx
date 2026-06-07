import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, UserX, Eye, Fingerprint, Search, Car, MapPin, Clock, Activity, Dna, Phone, Building2 } from 'lucide-react';

export default function IntelligenceNode({ data, selected }) {
  const getTypeConfig = () => {
    switch (data.type) {
      case 'suspect': 
        return { color: '#ef4444', label: 'Suspect', icon: <Fingerprint size={16}/> }; // Red
      case 'victim': 
        return { color: '#f59e0b', label: 'Victim', icon: <UserX size={16}/> }; // Amber
      case 'witness': 
        return { color: '#3b82f6', label: 'Witness', icon: <Eye size={16}/> }; // Blue
      case 'evidence': 
        return { color: '#22c55e', label: 'Evidence', icon: <Search size={16}/> }; // Green
      case 'vehicle': 
        return { color: '#94a3b8', label: 'Vehicle', icon: <Car size={16}/> }; // Slate
      case 'location': 
        return { color: '#8b5cf6', label: 'Location', icon: <MapPin size={16}/> }; // Purple
      case 'timeline': 
        return { color: '#06b6d4', label: 'Timeline Event', icon: <Clock size={16}/> }; // Cyan
      case 'physical': 
        return { color: '#eab308', label: 'Physical Attribute', icon: <Activity size={16}/> }; // Yellow
      case 'dna': 
        return { color: '#ec4899', label: 'DNA Match', icon: <Dna size={16}/> }; // Pink
      case 'phone': 
        return { color: '#14b8a6', label: 'Phone Record', icon: <Phone size={16}/> }; // Teal
      case 'organization': 
        return { color: '#f97316', label: 'Organization', icon: <Building2 size={16}/> }; // Orange
      default: 
        return { color: '#cbd5e1', label: 'Entity', icon: <User size={16}/> };
    }
  };

  const config = getTypeConfig();
  
  // Opacity fading for unselected nodes when another node is selected
  // This logic expects a property `dimmed: boolean` passed via data if we filter from the parent
  const isDimmed = data.dimmed;

  return (
    <div 
      className={`relative w-64 bg-surface-variant/90 panel-blur border shadow-xl rounded-md overflow-hidden transition-all duration-300 ${selected ? 'ring-2 ring-offset-2 ring-offset-background z-50' : 'hover:border-on-surface-variant z-10'} ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}`}
      style={{ borderColor: selected ? config.color : '#334155', ringColor: config.color }}
    >
      {/* Top Handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-16 h-1 !bg-transparent !border-none !rounded-none"
      />

      {/* Top Accent Bar */}
      <div className="h-1 w-full" style={{ backgroundColor: config.color }}></div>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-surface/50 border-b border-outline">
        <div style={{ color: config.color }} className="p-1 bg-background rounded-sm">
          {config.icon}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-on-surface-variant leading-none">
            {config.label}
          </span>
          <span className="text-sm font-bold text-on-surface truncate leading-tight mt-0.5">
            {data.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {data.imageUrl && (
          <div className="w-full h-24 mb-2 overflow-hidden rounded border border-outline bg-background">
            <img src={data.imageUrl} alt={data.label} className="w-full h-full object-cover opacity-80" />
          </div>
        )}
        {data.detail && (
          <p className="text-xs text-on-surface-variant font-sans line-clamp-3 leading-relaxed">
            {data.detail}
          </p>
        )}
      </div>

      {/* Footer Meta */}
      {data.id && (
        <div className="px-3 py-1.5 bg-surface/50 border-t border-outline flex justify-between items-center text-[9px] font-mono text-on-surface-variant">
          <span>ID: {data.id.substring(0,8)}</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: config.color}}></span> Active</span>
        </div>
      )}

      {/* Bottom Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-16 h-1 !bg-transparent !border-none !rounded-none"
      />
    </div>
  );
}

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, MapPin, Car } from 'lucide-react';

export default function PolaroidNode({ data }) {
  const getStyle = () => {
    switch (data.type) {
      case 'suspect': return { color: 'text-red-600 font-bold', icon: <User size={20} />, label: 'Suspect' };
      case 'victim': return { color: 'text-green-600 font-bold', icon: <User size={20} />, label: 'Victim' };
      case 'location': return { color: 'text-blue-600 font-bold', icon: <MapPin size={20} />, label: 'Location' };
      case 'vehicle': return { color: 'text-amber-600 font-bold', icon: <Car size={20} />, label: 'Vehicle' };
      default: return { color: 'text-gray-600 font-bold', icon: <User size={20} />, label: 'Evidence' };
    }
  };

  const style = getStyle();

  return (
    <div className="bg-[#f5f5f4] p-3 shadow-2xl border border-[#d6d3d1] w-52 rounded-sm transform transition-transform duration-150">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#ef4444] border-2 border-white" />
      
      <div className="w-full h-28 bg-[#e7e5e4] border border-[#d6d3d1] mb-2 flex items-center justify-center overflow-hidden rounded-sm">
        {data.imageUrl ? (
          <img src={data.imageUrl} alt={data.label} className="object-cover w-full h-full block" />
        ) : (
          <div className="opacity-40 text-[#44403c]">{style.icon}</div>
        )}
      </div>

      <div className="text-center">
        <p className="font-bold font-serif text-[#1c1917] text-sm leading-tight block">{data.label}</p>
        <p className={`text-[10px] tracking-widest uppercase mt-0.5 block ${style.color}`}>
          {style.label}
        </p>
        {data.detail && (
          <p className="text-[11px] text-[#44403c] mt-1.5 text-left leading-tight border-t border-[#e7e5e4] pt-1 block font-sans">
            {data.detail}
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#ef4444] border-2 border-white" />
    </div>
  );
}
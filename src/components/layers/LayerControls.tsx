import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface LayerControl {
  id: string;
  icon: LucideIcon;
  label: string;
  action: string;
}

interface LayerControlsProps {
  controls: LayerControl[];
  handleLayerControl: (action: string) => void;
  themeColor: string;
}

const LayerControls: React.FC<LayerControlsProps> = ({ 
  controls, 
  handleLayerControl, 
  themeColor 
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {controls.map((control) => {
        const Icon = control.icon;
        return (
          <button
            key={control.id}
            onClick={() => handleLayerControl(control.action)}
            className="flex items-center gap-2 p-2 bg-zinc-700/50 rounded-md hover:bg-zinc-600 transition-colors"
          >
            <Icon className="w-4 h-4" style={{ color: themeColor }} />
            <span className="text-sm">{control.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LayerControls;
import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, RotateCcw } from 'lucide-react';

interface AnchorPointMoverProps {
  applyAnchorPointChange: (position: string) => void;
  handleResetAnchorPoint: () => void;
  themeColor: string;
}

const AnchorPointMover: React.FC<AnchorPointMoverProps> = ({
  applyAnchorPointChange,
  handleResetAnchorPoint,
  themeColor
}) => {
  return (
    <div className="space-y-6">
      {/* Preset buttons with arrows */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => applyAnchorPointChange("topLeft")}
          className="p-3 rounded-md text-xs bg-zinc-600 hover:bg-zinc-500 transition-colors flex items-center justify-center"
          title="Top Left"
        >
          <ArrowUpLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => applyAnchorPointChange("topCenter")}
          className="p-3 rounded-md text-xs bg-zinc-600 hover:bg-zinc-500 transition-colors flex items-center justify-center"
          title="Top Center"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => applyAnchorPointChange("topRight")}
          className="p-3 rounded-md text-xs bg-zinc-600 hover:bg-zinc-500 transition-colors flex items-center justify-center"
          title="Top Right"
        >
          <ArrowUpRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => applyAnchorPointChange("centerLeft")}
          className="p-3 rounded-md text-xs bg-zinc-600 hover:bg-zinc-500 transition-colors flex items-center justify-center"
          title="Middle Left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => applyAnchorPointChange("center")}
          className="p-3 rounded-md text-xs bg-zinc-600 hover:bg-zinc-500 transition-colors flex items-center justify-center"
          title="Center"
        >
          <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: themeColor }}></div>
        </button>
        <button
          onClick={() => applyAnchorPointChange("centerRight")}
          className="p-3 rounded-md text-xs bg-zinc-600 hover:bg-zinc-500 transition-colors flex items-center justify-center"
          title="Middle Right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => applyAnchorPointChange("bottomLeft")}
          className="p-3 rounded-md text-xs bg-zinc-600 hover:bg-zinc-500 transition-colors flex items-center justify-center"
          title="Bottom Left"
        >
          <ArrowDownLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => applyAnchorPointChange("bottomCenter")}
          className="p-3 rounded-md text-xs bg-zinc-600 hover:bg-zinc-500 transition-colors flex items-center justify-center"
          title="Bottom Center"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <button
          onClick={() => applyAnchorPointChange("bottomRight")}
          className="p-3 rounded-md text-xs bg-zinc-600 hover:bg-zinc-500 transition-colors flex items-center justify-center"
          title="Bottom Right"
        >
          <ArrowDownRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Reset button */}
      <button
        onClick={handleResetAnchorPoint}
        className="w-full p-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 bg-zinc-600 hover:bg-zinc-500 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Reset to Center
      </button>
    </div>
  );
};

export default AnchorPointMover;
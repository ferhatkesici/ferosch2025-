import React from 'react';
import { ArrowRight, ArrowLeft, Shuffle } from 'lucide-react';

interface LayerOffsetProps {
  offsetType: 'frames' | 'seconds';
  setOffsetType: (type: 'frames' | 'seconds') => void;
  offsetValue: string;
  setOffsetValue: (value: string) => void;
  useRandomOffset: boolean;
  setUseRandomOffset: (useRandom: boolean) => void;
  minOffset: string;
  setMinOffset: (value: string) => void;
  maxOffset: string;
  setMaxOffset: (value: string) => void;
  offsetDirection: 'forward' | 'backward';
  setOffsetDirection: (direction: 'forward' | 'backward') => void;
  currentOffsetRef: React.MutableRefObject<number>;
  handleApplyLayerOffset: () => void;
  handleResetLayerOffset: () => void;
  themeColor: string;
}

const LayerOffset: React.FC<LayerOffsetProps> = ({
  offsetType,
  setOffsetType,
  offsetValue,
  setOffsetValue,
  useRandomOffset,
  setUseRandomOffset,
  minOffset,
  setMinOffset,
  maxOffset,
  setMaxOffset,
  offsetDirection,
  setOffsetDirection,
  currentOffsetRef,
  handleApplyLayerOffset,
  handleResetLayerOffset,
  themeColor
}) => {
  return (
    <div className="bg-zinc-700/50 p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-3">Layer Offset</h3>
      <div className="space-y-4">
        {/* Offset Type */}
        <div className="bg-zinc-800 p-3 rounded-md">
          <h4 className="text-xs text-zinc-400 mb-2">Offset Type</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setOffsetType('frames')}
              className={`flex-1 p-2 rounded-sm text-sm transition-colors ${
                offsetType === 'frames' 
                  ? 'text-zinc-900'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
              }`}
              style={offsetType === 'frames' ? { backgroundColor: themeColor } : {}}
            >
              Frames
            </button>
            <button
              onClick={() => setOffsetType('seconds')}
              className={`flex-1 p-2 rounded-sm text-sm transition-colors ${
                offsetType === 'seconds'
                  ? 'text-zinc-900'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
              }`}
              style={offsetType === 'seconds' ? { backgroundColor: themeColor } : {}}
            >
              Seconds
            </button>
          </div>
        </div>

        {/* Offset Value */}
        <div className="bg-zinc-800 p-3 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs text-zinc-400">Offset Value</h4>
            <div className="text-xs text-zinc-400">
              Current: {currentOffsetRef.current}x
            </div>
          </div>
          <input
            type="text"
            value={offsetValue}
            onChange={(e) => setOffsetValue(e.target.value)}
            className="w-full bg-zinc-700 rounded-sm p-2 text-sm"
          />
        </div>

        {/* Random Settings */}
        <div className="bg-zinc-800 p-3 rounded-md">
          <h4 className="text-xs text-zinc-400 mb-2">Random Settings</h4>
          
          {/* Random Checkbox */}
          <div 
            onClick={() => setUseRandomOffset(!useRandomOffset)}
            className="flex items-center justify-between p-2 bg-zinc-700 rounded-sm cursor-pointer hover:bg-zinc-600 transition-colors mb-3"
          >
            <span className="text-sm">Use Random Offset</span>
            <div className="w-4 h-4 border rounded flex items-center justify-center">
              <div 
                className={`w-2 h-2 rounded-sm transition-colors ${useRandomOffset ? '' : 'hidden'}`}
                style={{ backgroundColor: themeColor }}
              />
            </div>
          </div>

          {/* Min/Max Values */}
          <div className={`grid grid-cols-2 gap-2 ${useRandomOffset ? '' : 'opacity-50 pointer-events-none'}`}>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Min Value</label>
              <input
                type="text"
                value={minOffset}
                onChange={(e) => setMinOffset(e.target.value)}
                className="w-full bg-zinc-700 rounded-sm p-2 text-sm"
                disabled={!useRandomOffset}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Max Value</label>
              <input
                type="text"
                value={maxOffset}
                onChange={(e) => setMaxOffset(e.target.value)}
                className="w-full bg-zinc-700 rounded-sm p-2 text-sm"
                disabled={!useRandomOffset}
              />
            </div>
          </div>
        </div>

        {/* Direction */}
        <div className="bg-zinc-800 p-3 rounded-md">
          <h4 className="text-xs text-zinc-400 mb-2">Direction</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setOffsetDirection('forward')}
              className={`flex-1 p-2 rounded-sm text-sm transition-colors flex items-center justify-center gap-1 ${
                offsetDirection === 'forward' 
                  ? 'text-zinc-900'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
              }`}
              style={offsetDirection === 'forward' ? { backgroundColor: themeColor } : {}}
            >
              <ArrowRight className="w-4 h-4" />
              Forward
            </button>
            <button
              onClick={() => setOffsetDirection('backward')}
              className={`flex-1 p-2 rounded-sm text-sm transition-colors flex items-center justify-center gap-1 ${
                offsetDirection === 'backward'
                  ? 'text-zinc-900'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
              }`}
              style={offsetDirection === 'backward' ? { backgroundColor: themeColor } : {}}
            >
              <ArrowLeft className="w-4 h-4" />
              Backward
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleApplyLayerOffset}
            className="p-2 rounded-md text-sm font-medium text-zinc-900 flex items-center justify-center gap-2"
            style={{ backgroundColor: themeColor }}
          >
            <Shuffle className="w-4 h-4" />
            Apply Offset
          </button>
          <button
            onClick={handleResetLayerOffset}
            className="p-2 rounded-md text-sm font-medium bg-zinc-600 hover:bg-zinc-500 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Reset Offset
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayerOffset;
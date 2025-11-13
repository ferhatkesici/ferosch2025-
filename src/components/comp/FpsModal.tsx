import React from 'react';

interface FpsModalProps {
  show: boolean;
  fps: number;
  setFps: (fps: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  handleFpsSettingsApply: () => void;
  setShowFpsModal: (show: boolean) => void;
  themeColor: string;
}

const FpsModal: React.FC<FpsModalProps> = ({
  show,
  fps,
  setFps,
  duration,
  setDuration,
  handleFpsSettingsApply,
  setShowFpsModal,
  themeColor
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-6 w-96 space-y-4">
        <h3 className="text-lg font-medium">FPS & Duration Settings</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">FPS</label>
            <input
              type="number"
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              className="w-full bg-zinc-700 rounded-md p-2 text-sm"
              min="1"
              max="120"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Duration (frames)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full bg-zinc-700 rounded-md p-2 text-sm"
              min="1"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleFpsSettingsApply}
              className="flex-1 p-2 rounded-md text-sm font-medium text-zinc-900"
              style={{ backgroundColor: themeColor }}
            >
              Apply
            </button>
            <button
              onClick={() => setShowFpsModal(false)}
              className="flex-1 p-2 rounded-md text-sm font-medium bg-zinc-600 hover:bg-zinc-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FpsModal;
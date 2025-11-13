import React from 'react';

interface FpsAndDurationProps {
  themeColor: string;
  setShowFpsModal: (show: boolean) => void;
}

const FpsAndDuration: React.FC<FpsAndDurationProps> = ({
  themeColor,
  setShowFpsModal
}) => {
  return (
    <div className="bg-zinc-700/50 p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-3">FPS & Duration Settings</h3>
      <button
        onClick={() => setShowFpsModal(true)}
        className="w-full p-2 rounded-md text-sm font-medium text-zinc-900"
        style={{ backgroundColor: themeColor }}
      >
        Change FPS & Duration
      </button>
    </div>
  );
};

export default FpsAndDuration;
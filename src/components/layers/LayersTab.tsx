import React from 'react';
import { Move } from 'lucide-react';
import LayerControls from './LayerControls';
import AnchorPointMover from './AnchorPointMover';
import EaseControls from './EaseControls';

interface LayersTabProps {
  layerControls: any[];
  handleLayerControl: (action: string) => void;
  themeColor: string;
  showAnchorPointMover: boolean;
  setShowAnchorPointMover: (show: boolean) => void;
  pendingAnchorX: number;
  pendingAnchorY: number;
  handleAnchorPointChange: (x: number, y: number) => void;
  applyAnchorPointChange: (position: string) => void;
  handleResetAnchorPoint: () => void;
  easeInValue: number;
  easeOutValue: number;
  easeBothValue: number;
  activeAnimation: 'in' | 'out' | 'both';
  handleEaseChange: (type: 'in' | 'out' | 'both', value: number) => void;
  handleEaseClick: (type: 'in' | 'out' | 'both') => void;
  applyEase: (type: 'in' | 'out' | 'both', value: number) => void;
  animationSource: any;
}

const LayersTab: React.FC<LayersTabProps> = ({
  layerControls,
  handleLayerControl,
  themeColor,
  showAnchorPointMover,
  setShowAnchorPointMover,
  applyAnchorPointChange,
  handleResetAnchorPoint,
  easeInValue,
  easeOutValue,
  easeBothValue,
  activeAnimation,
  handleEaseChange,
  handleEaseClick,
  applyEase,
  animationSource
}) => {
  const glowStyle = {
    boxShadow: `0 0 25px ${themeColor}33, 0 0 15px ${themeColor}26, 0 0 5px ${themeColor}1a`,
    borderColor: `${themeColor}1a`
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Layer Controls Grid */}
      <LayerControls 
        controls={layerControls} 
        handleLayerControl={handleLayerControl} 
        themeColor={themeColor} 
      />

      {/* Ease Controls / AnchorPoint Mover Toggle */}
      <div className="relative space-y-6 bg-zinc-700/50 p-4 rounded-lg" style={glowStyle}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">
            {showAnchorPointMover ? "Anchor Point Mover" : "Ease Controls"}
          </h3>
          <button
            onClick={() => setShowAnchorPointMover(!showAnchorPointMover)}
            className="flex items-center gap-1 text-xs bg-zinc-600 hover:bg-zinc-500 p-1 px-2 rounded transition-colors"
            style={{ color: themeColor }}
          >
            {showAnchorPointMover ? (
              <>
                <span>Switch to Ease Controls</span>
              </>
            ) : (
              <>
                <span>Switch to Anchor Point Mover</span>
                <Move className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
        
        {showAnchorPointMover ? (
          <AnchorPointMover 
            applyAnchorPointChange={applyAnchorPointChange}
            handleResetAnchorPoint={handleResetAnchorPoint}
            themeColor={themeColor}
          />
        ) : (
          <EaseControls 
            easeInValue={easeInValue}
            easeOutValue={easeOutValue}
            easeBothValue={easeBothValue}
            activeAnimation={activeAnimation}
            handleEaseChange={handleEaseChange}
            handleEaseClick={handleEaseClick}
            applyEase={applyEase}
            themeColor={themeColor}
            animationSource={animationSource}
          />
        )}
      </div>
    </div>
  );
};

export default LayersTab;
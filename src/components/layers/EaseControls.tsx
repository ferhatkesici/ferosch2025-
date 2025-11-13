import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { updateLottieColors } from '../../utils/lottieUtils';

interface EaseControlsProps {
  easeInValue: number;
  easeOutValue: number;
  easeBothValue: number;
  activeAnimation: 'in' | 'out' | 'both';
  handleEaseChange: (type: 'in' | 'out' | 'both', value: number) => void;
  handleEaseClick: (type: 'in' | 'out' | 'both') => void;
  applyEase: (type: 'in' | 'out' | 'both', value: number) => void;
  themeColor: string;
  animationSource: any;
}

const EaseControls: React.FC<EaseControlsProps> = ({
  easeInValue,
  easeOutValue,
  easeBothValue,
  activeAnimation,
  handleEaseChange,
  handleEaseClick,
  applyEase,
  themeColor,
  animationSource
}) => {
  const playerRef = useRef<Player>(null);
  const [previewValue, setPreviewValue] = useState<{type: 'in' | 'out' | 'both', value: number} | null>(null);
  
  // Update animation colors based on theme
  const coloredAnimation = useMemo(() => {
    return updateLottieColors(animationSource, themeColor);
  }, [animationSource, themeColor]);

  // Update animation frame when slider values change or active animation changes
  useEffect(() => {
    if (playerRef.current) {
      let frame = 0;
      
      if (previewValue && previewValue.type === activeAnimation) {
        frame = Math.floor((previewValue.value / 100) * 100);
      } else {
        switch(activeAnimation) {
          case 'in':
            frame = Math.floor((easeInValue / 100) * 100);
            break;
          case 'out':
            frame = Math.floor((easeOutValue / 100) * 100);
            break;
          case 'both':
            frame = Math.floor((easeBothValue / 100) * 100);
            break;
        }
      }
      
      playerRef.current.stop();
      playerRef.current.setSeeker(frame);
    }
  }, [easeInValue, easeOutValue, easeBothValue, activeAnimation, previewValue]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, type: 'in' | 'out' | 'both') => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const value = Math.round((x / rect.width) * 100);
    setPreviewValue({ type, value: Math.max(0, Math.min(100, value)) });
  };

  const handleMouseLeave = () => {
    setPreviewValue(null);
  };

  return (
    <div className="space-y-6">
      {/* Animation Preview */}
      <div className="w-full aspect-video bg-zinc-800 rounded-lg overflow-hidden">
        <Player
          ref={playerRef}
          src={coloredAnimation}
          autoplay={false}
          loop={false}
          style={{ width: '100%', height: '100%' }}
          speed={0.5}
          renderer="svg"
          key={`${activeAnimation}-${themeColor}`}
        />
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        {/* Ease In */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm">Ease In</label>
            <span className="text-sm text-zinc-400">{easeInValue}%</span>
          </div>
          <div 
            className="range-input-container"
            onClick={() => handleEaseClick('in')}
            onMouseMove={(e) => handleMouseMove(e, 'in')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="range-input-hover-track" />
            {previewValue && previewValue.type === 'in' && (
              <div 
                className="range-input-preview"
                style={{ 
                  '--theme-color': themeColor,
                  left: `${previewValue.value}%`
                } as React.CSSProperties}
              />
            )}
            <input
              type="range"
              min="0"
              max="100"
              value={easeInValue}
              onChange={(e) => handleEaseChange('in', parseInt(e.target.value))}
              onMouseUp={() => applyEase('in', easeInValue)}
              onTouchEnd={() => applyEase('in', easeInValue)}
              className="range-input"
              style={{ '--theme-color': themeColor } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Ease Both */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm">Ease Both</label>
            <span className="text-sm text-zinc-400">{easeBothValue}%</span>
          </div>
          <div 
            className="range-input-container"
            onClick={() => handleEaseClick('both')}
            onMouseMove={(e) => handleMouseMove(e, 'both')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="range-input-hover-track" />
            {previewValue && previewValue.type === 'both' && (
              <div 
                className="range-input-preview"
                style={{ 
                  '--theme-color': themeColor,
                  left: `${previewValue.value}%`
                } as React.CSSProperties}
              />
            )}
            <input
              type="range"
              min="0"
              max="100"
              value={easeBothValue}
              onChange={(e) => handleEaseChange('both', parseInt(e.target.value))}
              onMouseUp={() => applyEase('both', easeBothValue)}
              onTouchEnd={() => applyEase('both', easeBothValue)}
              className="range-input"
              style={{ '--theme-color': themeColor } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Ease Out */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm">Ease Out</label>
            <span className="text-sm text-zinc-400">{easeOutValue}%</span>
          </div>
          <div 
            className="range-input-container"
            onClick={() => handleEaseClick('out')}
            onMouseMove={(e) => handleMouseMove(e, 'out')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="range-input-hover-track" />
            {previewValue && previewValue.type === 'out' && (
              <div 
                className="range-input-preview"
                style={{ 
                  '--theme-color': themeColor,
                  left: `${previewValue.value}%`
                } as React.CSSProperties}
              />
            )}
            <input
              type="range"
              min="0"
              max="100"
              value={easeOutValue}
              onChange={(e) => handleEaseChange('out', parseInt(e.target.value))}
              onMouseUp={() => applyEase('out', easeOutValue)}
              onTouchEnd={() => applyEase('out', easeOutValue)}
              className="range-input"
              style={{ '--theme-color': themeColor } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EaseControls;
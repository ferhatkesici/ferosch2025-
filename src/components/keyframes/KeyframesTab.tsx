import React from 'react';
import KeyframesOffset from './KeyframesOffset';

interface KeyframesTabProps {
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
  handleApplyKeyframeOffset: () => void;
  handleResetKeyframeOffset: () => void;
  handleApplyLayerOffset: () => void;
  handleResetLayerOffset: () => void;
  themeColor: string;
}

const KeyframesTab: React.FC<KeyframesTabProps> = ({
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
  handleApplyKeyframeOffset,
  handleResetKeyframeOffset,
  handleApplyLayerOffset,
  handleResetLayerOffset,
  themeColor
}) => {
  return (
    <div className="space-y-4">
      {/* Keyframes Offset */}
      <KeyframesOffset
        offsetType={offsetType}
        setOffsetType={setOffsetType}
        offsetValue={offsetValue}
        setOffsetValue={setOffsetValue}
        useRandomOffset={useRandomOffset}
        setUseRandomOffset={setUseRandomOffset}
        minOffset={minOffset}
        setMinOffset={setMinOffset}
        maxOffset={maxOffset}
        setMaxOffset={setMaxOffset}
        offsetDirection={offsetDirection}
        setOffsetDirection={setOffsetDirection}
        currentOffsetRef={currentOffsetRef}
        handleApplyKeyframeOffset={handleApplyKeyframeOffset}
        handleResetKeyframeOffset={handleResetKeyframeOffset}
        handleApplyLayerOffset={handleApplyLayerOffset}
        handleResetLayerOffset={handleResetLayerOffset}
        themeColor={themeColor}
      />
    </div>
  );
};

export default KeyframesTab;
import React from 'react';
import FpsAndDuration from './FpsAndDuration';
import CropComp from './CropComp';

interface CompTabProps {
  themeColor: string;
  setShowFpsModal: (show: boolean) => void;
  handleCropComp: () => void;
}

const CompTab: React.FC<CompTabProps> = ({ 
  themeColor, 
  setShowFpsModal, 
  handleCropComp 
}) => {
  return (
    <div className="space-y-4">
      <FpsAndDuration 
        themeColor={themeColor}
        setShowFpsModal={setShowFpsModal}
      />
      <CropComp 
        themeColor={themeColor}
        handleCropComp={handleCropComp}
      />
    </div>
  );
};

export default CompTab;
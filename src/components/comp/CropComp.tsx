import React from 'react';

interface CropCompProps {
  themeColor: string;
  handleCropComp: () => void;
}

const CropComp: React.FC<CropCompProps> = ({
  themeColor,
  handleCropComp
}) => {
  return (
    <div className="bg-zinc-700/50 p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-3">Composition Cropping</h3>
      <button
        onClick={handleCropComp}
        className="w-full p-2 rounded-md text-sm font-medium text-zinc-900"
        style={{ backgroundColor: themeColor }}
      >
        Crop Composition
      </button>
    </div>
  );
};

export default CropComp;
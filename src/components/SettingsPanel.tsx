import React from 'react';

interface ColorOption {
  color: string;
  label: string;
}

interface SettingsPanelProps {
  show: boolean;
  themeColor: string;
  setThemeColor: (color: string) => void;
  themeColors: ColorOption[];
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  show, 
  themeColor, 
  setThemeColor, 
  themeColors 
}) => {
  if (!show) return null;
  
  return (
    <div className="bg-zinc-800 rounded-lg p-4">
      <div className="space-y-4">
        <h3 className="text-sm font-medium mb-3">Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Theme Color</span>
            <div className="flex gap-2">
              {themeColors.map((colorOption) => (
                <button
                  key={colorOption.color}
                  onClick={() => setThemeColor(colorOption.color)}
                  className={`w-6 h-6 rounded-full ${themeColor === colorOption.color ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: colorOption.color }}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
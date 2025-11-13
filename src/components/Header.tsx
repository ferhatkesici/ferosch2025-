import React from 'react';
import { Settings, Terminal } from 'lucide-react';

interface HeaderProps {
  themeColor: string;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showConsole: boolean;
  setShowConsole: (show: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  themeColor, 
  showSettings, 
  setShowSettings, 
  showConsole, 
  setShowConsole 
}) => {
  return (
    <div className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <Settings style={{ color: themeColor }} className="w-5 h-5" />
        <h1 style={{ color: themeColor }} className="text-lg font-semibold">ferosch</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="hover:bg-zinc-700 p-2 rounded-md transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowConsole(!showConsole)}
          className="hover:bg-zinc-700 p-2 rounded-md transition-colors"
        >
          <Terminal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Header;
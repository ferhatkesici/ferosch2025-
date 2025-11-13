import React from 'react';

interface ConsolePanelProps {
  show: boolean;
  logs: string[];
}

const ConsolePanel: React.FC<ConsolePanelProps> = ({ show, logs }) => {
  if (!show) return null;
  
  return (
    <div className="bg-zinc-800 rounded-lg p-4 h-48 overflow-auto">
      <div className="font-mono text-sm">
        {logs.map((log, index) => (
          <div key={index} className="py-1 border-b border-zinc-700 last:border-0">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsolePanel;
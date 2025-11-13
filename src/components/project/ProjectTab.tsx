import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ProjectControl {
  id: string;
  icon: LucideIcon;
  label: string;
  action: string;
}

interface ProjectTabProps {
  projectControls: ProjectControl[];
  handleProjectControl: (action: string) => void;
  themeColor: string;
}

const ProjectTab: React.FC<ProjectTabProps> = ({ 
  projectControls, 
  handleProjectControl, 
  themeColor 
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-zinc-700/50 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-3">Project Tools</h3>
        <div className="grid grid-cols-1 gap-2">
          {projectControls.map((control) => {
            const Icon = control.icon;
            return (
              <button
                key={control.id}
                onClick={() => handleProjectControl(control.action)}
                className="flex items-center gap-2 p-3 bg-zinc-600 rounded-md hover:bg-zinc-500 transition-colors"
              >
                <Icon className="w-4 h-4" style={{ color: themeColor }} />
                <span className="text-sm">{control.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectTab;
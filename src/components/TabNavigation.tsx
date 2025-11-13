import React, { useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  themeColor: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  activeTab, 
  setActiveTab, 
  themeColor 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener('wheel', handleWheel);
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="bg-zinc-800 rounded-lg p-1 overflow-x-auto whitespace-nowrap"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div className="flex min-w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[120px] ${
                activeTab === tab.id
                  ? 'text-zinc-900'
                  : 'hover:bg-zinc-700 text-zinc-300'
              }`}
              style={{ backgroundColor: activeTab === tab.id ? themeColor : 'transparent' }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
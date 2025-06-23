import React from 'react';
import { TabType } from '../../hooks/useAppState';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'scoreboard' ? 'nav-tab-active' : ''}`}
            onClick={() => onTabChange('scoreboard')}
          >
            计分板
          </button>
          <button
            className={`nav-tab ${activeTab === 'players-stats' ? 'nav-tab-active' : ''}`}
            onClick={() => onTabChange('players-stats')}
          >
            统计分析
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'nav-tab-active' : ''}`}
            onClick={() => onTabChange('history')}
          >
            历史记录
          </button>
        </nav>
      </div>
    </div>
  );
}; 
import React from 'react';

const FilterButtons = ({ activeFilter, setFilter, themeColor = 'var(--accent-orange)' }) => {
  // Index mapping to determine the position of the sliding indicator
  const filterIndex = { 'day': 0, 'week': 1, 'month': 2 }[activeFilter] || 0;
  
  // Fixed width for each tab makes calculating the sliding offset easy and perfectly accurate
  const buttonWidth = 70; // 70px per button
  const indicatorLeft = filterIndex * buttonWidth;

  return (
    <div className="filter-tabs-container" style={{ width: `${buttonWidth * 3}px` }}>
      {/* The faint grey line underneath all options */}
      <div className="filter-track"></div>
      
      {/* The glowing colored line that slides to the active option */}
      <div 
        className="filter-active-indicator" 
        style={{ 
          left: `${indicatorLeft}px`, 
          width: `${buttonWidth}px`,
          background: themeColor,
          boxShadow: `0 0 8px ${themeColor === '#FFB800' ? 'rgba(255, 184, 0, 0.5)' : 'var(--accent-glow)'}`
        }}
      ></div>

      <button 
        className={`filter-tab ${activeFilter === 'day' ? 'active' : ''}`}
        onClick={() => setFilter('day')}
        style={{ 
            width: `${buttonWidth}px`,
            color: activeFilter === 'day' ? themeColor : 'var(--text-muted)',
            textShadow: activeFilter === 'day' ? `0 0 10px ${themeColor === '#FFB800' ? 'rgba(255, 184, 0, 0.3)' : 'rgba(74, 222, 128, 0.3)'}` : 'none'
        }}
      >
        DAY
      </button>
      <button 
        className={`filter-tab ${activeFilter === 'week' ? 'active' : ''}`}
        onClick={() => setFilter('week')}
        style={{ 
            width: `${buttonWidth}px`,
            color: activeFilter === 'week' ? themeColor : 'var(--text-muted)',
            textShadow: activeFilter === 'week' ? `0 0 10px ${themeColor === '#FFB800' ? 'rgba(255, 184, 0, 0.3)' : 'rgba(74, 222, 128, 0.3)'}` : 'none'
        }}
      >
        WEEK
      </button>
      <button 
        className={`filter-tab ${activeFilter === 'month' ? 'active' : ''}`}
        onClick={() => setFilter('month')}
        style={{ 
            width: `${buttonWidth}px`,
            color: activeFilter === 'month' ? themeColor : 'var(--text-muted)',
            textShadow: activeFilter === 'month' ? `0 0 10px ${themeColor === '#FFB800' ? 'rgba(255, 184, 0, 0.3)' : 'rgba(74, 222, 128, 0.3)'}` : 'none'
        }}
      >
        MONTH
      </button>
    </div>
  );
};

export default FilterButtons;
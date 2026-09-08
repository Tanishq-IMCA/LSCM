import React, { useState, useEffect, useRef, useCallback } from 'react';
import EnergyChart from './EnergyChart';
import GridRateChart from './GridRateChart';
import FilterButtons from './FilterButtons';
import SettingsPage from './SettingsPage';
import SolarPage from './SolarPage'; 
import HouseView from './HouseView';

const DashboardLayout = ({
  historicalData,
  predictionData,
  gridRates,
  filter,
  setFilter,
  loading,
  error,
  activePage,
  setActivePage
}) => {
  const [indicatorTop, setIndicatorTop] = useState(0);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(true);
  
  const dashboardItemRef = useRef(null);
  const solarItemRef = useRef(null);
  const houseItemRef = useRef(null); 
  const settingsItemRef = useRef(null);

  const getActiveRef = useCallback(() => {
      if (activePage === 'dashboard') return dashboardItemRef;
      if (activePage === 'solar') return solarItemRef;
      if (activePage === 'houseView') return houseItemRef;
      if (activePage === 'settings') return settingsItemRef;
      return null;
  }, [activePage]);

  useEffect(() => {
    setIsSimulatingLoad(true);
    const timer = setTimeout(() => {
        setIsSimulatingLoad(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [filter]); 

  const showLoader = loading || isSimulatingLoad;

  useEffect(() => {
    const updateIndicator = () => {
      const activeRef = getActiveRef();
      if (activeRef && activeRef.current) {
        setIndicatorTop(activeRef.current.offsetTop);
      }
    };
    
    updateIndicator();
    setTimeout(updateIndicator, 100);
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [getActiveRef]);

  const handleDisabledClick = (e) => {
    const el = e.currentTarget;
    el.classList.remove('error-flash');
    void el.offsetWidth;
    el.classList.add('error-flash');
  };

  const generateInsight = () => {
      if (!historicalData || historicalData.length === 0 || !predictionData || predictionData.length === 0) {
          return {
              title: "AWAITING TELEMETRY",
              textParts: [{ text: "System is compiling predictive models based on historical nodes.", color: null }],
              status: "neutral"
          };
      }

      const histAvg = historicalData.reduce((sum, d) => sum + d.energy_consumption_kwh, 0) / historicalData.length;
      const predAvg = predictionData.reduce((sum, d) => sum + d.predicted_consumption_kwh, 0) / predictionData.length;
      const percentDiff = ((predAvg - histAvg) / histAvg) * 100;
      
      let timeframe = "day";
      if (filter === 'week') timeframe = "week";
      if (filter === 'month') timeframe = "month";

      if (percentDiff > 15) {
          return {
              title: "SURGE DETECTED",
              textParts: [
                  { text: `Predictive models indicate your energy consumption is tracking `, color: null },
                  { text: `${Math.abs(percentDiff).toFixed(1)}% higher`, color: 'danger' },
                  { text: ` than your standard ${timeframe}ly average. `, color: null },
                  { text: `Grid dependency is likely.`, color: 'danger' }
              ],
              status: "danger"
          };
      } else if (percentDiff < -15) {
          return {
              title: "OPTIMAL EFFICIENCY",
              textParts: [
                  { text: `Energy output is stabilized.`, color: 'good' },
                  { text: ` Consumption is forecasted to be `, color: null },
                  { text: `${Math.abs(percentDiff).toFixed(1)}% lower`, color: 'good' },
                  { text: ` than your average ${timeframe}. `, color: null },
                  { text: `Battery reserves holding steady.`, color: 'good' }
              ],
              status: "good"
          };
      } else {
          return {
              title: "NOMINAL PATTERN",
              textParts: [
                  { text: `Your forecasted ${timeframe}ly energy usage remains consistent with historical data. `, color: null },
                  { text: `Minimal deviations detected.`, color: 'good' }
              ],
              status: "neutral"
          };
      }
  };

  const insight = generateInsight();

  const renderAnimatedText = (textParts) => {
      let wordIndex = 0;
      return textParts.map((part, partIndex) => {
          const words = part.text.split(' ');
          let colorStyle = {};
          if (part.color === 'danger') {
              colorStyle = { color: '#ff4444', textShadow: '0 0 10px rgba(255, 68, 68, 0.6)', fontWeight: '600' };
          } else if (part.color === 'good') {
              colorStyle = { color: 'var(--accent-orange)', textShadow: '0 0 10px var(--accent-glow)', fontWeight: '600' };
          }

          return words.map((word, wIdx) => {
              if (!word.trim()) return null; 
              const currentIdx = wordIndex++;
              return (
                  <span 
                      key={`${partIndex}-${wIdx}`} 
                      className="word-reveal" 
                      style={{ 
                          animationDelay: `${currentIdx * 0.08}s`,
                          ...colorStyle
                      }} 
                  >
                      {word}&nbsp;
                  </span>
              );
          });
      });
  };

  let indicatorColor = 'var(--accent-orange)'; 
  let indicatorGlow = 'var(--accent-glow)';
  
  if (activePage === 'solar') {
      indicatorColor = '#FFB800'; 
      indicatorGlow = 'rgba(255, 184, 0, 0.5)';
  } else if (activePage === 'houseView') {
      indicatorColor = '#00F0FF'; 
      indicatorGlow = 'rgba(0, 240, 255, 0.5)';
  } else if (activePage === 'settings') {
      indicatorColor = '#b5b5b5'; 
      indicatorGlow = 'rgba(255, 255, 255, 0.2)';
  }

  return (
    <>
      <nav className="sidebar">
        <div 
            className="nav-indicator" 
            style={{ 
                top: `${indicatorTop}px`, 
                height: '60px', 
                pointerEvents: 'none',
                background: indicatorColor,
                boxShadow: `0 0 20px ${indicatorGlow}`
            }}
        ></div>
        
        <div className="logo-area" style={{ color: 'var(--accent-orange)', fontSize: '1.4rem', marginBottom: '20px', zIndex: 10, cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-layer-group"></i>
        </div>

        <div 
            ref={dashboardItemRef} 
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} 
            style={{ cursor: 'pointer' }} 
            title="Dashboard"
            onClick={() => setActivePage('dashboard')}
        >
            <i className="fa-solid fa-chart-line"></i>
        </div>
        
        <div 
            ref={solarItemRef}
            className={`nav-item ${activePage === 'solar' ? 'active' : ''}`} 
            style={{ cursor: 'pointer' }} 
            title="Solar Arrays & Battery"
            onClick={() => setActivePage('solar')}
        >
             <i className="fa-solid fa-sun"></i>
        </div>
        
        <div 
            ref={houseItemRef}
            className={`nav-item ${activePage === 'houseView' ? 'active' : ''}`} 
            style={{ cursor: 'pointer' }} 
            title="Premises Overview"
            onClick={() => setActivePage('houseView')}
        >
            <i className="fa-solid fa-eye"></i> 
        </div>
        
        <div className="nav-item disabled" style={{ opacity: 0.5 }} title="Vehicle Charging (Coming Soon)" onClick={handleDisabledClick}>
            <i className="fa-solid fa-car-side"></i>
        </div>
        
        <div style={{ marginTop: 'auto', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '20px', width: '100%' }}>
             <div 
                ref={settingsItemRef}
                className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} 
                style={{ cursor: 'pointer' }} 
                title="Settings"
                onClick={() => setActivePage('settings')}
             >
                 <i className="fa-solid fa-gear"></i>
             </div>
        </div>
      </nav>

      <div className="app-container">
        
        {activePage === 'dashboard' && (
            <div className="page-fade-in">
                <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div className="title-underline-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                        <div>
                            {/* Added data-text for accurate CSS reflection */}
                            <h1 className="dashboard-title" data-text="SOLARIS CORE">
                                SOLARIS CORE
                            </h1>
                            <div className="themed-wave-line"></div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="glass-panel card" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '500px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Energy Consumption</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Space Mono', monospace" }}>
                                    {!showLoader && historicalData.length > 0 ? `${historicalData[historicalData.length-1].energy_consumption_kwh.toFixed(1)} kWh` : '0.0 kWh'}
                                    <span style={{ fontSize: '12px', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', fontFamily: "'Poppins', sans-serif" }}>
                                        <i className="fa-solid fa-arrow-up" style={{ fontSize: '10px', marginRight: '4px' }}></i> Active
                                    </span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                <FilterButtons activeFilter={filter} setFilter={setFilter} />
                                
                                <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                         <div style={{ width: '20px', height: '2px', background: 'var(--accent-orange)', boxShadow: '0 0 5px var(--accent-orange)', borderRadius: '2px' }}></div> 
                                         Historical
                                     </div>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                         <div style={{ 
                                             width: '20px', 
                                             height: '6px', 
                                             borderTop: '2px solid #ff4444',
                                             background: 'repeating-linear-gradient(45deg, rgba(255, 68, 68, 0.6), rgba(255, 68, 68, 0.6) 2px, rgba(255, 68, 68, 0.15) 2px, rgba(255, 68, 68, 0.15) 6px)', 
                                             borderRadius: '1px' 
                                         }}></div> 
                                         Predicted
                                     </div>
                                </div>
                            </div>
                        </div>

                        {error ? (
                            <div style={{ margin: 'auto', color: '#ff4444', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{error}</div>
                        ) : showLoader ? (
                            <div className="telemetry-loader" style={{ flex: 1 }}>
                                <div className="radar-spinner">
                                    <div className="circle circle-loader"></div>
                                    <div className="circle circle-loader"></div>
                                    <div className="circle circle-loader"></div>
                                </div>
                                <div className="telemetry-text">LOADING TELEMETRY</div>
                            </div>
                        ) : (
                            <div className="graph-fade-in" style={{ flex: 1, position: 'relative', width: '100%' }}>
                                <EnergyChart 
                                    historicalData={historicalData} 
                                    predictionData={predictionData} 
                                />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', minWidth: '350px' }}>
                        
                        <div className="glass-panel card" style={{ padding: '20px 25px', height: '180px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {showLoader ? (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                    Analyzing data streams...
                                </div>
                            ) : (
                                <div className="graph-fade-in">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', position: 'relative', height: '24px' }}>
                                        <div style={{ width: '4px', height: '20px', background: 'var(--accent-orange)', boxShadow: '0 0 10px var(--accent-glow)' }}></div>
                                        <div style={{ position: 'relative', flex: 1, height: '100%' }}>
                                            <h3 className="title-swap-1" style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-orange)', letterSpacing: '2px' }}>
                                                AI PREDICTIVE INSIGHT
                                            </h3>
                                            <h3 className="title-swap-2" style={{ 
                                                margin: 0, 
                                                fontSize: '0.9rem', 
                                                color: insight.status === 'danger' ? '#ff4444' : insight.status === 'good' ? 'var(--accent-orange)' : 'white',
                                                letterSpacing: '2px',
                                                textShadow: insight.status === 'danger' ? '0 0 10px rgba(255, 68, 68, 0.4)' : 'none'
                                            }}>
                                                {insight.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <div style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', letterSpacing: '0.5px' }}>
                                        <div key={filter}>
                                            {renderAnimatedText(insight.textParts)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="glass-panel card" style={{ padding: '20px 25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ width: '4px', height: '20px', background: '#00F0FF', boxShadow: '0 0 10px #00F0FF' }}></div>
                                <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#00F0FF', letterSpacing: '2px' }}>US GRID RATES</h3>
                            </div>
                            <div style={{ flex: 1, position: 'relative', minHeight: '150px' }}>
                                 {showLoader ? (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                        Syncing national grid...
                                    </div>
                                ) : (
                                    <GridRateChart gridRates={gridRates} />
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )}

        {activePage === 'solar' && (
            <SolarPage 
                historicalData={historicalData} 
                predictionData={predictionData} 
                filter={filter}
                setFilter={setFilter}
                showLoader={showLoader}
                error={error}
            />
        )}

        {activePage === 'houseView' && (
            <HouseView historicalData={historicalData} predictionData={predictionData} />
        )}

        {activePage === 'settings' && (
            <div className="page-fade-in" style={{ height: '100%' }}>
                <SettingsPage />
            </div>
        )}

      </div>
    </>
  );
};

export default DashboardLayout;
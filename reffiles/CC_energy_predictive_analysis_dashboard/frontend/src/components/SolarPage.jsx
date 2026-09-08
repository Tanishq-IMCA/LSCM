import React from 'react';
import SolarChart from './SolarChart';
import BatteryChart from './BatteryChart';
import FilterButtons from './FilterButtons';

const SolarPage = ({
  historicalData,
  predictionData,
  filter,
  setFilter,
  showLoader,
  error
}) => {

  const generateInsight = () => {
      if (!historicalData || historicalData.length === 0 || !predictionData || predictionData.length === 0) {
          return {
              title: "AWAITING TELEMETRY",
              textParts: [{ text: "System is compiling solar predictive models based on historical nodes.", color: null }],
              status: "neutral"
          };
      }

      // Calculate average solar generation
      const histSolarAvg = historicalData.reduce((sum, d) => sum + d.solar_generation_kwh, 0) / historicalData.length;
      const predSolarAvg = predictionData.reduce((sum, d) => sum + d.predicted_solar_generation_kwh, 0) / predictionData.length;
      const percentDiff = ((predSolarAvg - histSolarAvg) / (histSolarAvg || 1)) * 100;

      let timeframe = "day";
      if (filter === 'week') timeframe = "week";
      if (filter === 'month') timeframe = "month";

      if (percentDiff > 10) {
          return {
              title: "OPTIMAL YIELD",
              textParts: [
                  { text: `Weather patterns indicate a `, color: null },
                  { text: `${Math.abs(percentDiff).toFixed(1)}% increase`, color: 'good' },
                  { text: ` in solar generation compared to the ${timeframe}ly average. `, color: null },
                  { text: `Battery reserves will cap quickly.`, color: 'good' }
              ],
              status: "good"
          };
      } else if (percentDiff < -15) {
          return {
              title: "LOW YIELD DETECTED",
              textParts: [
                  { text: `Solar array efficiency is tracking `, color: null },
                  { text: `${Math.abs(percentDiff).toFixed(1)}% lower`, color: 'danger' },
                  { text: ` than standard parameters due to forecasted cloud cover. `, color: null },
                  { text: `Grid reliance will increase.`, color: 'danger' }
              ],
              status: "danger"
          };
      } else {
          return {
              title: "NOMINAL YIELD",
              textParts: [
                  { text: `Solar panel arrays are operating within normal parameters. Forecasted generation matches historical ${timeframe}ly averages. `, color: null },
                  { text: `System stable.`, color: 'good' }
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
              colorStyle = { color: '#FFB800', textShadow: '0 0 10px rgba(255, 184, 0, 0.5)', fontWeight: '600' };
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

  const loaderCircleStyle = (color) => ({
      borderColor: color
  });

  return (
    <div className="page-fade-in">
        <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="title-underline-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                    <h1 className="dashboard-title" data-text="SOLAR ARRAY STATUS">
                        SOLAR ARRAY STATUS
                    </h1>
                    <div className="themed-wave-line" style={{ background: '#FFB800', boxShadow: '0 0 15px #FFB800' }}></div>
                </div>
            </div>
        </div>

        <div className="dashboard-grid">
            {/* Top Left: Solar Generation Chart */}
            <div className="glass-panel card" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Solar Generation Output</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Space Mono', monospace" }}>
                            {!showLoader && historicalData.length > 0 ? `${historicalData[historicalData.length-1].solar_generation_kwh.toFixed(1)} kWh` : '0.0 kWh'}
                            <span style={{ fontSize: '12px', color: '#FFB800', display: 'flex', alignItems: 'center', fontFamily: "'Poppins', sans-serif", textShadow: '0 0 5px #FFB800' }}>
                                <i className="fa-solid fa-sun" style={{ fontSize: '10px', marginRight: '4px' }}></i> Active
                            </span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <FilterButtons activeFilter={filter} setFilter={setFilter} themeColor="#FFB800" />
                        
                        <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <div style={{ width: '20px', height: '2px', background: '#FFB800', boxShadow: '0 0 5px #FFB800', borderRadius: '2px' }}></div> 
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
                            <div className="circle circle-loader" style={loaderCircleStyle('#FFB800')}></div>
                            <div className="circle circle-loader" style={loaderCircleStyle('#FFB800')}></div>
                            <div className="circle circle-loader" style={loaderCircleStyle('#FFB800')}></div>
                        </div>
                        <div className="telemetry-text" style={{ color: '#FFB800', textShadow: '0 0 10px rgba(255, 184, 0, 0.5)' }}>SCANNING ARRAYS</div>
                    </div>
                ) : (
                    <div className="graph-fade-in" style={{ flex: 1, position: 'relative', width: '100%' }}>
                        <SolarChart 
                            historicalData={historicalData} 
                            predictionData={predictionData} 
                        />
                    </div>
                )}
            </div>

            {/* Right Column: AI Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', minWidth: '350px' }}>
                <div className="glass-panel card" style={{ padding: '20px 25px', height: '180px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {showLoader ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                            Analyzing weather data...
                        </div>
                    ) : (
                        <div className="graph-fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', position: 'relative', height: '24px' }}>
                                <div style={{ width: '4px', height: '20px', background: '#FFB800', boxShadow: '0 0 10px #FFB800' }}></div>
                                <div style={{ position: 'relative', flex: 1, height: '100%' }}>
                                    <h3 className="title-swap-1" style={{ margin: 0, fontSize: '0.9rem', color: '#FFB800', letterSpacing: '2px' }}>
                                        SOLAR FEEDBACK
                                    </h3>
                                    <h3 className="title-swap-2" style={{ 
                                        margin: 0, 
                                        fontSize: '0.9rem', 
                                        color: insight.status === 'danger' ? '#ff4444' : insight.status === 'good' ? '#FFB800' : 'white',
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
            </div>
            
            {/* Bottom Row: Battery Chart */}
            <div className="glass-panel card" style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '500px', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Powerwall Reserve Capacity</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Space Mono', monospace" }}>
                            {!showLoader && historicalData.length > 0 ? `${historicalData[historicalData.length-1].battery_charge_percent.toFixed(1)}%` : '0.0%'}
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                        <FilterButtons activeFilter={filter} setFilter={setFilter} themeColor="#00F0FF" />
                        
                        <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <div style={{ width: '20px', height: '2px', background: '#00F0FF', boxShadow: '0 0 5px #00F0FF', borderRadius: '2px' }}></div> 
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
                            <div className="circle circle-loader" style={loaderCircleStyle('#00F0FF')}></div>
                            <div className="circle circle-loader" style={loaderCircleStyle('#00F0FF')}></div>
                            <div className="circle circle-loader" style={loaderCircleStyle('#00F0FF')}></div>
                        </div>
                        <div className="telemetry-text" style={{ color: '#00F0FF', textShadow: '0 0 10px rgba(0, 240, 255, 0.5)' }}>CHECKING CELLS</div>
                    </div>
                ) : (
                    <div className="graph-fade-in" style={{ flex: 1, position: 'relative', width: '100%' }}>
                        <BatteryChart 
                            historicalData={historicalData} 
                            predictionData={predictionData} 
                        />
                    </div>
                )}
            </div>

        </div>
    </div>
  );
};

export default SolarPage;
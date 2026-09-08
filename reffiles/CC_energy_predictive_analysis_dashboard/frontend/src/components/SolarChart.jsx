import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const SolarChart = ({ historicalData, predictionData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    if (chartRef.current && historicalData.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      
      const formatDate = (timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
          });
      };
      
      const labels = historicalData.map(d => formatDate(d.timestamp));
      const solarData = historicalData.map(d => d.solar_generation_kwh);
      
      const predictionLabels = predictionData.map(p => formatDate(p.timestamp));
      const predictionSolarData = predictionData.map(p => p.predicted_solar_generation_kwh);
      
      const allLabels = [...labels, ...predictionLabels];
      
      const themeYellow = '#FFB800'; 
      const themeRed = '#ff4444'; 
      
      const historicalGradient = ctx.createLinearGradient(0, 0, 0, 400); 
      historicalGradient.addColorStop(0, themeYellow);
      historicalGradient.addColorStop(1, 'rgba(255, 184, 0, 0)');
      
      let predictionPattern = null;
      try {
          const shape = document.createElement('canvas');
          shape.width = 10;
          shape.height = 10;
          const c = shape.getContext('2d');

          c.fillStyle = 'rgba(255, 68, 68, 0.15)';
          c.fillRect(0, 0, shape.width, shape.height);

          c.strokeStyle = 'rgba(255, 68, 68, 0.6)';
          c.lineWidth = 2;
          c.beginPath();
          c.moveTo(0, 10);
          c.lineTo(10, 0);
          c.stroke();
          
          predictionPattern = ctx.createPattern(shape, 'repeat');
      } catch (e) {
          predictionPattern = 'rgba(255, 68, 68, 0.3)';
      }

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: allLabels,
          datasets: [
            {
              label: 'Historical',
              data: solarData,
              backgroundColor: historicalGradient,
              borderColor: themeYellow,
              borderWidth: { top: 2, right: 0, bottom: 0, left: 0 },
              borderRadius: 0,
              barPercentage: 0.95, 
              categoryPercentage: 1.0,
            },
            {
              type: 'bar', 
              label: 'Predicted',
              data: Array(solarData.length).fill(null).concat(predictionSolarData),
              backgroundColor: predictionPattern,
              borderColor: themeRed,
              borderWidth: { top: 2, right: 0, bottom: 0, left: 0 },
              borderRadius: 0,
              barPercentage: 0.95,
              categoryPercentage: 1.0,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          color: '#e0e0e0',
          layout: {
            padding: 0
          },
          animation: {
            duration: 1500, 
            easing: 'easeOutQuart',
            delay: (context) => {
                let delay = 0;
                if (context.type === 'data' && context.mode === 'default' && !context.dropped) {
                    delay = context.dataIndex * 15;
                    context.dropped = true; 
                }
                return delay;
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                display: false 
              },
              border: {
                  display: false 
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)', 
                drawBorder: false
              },
              ticks: {
                display: true, 
                color: '#e0e0e0',
                font: {
                    family: "'Inter', sans-serif",
                    size: 10
                },
                callback: function(value) {
                    return value + ' kWh';
                },
                maxTicksLimit: 5 
              },
              border: {
                  display: false
              }
            }
          },
          plugins: {
            legend: {
              display: false 
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              titleColor: '#fff',
              displayColors: false,
              filter: function(tooltipItem) {
                  return tooltipItem.raw !== null;
              },
              callbacks: {
                  label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                          label += ': ';
                      }
                      if (context.parsed.y !== null) {
                          label += context.parsed.y + ' kWh';
                      }
                      return label;
                  },
                  labelTextColor: function(context) {
                      return context.dataset.label === 'Predicted' ? themeRed : themeYellow;
                  }
              },
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
              padding: 12
            }
          }
        }
      });
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [historicalData, predictionData]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default SolarChart;
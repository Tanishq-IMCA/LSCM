import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const BatteryChart = ({ historicalData, predictionData }) => {
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
      const batteryData = historicalData.map(d => d.battery_charge_percent);
      
      const predictionLabels = predictionData.map(p => formatDate(p.timestamp));
      const predictionBatteryData = predictionData.map(p => p.predicted_battery_charge_percent);
      
      const allLabels = [...labels, ...predictionLabels];
      
      const themeCyan = '#00F0FF'; 
      const themeRed = '#ff4444'; 
      
      const historicalGradient = ctx.createLinearGradient(0, 0, 0, 400); 
      historicalGradient.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
      historicalGradient.addColorStop(1, 'rgba(0, 240, 255, 0)');

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: allLabels,
          datasets: [
            {
              label: 'Historical Battery %',
              data: batteryData,
              backgroundColor: historicalGradient,
              borderColor: themeCyan,
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointBackgroundColor: '#0F0F11',
              pointBorderColor: themeCyan,
              pointBorderWidth: 2,
            },
            {
              label: 'Predicted Battery %',
              data: Array(batteryData.length - 1).fill(null).concat(
                  batteryData[batteryData.length - 1],
                  predictionBatteryData
              ),
              borderColor: themeRed,
              borderDash: [5, 5],
              borderWidth: 2,
              tension: 0.4,
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointBackgroundColor: '#0F0F11',
              pointBorderColor: themeRed,
              pointBorderWidth: 2,
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
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: 'var(--text-muted)', 
                font: { family: "'Space Mono', monospace", size: 9 },
                maxTicksLimit: 10,
                maxRotation: 0,
                autoSkip: true,
              },
              border: { display: false }
            },
            y: {
              beginAtZero: true,
              max: 100, // Battery is 0-100%
              grid: {
                color: 'rgba(255, 255, 255, 0.05)', 
                drawBorder: false,
                borderDash: [5, 5]
              },
              ticks: {
                display: true, 
                color: 'var(--text-muted)',
                font: { family: "'Space Mono', monospace", size: 10 },
                callback: function(value) {
                    return value + '%';
                },
                maxTicksLimit: 5
              },
              border: { display: false }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              titleColor: '#fff',
              titleFont: { family: "'Space Mono', monospace" },
              bodyFont: { family: "'Space Mono', monospace", weight: 'bold' },
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                  label: function(context) {
                      return context.parsed.y.toFixed(1) + '% Charge';
                  },
                  labelTextColor: function(context) {
                      return context.dataset.label.includes('Predicted') ? themeRed : themeCyan;
                  }
              }
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
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
        <canvas ref={chartRef} />
    </div>
  );
};

export default BatteryChart;
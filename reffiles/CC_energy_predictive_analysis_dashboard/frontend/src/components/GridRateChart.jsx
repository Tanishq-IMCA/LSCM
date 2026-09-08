import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const GridRateChart = ({ gridRates }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    if (chartRef.current && gridRates && gridRates.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      
      const labels = gridRates.map(r => r.time);
      const data = gridRates.map(r => r.rate);
      
      const maxRate = Math.max(...data);
      const minRate = Math.min(...data);
      const avgRate = data.reduce((a, b) => a + b, 0) / data.length;
      
      const themeGreen = '#4ADE80';
      const themeYellow = '#FFB800'; 
      const themeRed = '#ff4444'; 

      const getGradient = (ctx, chartArea) => {
          let gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          const chartMax = maxRate * 1.1; 
          
          const lowStop = Math.min(1, Math.max(0, minRate / chartMax));
          const avgStop = Math.min(1, Math.max(0, avgRate / chartMax));
          const highStop = Math.min(1, Math.max(0, maxRate / chartMax));

          gradient.addColorStop(0, themeGreen);
          gradient.addColorStop(lowStop, themeGreen);
          gradient.addColorStop(avgStop, themeYellow);
          gradient.addColorStop(highStop, themeRed);
          gradient.addColorStop(1, themeRed);
          
          return gradient;
      };
      
      const getFillGradient = (ctx, chartArea) => {
          let gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          const chartMax = maxRate * 1.1;
          
          const lowStop = Math.min(1, Math.max(0, minRate / chartMax));
          const avgStop = Math.min(1, Math.max(0, avgRate / chartMax));
          const highStop = Math.min(1, Math.max(0, maxRate / chartMax));

          gradient.addColorStop(0, 'rgba(74, 222, 128, 0)'); 
          gradient.addColorStop(lowStop, 'rgba(74, 222, 128, 0.1)');
          gradient.addColorStop(avgStop, 'rgba(255, 184, 0, 0.2)');
          gradient.addColorStop(highStop, 'rgba(255, 68, 68, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 68, 68, 0.4)');
          
          return gradient;
      };

      // Helper function to safely get color without risking Chart.js recursion loops
      const getColorForValue = (value) => {
          if (value >= avgRate + (maxRate - avgRate)/2) return themeRed;
          if (value >= minRate + (avgRate - minRate)/2) return themeYellow;
          return themeGreen;
      };

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'US Grid Rate ($/kWh)',
              data: data,
              backgroundColor: function(context) {
                  const chart = context.chart;
                  const {ctx, chartArea} = chart;
                  if (!chartArea) return null;
                  return getFillGradient(ctx, chartArea);
              },
              borderColor: function(context) {
                  const chart = context.chart;
                  const {ctx, chartArea} = chart;
                  if (!chartArea) return null;
                  return getGradient(ctx, chartArea);
              },
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 6, // Make hover point slightly larger to show off the color
              pointBackgroundColor: '#0F0F11',
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
          elements: {
              point: {
                  // Apply dynamic color to the hover dot
                  borderColor: (context) => {
                      if (context.type !== 'data') return themeGreen;
                      return getColorForValue(context.raw);
                  }
              }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: 'var(--text-muted)', 
                font: { family: "'Space Mono', monospace", size: 9 },
                maxTicksLimit: 6 
              },
              border: { display: false }
            },
            y: {
              beginAtZero: true,
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
                    return '$' + value.toFixed(2);
                },
                maxTicksLimit: 4
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
              // Removed dynamic bodyColor here to stop the recursion crash.
              // Instead we handle text color specifically inside the callbacks.
              bodyFont: { family: "'Space Mono', monospace", weight: 'bold' },
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                  label: function(context) {
                      return '$' + context.parsed.y.toFixed(3) + ' / kWh';
                  },
                  // Safely apply the color to the specific text label string
                  labelTextColor: function(context) {
                      return getColorForValue(context.raw);
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
  }, [gridRates]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace", zIndex: 1 }}>
            LIVE FEED • KWH / USD
        </div>
        <canvas ref={chartRef} />
    </div>
  );
};

export default GridRateChart;
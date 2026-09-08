import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/main.css';
import DashboardLayout from './components/DashboardLayout';

// Set the base URL for the FastAPI backend
const API_URL = 'http://localhost:8000/api';

function App() {
  const [historicalData, setHistoricalData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [gridRates, setGridRates] = useState([]);
  const [filter, setFilter] = useState('month'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // App-level state for UI routing and settings
  const [activePage, setActivePage] = useState('dashboard');
  const [frostLevel, setFrostLevel] = useState(35); // Default 35px blur from new code

  // Update CSS variable live when frostLevel changes.
  useEffect(() => {
      let animationFrameId;
      const updateBlur = () => {
          document.documentElement.style.setProperty('--glass-blur', `blur(${frostLevel}px)`);
      };
      
      animationFrameId = requestAnimationFrame(updateBlur);
      
      return () => cancelAnimationFrame(animationFrameId);
  }, [frostLevel]);

  // Set the background wallpaper on component mount directly to the body
  // Using fixed attachment prevents the "half-white screen" scrolling issue
  useEffect(() => {
      document.body.style.backgroundImage = `url('/wallpaper.jpeg')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.minHeight = '100vh';
      document.body.style.margin = '0';
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [histResponse, predResponse, ratesResponse] = await Promise.all([
          axios.get(`${API_URL}/dashboard_data`, { params: { filter_type: filter } }),
          axios.get(`${API_URL}/predict`, { params: { days_ahead: 7 } }),
          axios.get(`${API_URL}/grid_rates`)
        ]);
        
        setHistoricalData(histResponse.data);
        setPredictionData(predResponse.data);
        setGridRates(ratesResponse.data);
        
      } catch (err) {
        setError('Failed to fetch data. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  return (
    <div className="App">
      <DashboardLayout
        historicalData={historicalData}
        predictionData={predictionData}
        gridRates={gridRates}
        filter={filter}
        setFilter={setFilter}
        loading={loading}
        error={error}
        activePage={activePage}
        setActivePage={setActivePage}
      />
    </div>
  );
}

export default App;
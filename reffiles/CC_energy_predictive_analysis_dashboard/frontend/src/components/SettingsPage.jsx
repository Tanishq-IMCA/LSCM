import React from 'react';
import '../styles/main.css';

const SettingsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="title-underline-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                  <h1 className="dashboard-title" data-text="SYSTEM SETTINGS">
                      SYSTEM SETTINGS
                  </h1>
                  <div className="themed-wave-line"></div>
              </div>
          </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '10vh' }}>
        
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', justifyContent: 'center', padding: '60px 80px', maxWidth: '800px', width: '100%' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--accent-orange)', fontSize: '2.5rem', textShadow: '0 0 15px var(--accent-glow)', marginRight: '20px' }}></i>
                <div className="title-underline-wrapper">
                    <h1 className="dashboard-title" data-text="PAGE UNDER DEVELOPMENT!">
                        PAGE UNDER DEVELOPMENT!
                    </h1>
                    <div className="themed-wave-line"></div>
                </div>
            </div>

            <p style={{ color: 'var(--text-muted)', margin: 0, textAlign: 'center', fontSize: '1.2rem', letterSpacing: '1px' }}>
                System configuration parameters are currently being integrated. Please check back later.
            </p>
        </div>
        
      </div>
    </div>
  );
};

export default SettingsPage;
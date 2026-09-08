import React from 'react';
import './App.css';
import cipherGlass from './assets/wallpapers/Cipher Glass.jpeg';

const navItems = [
  { label: 'Home', short: 'HM', active: true },
  { label: 'Social', short: 'SO' },
  { label: 'Finance', short: 'FN' },
  { label: 'Tasks', short: 'TS' },
  { label: 'Schedule', short: 'SC' },
  { label: 'Calendar', short: 'CL' },
  { label: 'Health', short: 'HL' },
  { label: 'Settings', short: 'ST' },
];

function App() {
  return (
    <main
      className="desktop-shell"
      style={{
        backgroundImage: `url(${cipherGlass})`,
      }}
    >
      <section className="workspace">

        <div className="glass-stage" aria-label="Main workspace panel" />
      </section>

      <nav className="dock" aria-label="Primary">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`dock-item${item.active ? ' dock-item--active' : ''}`}
            type="button"
            aria-current={item.active ? 'page' : undefined}
            title={item.label}
          >
            <span className="dock-item__glyph" aria-hidden="true">
              {item.short}
            </span>
            <span className="dock-item__label">{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}

export default App;

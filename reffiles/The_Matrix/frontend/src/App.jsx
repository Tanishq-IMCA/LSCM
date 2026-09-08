import React, { useEffect, useRef } from 'react'
import './index.css'

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;

    let particles = [];
    let mouse = { x: -1000, y: -1000, radius: 150 };

    const CONFIG = {
        bgColor: '#08080a',
        dotColor: '255, 50, 50', // RED DOTS
        dotSize: 1.5,
        spacing: 29, 
        friction: 0.85,    
        ease: 0.1,         
        repelForce: 20,
        bootDuration: 0
    };

    let bootStartTime = Date.now();

    function initCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
        bootStartTime = Date.now();
    }

    class Particle {
        constructor(x, y, centerX, centerY) {
            this.originX = x;
            this.originY = y;
            
            this.x = centerX;
            this.y = centerY;
            
            const randomAngle = Math.random() * Math.PI * 2;
            const randomVelocity = Math.random() * 50 + 20; 
            
            this.vx = Math.cos(randomAngle) * randomVelocity;
            this.vy = Math.sin(randomAngle) * randomVelocity;
            
            if (Math.random() < 0.20) {
                this.baseAlpha = 0.15 + Math.random() * 0.15;
            } else {
                this.baseAlpha = 0.6 + Math.random() * 0.4;
            }
        }

        draw() {
            ctx.fillStyle = `rgba(${CONFIG.dotColor}, ${this.baseAlpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, CONFIG.dotSize, 0, Math.PI * 2);
            ctx.fill();
        }

        update(timeElapsed) {
            let isBooting = timeElapsed < CONFIG.bootDuration;
            
            let currentFriction;
            let currentEase;
            let progress = isBooting ? (timeElapsed / CONFIG.bootDuration) : 1;

            if (isBooting) {
                if (progress < 0.20) {
                    currentFriction = 0.95; 
                    currentEase = 0; 
                    
                    if (this.x < 0) { this.x = 0; this.vx *= -0.8; }
                    if (this.x > canvas.width) { this.x = canvas.width; this.vx *= -0.8; }
                    if (this.y < 0) { this.y = 0; this.vy *= -0.8; }
                    if (this.y > canvas.height) { this.y = canvas.height; this.vy *= -0.8; }
                    
                } else if (progress < 0.85) {
                    let easeProgress = (progress - 0.20) / 0.65; 
                    currentFriction = 0.65; 
                    currentEase = (easeProgress * easeProgress) * 0.4;
                } else {
                    currentFriction = 0.10; 
                    currentEase = 0.90; 
                }
            } else {
                currentFriction = CONFIG.friction;
                currentEase = CONFIG.ease;
            }

            if (!isBooting) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * CONFIG.repelForce;
                    let directionY = forceDirectionY * force * CONFIG.repelForce;

                    this.vx -= directionX;
                    this.vy -= directionY;
                }
            }

            this.vx += (this.originX - this.x) * currentEase;
            this.vy += (this.originY - this.y) * currentEase;
            
            this.vx *= currentFriction;
            this.vy *= currentFriction;
            
            this.x += this.vx;
            this.y += this.vy;

            this.draw();
        }
    }

    function initParticles() {
        particles = [];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        for (let y = 0; y < canvas.height; y += CONFIG.spacing) {
            for (let x = 0; x < canvas.width; x += CONFIG.spacing) {
                particles.push(new Particle(x, y, centerX, centerY));
            }
        }
    }

    function animate() {
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(-10, -10, canvas.width + 20, canvas.height + 20);

        let timeElapsed = Date.now() - bootStartTime;

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(timeElapsed);
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    const handleResize = () => initCanvas();
    
    const handleMouseMove = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };
    const handleMouseOut = () => {
        mouse.x = -1000;
        mouse.y = -1000;
    };

    const handleTouchMove = (e) => {
        if (e.target.tagName.toLowerCase() !== 'input' && e.target.tagName.toLowerCase() !== 'button') {
             e.preventDefault();
        }
        
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    };
    const handleTouchEnd = () => {
        mouse.x = -1000;
        mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);
    
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    initCanvas();
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseout', handleMouseOut);
        
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchstart', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('touchcancel', handleTouchEnd);
        
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'none', 
          display: 'block' 
        }}
      />
      
      {/* MAIN DASHBOARD LAYOUT */}
      <div 
        style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        height: '100vh',
        padding: '50px 30px 80px 30px', 
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Top Header Area */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '30px',
          pointerEvents: 'auto'
        }}>
          <div className="title-underline-wrapper">
            <h1 className="title-font dashboard-title">MATRIX OS</h1>
            <div className="themed-wave-line"></div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '25px',
          flex: 1, 
          minHeight: 0 
        }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ display: 'flex', gap: '20px', height: '100px' }}>
              <div className="glass-panel" style={{ flex: 1, pointerEvents: 'auto' }}></div>
              <div className="glass-panel" style={{ flex: 1, pointerEvents: 'auto' }}></div>
              <div className="glass-panel" style={{ flex: 1, pointerEvents: 'auto' }}></div>
            </div>
            <div className="glass-panel" style={{ flex: 1, pointerEvents: 'auto' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div className="glass-panel" style={{ height: '220px', pointerEvents: 'auto' }}></div>
            <div className="glass-panel" style={{ flex: 1, pointerEvents: 'auto' }}></div>
          </div>

        </div>
      </div>
    </>
  )
}

export default App
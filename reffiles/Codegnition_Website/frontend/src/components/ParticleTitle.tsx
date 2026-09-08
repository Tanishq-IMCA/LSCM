'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  noiseSeedX: number;
  noiseSeedY: number;
};

const simpleNoise = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export default function ParticleTitle({ text, className }: { text: string, className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let time = 0;
    let textBoundaryWidth = 800;

    const initParticles = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      const computedStyles = getComputedStyle(container);
      const fontFamily = computedStyles.fontFamily;
      const fontSize = computedStyles.fontSize;
      
      ctx.font = `${fontSize} ${fontFamily}`;
      textBoundaryWidth = ctx.measureText(text).width;

      particles = [];
      const particleCount = 250;

      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * textBoundaryWidth * 1.2 - (textBoundaryWidth * 0.1);
        const y = Math.random() * rect.height;
        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 1.2 + 0.8,
          color: 'rgba(255, 255, 255, 0.25)',
          noiseSeedX: Math.random() * 100,
          noiseSeedY: Math.random() * 100,
        });
      }
    };

    const animate = () => {
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008;

      particles.forEach((p) => {
        const noiseX = (simpleNoise(p.noiseSeedX + time) - 0.5) * 0.2;
        const noiseY = (simpleNoise(p.noiseSeedY + time) - 0.5) * 0.2;
        p.vx += noiseX;
        p.vy += noiseY;

        const friction = 0.96;
        p.vx *= friction;
        p.vy *= friction;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.size) p.x = rect.width + p.size;
        if (p.x > rect.width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = rect.height + p.size;
        if (p.y > rect.height + p.size) p.y = -p.size;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      cancelAnimationFrame(animationFrameId);
      initParticles();
      animate();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    
    document.fonts.ready.then(() => {
        initParticles();
        animate();
    });

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [text]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <span className="relative z-10">{text}</span>
    </div>
  );
}
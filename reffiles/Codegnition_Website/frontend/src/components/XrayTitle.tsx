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
  isDust: boolean;
  isDisturbed: boolean;
};

const simpleNoise = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export default function XrayTitle({ text, className }: { text: string, className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let time = 0;
    let textBoundaryWidth = 0;

    const mouse = {
      x: -9999,
      y: -9999,
      radius: 80,
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
    };

    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handlePointerLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', handlePointerLeave);
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', handlePointerLeave);
    container.addEventListener('touchcancel', handlePointerLeave);

    const initParticles = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      
      // Prevent IndexSizeError on some browsers if container is 0x0
      if (rect.width <= 0 || rect.height <= 0) return;

      canvas.width = Math.max(1, Math.ceil(rect.width * dpr));
      canvas.height = Math.max(1, Math.ceil(rect.height * dpr));
      ctx.scale(dpr, dpr);

      const computedStyles = getComputedStyle(container);
      const fontFamily = computedStyles.fontFamily;
      const fontSize = computedStyles.fontSize;
      const fontString = `${fontSize} ${fontFamily}`;
      ctx.font = fontString;

      textBoundaryWidth = ctx.measureText(text).width;

      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, rect.height / 2);

      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e) {
        console.error("Canvas getImageData failed:", e);
        return;
      }

      const data = imageData.data;
      const imgWidth = imageData.width;
      const imgHeight = imageData.height;
      particles = [];
      const step = 4; // Sample every 4 logical pixels

      for (let y = 0; y < rect.height; y += step) {
        for (let x = 0; x < rect.width; x += step) {
          const canvasX = Math.floor(x * dpr);
          const canvasY = Math.floor(y * dpr);

          if (canvasX >= imgWidth || canvasY >= imgHeight) continue;

          const index = (canvasY * imgWidth + canvasX) * 4;
          if (data[index + 3] > 128) {
            particles.push({
              x: x, y: y,
              originX: x, originY: y,
              vx: 0, vy: 0,
              size: 1.2,
              color: 'rgba(255, 255, 255, 0.85)',
              noiseSeedX: Math.random() * 100, noiseSeedY: Math.random() * 100,
              isDust: false, isDisturbed: false,
            });
          }
        }
      }

      const dustCount = Math.floor((rect.width * rect.height) / 1000);
      for (let i = 0; i < dustCount; i++) {
        particles.push({
          x: Math.random() * rect.width, y: Math.random() * rect.height,
          originX: Math.random() * rect.width, originY: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 1.5 + 1,
          color: 'rgba(255, 255, 255, 0.4)',
          noiseSeedX: Math.random() * 100, noiseSeedY: Math.random() * 100,
          isDust: true, isDisturbed: false,
        });
      }
    };

    const animate = () => {
      const rect = container.getBoundingClientRect();

      // Ensure canvas hasn't been collapsed before drawing
      if (rect.width <= 0 || rect.height <= 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, rect.width, rect.height);
      time += 0.005;

      const computedStyles = getComputedStyle(container);
      const fontFamily = computedStyles.fontFamily;
      const fontSize = computedStyles.fontSize;
      const fontString = `${fontSize} ${fontFamily}`;
      ctx.font = fontString;
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, rect.height / 2);

      // Create the hole in the text
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      // Draw the skeleton xray inside the hole
      ctx.save();
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.strokeText(text, 0, rect.height / 2);
      ctx.restore();

      particles.forEach((p) => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          p.isDisturbed = true;
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force * 0.5;
          p.vy -= Math.sin(angle) * force * 0.5;
        }

        if (p.isDisturbed || p.isDust) {
          const noiseX = (simpleNoise(p.noiseSeedX + time) - 0.5) * 0.5;
          const noiseY = (simpleNoise(p.noiseSeedY + time) - 0.5) * 0.5;
          p.vx += noiseX;
          p.vy += noiseY;
        }
        
        if (!p.isDust && !p.isDisturbed) {
            const returnForce = 0.05;
            p.vx += (p.originX - p.x) * returnForce;
            p.vy += (p.originY - p.y) * returnForce;
        }

        if (p.isDust) {
            if (p.x < 0) p.x = rect.width;
            if (p.x > rect.width) p.x = 0;
            if (p.y < 0) p.y = rect.height;
            if (p.y > rect.height) p.y = 0;
        }

        const friction = 0.96;
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        if (p.isDisturbed && !p.isDust && Math.abs(p.vx) < 0.1 && Math.abs(p.vy) < 0.1) {
            const distToOrigin = Math.sqrt(Math.pow(p.originX - p.x, 2) + Math.pow(p.originY - p.y, 2));
            if (distToOrigin < 1) p.isDisturbed = false;
        }
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
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', handlePointerLeave);
      container.removeEventListener('touchcancel', handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full touch-none cursor-crosshair ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
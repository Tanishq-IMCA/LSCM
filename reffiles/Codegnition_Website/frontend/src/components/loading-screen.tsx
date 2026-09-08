'use client';

import { useEffect, useState } from 'react';
import { useLoading } from '@/context/LoadingContext';

export default function LoadingScreen() {
  const { setLoading } = useLoading();
  const [isMounted, setIsMounted] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 1500); // Hold the screen for 1.5s

      const hideTimer = setTimeout(() => {
        setIsHidden(true);
        setLoading(false); // Signal that loading is complete
      }, 2500); // Fade out over 1s

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isMounted, setLoading]);

  if (isHidden) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#050816',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 1s ease-in-out',
        opacity: isFading ? 0 : 1,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          color: 'white',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: isFading ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
        }}
      >
        CODEGNITION
      </div>
    </div>
  );
}
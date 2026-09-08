'use client';

import { useEffect, useRef, useState } from 'react';

const LOADER_MIN = 5000;
const LOADER_MAX = 10000;

export default function ExperienceLayer() {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const durationRef = useRef(LOADER_MIN + Math.floor(Math.random() * (LOADER_MAX - LOADER_MIN + 1)));
  const videoRef = useRef<HTMLVideoElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const clickRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const duration = durationRef.current;
    const startedAt = performance.now();
    const progressTimer = window.setInterval(() => {
      setProgress(Math.min(((performance.now() - startedAt) / duration) * 100, 100));
    }, 50);
    const fadeTimer = window.setTimeout(() => setIsFading(true), duration - 1000);
    const hideTimer = window.setTimeout(() => setIsHidden(true), duration);

    const unlockAudio = () => {
      void musicRef.current?.play().catch(() => undefined);
      document.removeEventListener('pointerdown', unlockAudio);
    };
    document.addEventListener('pointerdown', unlockAudio, { passive: true });

    void videoRef.current?.play().catch(() => undefined);
    void musicRef.current?.play().catch(() => undefined);

    const playClickSound = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest(
        'a,button,input,select,textarea,summary,[role="button"],[tabindex]:not([tabindex="-1"])',
      );
      if (!interactive || !clickRef.current) return;
      clickRef.current.currentTime = 0;
      void clickRef.current.play().catch(() => undefined);
      void musicRef.current?.play().catch(() => undefined);
    };
    document.addEventListener('click', playClickSound, true);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('click', playClickSound, true);
    };
  }, []);

  return (
    <>
      <audio ref={musicRef} src="/bg.mp4" loop preload="auto" aria-hidden="true" />
      <audio ref={clickRef} src="/click.mp3" preload="auto" aria-hidden="true" />
      {!isHidden && (
        <div className={`loader-screen ${isFading ? 'loader-screen--fading' : ''}`} aria-label="Loading LSCM">
          <video
            ref={videoRef}
            className={`loader-screen__video ${isFading ? 'loader-screen__video--blurred' : ''}`}
            src="/bg.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
          />
          <div className="loader-screen__shade" />
          <div className="loader-screen__brand">
            <span className="loader-screen__eyebrow">LSCM // LOS SANTOS CAR MODDERS</span>
            <strong>NEO</strong>
            <span className="loader-screen__status">LOADING COMMUNITY SERVICES</span>
          </div>
          <div className="loader-screen__progress">
            <div className="loader-screen__progress-meta">
              <span>INITIALIZING</span>
              <span>{Math.round(progress).toString().padStart(3, '0')}%</span>
            </div>
            <div className="loader-screen__bar">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
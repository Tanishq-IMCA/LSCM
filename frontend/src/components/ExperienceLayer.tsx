'use client';

import { useEffect, useRef, useState } from 'react';

export default function ExperienceLayer() {
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaderFading, setIsLoaderFading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isScreensaver, setIsScreensaver] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const clickRef = useRef<HTMLAudioElement>(null);
  const reverseRef = useRef(false);
  const reverseFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const unlockAudio = () => {
      if (!isMuted) void musicRef.current?.play().catch(() => undefined);
      document.removeEventListener('pointerdown', unlockAudio);
    };
    document.addEventListener('pointerdown', unlockAudio, { passive: true });

    void videoRef.current?.play().catch(() => undefined);

    const playClickSound = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest(
        'a,button,input,select,textarea,summary,[role="button"],[tabindex]:not([tabindex="-1"])',
      );
      if (!interactive || !clickRef.current) return;
      clickRef.current.currentTime = 0;
      void clickRef.current.play().catch(() => undefined);
      if (!isMuted) void musicRef.current?.play().catch(() => undefined);
    };
    document.addEventListener('click', playClickSound, true);

    return () => {
      if (reverseFrameRef.current) cancelAnimationFrame(reverseFrameRef.current);
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('click', playClickSound, true);
    };
  }, [isMuted]);

  useEffect(() => {
    const startedAt = Date.now();
    const loaderDuration = 8000;
    const progressDuration = 7400;
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setLoadProgress(Math.min(92, Math.round((elapsed / progressDuration) * 92)));
    }, 50);
    const finishTimer = window.setTimeout(() => {
      window.clearInterval(progressTimer);
      setLoadProgress(100);
      setIsLoaderFading(true);
      window.setTimeout(() => setIsLoading(false), 950);
    }, loaderDuration);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('screensaver-active', isScreensaver);
    return () => document.body.classList.remove('screensaver-active');
  }, [isScreensaver]);

  const reverseVideo = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.pause();
    reverseRef.current = true;
    const stepBack = () => {
      if (!reverseRef.current || !videoRef.current) return;
      const current = videoRef.current.currentTime;
      if (current <= 0.04) {
        reverseRef.current = false;
        videoRef.current.currentTime = 0;
        void videoRef.current.play().catch(() => undefined);
        return;
      }
      videoRef.current.currentTime = Math.max(0, current - 0.035);
      reverseFrameRef.current = requestAnimationFrame(stepBack);
    };
    reverseFrameRef.current = requestAnimationFrame(stepBack);
  };

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPaused) {
      setIsPaused(false);
      reverseRef.current = false;
      void video.play().catch(() => undefined);
    } else {
      setIsPaused(true);
      video.pause();
    }
  };

  const toggleAudio = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (musicRef.current) {
      musicRef.current.muted = nextMuted;
      if (!nextMuted) void musicRef.current.play().catch(() => undefined);
      else musicRef.current.pause();
    }
  };

  return (
    <div className="experience-layer">
      <audio ref={musicRef} src="/lscm-theme.mp3" loop preload="auto" muted={isMuted} aria-hidden="true" />
      <audio ref={clickRef} src="/click.mp3" preload="auto" aria-hidden="true" />
      <video
        ref={videoRef}
        className={`video-wallpaper ${isPaused ? 'video-wallpaper--paused' : ''}`}
        src="/bg.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={reverseVideo}
        aria-hidden="true"
      />
      <div className={`wallpaper-controls ${isScreensaver ? 'wallpaper-controls--hidden' : ''}`} aria-label="Wallpaper controls">
        <button type="button" onClick={toggleAudio} title={isMuted ? 'Unmute LSCM music' : 'Mute LSCM music'}>
          {isMuted ? 'AUDIO OFF' : 'AUDIO ON'}
        </button>
        <button type="button" onClick={toggleVideo} title={isPaused ? 'Play background video' : 'Pause background video'}>
          {isPaused ? 'PLAY WALLPAPER' : 'PAUSE WALLPAPER'}
        </button>
        <button
          type="button"
          onClick={() => setIsScreensaver(true)}
          className="wallpaper-icon-button"
          title="Enter screensaver mode"
          aria-label="Enter screensaver mode"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="1" />
            <circle cx="8" cy="9" r="1.5" />
            <path d="m5 17 4-4 3 3 2-2 5 3" />
          </svg>
        </button>
      </div>
      {isScreensaver && (
        <div className="screensaver-overlay" aria-label="Screensaver mode">
          <button
            type="button"
            className="screensaver-overlay__button wallpaper-icon-button"
            onClick={() => setIsScreensaver(false)}
            title="Exit screensaver mode"
            aria-label="Exit screensaver mode"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="1" />
              <circle cx="8" cy="9" r="1.5" />
              <path d="m5 17 4-4 3 3 2-2 5 3" />
            </svg>
          </button>
          <div className="screensaver-overlay__brand">LSCM</div>
        </div>
      )}
      {isLoading && (
        <div className={`loader-screen ${isLoaderFading ? 'loader-screen--fading' : ''}`} role="status" aria-live="polite">
          <video
            className="loader-screen__video"
            src="/bg.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="loader-screen__shade" />
          <div className="loader-screen__brand loader-screen__brand--corner z-10">
            <span className="loader-screen__eyebrow">Los Santos Car Modders</span>
            <strong>LSCM</strong>
            <span className="loader-screen__status">Initializing community services</span>
          </div>
          <div className="loader-screen__progress">
            <div className="loader-screen__progress-meta">
              <span>Loading experience</span>
              <span>{loadProgress}%</span>
            </div>
            <div className="loader-screen__bar">
              <span style={{ width: `${loadProgress}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
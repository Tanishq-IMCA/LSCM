'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('password'); // 'password', 'faceid-setup', '2fa-setup', '2fa-verify'
  const [twoFACode, setTwoFACode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleApiError = (err: any, context: string) => {
    if (err.message.includes('Failed to fetch')) {
      setError(`Network Error: Could not connect to the API at ${API_BASE_URL}. Please ensure the backend server is running. [${context}]`);
    } else {
      setError(err instanceof Error ? err.message : `An unknown error occurred. [${context}]`);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== 'Tanishq@1234') {
      setError('Invalid password');
      return;
    }
    
    setIsLoading(true);
    try {
      const statusRes = await fetch(`${API_BASE_URL}/2fa/status`);
      if (!statusRes.ok) throw new Error('Failed to get 2FA status from server.');
      const statusData = await statusRes.json();

      if (statusData.is_configured) {
        setStep('2fa-verify');
      } else {
        const generateRes = await fetch(`${API_BASE_URL}/2fa/generate`);
        if (!generateRes.ok) throw new Error('Failed to generate QR code from server.');
        const data = await generateRes.json();
        setQrCode(data.qr_code);
        setStep('2fa-setup');
      }
    } catch (err) {
      handleApiError(err, 'password submission');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: twoFACode }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid 2FA token.');
      }
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      router.push('/admin');
    } catch (err) {
      handleApiError(err, '2FA verification');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFaceID = () => {
    if (localStorage.getItem('faceIdRegistered') === 'true') {
      setIsLoading(true);
      setTimeout(() => {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        router.push('/admin');
      }, 1000);
    } else {
      setStep('faceid-setup');
    }
  };

  const handleFaceIDSetup = () => {
    setError('');
    if (password !== 'Tanishq@1234') {
      setError('Invalid password required to set up Face ID.');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('faceIdRegistered', 'true');
      setIsLoading(false);
      handleFaceID();
    }, 2000);
  };

  const renderStep = () => {
    // The JSX for the steps remains the same...
    switch (step) {
        case 'password':
          return (
            <motion.div key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl text-white font-display uppercase tracking-widest mb-8 text-center md:text-left">Authentication</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <input type="password" placeholder="ENTER PASSPHRASE" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all uppercase tracking-widest text-sm" disabled={isLoading} />
                </div>
                {error && <p className="text-red-400 text-xs uppercase tracking-widest">{error}</p>}
                <div className="flex items-center gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-white/90 transition-colors" disabled={isLoading}>{isLoading ? 'Authenticating...' : 'Authenticate'}</button>
                  <button type="button" onClick={handleFaceID} className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all group" title="Use Face ID" disabled={isLoading}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 group-hover:text-white transition-colors"><path d="M7 3h-2c-1.105 0-2 .895-2 2v2" /><path d="M17 3h2c1.105 0 2 .895 2 2v2" /><path d="M7 21h-2c-1.105 0-2-.895-2-2v-2" /><path d="M17 21h2c1.105 0 2-.895 2-2v-2" /><path d="M9 10a3 3 0 0 1 6 0v2a3 3 0 0 1-6 0z" /><path d="M12 16v.01" /></svg>
                  </button>
                </div>
              </form>
            </motion.div>
          );
        case 'faceid-setup':
          return (
            <motion.div key="faceid-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h2 className="text-2xl text-white font-display uppercase tracking-widest mb-4">Setup Face ID</h2>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-6">Enter your password to register this device.</p>
              <form onSubmit={(e) => { e.preventDefault(); handleFaceIDSetup(); }} className="space-y-4">
                <input type="password" placeholder="ENTER PASSPHRASE" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all uppercase tracking-widest text-sm" disabled={isLoading} />
                {error && <p className="text-red-400 text-xs uppercase tracking-widest">{error}</p>}
                <button type="submit" className="w-full bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-white/90 transition-colors" disabled={isLoading}>{isLoading ? 'Scanning...' : 'Register Face ID'}</button>
                <button type="button" onClick={() => setStep('password')} className="text-white/50 text-xs uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
              </form>
            </motion.div>
          );
        case '2fa-setup':
          return (
            <motion.div key="2fa-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h2 className="text-2xl text-white font-display uppercase tracking-widest mb-4">Setup 2FA</h2>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-6">Scan this QR code with your authenticator app</p>
              <div className="flex justify-center mb-6 p-2 bg-white rounded-lg">
                {qrCode ? <img src={qrCode} alt="2FA QR Code" /> : <p className="text-black">Loading QR Code...</p>}
              </div>
              <button onClick={() => setStep('2fa-verify')} className="w-full bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-white/90 transition-colors">I have scanned, proceed to verify</button>
            </motion.div>
          );
        case '2fa-verify':
          return (
            <motion.div key="2fa-verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl text-white font-display uppercase tracking-widest mb-8 text-center md:text-left">Verification</h2>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-6">Enter 6-digit authenticator code</p>
              <form onSubmit={handle2FASubmit} className="space-y-6">
                <div>
                  <input type="text" placeholder="000000" value={twoFACode} onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-white text-center tracking-[0.5em] text-xl placeholder:text-white/20 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all" disabled={isLoading} />
                </div>
                {error && <p className="text-red-400 text-xs uppercase tracking-widest text-center">{error}</p>}
                <div className="pt-4">
                  <button type="submit" className="w-full bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-white/90 transition-colors" disabled={isLoading}>{isLoading ? 'Verifying...' : 'Verify & Proceed'}</button>
                </div>
              </form>
            </motion.div>
          );
        default:
          return null;
      }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="w-full max-w-4xl grid md:grid-cols-[1fr,1px,1fr] gap-8 items-center relative z-10">
        <div className="text-center md:text-right hidden md:block">
          <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-wider text-white mb-4 stencil-text swish-reflection">System<br />Override</h1>
          <p className="text-white/60 tracking-widest uppercase text-sm">Restricted Access<br />Authorized Personnel Only</p>
        </div>
        <div className="hidden md:block w-[1px] h-64 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl w-full max-w-md mx-auto relative overflow-hidden">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
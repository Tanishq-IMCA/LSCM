'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-10 border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div
          className="text-sm tracking-[0.26em] uppercase text-white/22"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <div className="flex items-center gap-3">
            <img src="/grayscalemini.png" alt="LSCM" className="h-8 w-auto opacity-70" />
            <span className="text-[11px] tracking-[0.28em] text-white/35">ALL THE LSCM</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {['Features', 'How It Works', 'About', 'Store'].map((link) => (
           <Link
              key={link}
              href={link === 'About' ? '/about' : link === 'Store' ? '/store' : link === 'Features' ? '/#features' : '/#how'}
              className="text-[11px] uppercase tracking-[0.28em] text-white/18 hover:text-white/45 transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
             >
              {link}
            </Link>
          ))}
          <div className="text-[11px] tracking-[0.2em] text-white/18 hover:text-white/40 transition-colors" style={{ fontFamily: 'var(--font-mono)' }}>
            Legal — visit <Link href="/legal" className="underline decoration-white/20 hover:decoration-white/50 underline-offset-2">Terms</Link>
          </div>
        </div>
        <div
          className="text-[11px] tracking-[0.2em] text-white/15"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          © 2026 — LOS SANTOS CAR MODDERS // ALL RIGHTS RESERVED
        </div>
      </div>
    </footer>
  );
}

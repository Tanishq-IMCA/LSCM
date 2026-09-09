'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Header } from '@/components/Landing/Header';
import { Footer } from '@/components/Landing/Footer';
import GlitchyText from '@/components/ui/GlitchyText';
import Link from 'next/link';

const sections = [
  ['Community & Company Information', 'LSCM is an independent GTA V modding community operated by its management team. LSCM is not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive.'],
  ['Joining & Service Requests', 'Join the official Discord to see live availability, ask questions and request support. The website catalogue introduces the services; management confirms the final scope, timing and delivery details.'],
  ['Community Conduct', 'Be respectful, do not spam or harass members, do not impersonate staff, and follow moderator instructions during heists and service delivery. Management may refuse service for abusive or disruptive behaviour.'],
  ['Heist & Gameplay Guidelines', 'Heist slots are shared live in Discord. Premium heists are limited to two runs per 30 minutes. Current scheduled availability is Monday–Friday, 9am–3pm CST, with Thursday reserved for modded car requests. Follow community earning limits and cooldowns.'],
  ['Payments & Delivery', 'Prices shown in the store are catalogue guidance and may change with availability. Confirm payment instructions only through official management channels. Service timing is estimated, and digital services are considered delivered once completed.'],
  ['Account Responsibility & Risk', 'You are responsible for your GTA Online account and understand that updates, wipes, suspensions and resets can happen. LSCM does not guarantee permanent results or protection from platform enforcement.'],
  ['Privacy & Communications', 'Information shared with management is used to coordinate services and support. Do not share passwords or sensitive credentials in public channels. For availability updates or bug reports, use the official LSCM Discord server.'],
  ['Beta Notice', 'This website is in beta. Some instability, outdated availability or bugs may occur while the experience is being improved. Please report issues in the official Discord so the crew can fix them.'],
];

export default function LegalPage() {
  const { scrollYProgress } = useScroll();
  const fillHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <main className="min-h-screen relative">
      <div className="fixed right-5 top-1/2 -translate-y-1/2 h-[50vh] w-[3px] hidden md:block bg-white/10 z-50">
        <motion.div className="absolute top-0 left-0 w-full bg-[var(--accent)]" style={{ height: fillHeight }} />
      </div>
      <Header />
      <section className="max-w-4xl mx-auto px-6 pt-40 pb-20">
        <p className="text-[11px] uppercase tracking-[0.44em] mb-5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>LSCM // COMMUNITY TERMS</p>
        <h1 className="text-3xl md:text-5xl text-white tracking-[0.07em] uppercase leading-[1.1]" style={{ fontFamily: 'var(--font-display)' }}>
          <GlitchyText text="COMMUNITY TERMS" />
        </h1>
        <p className="mt-6 text-base leading-7 text-white/45" style={{ fontFamily: 'var(--font-body)' }}>
          These notes explain how LSCM services, heists, payments, support and beta feedback work. Browse the catalogue, join the crew and confirm details with management before requesting a service.
        </p>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-4">
        <div className="space-y-5">
          {sections.map(([title, content], index) => (
            <motion.article key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass border border-white/[0.08] p-7">
              <p className="text-[11px] uppercase tracking-[0.4em] mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>Section {String(index + 1).padStart(2, '0')}</p>
              <h2 className="text-xl md:text-2xl text-white tracking-[0.08em] uppercase" style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
              <div className="h-px w-full mt-4 mb-4 bg-[var(--accent)]/60" />
              <p className="text-base leading-7 text-white/45" style={{ fontFamily: 'var(--font-body)' }}>{content}</p>
            </motion.article>
          ))}
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-base text-white/55" style={{ fontFamily: 'var(--font-body)' }}>Need help or spotted a bug?</p>
        <Link href="https://discord.gg/wy5ws9vVMs" target="_blank" className="mt-5 inline-flex border border-[var(--accent)]/60 px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-white/75 hover:bg-[var(--accent)]/15 hover:text-white" style={{ fontFamily: 'var(--font-display)' }}>Report it on Discord</Link>
      </section>
      <Footer />
    </main>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { fetchAdminSummary } from "@/lib/api";

// Define a type for the summary data to ensure type safety
type AdminSummary = {
  queueDepth: number;
  deploymentsToday: number;
  activeClients: number;
  systems: { name: string; status: string }[];
};

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await fetchAdminSummary();
        setSummary(data);
      } catch (err) {
        setError('Failed to load admin summary.');
      }
    }
    loadSummary();
  }, []);

  if (error) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!summary) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Admin Dashboard...</div>;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <p className="font-body text-xs uppercase text-accent">Admin</p>
          <h1 className="mt-4 font-display text-5xl uppercase text-white">Internal Command Surface</h1>
        </div>
        <a href="/" className="font-body text-sm text-muted transition hover:text-white">
          Return to landing
        </a>
      </div>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        <article className="glass-panel rounded-lg p-6">
          <p className="font-body text-xs uppercase text-muted">Queue Depth</p>
          <p className="mt-4 font-display text-4xl uppercase text-white">{summary.queueDepth}</p>
        </article>
        <article className="glass-panel rounded-lg p-6">
          <p className="font-body text-xs uppercase text-muted">Deployments Today</p>
          <p className="mt-4 font-display text-4xl uppercase text-white">{summary.deploymentsToday}</p>
        </article>
        <article className="glass-panel rounded-lg p-6">
          <p className="font-body text-xs uppercase text-muted">Active Clients</p>
          <p className="mt-4 font-display text-4xl uppercase text-white">{summary.activeClients}</p>
        </article>
      </section>

      <section className="mt-10 glass-panel rounded-lg p-6">
        <h2 className="font-display text-3xl uppercase text-white">System Readout</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {summary.systems.map((system) => (
            <div key={system.name} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="font-body text-xs uppercase text-muted">{system.name}</p>
              <p className="mt-3 font-display text-xl uppercase text-white">{system.status}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
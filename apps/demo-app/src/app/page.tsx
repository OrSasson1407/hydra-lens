'use client';

import { Suspense, useState, useEffect } from 'react';
import { TimeDisplay } from './TimeDisplay';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-16 bg-gray-950 text-white">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          Hydra<span className="text-red-500">Lens</span> Demo
        </h1>
        <p className="text-gray-400 text-lg">
          A target app with intentional hydration mismatches
        </p>
      </header>

      {/* ── Mismatch #1: Timestamp ── */}
      <section className="w-full max-w-md rounded-xl border border-red-500/40 bg-red-950/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-red-400 font-bold text-sm uppercase tracking-widest">
            ⚠ Mismatch #1
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-3">
          Server renders <code className="text-red-300">"Server Rendered"</code>,
          client renders <code className="text-green-400">Date.now()</code>.
        </p>
        <Suspense fallback={<span className="font-mono text-xl">Loading…</span>}>
          <TimeDisplay />
        </Suspense>
      </section>

      {/* ── Mismatch #2: Random number ── */}
      <section className="w-full max-w-md rounded-xl border border-orange-500/40 bg-orange-950/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-orange-400 font-bold text-sm uppercase tracking-widest">
            ⚠ Mismatch #2
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-3">
          Server always renders <code className="text-red-300">0.500000</code>,
          client renders a random float.
        </p>
        <RandomDisplay />
      </section>

      <footer className="text-gray-600 text-xs">
        Install HydraLens extension → click the icon → Scan Page
      </footer>
    </main>
  );
}

// ── Client components ────────────────────────────────────────────────────────

function RandomDisplay() {
  const [value, setValue] = useState('0.500000');

  useEffect(() => {
    // Only runs on the client after hydration completes.
    // Server and client both start with '0.500000', so React is happy —
    // then the client immediately updates to a random value, giving
    // HydraLens a real server→client mismatch to detect.
    setValue(Math.random().toFixed(6));
  }, []);

  return <p className="font-mono text-2xl text-orange-300">{value}</p>;
}

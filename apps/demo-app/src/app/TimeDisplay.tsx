'use client';

import { useState, useEffect } from 'react';

export function TimeDisplay() {
  // Both server and client start with the same stable value so React is happy
  // during hydration. Then useEffect (client-only) updates to the real timestamp,
  // giving HydraLens a genuine server → client text mismatch to detect.
  const [time, setTime] = useState('Server Rendered');

  useEffect(() => {
    setTime(new Date().getTime().toString());
  }, []);

  return <p className="font-mono text-2xl text-red-300">{time}</p>;
}

'use client';
import { useEffect, useState } from 'react';

export function InfoMismatch() {
  const [val, setVal] = useState('0.500000');
  useEffect(() => setVal(Math.random().toFixed(6)), []);

  return (
    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
      <p className="text-blue-700 font-mono text-lg">{val}</p>
      <p className="text-sm text-blue-600 mt-2">
        This is an <strong>Info</strong> mismatch. HydraLens detects the RegEx pattern of a random float and assumes this difference is intentional.
      </p>
    </div>
  );
}

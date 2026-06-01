'use client';
import { useEffect, useState } from 'react';

export function WarningMismatch() {
  const [desc, setDesc] = useState('Loading data from server...');
  useEffect(() => setDesc('Data successfully loaded on client!'), []);

  return (
    <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
      <p className="text-amber-700">Status: <span>{desc}</span></p>
      <p className="text-sm text-amber-600 mt-2">
        This is a <strong>Warning</strong> because it's a standard text mismatch inside a non-critical tag (&lt;span&gt;).
      </p>
    </div>
  );
}

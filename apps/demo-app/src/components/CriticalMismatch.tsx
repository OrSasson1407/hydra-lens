'use client';
import { useEffect, useState } from 'react';

export function CriticalMismatch() {
  const [title, setTitle] = useState('Server Rendered Title');
  useEffect(() => setTitle('Client Rendered Title'), []);

  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
      <h2 className="text-xl font-bold text-red-700">{title}</h2>
      <p className="text-sm text-red-600 mt-2">
        This is a <strong>Critical</strong> mismatch because it happens inside an &lt;h2&gt; tag, which is structurally important for SEO and accessibility.
      </p>
    </div>
  );
}

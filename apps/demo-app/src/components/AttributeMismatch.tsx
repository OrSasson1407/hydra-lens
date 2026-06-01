'use client';
import { useEffect, useState } from 'react';

export function AttributeMismatch() {
  const [href, setHref] = useState('/server-destination');
  const [btnClass, setBtnClass] = useState('px-4 py-2 bg-gray-500 text-white rounded');

  useEffect(() => {
    setHref('/client-destination');
    setBtnClass('px-4 py-2 bg-purple-600 text-white rounded font-bold shadow-lg');
  }, []);

  return (
    <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
      <div className="flex gap-4 items-center mb-4">
        <a href={href} className="text-purple-700 underline font-medium">
          Dynamic Link
        </a>
        <button className={btnClass}>
          Dynamic Button
        </button>
      </div>
      <p className="text-sm text-purple-600">
        This showcases the <strong>Attribute Mismatch</strong> detection. The link's `href` and the button's `class` change after hydration.
      </p>
    </div>
  );
}

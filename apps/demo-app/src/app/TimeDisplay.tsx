'use client';

export function TimeDisplay() {
  const time =
    typeof window !== 'undefined' ? new Date().getTime().toString() : 'Server Rendered';
  return <p className="font-mono text-2xl text-red-300">{time}</p>;
}

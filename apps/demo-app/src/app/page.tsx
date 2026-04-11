"use client";

export default function Home() {
  // THE TRAP: This renders something different on the server vs. the client
  // resulting in a hydration mismatch error in the console.
  const time = typeof window !== 'undefined' ? new Date().getTime() : 'Server Rendered';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-black">
      <h1 className="text-4xl font-bold mb-8">HydraLens Demo Target</h1>
      
      <div className="p-6 border-2 border-red-500 rounded bg-red-100 text-center">
        <p className="mb-2 font-semibold text-red-700">Intentional Hydration Mismatch Below:</p>
        <p className="font-mono text-2xl">{time}</p>
      </div>
    </main>
  );
}
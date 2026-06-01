import { CriticalMismatch } from '../components/CriticalMismatch';
import { WarningMismatch } from '../components/WarningMismatch';
import { InfoMismatch } from '../components/InfoMismatch';
import { AttributeMismatch } from '../components/AttributeMismatch';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b pb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            HydraLens <span className="text-blue-600">Playground</span>
          </h1>
          <p className="text-gray-500 mt-2">
            This page contains deliberate hydration mismatches. Open the HydraLens extension and click "Scan Page" to see them detected in real-time.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CriticalMismatch />
          <WarningMismatch />
          <InfoMismatch />
          <AttributeMismatch />
        </div>
      </div>
    </main>
  );
}

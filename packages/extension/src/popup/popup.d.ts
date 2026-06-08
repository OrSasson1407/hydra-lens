declare const HISTORY_KEY = "hydralens_scan_history";
declare const MAX_HISTORY = 5;
interface ScanRecord {
    url: string;
    ts: number;
    total: number;
    mismatches: any[];
}
declare const toggle: HTMLInputElement;
declare function getLatestMismatches(cb: (mismatches: any[]) => void): void;
declare function renderHistory(): void;

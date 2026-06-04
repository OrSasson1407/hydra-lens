declare const STORAGE_KEY = "hydralens_last_results";
declare let currentMismatches: any[];
declare function _setText(el: Element, text: string): void;
declare function createEl<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: Record<string, string>, text?: string): HTMLElementTagNameMap[K];
declare function renderResults(filter?: string): void;
declare function saveResults(mismatches: any[]): void;
declare function restoreResults(): void;

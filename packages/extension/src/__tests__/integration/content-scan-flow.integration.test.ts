import { describe, it, expect } from 'vitest';

describe('content-scan-flow.integration', () => {
  it('successful fetch → HYDRALENS_RESULTS message sent', () => { /* TODO */ });
  it('results payload contains mismatches array', () => { /* TODO */ });
  it('ignored selectors filtered from active mismatches', () => { /* TODO */ });
  it('AbortError → HYDRALENS_ERROR sent with timeout message', () => { /* TODO */ });
  it('network error → HYDRALENS_ERROR sent with error message', () => { /* TODO */ });
  it('overlays drawn for each active mismatch with a matching element', () => { /* TODO */ });
  it('no overlay drawn when querySelector returns null', () => { /* TODO */ });
});

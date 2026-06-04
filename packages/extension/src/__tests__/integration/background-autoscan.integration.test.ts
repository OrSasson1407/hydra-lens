import { describe, it, expect } from 'vitest';

describe('background-autoscan.integration', () => {
  it('onCompleted (frameId=0) → HYDRALENS_RUN sent after 1500ms', () => { /* TODO */ });
  it('onCompleted (frameId≠0) → no message sent', () => { /* TODO */ });
  it('onHistoryStateUpdated → HYDRALENS_RUN sent after 1000ms', () => { /* TODO */ });
  it('autoScan=false → neither event triggers a scan', () => { /* TODO */ });
  it('HYDRALENS_SET_AUTOSCAN(false) → autoScan stored as false', () => { /* TODO */ });
  it('keyboard command trigger-scan → HYDRALENS_RUN sent to active tab', () => { /* TODO */ });
});

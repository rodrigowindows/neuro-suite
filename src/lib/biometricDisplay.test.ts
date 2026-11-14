import { describe, expect, it } from 'vitest';
import { roundBlinkRate } from './biometricDisplay';

describe('blink-rate display precision', () => {
  it('rounds the reported long-decimal measurement to 61', () => {
    expect(roundBlinkRate(60.97764153143847)).toBe(61);
  });
  it('keeps existing integer measurements unchanged', () => {
    expect(roundBlinkRate(20)).toBe(20);
  });
});
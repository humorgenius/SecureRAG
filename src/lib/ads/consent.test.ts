import { describe, expect, it } from 'vitest';
import { adMode, CONSENT_KEY, isEeaLike, readConsent } from './consent';

/**
 * The one decision that can cost the account. Google's rule, quoted in
 * consent.ts: non-personalized ads still use cookies for frequency capping and
 * reporting, and consent is required for that where the ePrivacy Directive
 * applies — so "no ad request" is the correct answer for a declined visitor in
 * the EEA, the UK and Switzerland, not a broken slot.
 */
describe('ad mode', () => {
  it('personalizes only when consent was given', () => {
    expect(adMode('granted', 'America/New_York')).toBe('personalized');
    expect(adMode('granted', 'Europe/Berlin')).toBe('personalized');
  });

  it('answers a decline with a non-personalized ad outside the EEA', () => {
    expect(adMode('denied', 'Asia/Shanghai')).toBe('non-personalized');
    expect(adMode('denied', 'America/New_York')).toBe('non-personalized');
    expect(adMode('denied', 'Australia/Sydney')).toBe('non-personalized');
  });

  it('requests nothing in the EEA, the UK or Switzerland after a decline', () => {
    for (const zone of ['Europe/Berlin', 'Europe/London', 'Europe/Zurich', 'Europe/Dublin', 'Atlantic/Reykjavik']) {
      expect(adMode('denied', zone), zone).toBe('none');
    }
  });

  it('requests nothing before a choice is made, where consent is required', () => {
    // The gate is shown in these zones, and nothing is fetched until it is answered.
    expect(adMode('unset', 'Europe/Paris')).toBe('none');
    expect(adMode('unset', 'Europe/Bucharest')).toBe('none');
    expect(adMode('unset', 'Atlantic/Reykjavik')).toBe('none');
  });

  it('but sends a non-personalized request elsewhere, and shows no gate', () => {
    // No policy requires an answer outside the EEA, UK and Switzerland, so those
    // readers get an NPA request instead of a dialog in front of the article.
    expect(adMode('unset', 'America/New_York')).toBe('non-personalized');
    expect(adMode('unset', 'Asia/Shanghai')).toBe('non-personalized');
  });
});

describe('isEeaLike', () => {
  it('recognises European zones', () => {
    expect(isEeaLike('Europe/Paris')).toBe(true);
    expect(isEeaLike('Europe/Bucharest')).toBe(true);
  });

  it('but not the rest of the world', () => {
    expect(isEeaLike('Asia/Tokyo')).toBe(false);
    expect(isEeaLike('America/Sao_Paulo')).toBe(false);
    expect(isEeaLike('')).toBe(false);
  });

  it('errs toward not serving: non-EEA European zones are also caught', () => {
    // Moscow and Istanbul are not in the EEA. The heuristic still withholds ad
    // requests there, which costs an impression instead of risking a violation.
    expect(isEeaLike('Europe/Moscow')).toBe(true);
    expect(isEeaLike('Europe/Istanbul')).toBe(true);
  });
});

describe('readConsent', () => {
  it('treats an absent or unrecognised value as no choice yet', () => {
    expect(readConsent(() => null)).toBe('unset');
    expect(readConsent(() => 'banana')).toBe('unset');
  });

  it('reads the stored choice', () => {
    const store = (value: string) => (key: string) => (key === CONSENT_KEY ? value : null);
    expect(readConsent(store('granted'))).toBe('granted');
    expect(readConsent(store('denied'))).toBe('denied');
  });
});

/**
 * What an ad request is allowed to be. One pure function, because this is the
 * decision that can get the account banned if it is wrong.
 *
 * Google's own documentation drives every branch:
 *
 *  - Personalized ads need consent, full stop.
 *  - Non-personalized ads (NPA) do not personalise, but they still use cookies
 *    for frequency capping and aggregated reporting, and Google states plainly
 *    that consent is required for that where the ePrivacy Directive applies
 *    (EEA, UK, Switzerland). So a visitor there who declines gets no ad request
 *    at all — that is the compliant reading, not a broken slot.
 *  - Everywhere else a decline can be answered with an NPA request: the slot
 *    still earns, and the visitor is not tracked for personalisation.
 *  - Before any choice has been made, nothing is requested *where consent is
 *    required*. Elsewhere the gate is not shown at all and the request is NPA;
 *    the EEA still gets no request until it answers.
 */
export type ConsentChoice = 'unset' | 'granted' | 'denied';

export type AdMode = 'personalized' | 'non-personalized' | 'none';

export const CONSENT_KEY = 'sr.ad.consent';
export const CONSENT_EVENT = 'sr:consent';

/**
 * EEA / UK / Switzerland heuristic from the browser's time zone.
 *
 * A heuristic is the honest way to do this without a backend: it can be wrong for
 * a traveller or a VPN, and it deliberately errs toward *not* serving, so a wrong
 * guess costs an impression rather than a policy violation.
 */
export function isEeaLike(timeZone: string): boolean {
  return timeZone.startsWith('Europe/') || timeZone === 'Atlantic/Reykjavik';
}

export function adMode(choice: ConsentChoice, timeZone: string): AdMode {
  if (choice === 'granted') return 'personalized';
  if (choice === 'denied') return isEeaLike(timeZone) ? 'none' : 'non-personalized';
  /*
   * No answer yet. Where consent is legally required (EEA, UK, Switzerland) nothing
   * is requested until the visitor answers - that is the whole point of the gate.
   * Everywhere else Google does not require consent for personalized ads, so those
   * visitors get one directly and never see the gate: asking first was a dialog in
   * front of the majority of readers for no reason the policy imposes.
   *
   * A visitor who explicitly declines is still answered with an NPA request - that
   * is their choice being honoured, not a policy compliance step.
   */
  return isEeaLike(timeZone) ? 'none' : 'personalized';
}

/** Reads the stored choice, treating anything unrecognised as "no choice yet". */
export function readConsent(read: (key: string) => string | null): ConsentChoice {
  const value = read(CONSENT_KEY);
  return value === 'granted' || value === 'denied' ? value : 'unset';
}

export function currentTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    return '';
  }
}

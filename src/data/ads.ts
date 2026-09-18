/**
 * AdSense identifiers.
 *
 * Both stay empty until the account is approved, and while they are empty every
 * slot renders as a labeled placeholder and **no script is fetched at all** — a
 * site that is not yet monetised therefore makes zero third-party requests, which
 * is what the privacy page promises. Fill them in once AdSense issues the
 * publisher id and the per-unit slot ids.
 */
export const ADS = {
  /** e.g. 'ca-pub-0000000000000000' */
  client: 'ca-pub-9680789453651246',
  /** one id per layout position */
  slots: {
    'banner-top': '',
    'banner-mid': '',
    'banner-bottom': '',
    'rail-left': '',
    'rail-right': '',
    'anchor': '',
  },
  /**
   * Google's own CMP (Privacy & messaging -> European regulations message).
   *
   * When on, the consent question in the EEA, the UK and Switzerland is Google's to
   * ask: their message is delivered by the ad script and writes the TC string, so
   * the script has to load before any consent exists - which our own gate would
   * otherwise prevent, leaving Google's message unable to appear at all. Their
   * certified CMP is also the only route to limited ads after a decline.
   *
   * Our gate then stays out of the way (see ConsentGate): two dialogs asking the
   * same question is worse than either one alone. Set this to false to go back to
   * the hand-rolled gate.
   */
  googleCmp: true,
} as const;

export type AdSlotId = keyof typeof ADS.slots;

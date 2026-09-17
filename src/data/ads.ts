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
  client: '',
  /** one id per layout position */
  slots: {
    'banner-top': '',
    'banner-mid': '',
    'banner-bottom': '',
    'rail-left': '',
    'rail-right': '',
    'anchor': '',
  },
} as const;

export type AdSlotId = keyof typeof ADS.slots;

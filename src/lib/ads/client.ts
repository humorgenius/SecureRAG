import { ADS, type AdSlotId } from '../../data/ads';
import { CONSENT_EVENT, adMode, currentTimeZone, readConsent, type AdMode } from './consent';

/**
 * Browser side of the ad system.
 *
 * Loaded once per page by AdSlot.astro (Astro bundles the import, so six slots
 * still mean one script). The order of operations matters and mirrors Google's
 * documentation: decide the mode, load adsbygoogle.js only when a request is
 * actually allowed, set requestNonPersonalizedAds *before* the first push, then
 * push once per filled slot.
 */

const SCRIPT_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const ANCHOR_KEY = 'sr.ad.anchor';

let booted = false;
let scriptRequested = false;

type WithAds = Window & { adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number } };

const w = () => window as WithAds;

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function loadAdScript(client: string): void {
  if (scriptRequested) return;
  scriptRequested = true;
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `${SCRIPT_SRC}?client=${client}`;
  document.head.appendChild(script);
}

function fillSlots(mode: AdMode): void {
  w().adsbygoogle = w().adsbygoogle ?? [];
  if (mode === 'non-personalized') {
    // Documented AdSense switch for a per-page NPA request. Must be set before
    // the first push(), and one line per page is enough.
    w().adsbygoogle!.requestNonPersonalizedAds = 1;
  }

  document.querySelectorAll<HTMLElement>('[data-ad-body]').forEach((body) => {
    if (body.dataset.filled === '1') return;
    const holder = body.closest<HTMLElement>('[data-ad-id]');
    const unit = holder ? ADS.slots[holder.dataset.adId as AdSlotId] : '';
    if (!unit) return; // no unit id yet: the labeled placeholder stays

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.dataset.adClient = ADS.client;
    ins.dataset.adSlot = unit;
    ins.dataset.adFormat = 'auto';
    ins.dataset.fullWidthResponsive = 'true';
    body.appendChild(ins);
    body.dataset.filled = '1';
    w().adsbygoogle!.push({});
  });
}

function applyConsent(): void {
  const mode = adMode(readConsent((key) => storage()?.getItem(key) ?? null), currentTimeZone());
  // 'none' covers both "no choice yet" and "declined inside the EEA/UK/CH".
  // Either way nothing is requested — see the note in consent.ts.
  if (mode === 'none' || ADS.client.length === 0) return;
  loadAdScript(ADS.client);
  fillSlots(mode);
}

/** The bottom slot can be collapsed, and the choice sticks across pages. */
function bootAnchor(): void {
  const anchor = document.querySelector<HTMLElement>('[data-ad-variant="anchor"]');
  const button = anchor?.querySelector<HTMLButtonElement>('[data-ad-collapse]');
  if (!anchor || !button) return;

  const spacer = document.querySelector<HTMLElement>('[data-ad-spacer]');
  const setCollapsed = (collapsed: boolean) => {
    anchor.dataset.collapsed = collapsed ? '1' : '0';
    if (spacer) spacer.hidden = collapsed;
    button.setAttribute('aria-expanded', String(!collapsed));
    const label = button.dataset.labelShow ?? '';
    const hide = button.dataset.labelHide ?? '';
    button.textContent = collapsed ? label : hide;
  };

  setCollapsed(storage()?.getItem(ANCHOR_KEY) === '1');
  button.addEventListener('click', () => {
    const next = anchor.dataset.collapsed !== '1';
    setCollapsed(next);
    try {
      storage()?.setItem(ANCHOR_KEY, next ? '1' : '0');
    } catch {
      /* storage unavailable: the choice simply does not persist */
    }
  });
}

export function bootAds(): void {
  if (booted) return;
  booted = true;
  const start = () => {
    applyConsent();
    document.addEventListener(CONSENT_EVENT, applyConsent);
    bootAnchor();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}

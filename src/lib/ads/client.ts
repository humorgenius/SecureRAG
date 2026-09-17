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
  const body = anchor.querySelector<HTMLElement>('.ad-body');
  const label = anchor.querySelector<HTMLElement>('.ad-label');

  /*
   * The collapsed size is set inline rather than in the stylesheet.
   *
   * Stylesheet rules were not enough: the slot kept the height of its hidden ad
   * body, so "collapsed" still laid a 104px band over the last line of the page,
   * which is exactly what the collapse is supposed to stop. Inline styles win
   * over anything scoped, and the collapsed footprint is one 38px arrow.
   */
  const setCollapsed = (collapsed: boolean) => {
    anchor.dataset.collapsed = collapsed ? '1' : '0';
    if (spacer) spacer.dataset.collapsed = collapsed ? '1' : '0';
    if (body) body.style.display = collapsed ? 'none' : '';
    if (label) label.style.display = collapsed ? 'none' : '';

    // Centered at the bottom edge, and the arrow itself is ~3x its old size: the
    // white disc was right, the black glyph inside it was not.
    anchor.style.left = collapsed ? '50%' : '';
    anchor.style.right = collapsed ? 'auto' : '';
    anchor.style.transform = collapsed ? 'translateX(-50%)' : '';
    anchor.style.width = collapsed ? '38px' : '';
    anchor.style.height = collapsed ? '38px' : '';
    // A min-height somewhere up the cascade was holding the box at 104px, which
    // is why a plain height did nothing: the arrow stayed inside a tall band.
    anchor.style.minHeight = collapsed ? '0' : '';
    anchor.style.minWidth = collapsed ? '0' : '';
    anchor.style.background = collapsed ? 'transparent' : '';
    anchor.style.border = collapsed ? '0' : '';
    anchor.style.boxShadow = collapsed ? 'none' : '';

    button.style.width = collapsed ? '38px' : '';
    button.style.height = collapsed ? '38px' : '';
    button.style.padding = collapsed ? '0' : '';
    button.style.borderRadius = collapsed ? '50%' : '';
    button.style.border = collapsed ? '1px solid var(--line)' : '';
    button.style.background = collapsed ? '#fff' : '';
    button.style.boxShadow = collapsed ? '0 6px 18px rgba(10, 23, 48, .16)' : '';
    button.style.fontSize = collapsed ? '26px' : '';
    button.style.lineHeight = collapsed ? '1' : '';
    button.style.color = collapsed ? 'var(--ink)' : '';
    button.style.fontWeight = collapsed ? '700' : '';

    button.setAttribute('aria-expanded', String(!collapsed));
    button.textContent = collapsed ? (button.dataset.labelShow ?? '') : (button.dataset.labelHide ?? '');
  };

  // Always starts expanded, on every page load: a collapse lasts for the visit and
  // is not remembered. A remembered collapse left a small arrow in a corner that
  // readers could not find, which reads as "the ad disappeared".
  setCollapsed(false);
  button.addEventListener('click', () => setCollapsed(anchor.dataset.collapsed !== '1'));
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

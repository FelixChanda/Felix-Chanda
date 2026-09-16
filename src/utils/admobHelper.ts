/**
 * AdMob Helper utility to trigger full-screen interstitial ads
 * for online events: document download, app launch, prompts, and screen wake-up after sleep.
 */

export const ADMOB_APP_ID = 'ca-app-pub-2887402752089984~5632535357';
export const ADMOB_UNIT_ID = 'ca-app-pub-2887402752089984/7276789512';

export type AdTriggerType =
  | 'download'
  | 'launch'
  | 'prompt'
  | 'after_sleep'
  | 'feature';

export function triggerAdMobInterstitial(triggerType: AdTriggerType, label?: string): void {
  // Check if browser is online
  if (typeof window !== 'undefined' && window.navigator && !window.navigator.onLine) {
    console.log('[AdMob] Offline - skipping interstitial ad for:', triggerType);
    return;
  }

  if (typeof window !== 'undefined') {
    const event = new CustomEvent('datanurse-show-admob-interstitial', {
      detail: {
        triggerType,
        label: label || triggerType,
        appId: ADMOB_APP_ID,
        unitId: ADMOB_UNIT_ID,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);
  }
}

import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, ShieldCheck, Info, Sparkles } from 'lucide-react';
import { AdMobConfig } from '../types';

interface AdMobBannerProps {
  config: AdMobConfig;
  variant?: 'bottom-fixed' | 'inline-content';
  onOpenSettings?: () => void;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  config,
  variant = 'inline-content',
  onOpenSettings
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const adRef = useRef<HTMLModElement | null>(null);

  // Extract publisher client ID and slot ID from AdMob credentials
  // ca-app-pub-2887402752089984/7276789512 -> client: ca-pub-2887402752089984, slot: 7276789512
  const clientId = 'ca-pub-2887402752089984';
  const slotId = '7276789512';
  const appId = config.appId || 'ca-app-pub-2887402752089984~5632535357';
  const unitId = config.bannerUnitId || 'ca-app-pub-2887402752089984/7276789512';

  useEffect(() => {
    if (!config.enabled || isDismissed) return;

    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        // Only push if not already processed by Google Ads engine
        if (adRef.current && !adRef.current.getAttribute('data-adsbygoogle-status')) {
          adsbygoogle.push({});
          setAdLoaded(true);
        }
      }
    } catch (err) {
      console.warn('[AdMob] Live banner request info:', err);
    }
  }, [config.enabled, isDismissed]);

  if (!config.enabled || isDismissed) {
    return null;
  }

  if (variant === 'bottom-fixed') {
    return (
      <aside
        id="admob-sticky-bottom-banner"
        aria-label="Google AdMob Advertisement"
        className="fixed bottom-[52px] sm:bottom-[56px] inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xl px-3 py-1.5 transition-colors duration-200"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* AdMob Indicator Badge */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex flex-col items-start shrink-0">
              <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 leading-none">
                Ad • Google AdMob
              </span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 hidden sm:inline">
                {unitId}
              </span>
            </div>

            {/* Live Google Ad Container */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block', minHeight: '32px', maxHeight: '50px', width: '100%' }}
                data-ad-client={clientId}
                data-ad-slot={slotId}
                data-ad-format="horizontal"
                data-full-width-responsive="true"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-1.5 py-1 rounded cursor-pointer hidden sm:block font-mono"
                title="Google AdMob Unit ID & Parameters"
              >
                AdMob Config
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Ad"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Inline Responsive Ad Banner
  return (
    <div
      id="admob-inline-responsive-banner"
      aria-label="Google AdMob Banner Advertisement"
      className="w-full my-4 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-200 relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 leading-none">
            Google AdMob Live Ad
          </span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
            Unit: {unitId}
          </span>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss Ad"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Live Google Ad Container */}
      <div className="w-full min-h-[90px] flex items-center justify-center bg-slate-50 dark:bg-slate-950/60 rounded-xl overflow-hidden p-1">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '90px' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

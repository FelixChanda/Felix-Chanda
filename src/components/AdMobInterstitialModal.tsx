import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Zap, ExternalLink } from 'lucide-react';
import { ADMOB_APP_ID, ADMOB_UNIT_ID, AdTriggerType } from '../utils/admobHelper';

interface AdDetail {
  triggerType: AdTriggerType;
  label: string;
  appId: string;
  unitId: string;
  timestamp: number;
}

export const AdMobInterstitialModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adDetail, setAdDetail] = useState<AdDetail | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [canClose, setCanClose] = useState(false);
  const adSlotRef = useRef<HTMLModElement | null>(null);

  const clientId = 'ca-pub-2887402752089984';
  const slotId = '7276789512';

  useEffect(() => {
    const handleShowAd = (e: any) => {
      // Always verify online state
      if (!navigator.onLine) return;

      const detail: AdDetail = e.detail || {
        triggerType: 'feature',
        label: 'AdMob Live Ad',
        appId: ADMOB_APP_ID,
        unitId: ADMOB_UNIT_ID,
        timestamp: Date.now()
      };

      setAdDetail(detail);
      setIsOpen(true);
      setCountdown(3);
      setCanClose(false);

      // Trigger Google Ads push for live adsbygoogle element
      setTimeout(() => {
        try {
          if (typeof window !== 'undefined') {
            const adsbygoogle = (window as any).adsbygoogle || [];
            if (adSlotRef.current && !adSlotRef.current.getAttribute('data-adsbygoogle-status')) {
              adsbygoogle.push({});
            }
          }
        } catch (err) {
          console.warn('[AdMob Interstitial] Live push note:', err);
        }
      }, 50);
    };

    window.addEventListener('datanurse-show-admob-interstitial', handleShowAd);
    return () => {
      window.removeEventListener('datanurse-show-admob-interstitial', handleShowAd);
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanClose(true);
    }
  }, [isOpen, countdown]);

  if (!isOpen || !adDetail) return null;

  const getTriggerTitle = (type: AdTriggerType) => {
    switch (type) {
      case 'download':
        return 'Downloading Clinical Document...';
      case 'launch':
        return 'Welcome to DATANURSE';
      case 'prompt':
        return 'Processing Search & Reference Query...';
      case 'after_sleep':
        return 'Device Active — Live Sync';
      default:
        return 'Google AdMob Live Sponsor';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col relative transition-all">
        {/* AdMob Official Banner Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 tracking-wider shrink-0">
              Google AdMob Live Ad
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-teal-400 truncate">
                {getTriggerTitle(adDetail.triggerType)}
              </p>
              <p className="text-[10px] font-mono text-slate-400 truncate">
                Unit: {ADMOB_UNIT_ID}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            disabled={!canClose}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
              canClose
                ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{canClose ? 'Skip Ad' : `Skip in ${countdown}s`}</span>
            {canClose && <X className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Ad Body Content */}
        <div className="p-5 space-y-4 text-slate-800 dark:text-slate-100">
          {/* AdMob Live Tag Container */}
          <div className="w-full bg-slate-100 dark:bg-slate-950/70 rounded-2xl p-3 min-h-[250px] border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center overflow-hidden">
            <ins
              ref={adSlotRef}
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', minHeight: '250px' }}
              data-ad-client={clientId}
              data-ad-slot={slotId}
              data-ad-format="rectangle,horizontal"
              data-full-width-responsive="true"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
            <span className="font-mono">App ID: {ADMOB_APP_ID}</span>
            <span className="font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Google AdMob
            </span>
          </div>
        </div>

        {/* Footer close button */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Continue to DATANURSE
          </button>
        </div>
      </div>
    </div>
  );
};

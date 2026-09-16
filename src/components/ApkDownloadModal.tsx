import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Monitor,
  Download,
  ShieldCheck,
  Package,
  Info,
  CheckCircle2,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [downloadingPackage, setDownloadingPackage] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'pc'>('android');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if running as an installed PWA in standalone display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const [showGuideNotice, setShowGuideNotice] = useState(false);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
        }
      } catch (e) {
        console.warn('Install prompt error:', e);
        setShowGuideNotice(true);
      }
    } else {
      setShowGuideNotice(true);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleDownloadPackage = async () => {
    setDownloadingPackage(true);
    try {
      const res = await fetch('/api/download-apk-package');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'DATANURSE-Android-Package.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('API download failed');
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingPackage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div
        id="apk-download-dialog"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shadow-inner">
              {activeTab === 'android' ? <Smartphone className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                DATANURSE App Installer
              </h2>
              <p className="text-xs text-teal-200 font-medium">
                Android & VPhone (Virtual Phone) APK • PC Web App Edition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-1">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Android / VPhone APK</span>
          </button>

          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'pc'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>PC Web App (Desktop)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* App Card Preview */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-md ring-2 ring-teal-500/40 shrink-0 bg-slate-900">
              <img
                src="/bg-default.jpeg"
                alt="App Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  DATANURSE
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                  v1.2 Standalone
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Nursing database, past papers & clinical documents
              </p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" /> Standalone PWA
                </span>
                <span>• 100% Offline Capable</span>
              </div>
            </div>
          </div>

          {activeTab === 'android' ? (
            <>
              {/* Option 1: Direct Android 1-Click Install (WebAPK) */}
              <div className="p-4 rounded-xl border border-teal-500/40 bg-teal-50/50 dark:bg-teal-950/30 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-md mb-1">
                      Recommended for Android
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      1-Click Android WebAPK Installation
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      Android OS mints a true standalone native APK on your phone with full launcher icon, app drawer entry, and offline database cache.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleInstallPWA}
                  className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>{isInstalled ? 'App Already Installed' : 'Install DATANURSE on Android'}</span>
                </button>

                <button
                  onClick={handleOpenInNewTab}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-teal-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open App in New Window for Native Android Install Bar</span>
                </button>
              </div>

              {/* Option 2: Download Package */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md mb-1">
                      Offline Package Bundle
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      Download Package Archive (.JSON)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Contains all manifest files, service worker pre-cache configuration, icons, and TWA build instructions.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadPackage}
                  disabled={downloadingPackage}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloadingPackage ? 'Preparing Android Archive...' : 'Download Android Package Config'}</span>
                </button>
              </div>

              {/* Steps for Android */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-teal-600" />
                  How Android generates the WebAPK:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <li>Open this site on your Android device in Google Chrome, Edge, or Samsung Internet.</li>
                  <li>Tap the browser menu (<strong>⋮</strong> or <strong>≡</strong>) in top right.</li>
                  <li>Tap <strong>"Install application"</strong> or <strong>"Add to Home Screen"</strong>.</li>
                  <li>Google Play Services mints your device's native WebAPK package with offline caching.</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              {/* PC Desktop Install Option */}
              <div className="p-4 rounded-xl border border-teal-500/40 bg-teal-50/50 dark:bg-teal-950/30 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-md mb-1">
                      Desktop Web App (Windows / Mac / Linux / ChromeOS)
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      1-Click PC Desktop Installation
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      Installs DATANURSE as a standalone desktop window application with its own launcher icon on your PC desktop and taskbar.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleInstallPWA}
                  className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Monitor className="h-4 w-4" />
                  <span>{isInstalled ? 'PC App Already Installed' : 'Install DATANURSE PC App'}</span>
                </button>

                <button
                  onClick={handleOpenInNewTab}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-teal-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open App in New Window for PC Desktop Install Bar</span>
                </button>
              </div>

              {/* Steps for PC Desktop */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-teal-600" />
                  How to install on PC (Chrome, Edge, Brave, Opera):
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <li>In Google Chrome or Microsoft Edge on PC, look at the right side of the address URL bar.</li>
                  <li>Click the <strong>Install icon</strong> (⊕ or 📥) next to the bookmark star.</li>
                  <li>Click <strong>"Install DATANURSE"</strong>.</li>
                  <li>The app will immediately open in its own standalone desktop window and create a desktop shortcut!</li>
                </ol>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            PWA Standalone • Offline Database & Caching Active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

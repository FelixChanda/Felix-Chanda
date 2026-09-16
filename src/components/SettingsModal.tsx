import React, { useState } from 'react';
import {
  X,
  Settings,
  Sun,
  Moon,
  Mail,
  Send,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Smartphone,
  HardDrive,
  Key,
  FolderSync,
  Terminal,
  Info,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';
import { ThemeMode, AdMobConfig } from '../types';
import {
  initGoogleDriveAuth,
  requestGoogleDriveAccess,
  disconnectGoogleDrive,
  getAccessToken,
  AUTHOR_EMAIL
} from '../services/googleDriveService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  adMobConfig?: AdMobConfig;
  onUpdateAdMobConfig?: (config: AdMobConfig) => void;
  lastSyncTime: string;
  onForceSyncConditions: () => Promise<void>;
  isSyncing: boolean;
  onOpenApkModal?: () => void;
  onOpenDevConsole?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSelectTheme,
  adMobConfig,
  onUpdateAdMobConfig,
  lastSyncTime,
  onForceSyncConditions,
  isSyncing,
  onOpenApkModal,
  onOpenDevConsole
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Developer mode tap state
  const [versionTapCount, setVersionTapCount] = useState(0);
  const [isDevModeUnlocked, setIsDevModeUnlocked] = useState(false);
  const [tapHintMessage, setTapHintMessage] = useState('');

  // Google Drive state
  const [driveToken, setDriveToken] = useState<string | null>(getAccessToken());
  const [isDriveConnecting, setIsDriveConnecting] = useState(false);

  const contactEmail = AUTHOR_EMAIL;
  const appVersion = 'v2.4.0 (Native Android Build 104)';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      feedbackSubject.trim() || 'DATANURSE Database Inquiry'
    );
    const body = encodeURIComponent(
      feedbackMessage.trim() ||
        'Hello Chanda Felix,\n\nI am contacting you regarding the DATANURSE nursing database and library.\n\n'
    );
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  // Tap version handler (Easter Egg developer unlock)
  const handleTapVersion = () => {
    if (isDevModeUnlocked) {
      if (onOpenDevConsole) {
        onClose();
        onOpenDevConsole();
      }
      return;
    }

    const nextCount = versionTapCount + 1;
    setVersionTapCount(nextCount);

    if (nextCount >= 5) {
      setIsDevModeUnlocked(true);
      setTapHintMessage('🎉 Developer Console Unlocked! Opening controls...');
      setTimeout(() => {
        if (onOpenDevConsole) {
          onClose();
          onOpenDevConsole();
        }
      }, 1000);
    } else {
      const remaining = 5 - nextCount;
      setTapHintMessage(`Tap ${remaining} more time${remaining > 1 ? 's' : ''} to unlock Developer Console`);
      setTimeout(() => setTapHintMessage(''), 2500);
    }
  };

  const handleConnectDrive = async () => {
    setIsDriveConnecting(true);
    try {
      const token = await requestGoogleDriveAccess();
      setDriveToken(token);
    } catch (err) {
      console.warn('Drive connection note:', err);
    } finally {
      setIsDriveConnecting(false);
    }
  };

  const handleDisconnectDrive = () => {
    disconnectGoogleDrive();
    setDriveToken(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-fadeIn">
      <div
        id="settings-dialog"
        className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200"
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-teal-600 text-white shadow-xs">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Settings & Preferences
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                Workspace sync, theme & developer controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Close Settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-3.5 sm:p-5 md:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-xs sm:text-sm custom-scrollbar">
          {/* 1. Theme Switcher */}
          <section className="space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-amber-500" />
                Visual Appearance & Theme
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-700">
                Active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={() => onSelectTheme('light')}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer min-h-[52px] ${
                  theme === 'light'
                    ? 'border-teal-600 bg-teal-50/80 text-teal-950 ring-2 ring-teal-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <Sun className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Light Mode</div>
                  <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    High contrast daylight theme for academic reading.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectTheme('dark')}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer min-h-[52px] ${
                  theme === 'dark'
                    ? 'border-teal-500 bg-slate-800/90 text-white ring-2 ring-teal-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-indigo-950 text-indigo-300 shrink-0">
                  <Moon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Dark Mode</div>
                  <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Eye-safe nighttime clinical shift theme.
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* 2. Google Drive Workspace & Sync */}
          <section className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-teal-200 dark:border-teal-800/80 bg-gradient-to-br from-teal-50/80 via-emerald-50/40 to-slate-50/30 dark:from-teal-950/40 dark:via-slate-900/80 dark:to-slate-900/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-2.5 sm:space-x-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-teal-600 text-white shadow-xs shrink-0 mt-0.5">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      Google Drive Workspace Integration
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                      OSCETUBE Drive Ready
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Connected to repository (<span className="font-semibold text-teal-700 dark:text-teal-400">{AUTHOR_EMAIL}</span>). Automatically syncs videos from your <span className="font-bold text-slate-900 dark:text-white">'OSCETUBE'</span> Drive folder.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0 w-full sm:w-auto">
                {driveToken ? (
                  <button
                    onClick={handleDisconnectDrive}
                    className="w-full sm:w-auto min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer text-center"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleConnectDrive}
                    disabled={isDriveConnecting}
                    className="w-full sm:w-auto min-h-[40px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Key className="h-4 w-4" />
                    <span>{isDriveConnecting ? 'Connecting...' : 'Connect Drive'}</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* 3. Contact Author (Chanda Felix) */}
          <section className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  Contact Author & Compiler
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Compiled & maintained by <span className="font-extrabold text-teal-700 dark:text-teal-300">CHANDA FELIX</span>. Have past papers, updated modules, or feedback?
                </p>
              </div>

              <a
                id="btn-direct-contact-email"
                href={`mailto:${contactEmail}?subject=DATANURSE%20Nursing%20Database%20Inquiry`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors shrink-0 min-h-[40px]"
              >
                <Mail className="h-4 w-4" />
                <span>Contact Us</span>
              </a>
            </div>

            {/* Email Address Pill with Copy */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-mono text-xs font-extrabold text-teal-900 dark:text-teal-200 truncate">
                {contactEmail}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 min-h-[36px]"
              >
                {copiedEmail ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>

            {/* In-app message form */}
            <form onSubmit={handleSendEmail} className="space-y-2.5 pt-1">
              <input
                type="text"
                value={feedbackSubject}
                onChange={(e) => setFeedbackSubject(e.target.value)}
                placeholder="Inquiry subject (e.g. Adding Year 3 Past Papers)..."
                className="w-full p-2.5 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <textarea
                rows={2}
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Write your note or question to Chanda Felix..."
                className="w-full p-2.5 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[40px] w-full sm:w-auto"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Open Email with Message</span>
              </button>
            </form>
          </section>

          {/* 4. Android & VPhone App Package (APK) Download Option */}
          <section className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-2.5 sm:space-x-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0 mt-0.5">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    Android & VPhone (Virtual Phone) APK
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Download and install DATANURSE natively on Android physical devices and VPhone virtual environments.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenApkModal) onOpenApkModal();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer shrink-0 min-h-[40px] w-full sm:w-auto"
              >
                <Smartphone className="h-4 w-4" />
                <span>Get APK</span>
              </button>
            </div>
          </section>

          {/* 5. ABOUT DATANURSE & HIDDEN DEVELOPER CONSOLE UNLOCK */}
          <section className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-2.5 sm:space-x-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    About DATANURSE
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Zambian Nursing & Midwifery Academic Database & Clinical OSCE Station.
                  </p>
                  
                  {/* Interactive App Version Button */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTapVersion}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300 transition-all cursor-pointer active:scale-95 select-none min-h-[36px]"
                    >
                      {isDevModeUnlocked ? (
                        <Unlock className="h-3.5 w-3.5 text-teal-500" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span>App Version: {appVersion}</span>
                    </button>
                  </div>

                  {tapHintMessage && (
                    <div className="mt-2 text-xs font-semibold text-teal-600 dark:text-teal-400 animate-fadeIn">
                      {tapHintMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Launch Developer Console Button if unlocked */}
              {isDevModeUnlocked && onOpenDevConsole && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDevConsole();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-teal-600 hover:bg-teal-700 shadow-md transition-all cursor-pointer animate-pulse shrink-0 min-h-[40px] w-full sm:w-auto"
                >
                  <Terminal className="h-4 w-4" />
                  <span>Dev Console</span>
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 flex items-center justify-between shrink-0">
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium truncate max-w-[200px] sm:max-w-none">
            DATANURSE • {AUTHOR_EMAIL}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs min-h-[40px]"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};

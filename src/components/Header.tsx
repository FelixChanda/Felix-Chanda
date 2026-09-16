import React from 'react';
import {
  Stethoscope,
  PlusCircle,
  Calculator,
  Bookmark,
  Sun,
  Moon,
  Settings,
  Sparkles,
  Maximize2,
  Minimize2,
  EyeOff,
  Eye,
  Cloud
} from 'lucide-react';
import { ResourceCategory, ThemeMode } from '../types';

interface HeaderProps {
  totalCount: number;
  bookmarkedCount: number;
  showBookmarksOnly: boolean;
  onToggleBookmarksOnly?: () => void;
  onOpenAddModal: () => void;
  onOpenClinicalTools?: () => void;
  onOpenSettings?: () => void;
  theme: ThemeMode;
  onToggleTheme?: () => void;
  activeCategory: ResourceCategory | 'all';
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  hideNavBars?: boolean;
  onToggleHideNavBars?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  bookmarkedCount,
  showBookmarksOnly,
  onOpenAddModal,
  isFullscreen,
  onToggleFullscreen,
  hideNavBars,
  onToggleHideNavBars
}) => {
  return (
    <header
      id="header-navbar"
      className="fixed top-0 inset-x-0 z-40 bg-white/65 dark:bg-slate-900/65 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-md transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4rem] sm:min-h-[4.25rem] py-1.5 sm:py-2 gap-2">
          {/* Logo and Brand with App Icon Rendered */}
          <div
            id="brand-header-container"
            className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1"
          >
            {/* App Icon */}
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl overflow-hidden shadow-md ring-2 ring-teal-500/30 dark:ring-teal-400/40 shrink-0 aspect-square bg-slate-900">
              <img
                src="/bg-default.jpeg"
                alt="Data Nurse Icon"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex flex-col min-w-0 justify-center">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-black text-base sm:text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
                  Data <span className="text-teal-600 dark:text-teal-400">Nurse</span>
                </span>
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
                  Nursing Database
                </span>
              </div>

              {/* Author Attribution: "compiled by CHANDA FELIX" */}
              <div className="mt-0.5 sm:mt-1 flex items-center gap-1.5 flex-wrap min-w-0">
                <span
                  id="author-attribution-badge"
                  className="inline-flex items-center text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-200 bg-teal-50/90 dark:bg-teal-900/50 px-1.5 sm:px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-700/80 shadow-2xs whitespace-nowrap truncate max-w-[200px] sm:max-w-none"
                  title="Curated and compiled by Chanda Felix"
                >
                  compiled by CHANDA FELIX
                </span>
                <span className="hidden md:inline text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  • Academic & Clinical Library
                </span>
              </div>
            </div>
          </div>

          {/* Action Header Controls & Fullscreen Trigger */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {showBookmarksOnly && (
              <span className="inline-flex items-center px-2 py-1 text-[11px] sm:text-xs font-bold rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                ★ ({bookmarkedCount})
              </span>
            )}

            {/* Firebase Cloud Storage Live Sync Badge */}
            <div
              id="header-btn-cloud-sync"
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 shadow-2xs"
              title="Firebase Cloud Database & File Storage auto-sync active"
            >
              <Cloud className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">Cloud Sync</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Toggle Full Screen Mode Button */}
            {onToggleFullscreen && (
              <button
                id="header-btn-fullscreen"
                onClick={onToggleFullscreen}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isFullscreen
                    ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen Mode'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Exit Full Screen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Full Screen</span>
                  </>
                )}
              </button>
            )}

            {/* Force Hide Navigation Bars Button */}
            {onToggleHideNavBars && (
              <button
                id="header-btn-hidenav"
                onClick={onToggleHideNavBars}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  hideNavBars
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={hideNavBars ? 'Show Navigation Bars' : 'Hide Navigation Bars for Max View area'}
              >
                {hideNavBars ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            )}

            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50/80 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/80">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              Verified Repository
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};


import React from 'react';
import {
  Calculator,
  Bookmark,
  BookOpen,
  Sparkles,
  Settings,
  Video
} from 'lucide-react';

interface BottomBarProps {
  bookmarkedCount: number;
  showBookmarksOnly: boolean;
  onToggleBookmarksOnly: () => void;
  onOpenClinicalTools: () => void;
  onOpenSettings: () => void;
  onOpenTopics: () => void;
  isTopicsOpen?: boolean;
  onOpenRandomFlashcards?: () => void;
  onOpenOsce: () => void;
  isOsceOpen?: boolean;
  bottomOffsetClass?: string;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  bookmarkedCount,
  showBookmarksOnly,
  onToggleBookmarksOnly,
  onOpenClinicalTools,
  onOpenSettings,
  onOpenTopics,
  isTopicsOpen,
  onOpenRandomFlashcards,
  onOpenOsce,
  isOsceOpen,
  bottomOffsetClass = 'bottom-0'
}) => {
  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Bottom Navigation Bar"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800/60 shadow-2xl transition-all duration-200 pb-safe"
    >
      <div className="max-w-2xl mx-auto px-1.5 sm:px-4 py-1 flex items-center justify-between gap-0.5 sm:gap-1.5">
        {/* 1. Clinical Tools Button */}
        <button
          id="bottom-btn-tools"
          onClick={onOpenClinicalTools}
          className="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer group min-w-0"
          title="Clinical Tools & Dosage Calculators"
        >
          <div className="relative p-1 rounded-lg group-hover:bg-teal-50 dark:group-hover:bg-teal-950/60 transition-colors">
            <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[9.5px] sm:text-[11px] font-semibold mt-0.5 tracking-tight truncate w-full text-center">Tools</span>
        </button>

        {/* 2. Bookmarks Filter Button */}
        <button
          id="bottom-btn-bookmarks"
          onClick={onToggleBookmarksOnly}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer group min-w-0 ${
            showBookmarksOnly
              ? 'text-amber-700 dark:text-amber-300 bg-amber-50/90 dark:bg-amber-950/60 font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
          title={showBookmarksOnly ? 'Viewing Bookmarked Items' : 'Filter Saved Bookmarks'}
        >
          <div className="relative p-1 rounded-lg">
            <Bookmark
              className={`h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform ${
                showBookmarksOnly
                  ? 'text-amber-600 dark:text-amber-400 fill-amber-500'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            />
            {bookmarkedCount > 0 && (
              <span
                id="bottom-bookmarks-badge"
                className="absolute -top-1 -right-1.5 bg-amber-500 text-slate-950 font-black text-[9px] h-3.5 min-w-[14px] px-1 rounded-full flex items-center justify-center shadow-xs"
              >
                {bookmarkedCount}
              </span>
            )}
          </div>
          <span className="text-[9.5px] sm:text-[11px] font-semibold mt-0.5 tracking-tight truncate w-full text-center">
            Saved
          </span>
        </button>

        {/* 3. Center Quick Action: TOPICS (Gemini AI Sourced & Updated) */}
        <button
          id="bottom-btn-topics"
          onClick={onOpenTopics}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer group min-w-0 ${
            isTopicsOpen
              ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 font-bold'
              : 'text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60'
          }`}
          title="Nursing Topics Hub (Gemini AI Sourced & Updated)"
        >
          <div className="relative p-1 rounded-lg bg-teal-600 dark:bg-teal-500 text-white shadow-xs group-hover:scale-105 transition-transform">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[7px] px-1 rounded-full animate-pulse shadow-xs">
              AI
            </span>
          </div>
          <span className="text-[9.5px] sm:text-[11px] font-bold mt-0.5 tracking-tight text-teal-700 dark:text-teal-300 truncate w-full text-center">
            Topics
          </span>
        </button>

        {/* 4. Flashcards AI Quiz Button */}
        <button
          id="bottom-btn-flashcards"
          onClick={onOpenRandomFlashcards}
          className="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer group min-w-0"
          title="Study Random AI Flashcards"
        >
          <div className="relative p-1 rounded-lg group-hover:bg-amber-50 dark:group-hover:bg-amber-950/60 transition-colors">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[9.5px] sm:text-[11px] font-semibold mt-0.5 tracking-tight truncate w-full text-center">Flashcards</span>
        </button>

        {/* 5. OSCE Clinical Video Hub Button */}
        <button
          id="bottom-btn-osce"
          onClick={onOpenOsce}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer group min-w-0 ${
            isOsceOpen
              ? 'text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950/60'
              : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
          title="OSCE Clinical Video Hub"
        >
          <div className="relative p-1 rounded-lg">
            <Video className={`h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform ${
              isOsceOpen ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
            }`} />
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[7px] px-0.5 rounded-full animate-pulse">
              LIVE
            </span>
          </div>
          <span className="text-[9.5px] sm:text-[11px] font-semibold mt-0.5 tracking-tight truncate w-full text-center">
            OSCE
          </span>
        </button>

        {/* 6. Settings & Author Contact Button */}
        <button
          id="bottom-btn-settings"
          onClick={onOpenSettings}
          className="flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer group min-w-0"
          title="Settings, Guidelines & Author Contact"
        >
          <div className="p-1 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <span className="text-[9.5px] sm:text-[11px] font-semibold mt-0.5 tracking-tight truncate w-full text-center">Settings</span>
        </button>
      </div>
    </nav>
  );
};

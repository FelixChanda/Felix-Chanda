import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { ClinicalToolsModal } from './components/ClinicalToolsModal';
import { AddResourceModal } from './components/AddResourceModal';
import { SettingsModal } from './components/SettingsModal';
import { AdMobBanner } from './components/AdMobBanner';
import { FlashcardModal } from './components/FlashcardModal';
import { QuizModal } from './components/QuizModal';
import { BottomBar } from './components/BottomBar';
import { OsceModal } from './components/OsceModal';
import { TopicsModal } from './components/TopicsModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { DeveloperConsoleModal } from './components/DeveloperConsoleModal';
import { SplashScreen } from './components/SplashScreen';
import { AdMobInterstitialModal } from './components/AdMobInterstitialModal';
import { triggerAdMobInterstitial } from './utils/admobHelper';
import { updateNativeStatusBar, setupHardwareBackButton } from './utils/nativeApp';
import { INITIAL_RESOURCES } from './data/initialResources';
import { INITIAL_OPTIMUM_CONDITIONS, fetchOnlineClinicalGuidelines } from './data/optimumConditions';
import {
  ResourceItem,
  ResourceCategory,
  AcademicYearLevel,
  NursingDomain,
  ThemeMode,
  AdMobConfig,
  OptimumCondition
} from './types';
import {
  BookOpen,
  FileQuestion,
  GraduationCap,
  BookmarkCheck,
  Search,
  Sparkles,
  Award,
  HeartPulse,
  ShieldCheck,
  Info,
  AlertTriangle
} from 'lucide-react';

const STORAGE_KEY = 'datanurse_curated_resources_v1';

export default function App() {
  // Load persisted resources or fallback to INITIAL_RESOURCES
  const [resources, setResources] = useState<ResourceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved nursing resources', e);
    }
    return INITIAL_RESOURCES;
  });

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<AcademicYearLevel>('All Years');
  const [selectedDomain, setSelectedDomain] = useState<NursingDomain | 'All Domains'>('All Domains');
  const [sortBy, setSortBy] = useState<'latest' | 'title' | 'marks_or_credits'>('latest');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Modal States
  const [activeDetailItem, setActiveDetailItem] = useState<ResourceItem | null>(null);
  const [activeDocumentItem, setActiveDocumentItem] = useState<ResourceItem | null>(null);
  const [activePdfItem, setActivePdfItem] = useState<ResourceItem | null>(null);
  const [activeFlashcardResource, setActiveFlashcardResource] = useState<ResourceItem | null>(null);
  const [activeQuizResource, setActiveQuizResource] = useState<ResourceItem | null>(null);
  const [isClinicalToolsOpen, setIsClinicalToolsOpen] = useState(false);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isOsceOpen, setIsOsceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      return search.includes('install') || search.includes('apk') || search.includes('pwa') || path.includes('install');
    }
    return false;
  });

  // 5-second Hospital/Office Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Trigger online launch ad when splash screen completes
  useEffect(() => {
    if (!showSplash) {
      triggerAdMobInterstitial('launch', 'App Startup');
    }
  }, [showSplash]);

  // Trigger online after-sleep / screen wake-up interstitial ad
  useEffect(() => {
    let lastActive = Date.now();

    const handleBlur = () => {
      lastActive = Date.now();
    };

    const handleFocus = () => {
      if (Date.now() - lastActive > 3000) {
        triggerAdMobInterstitial('after_sleep', 'Screen Wake / Tab Focus');
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      } else {
        handleBlur();
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Top-of-Screen Alert Toast State
  const [topToastMessage, setTopToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleOfflineAlert = (e: any) => {
      setTopToastMessage(e.detail?.message || 'no internet');
      setTimeout(() => {
        setTopToastMessage(null);
      }, 4000);
    };
    window.addEventListener('datanurse-offline-alert', handleOfflineAlert);
    return () => {
      window.removeEventListener('datanurse-offline-alert', handleOfflineAlert);
    };
  }, []);

  // Fullscreen & Navigation Bar Toggle States - Default to true as requested
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [hideNavBars, setHideNavBars] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen toggle handler:', err);
      // Fallback toggle for framed viewports
      setIsFullscreen((prev) => !prev);
    }
  };

  const handleToggleHideNavBars = () => {
    setHideNavBars((prev) => !prev);
  };

  // Open Random AI Flashcards generator across all library modules
  const handleOpenRandomFlashcards = () => {
    triggerAdMobInterstitial('prompt', 'AI Flashcards Generator');
    if (resources && resources.length > 0) {
      const randomIndex = Math.floor(Math.random() * resources.length);
      setActiveFlashcardResource(resources[randomIndex]);
    }
  };

  // Theme State - defaults to dark as requested
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('datanurse_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'dark';
  });

  // Apply Theme class to document root & update Native Android Status Bar
  useEffect(() => {
    try {
      localStorage.setItem('datanurse_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      updateNativeStatusBar(theme);
    } catch (e) {}
  }, [theme]);

  // Native Android Hardware Back Button Handler
  useEffect(() => {
    const cleanup = setupHardwareBackButton(() => {
      if (isDevConsoleOpen) {
        setIsDevConsoleOpen(false);
        return true;
      }
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return true;
      }
      if (isOsceOpen) {
        setIsOsceOpen(false);
        return true;
      }
      if (isAddModalOpen) {
        setIsAddModalOpen(false);
        return true;
      }
      if (isClinicalToolsOpen) {
        setIsClinicalToolsOpen(false);
        return true;
      }
      if (isApkModalOpen) {
        setIsApkModalOpen(false);
        return true;
      }
      if (activeDetailItem) {
        setActiveDetailItem(null);
        return true;
      }
      if (activeDocumentItem) {
        setActiveDocumentItem(null);
        return true;
      }
      if (activePdfItem) {
        setActivePdfItem(null);
        return true;
      }
      if (activeFlashcardResource) {
        setActiveFlashcardResource(null);
        return true;
      }
      return false;
    });

    return cleanup;
  }, [
    isDevConsoleOpen,
    isSettingsOpen,
    isOsceOpen,
    isAddModalOpen,
    isClinicalToolsOpen,
    isApkModalOpen,
    activeDetailItem,
    activeDocumentItem,
    activePdfItem,
    activeFlashcardResource
  ]);

  // AdMob Configuration State with user's verified App ID and Ad Unit ID
  const [adMobConfig, setAdMobConfig] = useState<AdMobConfig>(() => {
    try {
      const saved = localStorage.getItem('datanurse_admob_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.appId = 'ca-app-pub-2887402752089984~5632535357';
        parsed.bannerUnitId = 'ca-app-pub-2887402752089984/7276789512';
        parsed.interstitialUnitId = 'ca-app-pub-2887402752089984/7276789512';
        parsed.enabled = true;
        parsed.testMode = false;
        return parsed;
      }
    } catch (e) {}
    return {
      enabled: true,
      testMode: false,
      appId: 'ca-app-pub-2887402752089984~5632535357',
      bannerUnitId: 'ca-app-pub-2887402752089984/7276789512',
      interstitialUnitId: 'ca-app-pub-2887402752089984/7276789512',
      showBannerBottom: true,
      showInlineAds: true,
    };
  });

  // Persist AdMob config
  useEffect(() => {
    try {
      localStorage.setItem('datanurse_admob_config', JSON.stringify(adMobConfig));
    } catch (e) {}
  }, [adMobConfig]);

  // Optimum Conditions State & Online Guidelines Automatic Sync
  const [optimumConditions, setOptimumConditions] = useState<OptimumCondition[]>(() => {
    try {
      const saved = localStorage.getItem('datanurse_optimum_conditions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_OPTIMUM_CONDITIONS;
  });

  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    try {
      return localStorage.getItem('datanurse_last_sync') || 'Online Verified (Live)';
    } catch (e) {
      return 'Online Verified (Live)';
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Automatically update optimum conditions from data fetched online on startup
  useEffect(() => {
    let isMounted = true;
    const runAutoSync = async () => {
      try {
        const feed = await fetchOnlineClinicalGuidelines();
        if (isMounted && feed.success) {
          setOptimumConditions(feed.conditions);
          setLastSyncTime(feed.syncTimestamp);
          try {
            localStorage.setItem('datanurse_optimum_conditions', JSON.stringify(feed.conditions));
            localStorage.setItem('datanurse_last_sync', feed.syncTimestamp);
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Background online guidelines auto-sync error:', err);
      }
    };
    runAutoSync();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleForceSyncConditions = async () => {
    setIsSyncing(true);
    try {
      const feed = await fetchOnlineClinicalGuidelines();
      if (feed.success) {
        setOptimumConditions(feed.conditions);
        setLastSyncTime(feed.syncTimestamp);
        try {
          localStorage.setItem('datanurse_optimum_conditions', JSON.stringify(feed.conditions));
          localStorage.setItem('datanurse_last_sync', feed.syncTimestamp);
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed manual online sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Persist to localStorage whenever resources change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    } catch (e) {
      console.error('Error saving resources to localStorage', e);
    }
  }, [resources]);

  // Toggle Bookmark
  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setResources((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = !item.isBookmarked;
          const updatedItem = { ...item, isBookmarked: updated };
          // Also update active modal if opened
          if (activeDetailItem && activeDetailItem.id === id) {
            setActiveDetailItem({ ...activeDetailItem, isBookmarked: updated });
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Add new user resource & persist to local storage
  const handleAddResource = async (newResource: ResourceItem) => {
    setResources((prev) => [newResource, ...prev]);
    // Automatically select the category of the new resource
    setSelectedCategory(newResource.category);
    if (newResource.category === 'documents') {
      setActiveDocumentItem(newResource);
    } else {
      setActiveDetailItem(newResource);
    }
  };

  // Compute counts for stats bar
  const counts = useMemo(() => {
    const modules = resources.filter((r) => r.category === 'modules').length;
    const past_papers = resources.filter((r) => r.category === 'past_papers').length;
    const textbooks = resources.filter((r) => r.category === 'textbooks').length;
    const notes = resources.filter((r) => r.category === 'notes').length;
    const documents = resources.filter((r) => r.category === 'documents').length;
    const bookmarked = resources.filter((r) => r.isBookmarked).length;

    return {
      all: resources.length,
      modules,
      past_papers,
      textbooks,
      notes,
      documents,
      bookmarked
    };
  }, [resources]);

  // Filter and Sort Resources
  const filteredResources = useMemo(() => {
    return resources
      .filter((item) => {
        // Bookmarks filter
        if (showBookmarksOnly && !item.isBookmarked) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Year Level filter
        if (selectedYear !== 'All Years' && item.yearLevel !== selectedYear) {
          return false;
        }

        // Domain filter
        if (selectedDomain !== 'All Domains' && item.domain !== selectedDomain) {
          return false;
        }

        // Search Query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchDesc = item.description.toLowerCase().includes(query);
          const matchDomain = item.domain.toLowerCase().includes(query);
          const matchCode = item.moduleCode?.toLowerCase().includes(query) || false;
          const matchPaperCode = item.paperCode?.toLowerCase().includes(query) || false;
          const matchDocType = item.documentGuidelineType?.toLowerCase().includes(query) || false;
          const matchDocFormat = item.documentFormat?.toLowerCase().includes(query) || false;
          const matchTags = item.tags.some((t) => t.toLowerCase().includes(query));
          const matchAuthors = item.authors?.toLowerCase().includes(query) || false;
          const matchQuestions =
            item.questions?.some((q) =>
              q.questionText.toLowerCase().includes(query) ||
              q.clinicalRationale.toLowerCase().includes(query)
            ) || false;
          const matchChapters =
            item.tableOfContents?.some((c) =>
              c.title.toLowerCase().includes(query) ||
              c.summary.toLowerCase().includes(query)
            ) || false;

          return (
            matchTitle ||
            matchDesc ||
            matchDomain ||
            matchCode ||
            matchPaperCode ||
            matchDocType ||
            matchDocFormat ||
            matchTags ||
            matchAuthors ||
            matchQuestions ||
            matchChapters
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'marks_or_credits') {
          const valA = a.totalMarks || (a.credits ? a.credits * 10 : 0) || 0;
          const valB = b.totalMarks || (b.credits ? b.credits * 10 : 0) || 0;
          return valB - valA;
        }
        // Default latest
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [
    resources,
    selectedCategory,
    selectedYear,
    selectedDomain,
    searchQuery,
    sortBy,
    showBookmarksOnly
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedYear !== 'All Years' ||
    selectedDomain !== 'All Domains' ||
    showBookmarksOnly;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedYear('All Years');
    setSelectedDomain('All Domains');
    setShowBookmarksOnly(false);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 relative overflow-x-hidden ${
      hideNavBars ? 'pt-3 pb-8' : adMobConfig.enabled && adMobConfig.showBannerBottom ? 'pt-20 sm:pt-24 pb-36 sm:pb-40' : 'pt-20 sm:pt-24 pb-24 sm:pb-28'
    }`}>
      {/* 5-Second Office / Hospital Splash Screen */}
      {showSplash && (
        <SplashScreen
          durationMs={5000}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* Top-of-Screen Offline Alert Toast Banner */}
      {topToastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white font-black px-6 py-2.5 rounded-full shadow-2xl border-2 border-white/80 flex items-center gap-2 text-sm animate-bounce tracking-wide">
          <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0" />
          <span className="uppercase">{topToastMessage}</span>
        </div>
      )}

      {/* Uploaded Campus Background Image - Clear, viewable backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <img
          src="/bg-default.jpeg"
          alt="Nursing Campus Background"
          className="w-full h-full object-cover opacity-65 dark:opacity-55 filter contrast-115 saturate-110 scale-105 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/45 backdrop-blur-[0.5px]" />
      </div>

      {/* Floating Control Bar for Hidden Nav Bars Mode or Full Screen Mode */}
      {hideNavBars && (
        <div className="fixed top-3 right-3 z-50 flex items-center gap-2 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full border border-teal-500/50 shadow-2xl text-xs font-bold animate-pulse">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          <span>Full View Active</span>
          <button
            onClick={handleToggleHideNavBars}
            className="ml-1 px-2 py-0.5 bg-teal-600 hover:bg-teal-500 text-white rounded-full text-[10px] uppercase font-black transition-colors cursor-pointer"
            title="Restore Navigation Bars"
          >
            Show Bars
          </button>
        </div>
      )}

      {/* Top Header */}
      {!hideNavBars && (
        <Header
          totalCount={counts.all}
          bookmarkedCount={counts.bookmarked}
          showBookmarksOnly={showBookmarksOnly}
          onToggleBookmarksOnly={() => setShowBookmarksOnly((prev) => !prev)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenClinicalTools={() => setIsClinicalToolsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          activeCategory={selectedCategory}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          hideNavBars={hideNavBars}
          onToggleHideNavBars={handleToggleHideNavBars}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        {/* Banner / Info Card */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-semibold">
              <HeartPulse className="h-3.5 w-3.5 text-teal-300" />
              <span>Standardized Nursing Education Curriculum</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              DATANURSE Academic & Clinical Library
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
              Unified repository for BSN and RN nursing students. Access accredited academic modules, authentic past examination papers with marking schemes, gold-standard clinical textbooks, high-yield revision cheat sheets, and AI-powered active recall flashcards.
            </p>

            {/* Fast Quick Links */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => { setSelectedCategory('modules'); setSelectedYear('All Years'); }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-teal-100 border border-white/10 font-medium transition-colors cursor-pointer"
              >
                🎓 Syllabi & Modules
              </button>
              <button
                onClick={() => { setSelectedCategory('documents'); setSelectedYear('All Years'); }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold transition-colors cursor-pointer"
              >
                📄 Clinical Documents & Protocols
              </button>
              <button
                onClick={() => { setSelectedCategory('past_papers'); setSelectedYear('All Years'); }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-teal-100 border border-white/10 font-medium transition-colors cursor-pointer"
              >
                📝 Past Papers & Marking Schemes
              </button>
              <button
                onClick={() => { setSelectedCategory('textbooks'); setSelectedYear('All Years'); }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-teal-100 border border-white/10 font-medium transition-colors cursor-pointer"
              >
                📚 Core Nursing Textbooks
              </button>
              <button
                onClick={() => { setSelectedCategory('notes'); setSelectedYear('All Years'); }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-teal-100 border border-white/10 font-medium transition-colors cursor-pointer"
              >
                📑 Care Plans & Lab Sheets
              </button>
            </div>
          </div>

          {/* Decorative faint background element */}
          <div className="absolute right-4 bottom-2 opacity-10 pointer-events-none hidden md:block">
            <GraduationCap className="h-56 w-56 text-white" />
          </div>
        </div>

        {/* Category Stats Overview Bar */}
        <StatsBar
          counts={counts}
          activeCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Filter and Search Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedDomain={selectedDomain}
          onDomainChange={setSelectedDomain}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Inline AdMob Sponsor Banner if enabled */}
        {adMobConfig.enabled && adMobConfig.showInlineAds && (
          <AdMobBanner
            config={adMobConfig}
            variant="inline-content"
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {showBookmarksOnly ? 'Saved Bookmarks' : 'Available Resources'}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {filteredResources.length} items
            </span>
            {selectedCategory !== 'all' && (
              <span className="text-xs text-teal-700 dark:text-teal-400 font-medium hidden sm:inline">
                in <span className="capitalize">{selectedCategory.replace('_', ' ')}</span>
              </span>
            )}
          </div>

          {showBookmarksOnly && (
            <button
              onClick={() => setShowBookmarksOnly(false)}
              className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 cursor-pointer"
            >
              Show All Resources
            </button>
          )}
        </div>

        {/* Resource Cards Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map((item, index) => (
              <ResourceCard
                key={item.id}
                item={item}
                index={index}
                onOpenDetail={(target) => {
                  if (target.category === 'documents') {
                    setActiveDocumentItem(target);
                  } else {
                    setActiveDetailItem(target);
                  }
                }}
                onOpenDeviceReader={(target) => {
                  setActiveDocumentItem(target);
                }}
                onOpenPdfViewer={(target) => {
                  setActivePdfItem(target);
                }}
                onToggleBookmark={(id, e) => handleToggleBookmark(id, e)}
                onOpenFlashcards={(target, e) => {
                  e.stopPropagation();
                  setActiveFlashcardResource(target);
                }}
                onOpenQuiz={(target, e) => {
                  e.stopPropagation();
                  setActiveQuizResource(target);
                }}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-10 text-center space-y-4 shadow-lg transition-colors">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto">
              <Search className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                No matching nursing resources found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {showBookmarksOnly
                  ? "You haven't bookmarked any resources yet. Click the bookmark icon on any item to save it here."
                  : 'Try broadening your search term, changing the nursing domain, or resetting the year level filters.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Contribute this Resource
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-slate-500 dark:text-slate-400 text-xs transition-colors duration-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
              DATA<span className="text-teal-600 dark:text-teal-400">NURSE</span>
            </span>
            <span className="text-teal-700 dark:text-teal-300 font-semibold">
              compiled by CHANDA FELIX
            </span>
            <span>• Nursing Database & Academic Resource Library</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsClinicalToolsOpen(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 font-medium cursor-pointer"
            >
              Clinical Tools
            </button>
            <span>•</span>
            <button
              onClick={() => { setSelectedCategory('past_papers'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-teal-600 dark:hover:text-teal-400 font-medium cursor-pointer"
            >
              Past Papers Bank
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 font-medium cursor-pointer"
            >
              Settings & Contact
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 font-medium cursor-pointer"
            >
              Submit Resource
            </button>
          </div>
        </div>
      </footer>

      {/* Dedicated Bottom Bar for Tools, Bookmarks, Topics, Flashcards, OSCE Videos, and Settings */}
      {!hideNavBars && (
        <BottomBar
          bookmarkedCount={counts.bookmarked}
          showBookmarksOnly={showBookmarksOnly}
          onToggleBookmarksOnly={() => setShowBookmarksOnly((prev) => !prev)}
          onOpenClinicalTools={() => setIsClinicalToolsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTopics={() => setIsTopicsOpen(true)}
          isTopicsOpen={isTopicsOpen}
          onOpenRandomFlashcards={handleOpenRandomFlashcards}
          onOpenOsce={() => setIsOsceOpen(true)}
          isOsceOpen={isOsceOpen}
          bottomOffsetClass={
            adMobConfig.enabled && adMobConfig.showBannerBottom
              ? 'bottom-[50px] sm:bottom-[54px]'
              : 'bottom-0'
          }
        />
      )}

      {/* Nursing Topics Hub Modal (Gemini AI Sourced & Updated) */}
      <TopicsModal
        isOpen={isTopicsOpen}
        onClose={() => setIsTopicsOpen(false)}
      />

      {/* OSCE Clinical Video Hub (Multi-Institution & YouTube/Drive Player) */}
      <OsceModal
        isOpen={isOsceOpen}
        onClose={() => setIsOsceOpen(false)}
      />

      {/* Bottom Fixed AdMob Banner if enabled */}
      {adMobConfig.enabled && adMobConfig.showBannerBottom && (
        <AdMobBanner
          config={adMobConfig}
          variant="bottom-fixed"
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Resource Detail Viewer Modal */}
      <ResourceDetailModal
        item={activeDetailItem}
        onClose={() => setActiveDetailItem(null)}
        onToggleBookmark={(id) => handleToggleBookmark(id)}
        onOpenFlashcards={(target) => setActiveFlashcardResource(target)}
        onOpenQuiz={(target) => setActiveQuizResource(target)}
        onOpenPdfViewer={(target) => setActivePdfItem(target)}
      />

      {/* Clinical Document Viewer & Device Reader Modal */}
      <DocumentViewerModal
        item={activeDocumentItem}
        isOpen={Boolean(activeDocumentItem)}
        onClose={() => setActiveDocumentItem(null)}
        onOpenQuiz={(target) => setActiveQuizResource(target)}
      />

      {/* Lightweight Integrated PDF Viewer Modal */}
      <PdfViewerModal
        item={activePdfItem}
        isOpen={Boolean(activePdfItem)}
        onClose={() => setActivePdfItem(null)}
        onOpenQuiz={(target) => setActiveQuizResource(target)}
      />

      {/* AI Flashcard Generator & Study Modal */}
      <FlashcardModal
        resource={activeFlashcardResource}
        isOpen={Boolean(activeFlashcardResource)}
        onClose={() => setActiveFlashcardResource(null)}
      />

      {/* AI Multiple-Choice Quiz & Examination Modal */}
      <QuizModal
        resource={activeQuizResource}
        isOpen={Boolean(activeQuizResource)}
        onClose={() => setActiveQuizResource(null)}
        onOpenFlashcards={(target) => setActiveFlashcardResource(target)}
      />

      {/* Clinical Calculators & Lab Values Reference Modal */}
      <ClinicalToolsModal
        isOpen={isClinicalToolsOpen}
        onClose={() => setIsClinicalToolsOpen(false)}
        theme={theme}
        onSelectTheme={setTheme}
        optimumConditions={optimumConditions}
        lastSyncTime={lastSyncTime}
        onForceSyncConditions={handleForceSyncConditions}
        isSyncing={isSyncing}
        adMobConfig={adMobConfig}
        onUpdateAdMobConfig={setAdMobConfig}
      />

      {/* Settings Modal (Theme, Email Contact, APK Download, Optimum Conditions, AdMob, Google Drive Workspace) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onSelectTheme={setTheme}
        adMobConfig={adMobConfig}
        onUpdateAdMobConfig={setAdMobConfig}
        lastSyncTime={lastSyncTime}
        onForceSyncConditions={handleForceSyncConditions}
        isSyncing={isSyncing}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenDevConsole={() => setIsDevConsoleOpen(true)}
      />

      {/* Developer Console Controls (Drive Sync, OSCETUBE Management, JSON Database Backup/Restore) */}
      <DeveloperConsoleModal
        isOpen={isDevConsoleOpen}
        onClose={() => setIsDevConsoleOpen(false)}
        resources={resources}
        onRestoreResources={(restored) => setResources(restored)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenOsceModal={() => setIsOsceOpen(true)}
      />

      {/* Contribute / Add Resource Modal */}
      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddResource={handleAddResource}
      />

      {/* Android APK Download Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Online Full-Screen AdMob Interstitial Modal */}
      <AdMobInterstitialModal />
    </div>
  );
}

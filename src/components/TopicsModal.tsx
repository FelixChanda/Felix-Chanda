import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Globe,
  MapPin,
  Stethoscope,
  ChevronRight,
  Send,
  Bot,
  User,
  GraduationCap,
  ShieldCheck,
  Zap,
  Tag,
  ArrowRight
} from 'lucide-react';
import { NursingTopic } from '../types';

interface TopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TopicsModal: React.FC<TopicsModalProps> = ({ isOpen, onClose }) => {
  const [topics, setTopics] = useState<NursingTopic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<NursingTopic | null>(null);

  // Gemini Live Q&A Tutor State for Selected Topic
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAskingAi, setIsAskingAi] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchTopics = async (region = selectedRegion, category = selectedCategory, search = searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch('/api/nursing-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, category, searchQuery: search })
      });
      const data = await response.json();
      if (data.topics && Array.isArray(data.topics)) {
        setTopics(data.topics);
        if (data.topics.length > 0 && !activeTopic) {
          setActiveTopic(data.topics[0]);
        }
        if (data.lastUpdated) {
          setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTopics();
    }
  }, [isOpen]);

  const handleAskAi = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeTopic || isAskingAi) return;

    const questionToSend = aiQuestion.trim() || `What are the most tested GNCZ exam questions and key clinical priority actions for ${activeTopic.title}?`;
    setIsAskingAi(true);
    setAiAnswer(null);

    try {
      const response = await fetch('/api/nursing-topic-deepdive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: activeTopic.title,
          question: questionToSend
        })
      });
      const data = await response.json();
      setAiAnswer(data.answer || 'No response generated. Please retry.');
      setAiQuestion('');
    } catch (err) {
      setAiAnswer('Clinical AI tutor connection failed. Please verify internet connection.');
    } finally {
      setIsAskingAi(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Specialties' },
    { id: 'National Health Priority', label: '🇿🇲 Zambia Priorities' },
    { id: 'Maternal & Neonatal', label: '🤰 Maternal & Midwifery' },
    { id: 'Pediatrics & IMCI', label: '👶 Pediatrics & IMCI' },
    { id: 'Critical Care & Emergency', label: '🚨 Emergency & ICU' },
    { id: 'Public Health & Epidemiology', label: '🏛️ Public Health' },
    { id: 'Pharmacology & Therapeutics', label: '💊 Pharmacology' }
  ];

  const filteredTopics = topics.filter((topic) => {
    const matchesRegion =
      selectedRegion === 'all' ||
      topic.region.toLowerCase() === selectedRegion.toLowerCase() ||
      topic.region === 'Both';
    const matchesCategory =
      selectedCategory === 'all' ||
      topic.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.institutionOrGuideline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (topic.tags && topic.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesRegion && matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-3 md:p-6 animate-fadeIn">
      <div
        id="nursing-topics-modal"
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-none sm:rounded-2xl max-w-7xl w-full h-full sm:h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Nursing Topics Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  <span>Gemini AI Sourced</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Zambian (GNCZ, NMCZ, MoH) & Global (WHO, CDC) evidence-based nursing curriculum & exam pearls
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchTopics(selectedRegion, selectedCategory, searchQuery)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="Query Gemini AI to refresh and source the latest nursing topics"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
              <span className="hidden md:inline">Update with AI</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close Topics Hub"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 sm:px-6 bg-slate-100/70 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shrink-0">
          {/* Region Tabs (All, Zambia, Global) */}
          <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl shrink-0">
            <button
              onClick={() => {
                setSelectedRegion('all');
                fetchTopics('all', selectedCategory, searchQuery);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedRegion === 'all'
                  ? 'bg-white dark:bg-teal-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Regions
            </button>
            <button
              onClick={() => {
                setSelectedRegion('zambia');
                fetchTopics('zambia', selectedCategory, searchQuery);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedRegion === 'zambia'
                  ? 'bg-white dark:bg-teal-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🇿🇲 Zambia (GNCZ)</span>
            </button>
            <button
              onClick={() => {
                setSelectedRegion('global');
                fetchTopics('global', selectedCategory, searchQuery);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedRegion === 'global'
                  ? 'bg-white dark:bg-teal-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🌐 Global (WHO)</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              placeholder="Search topics, guidelines, medications, or exams..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Chips */}
        <div className="px-3 sm:px-6 py-2 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                fetchTopics(selectedRegion, cat.id, searchQuery);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content (Split Grid: List on Left, Active Deep-Dive on Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Topics List (5 Cols) */}
          <div className="lg:col-span-5 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-slate-50/30 dark:bg-slate-950/30">
            {loading && topics.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Gemini AI is analyzing nursing guidelines...
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sourcing updated clinical standards from GNCZ, NMCZ, and WHO
                </p>
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching topics found</p>
                <p className="text-xs text-slate-500">Try changing your filters or searching for other keywords.</p>
                <button
                  onClick={() => {
                    setSelectedRegion('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                    fetchTopics('all', 'all', '');
                  }}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredTopics.map((t) => {
                const isSelected = activeTopic?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTopic(t);
                      setAiAnswer(null);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 shadow-md ring-1 ring-teal-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.region === 'Zambia'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : t.region === 'Global'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                                : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                            }`}
                          >
                            {t.region === 'Zambia' ? '🇿🇲 Zambia' : t.region === 'Global' ? '🌐 Global' : '🌍 Universal'}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {t.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {t.title}
                        </h3>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isSelected ? 'text-teal-600 rotate-90 lg:rotate-0' : 'text-slate-400 group-hover:translate-x-0.5'
                        }`}
                      />
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      {t.summary}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="truncate max-w-[200px] font-medium text-teal-700 dark:text-teal-300">
                        {t.institutionOrGuideline}
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                        {t.level}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Active Topic Deep-Dive & Gemini Q&A Tutor (7 Cols) */}
          <div className="lg:col-span-7 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-900 space-y-5">
            {activeTopic ? (
              <>
                {/* Topic Header */}
                <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                      {activeTopic.category}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {activeTopic.level}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Source: {activeTopic.institutionOrGuideline}
                    </span>
                  </div>

                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                    {activeTopic.title}
                  </h1>

                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeTopic.summary}
                  </p>
                </div>

                {/* Priority Nursing Interventions (ADPIE) */}
                <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <Stethoscope className="h-4 w-4" />
                    <span>Priority Nursing Interventions (ADPIE Clinical Workflow)</span>
                  </h4>
                  <div className="space-y-2">
                    {activeTopic.priorityInterventions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                        <div className="h-5 w-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="leading-relaxed font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* High-Yield Clinical Pearls */}
                <div className="space-y-2.5 bg-amber-50/80 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>High-Yield Clinical Pearls & Patient Safety Alerts</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {activeTopic.keyPearls.map((pearl, i) => (
                      <li key={i} className="text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2 leading-relaxed">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                        <span>{pearl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* GNCZ / Licensure Exam Traps Focus */}
                <div className="space-y-2 bg-purple-50/80 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800/60">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Licensure Exam Focus (GNCZ / NMCZ / NCLEX)</span>
                  </h4>
                  <p className="text-xs text-purple-950 dark:text-purple-200 leading-relaxed font-medium">
                    {activeTopic.examFocus}
                  </p>
                </div>

                {/* Recent 2025/2026 Treatment Updates if available */}
                {activeTopic.recentUpdates && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Recent Clinical Update: </span>
                      <span>{activeTopic.recentUpdates}</span>
                    </div>
                  </div>
                )}

                {/* Interactive Gemini AI Clinical Tutor Box */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400">
                      <Bot className="h-5 w-5" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Ask Gemini AI Clinical Tutor
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Live Clinical Reasoning
                    </span>
                  </div>

                  {aiAnswer && (
                    <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-slate-950 border border-teal-300 dark:border-teal-700/80 text-xs leading-relaxed text-slate-800 dark:text-slate-200 space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-1.5 font-bold text-teal-700 dark:text-teal-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Gemini Tutor Explanation:</span>
                      </div>
                      <div className="whitespace-pre-line text-xs font-sans">
                        {aiAnswer}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleAskAi} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      placeholder={`Ask anything about ${activeTopic.title} (e.g. drug dosing, exam questions)...`}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="submit"
                      disabled={isAskingAi}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isAskingAi ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span>Ask AI</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <BookOpen className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold">Select a nursing topic to inspect full clinical details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

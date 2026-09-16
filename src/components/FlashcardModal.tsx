import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Shuffle,
  Copy,
  Check,
  Brain,
  Award,
  Layers,
  HelpCircle,
  Lightbulb,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { ResourceItem, Flashcard } from '../types';
import { fetchAIFlashcards } from '../utils/flashcardGenerator';

interface FlashcardModalProps {
  resource: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({
  resource,
  isOpen,
  onClose
}) => {
  if (!isOpen || !resource) return null;

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cardCount, setCardCount] = useState<number>(8);
  const [focusMode, setFocusMode] = useState<string>('all');
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [needsReviewIds, setNeedsReviewIds] = useState<Set<string>>(new Set());
  const [filterNeedsReviewOnly, setFilterNeedsReviewOnly] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Load flashcards for resource
  const loadCards = useCallback(async (count: number, mode: string) => {
    setIsLoading(true);
    setIsFlipped(false);
    try {
      const generated = await fetchAIFlashcards(resource, count, mode);
      setCards(generated);
      setCurrentIndex(0);
      setMasteredIds(new Set());
      setNeedsReviewIds(new Set());
      setFilterNeedsReviewOnly(false);
    } catch (err) {
      console.error('Failed to generate flashcards', err);
    } finally {
      setIsLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    loadCards(cardCount, focusMode);
  }, [loadCards, cardCount, focusMode]);

  // Active cards based on filter
  const activeCards = useMemo(() => {
    if (filterNeedsReviewOnly) {
      const filtered = cards.filter((c) => needsReviewIds.has(c.id));
      return filtered.length > 0 ? filtered : cards;
    }
    return cards;
  }, [cards, filterNeedsReviewOnly, needsReviewIds]);

  const currentCard: Flashcard | undefined = activeCards[currentIndex] || activeCards[0];

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % activeCards.length);
  }, [activeCards.length]);

  const handlePrev = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
  }, [activeCards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleMarkMastered = useCallback(() => {
    if (!currentCard) return;
    setMasteredIds((prev) => new Set(prev).add(currentCard.id));
    setNeedsReviewIds((prev) => {
      const copy = new Set(prev);
      copy.delete(currentCard.id);
      return copy;
    });
    handleNext();
  }, [currentCard, handleNext]);

  const handleMarkNeedsReview = useCallback(() => {
    if (!currentCard) return;
    setNeedsReviewIds((prev) => new Set(prev).add(currentCard.id));
    setMasteredIds((prev) => {
      const copy = new Set(prev);
      copy.delete(currentCard.id);
      return copy;
    });
    handleNext();
  }, [currentCard, handleNext]);

  // Shuffle
  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '1') {
        handleMarkNeedsReview();
      } else if (e.key === '2') {
        handleMarkMastered();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleMarkMastered, handleMarkNeedsReview, onClose]);

  // Copy all Q&A for export
  const handleCopyAll = () => {
    if (cards.length === 0) return;
    const text = cards
      .map(
        (c, i) =>
          `[Flashcard ${i + 1}] (${c.category} • ${c.difficulty || 'Standard'})\nQ: ${c.question}\nA: ${c.answer}\nRationale: ${c.explanation}\nKey Pearl: ${c.keyPearl}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(
      `DATANURSE AI Flashcard Deck: ${resource.title} (${resource.domain})\n\n${text}`
    );
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Category badge styling
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Priority Action':
        return 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'NCLEX Case':
        return 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Drug & Pharmacology':
        return 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Diagnostic Sign':
        return 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Clinical Rationale':
        return 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const masteryPercent =
    cards.length > 0 ? Math.round((masteredIds.size / cards.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div
        id="modal-flashcards"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 overflow-hidden transition-colors duration-200"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs shrink-0">
              <Brain className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  AI Quiz & Flashcards
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
                  <Sparkles className="h-3 w-3 mr-1 text-teal-600 dark:text-teal-400" />
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md" title={resource.title}>
                {resource.title} • <span className="font-semibold text-teal-600 dark:text-teal-400">{resource.domain}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <button
              onClick={handleCopyAll}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Copy all cards formatted for study guides"
            >
              {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copiedAll ? 'Copied' : 'Export'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Flashcards (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Generator Controls Bar */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-100/70 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Focus mode selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Focus:</span>
              <select
                value={focusMode}
                onChange={(e) => setFocusMode(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Clinical Topics</option>
                <option value="nclex">NCLEX High-Yield Cases</option>
                <option value="pharmacology">Pharmacology & Safety</option>
                <option value="rationales">Clinical Rationale & Signs</option>
              </select>
            </div>

            {/* Card count selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Deck Size:</span>
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value={5}>5 Cards</option>
                <option value={8}>8 Cards</option>
                <option value={12}>12 Cards</option>
              </select>
            </div>

            {needsReviewIds.size > 0 && (
              <button
                onClick={() => {
                  setFilterNeedsReviewOnly((prev) => !prev);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  filterNeedsReviewOnly
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}
              >
                {filterNeedsReviewOnly ? 'Show All Cards' : `Review Missed (${needsReviewIds.size})`}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              disabled={isLoading || activeCards.length === 0}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Randomize card order"
            >
              <Shuffle className="h-3 w-3" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={() => loadCards(cardCount, focusMode)}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Generating...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Study Progress Indicator */}
        <div className="px-5 sm:px-6 pt-3 pb-2 flex items-center justify-between gap-4 shrink-0 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 dark:text-white">
              Card {activeCards.length > 0 ? currentIndex + 1 : 0} of {activeCards.length}
            </span>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {masteredIds.size} Mastered
              </span>
              <span>•</span>
              <span className="inline-flex items-center text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                {needsReviewIds.size} Review
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-600 dark:text-teal-400">{masteryPercent}%</span>
            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${masteryPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Flashcard Interactive Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center min-h-[320px] sm:min-h-[380px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center">
              <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 animate-pulse">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Generating Clinical Flashcards...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Analyzing {resource.title} content, extracting priority questions, clinical rationales, and exam pearls.
              </p>
            </div>
          ) : currentCard ? (
            <div className="w-full max-w-2xl flex flex-col items-center">
              {/* Flip Card Container */}
              <div
                id={`flashcard-${currentCard.id}`}
                onClick={handleFlip}
                className="w-full cursor-pointer group"
                role="button"
                tabIndex={0}
                aria-label="Click to flip flashcard"
              >
                <div
                  className={`w-full min-h-[280px] sm:min-h-[320px] rounded-2xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between relative shadow-md select-none ${
                    !isFlipped
                      ? 'bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-950 border-slate-200/90 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600'
                      : 'bg-gradient-to-b from-teal-50/50 via-white to-slate-50 dark:from-teal-950/30 dark:via-slate-900 dark:to-slate-950 border-teal-300 dark:border-teal-700/80 ring-1 ring-teal-500/20 shadow-lg'
                  }`}
                >
                  {/* Top Badges & Status */}
                  <div className="flex items-center justify-between gap-2 shrink-0 mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getCategoryColor(
                          currentCard.category
                        )}`}
                      >
                        {currentCard.category}
                      </span>
                      {currentCard.difficulty && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                          {currentCard.difficulty}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 dark:text-slate-500">
                      <RotateCcw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
                      <span className="hidden sm:inline text-[11px] font-medium">
                        {isFlipped ? 'Showing Answer' : 'Click to Flip'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Front (Question) or Back (Answer & Rationale) */}
                  <div className="flex-1 flex flex-col justify-center my-2">
                    {!isFlipped ? (
                      /* FRONT: Question */
                      <div className="space-y-4">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs shrink-0 mt-0.5">
                            Q
                          </div>
                          <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white leading-relaxed">
                            {currentCard.question}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic pl-8">
                          Think through your nursing assessment, priority interventions, and rationale before flipping.
                        </p>
                      </div>
                    ) : (
                      /* BACK: Answer + Rationale + Pearl */
                      <div className="space-y-3.5 animate-fadeIn">
                        {/* Target Answer */}
                        <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1 flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> Target Clinical Answer
                          </div>
                          <p className="font-bold text-sm sm:text-base text-teal-950 dark:text-teal-100 leading-snug">
                            {currentCard.answer}
                          </p>
                        </div>

                        {/* Rationale */}
                        {currentCard.explanation && (
                          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                            <span className="font-bold text-slate-900 dark:text-white mr-1">
                              Clinical Rationale:
                            </span>
                            {currentCard.explanation}
                          </div>
                        )}

                        {/* High-Yield Clinical Pearl */}
                        {currentCard.keyPearl && (
                          <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold uppercase text-[10px] tracking-wider block text-amber-800 dark:text-amber-300">
                                High-Yield Clinical Pearl / Safety Alert:
                              </span>
                              <span>{currentCard.keyPearl}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Prompt / Flip Action Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 shrink-0">
                    <span className="text-[11px]">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">Space</kbd> to flip
                    </span>
                    <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                      {isFlipped ? 'Click to view question' : 'Click to reveal answer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Self Assessment Actions (When Flipped) */}
              {isFlipped && (
                <div className="mt-4 flex items-center justify-center gap-3 w-full animate-fadeIn">
                  <button
                    onClick={handleMarkNeedsReview}
                    className="flex-1 max-w-[200px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                    title="Press 1 on keyboard"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span>Needs Review (1)</span>
                  </button>

                  <button
                    onClick={handleMarkMastered}
                    className="flex-1 max-w-[200px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                    title="Press 2 on keyboard"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Got It! Mastered (2)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 space-y-2">
              <p className="font-bold text-slate-700 dark:text-slate-300">No cards in this deck filter</p>
              <button
                onClick={() => setFilterNeedsReviewOnly(false)}
                className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold"
              >
                Show All Cards
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <button
            onClick={handlePrev}
            disabled={activeCards.length <= 1}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={handleFlip}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={activeCards.length <= 1}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

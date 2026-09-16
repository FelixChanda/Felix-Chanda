import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  X,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Award,
  BookOpen,
  Brain,
  HelpCircle,
  Lightbulb,
  Share2,
  Copy,
  Check,
  Printer,
  SlidersHorizontal,
  Flame,
  Target,
  FileText,
  ListOrdered,
  Shuffle
} from 'lucide-react';
import { ResourceItem, QuizQuestion, QuizHistoryItem } from '../types';
import { fetchAIQuiz, saveQuizHistory, loadQuizHistory } from '../utils/quizGenerator';

interface QuizModalProps {
  resource: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFlashcards?: (resource: ResourceItem) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  resource,
  isOpen,
  onClose,
  onOpenFlashcards
}) => {
  if (!isOpen || !resource) return null;

  // Configuration state
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [quizMode, setQuizMode] = useState<'study' | 'exam'>('study');
  const [difficulty, setDifficulty] = useState<string>('balanced');
  const [focusTopic, setFocusTopic] = useState<string>('');

  // Active quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiSource, setApiSource] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'missed' | 'correct'>('all');

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Load quiz from server or fallback
  const loadQuiz = useCallback(async () => {
    if (!resource) return;
    setIsLoading(true);
    setIsSubmitted(false);
    setUserAnswers({});
    setCurrentIdx(0);
    setSecondsElapsed(0);

    try {
      const qs = await fetchAIQuiz(resource, questionCount, difficulty, focusTopic);
      setQuestions(qs);
      setApiSource(qs.length > 0 ? 'Gemini AI Clinical Engine' : 'Clinical Curriculum Engine');
    } catch (err) {
      console.error('Failed to load quiz questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [resource, questionCount, difficulty, focusTopic]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  // Timer effect
  useEffect(() => {
    if (isLoading || isSubmitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, isSubmitted]);

  // Format time (MM:SS)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion: QuizQuestion | undefined = questions[currentIdx];

  // Selection handler
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted && quizMode === 'exam') return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Check if current question has been answered
  const isCurrentAnswered = currentQuestion ? userAnswers[currentQuestion.id] !== undefined : false;
  const currentSelectedOption = currentQuestion ? userAnswers[currentQuestion.id] : undefined;

  // Calculate score
  const scoreStats = useMemo(() => {
    if (questions.length === 0) return { score: 0, total: 0, percentage: 0, missed: [] as QuizQuestion[] };
    let correctCount = 0;
    const missedList: QuizQuestion[] = [];

    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        correctCount++;
      } else {
        missedList.push(q);
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    return {
      score: correctCount,
      total: questions.length,
      percentage,
      missed: missedList
    };
  }, [questions, userAnswers]);

  // Submit quiz handler
  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Save to history
    saveQuizHistory({
      id: `quiz-run-${Date.now()}`,
      resourceId: resource.id,
      resourceTitle: resource.title,
      category: resource.category,
      score: scoreStats.score,
      total: scoreStats.total,
      percentage: scoreStats.percentage,
      timeSpentSeconds: secondsElapsed,
      completedAt: new Date().toISOString(),
      mode: quizMode
    });
  };

  // Practice missed questions
  const handlePracticeMissed = () => {
    if (scoreStats.missed.length === 0) return;
    setQuestions(scoreStats.missed);
    setUserAnswers({});
    setCurrentIdx(0);
    setIsSubmitted(false);
    setSecondsElapsed(0);
    setQuizMode('study');
  };

  // Retake same questions
  const handleRetakeSame = () => {
    setUserAnswers({});
    setCurrentIdx(0);
    setIsSubmitted(false);
    setSecondsElapsed(0);
  };

  // Copy results summary
  const handleCopySummary = () => {
    const summary = `📊 DATANURSE Clinical Quiz Report
Module: ${resource.title} (${resource.domain})
Score: ${scoreStats.score}/${scoreStats.total} (${scoreStats.percentage}%)
Time Taken: ${formatTime(secondsElapsed)}
Mode: ${quizMode === 'study' ? 'Study Mode' : 'Exam Simulation'}
Status: ${scoreStats.percentage >= 80 ? 'Mastery Achieved / NCLEX Ready ✅' : scoreStats.percentage >= 60 ? 'Passing / Review Needed ⚠️' : 'Remediation Recommended ❌'}
Generated via DATANURSE AI Clinical Engine`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Filtered review questions
  const reviewQuestions = useMemo(() => {
    if (reviewFilter === 'missed') {
      return questions.filter((q) => userAnswers[q.id] !== q.correctAnswerIndex);
    }
    if (reviewFilter === 'correct') {
      return questions.filter((q) => userAnswers[q.id] === q.correctAnswerIndex);
    }
    return questions;
  }, [questions, userAnswers, reviewFilter]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div
        id="modal-quiz"
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
      >
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xs shrink-0">
              <Brain className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                  AI Multiple-Choice Quiz
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {resource.domain}
                </span>
                {resource.moduleCode && (
                  <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
                    [{resource.moduleCode}]
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {resource.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Flashcards shortcut */}
            {onOpenFlashcards && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFlashcards(resource);
                }}
                className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900/80 text-teal-800 dark:text-teal-300 text-xs font-bold transition-colors cursor-pointer"
                title="Switch to Flashcards mode"
              >
                <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>Flashcards</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close quiz dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100/90 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            {/* Mode toggle */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setQuizMode('study')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  quizMode === 'study'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Instant feedback & rationales after each question"
              >
                Study Mode
              </button>
              <button
                onClick={() => setQuizMode('exam')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  quizMode === 'exam'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Timed test simulation with comprehensive end-of-quiz score review"
              >
                Exam Mode
              </button>
            </div>

            {/* Question Count Select */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Questions:</span>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                disabled={isLoading || isSubmitted}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teal-500 cursor-pointer disabled:opacity-50"
              >
                <option value={5}>5 Qs</option>
                <option value={10}>10 Qs</option>
                <option value={15}>15 Qs</option>
                <option value={20}>20 Qs</option>
              </select>
            </div>

            {/* Difficulty Select */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Focus:</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isLoading || isSubmitted}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teal-500 cursor-pointer disabled:opacity-50"
              >
                <option value="balanced">Balanced Mix</option>
                <option value="nclex">NCLEX Scenarios</option>
                <option value="pharmacology">Pharmacology & Safety</option>
              </select>
            </div>
          </div>

          {/* Right Action: Regenerate / Timer */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 font-mono font-bold">
              <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>

            <button
              onClick={() => loadQuiz()}
              disabled={isLoading}
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer disabled:opacity-50"
              title="Generate fresh AI quiz questions"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-teal-500' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            /* Loading State */
            <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 flex items-center justify-center animate-pulse">
                  <Brain className="h-8 w-8 text-teal-600 dark:text-teal-400 animate-bounce" />
                </div>
                <Sparkles className="h-5 w-5 text-amber-500 absolute -top-1 -right-1 animate-spin" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Generating AI Clinical Quiz...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Synthesizing multiple-choice questions, patient scenarios, and clinical rationales from{' '}
                  <strong className="text-slate-700 dark:text-slate-300">{resource.title}</strong>.
                </p>
              </div>
            </div>
          ) : isSubmitted ? (
            /* ========================================================================= */
            /* RESULTS / SCORECARD VIEW                                                  */
            /* ========================================================================= */
            <div className="space-y-6 animate-fadeIn">
              {/* Top Score Banner */}
              <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-teal-800/60 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal-500/10 pointer-events-none rounded-r-2xl transform skew-x-12" />
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center space-x-5">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-800"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={`${
                            scoreStats.percentage >= 80
                              ? 'text-teal-400'
                              : scoreStats.percentage >= 60
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                          strokeDasharray={`${scoreStats.percentage}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-black">{scoreStats.percentage}%</span>
                        <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold">Accuracy</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          {scoreStats.percentage >= 80
                            ? 'Honors Mastery • NCLEX Ready'
                            : scoreStats.percentage >= 60
                            ? 'Proficient • Competency Met'
                            : 'Remediation Recommended'}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black">
                        You scored {scoreStats.score} out of {scoreStats.total}
                      </h3>
                      <p className="text-xs text-slate-300">
                        Total time elapsed: <strong className="text-teal-300">{formatTime(secondsElapsed)}</strong> • Mode:{' '}
                        {quizMode === 'study' ? 'Study Mode' : 'Exam Simulation'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleRetakeSame}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Retake Quiz</span>
                    </button>

                    {scoreStats.missed.length > 0 && (
                      <button
                        onClick={handlePracticeMissed}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition-all cursor-pointer"
                      >
                        <Target className="h-3.5 w-3.5" />
                        <span>Practice Missed ({scoreStats.missed.length})</span>
                      </button>
                    )}

                    <button
                      onClick={handleCopySummary}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                    >
                      {copiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedSummary ? 'Copied Report!' : 'Copy Summary'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Review Filter Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Detailed Question Review
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({reviewQuestions.length} questions)
                  </span>
                </div>

                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    onClick={() => setReviewFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      reviewFilter === 'all'
                        ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    All ({questions.length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('missed')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      reviewFilter === 'missed'
                        ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Missed ({scoreStats.missed.length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('correct')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      reviewFilter === 'correct'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Correct ({scoreStats.score})
                  </button>
                </div>
              </div>

              {/* Questions Review Accordion List */}
              <div className="space-y-4">
                {reviewQuestions.map((q, qIndex) => {
                  const userChoice = userAnswers[q.id];
                  const isCorrect = userChoice === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id || qIndex}
                      className={`rounded-xl border p-4 sm:p-5 transition-all ${
                        isCorrect
                          ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                      }`}
                    >
                      {/* Question Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {isCorrect ? '✓' : '✕'}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Question {questions.indexOf(q) + 1}
                          </span>
                          {q.category && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {q.category}
                            </span>
                          )}
                          {q.difficulty && (
                            <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                              • {q.difficulty}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
                        {q.question}
                      </h4>

                      {/* Options Review */}
                      <div className="space-y-2 mb-4">
                        {q.options.map((opt, optIdx) => {
                          const isOptionCorrect = optIdx === q.correctAnswerIndex;
                          const isUserSelected = userChoice === optIdx;
                          const letter = String.fromCharCode(65 + optIdx);

                          let borderClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80';
                          let textClass = 'text-slate-700 dark:text-slate-300';
                          let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

                          if (isOptionCorrect) {
                            borderClass = 'border-emerald-500 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 font-semibold';
                            textClass = 'text-emerald-900 dark:text-emerald-200';
                            badgeClass = 'bg-emerald-600 text-white border-emerald-600';
                          } else if (isUserSelected && !isCorrect) {
                            borderClass = 'border-rose-500 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/60 line-through';
                            textClass = 'text-rose-900 dark:text-rose-200';
                            badgeClass = 'bg-rose-600 text-white border-rose-600';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-lg border text-xs sm:text-sm flex items-start space-x-3 transition-colors ${borderClass}`}
                            >
                              <span
                                className={`h-5 w-5 rounded-md flex items-center justify-center text-xs font-black shrink-0 border ${badgeClass}`}
                              >
                                {letter}
                              </span>
                              <span className={`flex-1 leading-relaxed ${textClass}`}>{opt}</span>
                              {isOptionCorrect && (
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                  Correct Answer
                                </span>
                              )}
                              {isUserSelected && !isOptionCorrect && (
                                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 shrink-0">
                                  Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Box */}
                      <div className="p-3.5 rounded-lg bg-teal-50/80 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/80 text-xs space-y-2">
                        <div className="flex items-center space-x-1.5 font-bold text-teal-800 dark:text-teal-300">
                          <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <span>Clinical Rationale</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {q.explanation}
                        </p>
                        {q.clinicalPearl && (
                          <div className="mt-2 pt-2 border-t border-teal-200/60 dark:border-teal-800/60 flex items-start space-x-2 text-amber-800 dark:text-amber-300">
                            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span className="font-semibold">{q.clinicalPearl}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : currentQuestion ? (
            /* ========================================================================= */
            /* ACTIVE QUIZ QUESTION VIEW                                                 */
            /* ========================================================================= */
            <div className="space-y-5 animate-fadeIn">
              {/* Question Navigator Tracker */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-xs text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    Question {currentIdx + 1} of {questions.length}
                  </span>
                  {currentQuestion.category && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {currentQuestion.category}
                    </span>
                  )}
                  {currentQuestion.difficulty && (
                    <span className="hidden sm:inline text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      • {currentQuestion.difficulty}
                    </span>
                  )}
                </div>

                {/* Progress bar and pills */}
                <div className="flex items-center space-x-1 overflow-x-auto max-w-[50%]">
                  {questions.map((q, idx) => {
                    const isAnswered = userAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentIdx;
                    let pillBg = 'bg-slate-200 dark:bg-slate-800 text-slate-500';

                    if (isCurrent) {
                      pillBg = 'ring-2 ring-teal-500 bg-teal-600 text-white font-bold';
                    } else if (isAnswered) {
                      if (quizMode === 'study') {
                        const isCorrect = userAnswers[q.id] === q.correctAnswerIndex;
                        pillBg = isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-700'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-400 dark:border-rose-700';
                      } else {
                        pillBg = 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700';
                      }
                    }

                    return (
                      <button
                        key={q.id || idx}
                        onClick={() => setCurrentIdx(idx)}
                        className={`h-6 w-6 rounded-md text-[11px] flex items-center justify-center transition-all cursor-pointer ${pillBg}`}
                        title={`Jump to Question ${idx + 1}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Stem Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 shadow-2xs">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options Selection List */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((optionText, optIndex) => {
                  const letter = String.fromCharCode(65 + optIndex);
                  const isSelected = currentSelectedOption === optIndex;
                  const isCorrect = optIndex === currentQuestion.correctAnswerIndex;
                  const showStudyFeedback = quizMode === 'study' && isCurrentAnswered;

                  let cardStyle =
                    'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/30 dark:hover:bg-teal-950/20';
                  let badgeStyle =
                    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
                  let textStyle = 'text-slate-800 dark:text-slate-200';

                  if (showStudyFeedback) {
                    if (isCorrect) {
                      cardStyle =
                        'border-emerald-500 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 ring-1 ring-emerald-500';
                      badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                      textStyle = 'text-emerald-950 dark:text-emerald-100 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      cardStyle =
                        'border-rose-500 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/60 ring-1 ring-rose-500';
                      badgeStyle = 'bg-rose-600 text-white border-rose-600';
                      textStyle = 'text-rose-950 dark:text-rose-100';
                    } else {
                      cardStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 opacity-60';
                    }
                  } else if (isSelected) {
                    cardStyle =
                      'border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/80 ring-2 ring-teal-500 shadow-sm';
                    badgeStyle = 'bg-teal-600 text-white border-teal-600';
                    textStyle = 'text-teal-950 dark:text-teal-100 font-semibold';
                  }

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelectOption(currentQuestion.id, optIndex)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm flex items-start space-x-3.5 transition-all duration-200 cursor-pointer ${cardStyle}`}
                    >
                      <span
                        className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border transition-colors ${badgeStyle}`}
                      >
                        {letter}
                      </span>
                      <span className={`flex-1 leading-relaxed ${textStyle}`}>
                        {optionText}
                      </span>
                      {showStudyFeedback && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {showStudyFeedback && isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Study Mode Immediate Rationale Box */}
              {quizMode === 'study' && isCurrentAnswered && (
                <div className="p-4 rounded-xl bg-teal-50/90 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs space-y-2 animate-fadeIn shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-bold text-teal-900 dark:text-teal-200">
                      {currentSelectedOption === currentQuestion.correctAnswerIndex ? (
                        <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          Correct! Evidence-Based Clinical Rationale:
                        </span>
                      ) : (
                        <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                          <XCircle className="h-4 w-4" />
                          Incorrect Choice. Clinical Rationale:
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>

                  {currentQuestion.clinicalPearl && (
                    <div className="mt-2.5 pt-2 border-t border-teal-200/80 dark:border-teal-800/80 flex items-start space-x-2 text-amber-800 dark:text-amber-300">
                      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="font-semibold leading-relaxed">
                        {currentQuestion.clinicalPearl}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              No questions found. Click Regenerate to reload.
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 shrink-0">
          {!isSubmitted ? (
            <>
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0 || isLoading}
                className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all cursor-pointer hover:shadow-emerald-500/20"
                  >
                    <Check className="h-4 w-4" />
                    <span>Submit & View Scorecard</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Quiz completed • {scoreStats.score}/{scoreStats.total} correct
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

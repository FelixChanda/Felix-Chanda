import React, { useState } from 'react';
import {
  X,
  Bookmark,
  FileText,
  BookOpen,
  GraduationCap,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  RotateCcw,
  Printer,
  Copy,
  Check,
  Layers,
  Award,
  Clock,
  Building,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Brain,
  FolderDown,
  Smartphone,
  Paperclip,
  Download,
  Eye
} from 'lucide-react';
import { ResourceItem, PastPaperQuestion } from '../types';
import { openInDeviceReader, printDocument, openAttachmentInExternalReader } from '../utils/documentHelper';

interface ResourceDetailModalProps {
  item: ResourceItem | null;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  onOpenFlashcards?: (item: ResourceItem) => void;
  onOpenQuiz?: (item: ResourceItem) => void;
  onOpenPdfViewer?: (item: ResourceItem) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  item,
  onClose,
  onToggleBookmark,
  onOpenFlashcards,
  onOpenQuiz,
  onOpenPdfViewer
}) => {
  if (!item) return null;

  // Past Paper state
  const [examMode, setExamMode] = useState<'study' | 'practice'>('study');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [revealedRationales, setRevealedRationales] = useState<Record<string, boolean>>({});
  const [userTextNotes, setUserTextNotes] = useState<Record<string, string>>({});

  // Textbook state
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);

  // General state
  const [copiedNote, setCopiedNote] = useState(false);
  const [checkedOutcomes, setCheckedOutcomes] = useState<Record<number, boolean>>({});
  const [attachmentMessage, setAttachmentMessage] = useState<string | null>(null);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const toggleRationale = (questionId: string) => {
    setRevealedRationales((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleResetPractice = () => {
    setSelectedAnswers({});
    setRevealedRationales({});
    setUserTextNotes({});
  };

  const handleCopyNotes = () => {
    if (!item) return;
    let fullText = `${item.title}\n${item.description}\n\n`;
    if (item.highYieldKeyPoints) {
      fullText += `High-Yield Key Points:\n${item.highYieldKeyPoints.map((k) => `• ${k}`).join('\n')}\n\n`;
    }
    if (item.sections) {
      fullText += item.sections
        .map(
          (s) =>
            `## ${s.title}\n${s.content}\n${s.bulletPoints?.map((b) => `• ${b}`).join('\n') || ''}`
        )
        .join('\n\n');
    }
    navigator.clipboard.writeText(fullText);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div
        id="modal-resource-detail"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-colors duration-200"
      >
        {/* Modal Top Header Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {item.category.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              {item.domain}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Integrated PDF Viewer Button */}
            {onOpenPdfViewer && (
              <button
                onClick={() => onOpenPdfViewer(item)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 dark:hover:bg-purple-900/80 text-purple-800 dark:text-purple-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Preview PDF document directly inside the app"
              >
                <Eye className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Preview PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}

            {/* Universal Download & Open in Device Reader button */}
            <button
              onClick={() => openInDeviceReader(item, (msg) => setAttachmentMessage(msg))}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-rose-800 dark:text-rose-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Download or open file in Adobe Acrobat, Word, System PDF Reader, or native device reader"
            >
              <FolderDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">Download File</span>
              <span className="sm:hidden">Download</span>
            </button>

            {/* AI Multiple-Choice Quiz Button */}
            {onOpenQuiz && (
              <button
                onClick={() => onOpenQuiz(item)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Generate AI Multiple-Choice Quiz based on this module or document"
              >
                <Brain className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">AI Quiz</span>
                <span className="sm:hidden">Quiz</span>
              </button>
            )}

            <button
              onClick={() => onOpenFlashcards?.(item)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 dark:hover:bg-teal-900/80 text-teal-800 dark:text-teal-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Generate AI Quiz Flashcards from this resource"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">AI Flashcards</span>
              <span className="sm:hidden">Cards</span>
            </button>

            <button
              onClick={() => onToggleBookmark(item.id)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                item.isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title={item.isBookmarked ? 'Bookmarked' : 'Save to bookmarks'}
            >
              <Bookmark className={`h-4 w-4 ${item.isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>

            {item.category === 'notes' && (
              <button
                onClick={handleCopyNotes}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Copy note content"
              >
                {copiedNote ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            )}

            <button
              onClick={() => openInDeviceReader(item)}
              className="px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1"
              title="Open document in native device reader or download original file"
            >
              <Smartphone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Open in Document Reader</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer hidden sm:block"
              title="Print document"
            >
              <Printer className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          {/* Main Title & Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                {item.yearLevel}
              </span>
              {item.moduleCode && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {item.moduleCode}
                </span>
              )}
              {item.paperCode && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Code: {item.paperCode}
                </span>
              )}
              {item.updatedAt && (
                <span className="text-xs text-slate-400">
                  Updated: {new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {item.title}
            </h2>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.description}
            </p>

            {/* Patch Notes & Release Audit Log */}
            {item.patchNotes && item.patchNotes.length > 0 && (
              <div className="mt-3.5 p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 dark:text-amber-200">
                    <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Resource Patch Notes & Release History ({item.versionRelease || 'v1.0'})</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                    Auto-Categorized & Audited
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {item.patchNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* UNIVERSAL DOCUMENT & ATTACHMENT ACTION CARD (FOR ALL CATEGORIES) */}
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-teal-300 dark:border-teal-700/80 bg-teal-50/70 dark:bg-teal-950/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-xs shrink-0 mt-0.5">
                    <Paperclip className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200">
                        {item.attachmentType || item.documentFormat || 'PDF'} Document
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[220px] sm:max-w-md">
                        {item.attachmentName || `${item.title}.${(item.attachmentType || item.documentFormat || 'pdf').toLowerCase()}`}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        ({item.attachmentSize || item.fileSize || '1.8 MB'})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Official curriculum attachment. Download directly in its original format (.pdf, .docx), launch in your device's external reader (Adobe, WPS, Word), or preview in-app.
                    </p>
                  </div>
                </div>

                <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 shrink-0">
                  {onOpenPdfViewer && (
                    <button
                      onClick={() => onOpenPdfViewer(item)}
                      className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md hover:shadow-rose-500/25 transition-all cursor-pointer inline-flex items-center gap-1.5"
                      title="Preview Document in Built-in PDF Reader"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Preview PDF</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setAttachmentMessage('Opening in device reader / downloading file...');
                      openAttachmentInExternalReader(
                        item,
                        (msg) => {
                          setAttachmentMessage(msg);
                          setTimeout(() => setAttachmentMessage(null), 3500);
                        },
                        (err) => {
                          setAttachmentMessage(`Notice: ${err}`);
                          setTimeout(() => setAttachmentMessage(null), 4000);
                        }
                      );
                    }}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-teal-500/25 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                    title="Download attachment directly or open in native device reader"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download / Device Reader</span>
                  </button>

                  <button
                    onClick={() => printDocument(item)}
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    title="Print Document"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {attachmentMessage && (
                <div className="p-2.5 rounded-lg bg-teal-100 dark:bg-teal-900/80 text-teal-900 dark:text-teal-200 text-xs font-semibold flex items-center justify-between animate-fadeIn">
                  <span>{attachmentMessage}</span>
                  <button
                    onClick={() => setAttachmentMessage(null)}
                    className="text-teal-700 dark:text-teal-300 hover:text-teal-950 font-bold ml-2 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* =======================================================
              MODULE VIEW
             ======================================================= */}
          {item.category === 'modules' && (
            <div className="space-y-6">
              {/* Highlights row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-teal-50/50 p-3.5 rounded-xl border border-teal-100">
                <div>
                  <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wide">Academic Credits</div>
                  <div className="text-base font-bold text-slate-900">{item.credits || 6} Credits</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wide">Semester</div>
                  <div className="text-base font-bold text-slate-900">{item.semester || 'Term 1'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wide">Clinical Hours</div>
                  <div className="text-base font-bold text-slate-900">{item.clinicalPlacementHours || 90} hrs</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wide">Curriculum Units</div>
                  <div className="text-base font-bold text-slate-900">{item.syllabus?.length || 4} Units</div>
                </div>
              </div>

              {/* Learning Outcomes */}
              {item.learningOutcomes && item.learningOutcomes.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-teal-600" />
                    Core Module Competency Goals (Click to check off)
                  </h3>
                  <div className="space-y-2">
                    {item.learningOutcomes.map((outcome, idx) => (
                      <label
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={!!checkedOutcomes[idx]}
                          onChange={() =>
                            setCheckedOutcomes((prev) => ({ ...prev, [idx]: !prev[idx] }))
                          }
                          className="mt-0.5 h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                        />
                        <span className={checkedOutcomes[idx] ? 'line-through text-slate-400' : ''}>
                          {outcome}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Syllabus Breakdown */}
              {item.syllabus && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-teal-600" />
                    Detailed Syllabus & Clinical Units
                  </h3>
                  <div className="space-y-3">
                    {item.syllabus.map((unit) => (
                      <div
                        key={unit.unitNumber}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-900 text-sm">
                            Unit {unit.unitNumber}: {unit.title}
                          </span>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {unit.durationWeeks} weeks duration
                          </span>
                        </div>
                        <div className="mb-2.5">
                          <span className="text-xs font-semibold text-slate-500">Key Lecture Topics:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {unit.topics.map((t, i) => (
                              <span
                                key={i}
                                className="text-xs bg-teal-50/70 text-teal-800 border border-teal-100 px-2 py-0.5 rounded-md"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-slate-500">Assessed Competencies:</span>
                          <ul className="list-disc list-inside text-xs text-slate-600 mt-1 space-y-0.5">
                            {unit.keyCompetencies.map((comp, ci) => (
                              <li key={ci}>{comp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              PAST PAPERS VIEW
             ======================================================= */}
          {item.category === 'past_papers' && (
            <div className="space-y-6">
              {/* Exam Info & Mode Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 p-4 rounded-xl border border-blue-200/80">
                <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-700">
                  <div>
                    <span className="font-semibold text-blue-900">Total Marks:</span> {item.totalMarks}
                  </div>
                  <div>
                    <span className="font-semibold text-blue-900">Time:</span> {item.durationMinutes} mins
                  </div>
                  <div>
                    <span className="font-semibold text-blue-900">Period:</span> {item.examPeriod}
                  </div>
                </div>

                {/* Study Mode vs Interactive Practice Mode */}
                <div className="flex items-center bg-white p-1 rounded-xl border border-blue-200 shrink-0">
                  <button
                    onClick={() => setExamMode('study')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      examMode === 'study'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Marking Scheme View
                  </button>
                  <button
                    onClick={() => setExamMode('practice')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      examMode === 'practice'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Interactive Test Mode
                  </button>
                </div>
              </div>

              {examMode === 'practice' && (
                <div className="flex items-center justify-between bg-teal-50 px-4 py-2.5 rounded-xl border border-teal-200 text-xs">
                  <span className="font-semibold text-teal-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    Interactive Mock Test Mode Active — Answer questions and check rationales!
                  </span>
                  <button
                    onClick={handleResetPractice}
                    className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Test
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {item.questions && item.questions.length > 0 ? (
                  item.questions.map((q) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isCorrect = selectedAnswers[q.id] === q.correctOptionIndex;
                    const showRationale = revealedRationales[q.id];

                    return (
                      <div
                        key={q.id}
                        className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {q.number}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              {q.type.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            [{q.marks} Marks]
                          </span>
                        </div>

                        {/* Question text */}
                        <div className="text-sm font-semibold text-slate-900 whitespace-pre-line leading-relaxed">
                          {q.questionText}
                        </div>

                        {/* Multiple Choice Options */}
                        {q.options && q.options.length > 0 && (
                          <div className="space-y-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = selectedAnswers[q.id] === optIdx;
                              const isCorrectOption = q.correctOptionIndex === optIdx;

                              let btnClasses = 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800';

                              if (examMode === 'practice' && isAnswered) {
                                if (isSelected) {
                                  btnClasses = isCorrect
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500'
                                    : 'border-rose-400 bg-rose-50 text-rose-900 font-semibold ring-1 ring-rose-400';
                                } else if (isCorrectOption && showRationale) {
                                  btnClasses = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                                }
                              } else if (examMode === 'study' && isCorrectOption) {
                                btnClasses = 'border-teal-500 bg-teal-50 text-teal-900 font-semibold ring-1 ring-teal-500';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectOption(q.id, optIdx)}
                                  className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 cursor-pointer ${btnClasses}`}
                                >
                                  <span className="font-mono text-xs font-bold mt-0.5 shrink-0">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span className="flex-1 leading-snug">{opt.replace(/^[A-D]\.\s*/, '')}</span>
                                  {examMode === 'study' && isCorrectOption && (
                                    <span className="shrink-0 text-xs font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
                                      Correct Answer
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Case Study text notes for non-MCQs */}
                        {q.type !== 'multiple_choice' && (
                          <div className="pt-2">
                            <textarea
                              rows={3}
                              placeholder="Write your diagnostic analysis, interventions, or calculation steps here..."
                              value={userTextNotes[q.id] || ''}
                              onChange={(e) =>
                                setUserTextNotes((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                          </div>
                        )}

                        {/* Rationale & Solution reveal toggle */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <button
                            onClick={() => toggleRationale(q.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
                          >
                            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                            {showRationale ? 'Hide Marking Scheme & Rationale' : 'Show Marking Scheme & Clinical Rationale'}
                          </button>
                          {q.highYieldTip && (
                            <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 hidden sm:inline">
                              NCLEX / Exam Tip
                            </span>
                          )}
                        </div>

                        {/* Revealed Rationale Box */}
                        {showRationale && (
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
                            <div>
                              <span className="font-bold text-slate-900 uppercase tracking-wide">
                                Official Marking Guide:
                              </span>
                              <p className="mt-1 font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-line">
                                {q.markingScheme}
                              </p>
                            </div>
                            <div>
                              <span className="font-bold text-teal-900 uppercase tracking-wide">
                                Clinical Rationale:
                              </span>
                              <p className="mt-1 text-slate-600 leading-relaxed">
                                {q.clinicalRationale}
                              </p>
                            </div>
                            {q.highYieldTip && (
                              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 font-medium">
                                💡 <span className="font-bold">Clinical Pearl:</span> {q.highYieldTip}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    No questions recorded for this paper.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =======================================================
              TEXTBOOK VIEW
             ======================================================= */}
          {item.category === 'textbooks' && (
            <div className="space-y-6">
              {/* Textbook Metadata Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Authors</span>
                  <span className="font-bold text-slate-900 text-sm">{item.authors}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Edition & Publisher</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {item.edition} ({item.publisher})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Standard ISBN</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{item.isbn}</span>
                </div>
              </div>

              {/* Sample Excerpt */}
              {item.sampleExcerpt && (
                <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-indigo-600 text-xs sm:text-sm text-slate-700 italic">
                  "{item.sampleExcerpt}"
                </div>
              )}

              {/* Table of Contents */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  Key Chapter Index & Clinical High-Yield Topics
                </h3>
                <div className="space-y-2">
                  {item.tableOfContents?.map((ch) => {
                    const isExpanded = expandedChapter === ch.chapterNumber;
                    return (
                      <div
                        key={ch.chapterNumber}
                        className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedChapter(isExpanded ? null : ch.chapterNumber)}
                          className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center shrink-0">
                              {ch.chapterNumber}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-800">
                              {ch.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                              {ch.pageRange}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                            <p className="leading-relaxed">{ch.summary}</p>
                            {ch.keyPearls && (
                              <div className="pt-1">
                                <span className="font-semibold text-slate-700">
                                  High-Yield Highlights:
                                </span>
                                <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-indigo-900 font-medium">
                                  {ch.keyPearls.map((p, pi) => (
                                    <li key={pi}>{p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              CLINICAL NOTES VIEW
             ======================================================= */}
          {item.category === 'notes' && (
            <div className="space-y-6">
              {/* High-Yield Key Points Banner */}
              {item.highYieldKeyPoints && item.highYieldKeyPoints.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
                    <BookmarkCheck className="h-4 w-4 text-emerald-700" />
                    Rapid Clinical Takeaways
                  </h3>
                  <ul className="space-y-1 text-xs sm:text-sm text-emerald-950 font-medium">
                    {item.highYieldKeyPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Formatted Sections */}
              <div className="space-y-5">
                {item.sections?.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-5 rounded-xl border border-slate-200 bg-white space-y-3"
                  >
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {section.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {section.content}
                    </p>

                    {section.bulletPoints && (
                      <ul className="space-y-2 pt-1">
                        {section.bulletPoints.map((bullet, bIdx) => (
                          <li
                            key={bIdx}
                            className="text-xs sm:text-sm text-slate-700 pl-3 border-l-2 border-slate-200 leading-relaxed"
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.callout && (
                      <div
                        className={`p-3 rounded-lg text-xs leading-relaxed font-semibold flex items-start gap-2 ${
                          section.callout.type === 'danger'
                            ? 'bg-rose-50 border border-rose-200 text-rose-900'
                            : 'bg-amber-50 border border-amber-200 text-amber-900'
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{section.callout.text}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* =======================================================
                  ATTACHMENT SECTION
                 ======================================================= */}
              {(item.category === 'notes' || item.attachmentName || item.attachmentUrl || item.attachmentDataUri) && (
                <div className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-teal-300 dark:border-teal-700/80 bg-teal-50/70 dark:bg-teal-950/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-xs shrink-0 mt-0.5">
                        <Paperclip className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200">
                            {item.attachmentType || 'PDF'} Attachment
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                            {item.attachmentName || `${item.title} - Attachment.${(item.attachmentType || 'pdf').toLowerCase()}`}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            ({item.attachmentSize || '1.5 MB'})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          Clinical document attachment. Tap below to download the file directly in its original format (.pdf, .docx) to your device.
                        </p>
                      </div>
                    </div>

                    <button
                      id="btn-open-note-attachment"
                      onClick={() => {
                        setAttachmentMessage('Downloading attachment in original format...');
                        openAttachmentInExternalReader(
                          item,
                          (msg) => {
                            setAttachmentMessage(msg);
                            setTimeout(() => setAttachmentMessage(null), 3500);
                          },
                          (err) => {
                            setAttachmentMessage(`Note: ${err}`);
                            setTimeout(() => setAttachmentMessage(null), 4000);
                          }
                        );
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-teal-500/25 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shrink-0"
                      title="Download this attachment directly in its original format"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Attachment</span>
                    </button>
                  </div>

                  {attachmentMessage && (
                    <div className="p-2.5 rounded-lg bg-teal-100 dark:bg-teal-900/80 text-teal-900 dark:text-teal-200 text-xs font-semibold flex items-center justify-between animate-fadeIn">
                      <span>{attachmentMessage}</span>
                      <button
                        onClick={() => setAttachmentMessage(null)}
                        className="text-teal-700 dark:text-teal-300 hover:text-teal-950 font-bold ml-2 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              CLINICAL DOCUMENTS VIEW (Offline / Online Device Reader)
             ======================================================= */}
          {item.category === 'documents' && (
            <div className="space-y-6">
              {/* Document Actions & Specs Banner */}
              <div className="bg-rose-50/90 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-2xs">
                      {item.documentFormat || 'PDF'}
                    </span>
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      {item.documentGuidelineType || 'Clinical Practice Protocol'}
                    </span>
                    <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                      • {item.pageCount || 12} Pages • {item.fileSize || '1.8 MB'}
                    </span>
                  </div>
                  <p className="text-xs text-rose-800 dark:text-rose-300">
                    Document is available for offline use and can be opened in external document viewers (Adobe Acrobat, WPS Office, Microsoft Word).
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => openInDeviceReader(item)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                    title="Launch directly in your device's native document reader"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Open in Device Reader</span>
                  </button>
                  <button
                    onClick={() => printDocument(item)}
                    className="px-3 py-2 rounded-lg border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-900 dark:text-rose-200 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    title="Print or export document"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </div>
              </div>

              {/* High-Yield Points */}
              {item.highYieldKeyPoints && item.highYieldKeyPoints.length > 0 && (
                <div className="bg-amber-50/90 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Clinical Safety Checklist & Highlights
                  </h4>
                  <ul className="space-y-1.5">
                    {item.highYieldKeyPoints.map((pt, i) => (
                      <li key={i} className="text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
                        <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                          #{i + 1}
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Document Reader */}
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Clinical Document Full Text (Offline Available)
                  </span>
                  <button
                    onClick={() => openInDeviceReader(item)}
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Smartphone className="h-3 w-3" />
                    <span>Send to Device Reader</span>
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-4 whitespace-pre-line font-sans">
                  {item.documentContentText || item.description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
            Category: <span className="text-slate-800 dark:text-slate-200 font-semibold capitalize">{item.category.replace('_', ' ')}</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (item.attachmentName || item.attachmentDataUri || item.attachmentUrl) {
                  openAttachmentInExternalReader(item);
                } else {
                  openInDeviceReader(item);
                }
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center justify-center space-x-1.5 shadow-2xs"
              title="Download attachment directly in its original format (.pdf, .docx)"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Attachment</span>
            </button>

            <button
              onClick={() => onOpenFlashcards?.(item)}
              className="px-3 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center justify-center space-x-1.5 shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span>AI Flashcards</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

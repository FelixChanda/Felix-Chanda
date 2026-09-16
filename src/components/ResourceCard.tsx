import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  FileText,
  BookOpen,
  BookmarkCheck,
  Bookmark,
  Clock,
  Award,
  Layers,
  Building,
  User,
  ArrowRight,
  HelpCircle,
  FileSpreadsheet,
  Sparkles,
  FolderDown,
  Smartphone,
  CheckCircle2,
  List,
  Loader2,
  ChevronUp,
  Eye,
  Brain
} from 'lucide-react';
import { ResourceItem } from '../types';
import { openInDeviceReader } from '../utils/documentHelper';

interface ResourceCardProps {
  item: ResourceItem;
  index?: number;
  onOpenDetail: (item: ResourceItem) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onOpenFlashcards: (item: ResourceItem, e: React.MouseEvent) => void;
  onOpenQuiz?: (item: ResourceItem, e: React.MouseEvent) => void;
  onOpenDeviceReader?: (item: ResourceItem, e: React.MouseEvent) => void;
  onOpenPdfViewer?: (item: ResourceItem, e: React.MouseEvent) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  item,
  index = 0,
  onOpenDetail,
  onToggleBookmark,
  onOpenFlashcards,
  onOpenQuiz,
  onOpenPdfViewer
}) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryData, setSummaryData] = useState<string[] | null>(null);

  const handleGenerateSummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (summaryData) {
      setIsSummaryOpen(!isSummaryOpen);
      return;
    }
    
    setIsSummaryOpen(true);
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: item })
      });
      const data = await response.json();
      setSummaryData(data.summary || ['Summary unavailable at this time.']);
    } catch (err) {
      setSummaryData(['Failed to generate summary. Please try again.']);
    } finally {
      setIsGenerating(false);
    }
  };
  // Category specifics
  const getCategoryMeta = () => {
    switch (item.category) {
      case 'modules':
        return {
          badgeText: item.moduleCode || 'Module',
          badgeBg: 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          icon: GraduationCap,
          actionText: 'View Syllabus & Units',
          actionColor: 'text-teal-700 dark:text-teal-400 hover:text-teal-800'
        };
      case 'documents':
        return {
          badgeText: `${item.documentFormat || 'PDF'} Document`,
          badgeBg: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          icon: FolderDown,
          actionText: 'Open Document',
          actionColor: 'text-rose-700 dark:text-rose-400 hover:text-rose-800'
        };
      case 'past_papers':
        return {
          badgeText: `${item.examYear ? item.examYear + ' ' : ''}Past Paper`,
          badgeBg: 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: FileText,
          actionText: 'Exam & Solutions',
          actionColor: 'text-blue-700 dark:text-blue-400 hover:text-blue-800'
        };
      case 'textbooks':
        return {
          badgeText: item.edition ? item.edition.split('(')[0].trim() : 'Textbook',
          badgeBg: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          icon: BookOpen,
          actionText: 'Browse Chapters',
          actionColor: 'text-indigo-700 dark:text-indigo-400 hover:text-indigo-800'
        };
      case 'notes':
      default:
        return {
          badgeText: item.noteType || 'Study Note',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: BookmarkCheck,
          actionText: 'Open Clinical Note',
          actionColor: 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800'
        };
    }
  };

  const meta = getCategoryMeta();
  const CategoryIcon = meta.icon;

  const handleDeviceReaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openInDeviceReader(item);
  };

  return (
    <motion.div
      id={`resource-card-${item.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.04, 0.28)
      }}
      onClick={() => onOpenDetail(item)}
      className="group bg-white/60 dark:bg-slate-900/60 hover:bg-white/75 dark:hover:bg-slate-900/75 backdrop-blur-md rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5 hover:border-teal-400/80 dark:hover:border-teal-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeBg}`}
            >
              <CategoryIcon className="h-3 w-3 mr-1" />
              {meta.badgeText}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {item.yearLevel.split('(')[0].trim()}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => onOpenFlashcards(item, e)}
              className="p-1.5 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/70 transition-colors cursor-pointer"
              title="Generate AI Quiz Flashcards for this resource"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => onToggleBookmark(item.id, e)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={item.isBookmarked ? 'Remove from saved' : 'Save resource to bookmarks'}
            >
              <Bookmark
                className={`h-4 w-4 ${
                  item.isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-2 mb-1.5 leading-snug">
          {item.title}
        </h3>

        {/* Domain / Specialty */}
        <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-2.5 flex items-center gap-1">
          <span>{item.domain}</span>
        </p>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {item.description}
        </p>

        {/* Category Specific Metrics */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 mb-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800/80">
          {item.category === 'modules' && (
            <>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Award className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" /> Credits
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.credits || 4} Credits</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Layers className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" /> Syllabus Units
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.syllabus?.length || 4} Units</span>
              </div>
              {item.clinicalPlacementHours && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" /> Clinical Rotations
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.clinicalPlacementHours} hrs</span>
                </div>
              )}
            </>
          )}

          {item.category === 'past_papers' && (
            <>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Award className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Total Marks
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.totalMarks || 100} Marks</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Time Allowed
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.durationMinutes || 90} mins</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <HelpCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Questions
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.questions?.length || 10} Questions with Solutions
                </span>
              </div>
            </>
          )}

          {item.category === 'textbooks' && (
            <>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                  <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" /> Authors
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={item.authors}>
                  {item.authors?.split(',')[0]} et al.
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Building className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Publisher
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{item.publisher}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Chapters
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.tableOfContents?.length || 8}+ Chapters</span>
              </div>
            </>
          )}

          {item.category === 'documents' && (
            <>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <FolderDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Format
                </span>
                <span className="font-bold text-rose-700 dark:text-rose-300">
                  {item.documentFormat || 'PDF'} Document
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <FileText className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" /> Scope / Pages
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.pageCount ? `${item.pageCount} Pages` : 'Complete Guide'} {item.fileSize ? `(${item.fileSize})` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Offline Reader
                </span>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Device Ready
                </span>
              </div>
            </>
          )}

          {item.category === 'notes' && (
            <>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Format
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.noteType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Reading Time
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.readTimeMinutes || 5} min read</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <BookmarkCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Key Pearls
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.highYieldKeyPoints?.length || 3} High-Yield points
                </span>
              </div>
            </>
          )}

          {/* Patch Notes & Release Audit Badge */}
          {item.patchNotes && item.patchNotes.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3 w-3" /> {item.versionRelease || 'Latest Patch'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Verified Category</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 italic bg-amber-50/60 dark:bg-amber-950/40 p-1.5 rounded border border-amber-200/50 dark:border-amber-800/50">
                "{item.patchNotes[0]}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Tags & Action */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-hidden shrink-0">
          {item.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium truncate max-w-[80px]"
            >
              #{t}
            </span>
          ))}
          {item.tags.length > 2 && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              +{item.tags.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Universal Download & Device Reader button for ALL categories */}
          <button
            onClick={handleDeviceReaderClick}
            className="inline-flex items-center text-[10px] sm:text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-100 dark:hover:bg-rose-900/90 px-1.5 sm:px-2 py-1 rounded-md border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
            title="Download file or open in external device reader (Adobe, Word, System PDF Reader, etc.)"
          >
            <FolderDown className="h-3 w-3 mr-1 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Download</span>
          </button>

          {onOpenPdfViewer && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPdfViewer(item, e);
              }}
              className="inline-flex items-center text-[10px] sm:text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/70 hover:bg-rose-100 dark:hover:bg-rose-900/80 px-1.5 sm:px-2 py-1 rounded-md border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              title="Preview PDF Document in App"
            >
              <Eye className="h-3 w-3 mr-1 shrink-0" />
              <span>Preview PDF</span>
            </button>
          )}

          {onOpenQuiz && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuiz(item, e);
              }}
              className="inline-flex items-center text-[10px] sm:text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 px-1.5 sm:px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              title="Generate AI Multiple-Choice Quiz based on this module or document"
            >
              <Brain className="h-3 w-3 mr-1 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>Quiz</span>
            </button>
          )}

          <button
            onClick={(e) => onOpenFlashcards(item, e)}
            className="inline-flex items-center text-[10px] sm:text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900/80 px-1.5 sm:px-2 py-1 rounded-md border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
            title="Generate AI Quiz Flashcards"
          >
            <Sparkles className="h-3 w-3 mr-1 shrink-0" />
            <span>Cards</span>
          </button>
          
          <button
            onClick={handleGenerateSummary}
            className={`inline-flex items-center text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-1 rounded-md border transition-colors cursor-pointer ${
              isSummaryOpen
                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900/80 border-amber-200 dark:border-amber-800'
            }`}
            title="Generate AI Quick Summary"
          >
            <List className="h-3 w-3 mr-1 shrink-0" />
            <span>Summary</span>
          </button>

          <span className={`inline-flex items-center text-xs font-bold ${meta.actionColor} transition-transform group-hover:translate-x-0.5 ml-1`}>
            <span>{meta.actionText}</span>
            <ArrowRight className="h-3.5 w-3.5 ml-0.5 shrink-0" />
          </span>
        </div>
      </div>
      
      {/* Inline Quick Summary Panel */}
      {isSummaryOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              AI Quick Summary
            </h4>
            <button 
              onClick={() => setIsSummaryOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          </div>
          
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Synthesizing clinical notes...</span>
            </div>
          ) : summaryData ? (
            <ul className="space-y-1.5">
              {summaryData.map((point, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-500 font-black mt-0.5">•</span>
                  <span>{point.replace(/^[-*•]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </motion.div>
  );
};

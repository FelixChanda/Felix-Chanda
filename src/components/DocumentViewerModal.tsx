import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Smartphone,
  Printer,
  CheckCircle2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Share2,
  ShieldCheck,
  AlertCircle,
  Brain
} from 'lucide-react';
import { ResourceItem } from '../types';
import { openInDeviceReader, printDocument } from '../utils/documentHelper';

interface DocumentViewerModalProps {
  item: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuiz?: (item: ResourceItem) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  item,
  isOpen,
  onClose,
  onOpenQuiz
}) => {
  if (!isOpen || !item) return null;

  const [fontSizePercent, setFontSizePercent] = useState<number>(100);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenInDevice = async () => {
    await openInDeviceReader(
      item,
      (msg) => showToast(msg),
      (err) => showToast(err)
    );
  };

  const handlePrint = () => {
    printDocument(item);
  };

  const extension = (item.documentFormat || 'PDF').toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div
        id="document-viewer-dialog"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
      >
        {/* Document Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0 gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-xs shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                  {extension} Document
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  Available Offline
                </span>
                {item.fileSize && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.fileSize}
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {item.title}
              </h2>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* AI Multiple-Choice Quiz Button */}
            {onOpenQuiz && (
              <button
                onClick={() => onOpenQuiz(item)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer hover:shadow-indigo-500/20"
                title="Generate AI Multiple-Choice Quiz directly from this document content"
              >
                <Brain className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">AI Quiz</span>
                <span className="sm:hidden">Quiz</span>
              </button>
            )}

            {/* Open in Native Device Reader button */}
            <button
              id="btn-open-device-reader"
              onClick={handleOpenInDevice}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-xs transition-all cursor-pointer hover:shadow-teal-500/20"
              title="Launch directly in Adobe Acrobat, WPS Office, or your device default document reader"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open in Device Reader</span>
              <span className="sm:hidden">Device Reader</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Print / Save as PDF"
            >
              <Printer className="h-4 w-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close document viewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="bg-teal-500 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between shadow-xs animate-fadeIn shrink-0">
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              {notification}
            </span>
            <button onClick={() => setNotification(null)} className="text-slate-950 hover:opacity-75">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Toolbar (Zoom & Meta) */}
        <div className="px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/80 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span>
              Author: <strong className="text-slate-800 dark:text-slate-200">{item.authorOrInstitution}</strong>
            </span>
            <span>•</span>
            <span>
              Domain: <strong className="text-slate-800 dark:text-slate-200">{item.domain}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFontSizePercent((prev) => Math.max(80, prev - 10))}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Decrease Font Size"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-mono w-10 text-center">{fontSizePercent}%</span>
            <button
              onClick={() => setFontSizePercent((prev) => Math.min(150, prev + 10))}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Increase Font Size"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Document Content Reader Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950/50">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm transition-colors">
            {/* Document Header Page */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span>DATANURSE CLINICAL ARCHIVE</span>
                <span>COMPILED BY CHANDA FELIX</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {item.title}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* High-Yield Key Pearls if present */}
            {item.highYieldKeyPoints && item.highYieldKeyPoints.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Clinical Alerts & High-Yield Safety Pearls
                </h4>
                <ul className="space-y-1.5">
                  {item.highYieldKeyPoints.map((pt, i) => (
                    <li key={i} className="text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                        [{i + 1}]
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Document Main Body Text */}
            <div
              className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed font-sans"
              style={{ fontSize: `${(15 * fontSizePercent) / 100}px` }}
            >
              {item.documentContentText ? (
                <div className="space-y-4 whitespace-pre-line font-normal">
                  {item.documentContentText}
                </div>
              ) : (
                <div className="space-y-3">
                  <p>{item.description}</p>
                  <p className="text-xs text-slate-500 italic">
                    This document is fully prepared for device document reading. Tap the "Open in Device Reader" button above to launch your installed document app (Adobe Acrobat, WPS Office, Microsoft Word, or default system viewer).
                  </p>
                </div>
              )}
            </div>

            {/* Offline Device Notice Card */}
            <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl">
              <div className="text-xs text-slate-600 dark:text-slate-400 text-center sm:text-left">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Offline Placement & Study Mode
                </span>
                This document is cached and can be opened without an active internet connection.
              </div>
              <button
                onClick={handleOpenInDevice}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-2 shrink-0 cursor-pointer shadow-xs transition-colors"
              >
                <Smartphone className="h-3.5 w-3.5 text-teal-400" />
                Launch in Device Reader
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

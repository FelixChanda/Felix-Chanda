import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  Smartphone,
  Eye,
  CheckCircle2,
  RefreshCw,
  Search,
  BookOpen,
  Brain
} from 'lucide-react';
import { ResourceItem } from '../types';
import { generatePdfBlobFromResource, openInDeviceReader, printDocument } from '../utils/documentHelper';

interface PdfViewerModalProps {
  item: ResourceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuiz?: (item: ResourceItem) => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  item,
  isOpen,
  onClose,
  onOpenQuiz
}) => {
  if (!isOpen || !item) return null;

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'pdf' | 'text'>('pdf');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    setIsLoading(true);

    try {
      // Check if item has a direct PDF URL or data URI
      const directUrl = item.documentUrl || item.documentDataUri || item.attachmentUrl || item.attachmentDataUri;
      if (directUrl && (directUrl.includes('.pdf') || directUrl.startsWith('data:application/pdf'))) {
        setPdfBlobUrl(directUrl);
      } else {
        // Generate real PDF blob using jsPDF engine
        const blob = generatePdfBlobFromResource(item);
        objectUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(objectUrl);
      }
    } catch (err) {
      console.warn('PDF blob generation error:', err);
    } finally {
      setIsLoading(false);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [item]);

  const handleDownload = async () => {
    await openInDeviceReader(
      item,
      (msg) => {
        setDownloadNotice(msg);
        setTimeout(() => setDownloadNotice(null), 3000);
      },
      (err) => {
        setDownloadNotice(err);
        setTimeout(() => setDownloadNotice(null), 3000);
      }
    );
  };

  const handlePrint = () => {
    printDocument(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
      <div
        className={`bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 w-full flex flex-col overflow-hidden transition-all duration-300 font-sans ${
          isFullscreen ? 'fixed inset-2 max-w-none max-h-none z-50 rounded-xl' : 'max-w-5xl max-h-[94vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="h-14 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-800">
                  PDF Previewer
                </span>
                <span className="text-xs text-slate-400 truncate hidden sm:inline">
                  {item.domain}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
                {item.title}
              </h3>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* View Mode Toggle Switch */}
            <div className="hidden sm:flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'pdf' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                PDF View
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'text' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Text View
              </button>
            </div>

            {/* AI Multiple-Choice Quiz Button */}
            {onOpenQuiz && (
              <button
                onClick={() => onOpenQuiz(item)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xs cursor-pointer active:scale-95"
                title="Generate AI Multiple-Choice Quiz from this document"
              >
                <Brain className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">AI Quiz</span>
                <span className="sm:hidden">Quiz</span>
              </button>
            )}

            {/* Direct Download Button */}
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-xs cursor-pointer active:scale-95"
              title="Download PDF to device"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">Download</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Print Document"
            >
              <Printer className="h-4 w-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close Previewer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Download Notice Toast */}
        {downloadNotice && (
          <div className="bg-teal-500 text-slate-950 font-bold px-4 py-2 text-xs flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              {downloadNotice}
            </span>
            <button onClick={() => setDownloadNotice(null)} className="text-slate-950 hover:opacity-75">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Toolbar Bar */}
        <div className="h-10 px-4 sm:px-6 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-teal-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>PDF Ready for Offline Review</span>
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline text-slate-400">
              Author: <strong className="text-slate-200">{item.authorOrInstitution}</strong>
            </span>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(70, prev - 15))}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 w-12 text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(160, prev + 15))}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Main Document Display Canvas Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-2 sm:p-4 flex flex-col items-center justify-start">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-teal-400 animate-spin" />
              <p className="text-xs text-slate-400">Rendering PDF Document Preview...</p>
            </div>
          ) : viewMode === 'pdf' && pdfBlobUrl ? (
            <div
              className="w-full h-full min-h-[500px] flex-1 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl transition-all"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              <iframe
                src={`${pdfBlobUrl}#toolbar=1&navpanes=0&view=FitH`}
                title={item.title}
                className="w-full h-full border-0 min-h-[550px]"
              />
            </div>
          ) : (
            /* Text Reflow View Mode */
            <div
              className="w-full max-w-3xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl text-slate-200 transition-all"
              style={{ fontSize: `${(14 * zoomLevel) / 100}px` }}
            >
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">
                  DATANURSE DOCUMENT TEXT PREVIEW
                </span>
                <h1 className="text-lg sm:text-xl font-black text-white mt-1 leading-snug">{item.title}</h1>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.description}</p>
              </div>

              {item.highYieldKeyPoints && item.highYieldKeyPoints.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-2">
                  <h4 className="text-xs font-extrabold text-amber-300 flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span>High-Yield Safety Alerts & Key Points</span>
                  </h4>
                  <ul className="space-y-1 text-xs">
                    {item.highYieldKeyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="font-bold text-amber-400">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.sections && item.sections.length > 0 ? (
                <div className="space-y-6">
                  {item.sections.map((sec, i) => (
                    <div key={i} className="space-y-2">
                      <h3 className="text-sm font-bold text-teal-300 border-b border-slate-800 pb-1">{sec.title}</h3>
                      <p className="text-xs leading-relaxed text-slate-300">{sec.content}</p>
                      {sec.bulletPoints && (
                        <ul className="pl-4 list-disc text-xs text-slate-300 space-y-1">
                          {sec.bulletPoints.map((bp, idx) => (
                            <li key={idx}>{bp}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                  <p>{item.documentContentText || item.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-10 px-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>DATANURSE Integrated PDF Engine</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

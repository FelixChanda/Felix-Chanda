import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Video,
  CheckCircle2,
  AlertCircle,
  Film,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  BookOpen,
  GraduationCap,
  HardDrive,
  UploadCloud
} from 'lucide-react';
import {
  ResourceCategory,
  AcademicYearLevel,
  NursingDomain,
  ResourceItem,
  OsceVideo
} from '../types';
import {
  uploadFileToGoogleDrive,
  getAccessToken,
  AUTHOR_EMAIL
} from '../services/googleDriveService';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (newResource: ResourceItem) => void;
  onAddVideo?: (newVideo: OsceVideo) => void;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({
  isOpen,
  onClose,
  onAddResource,
  onAddVideo
}) => {
  if (!isOpen) return null;

  // Active Tab: 'documents' | 'videos' | 'inventory'
  const [activeTab, setActiveTab] = useState<'documents' | 'videos' | 'inventory'>('documents');

  // --- DOCUMENT UPLOAD STATES ---
  const [docCategory, setDocCategory] = useState<ResourceCategory>('documents');
  const [docTitle, setDocTitle] = useState('');
  const [docDomain, setDocDomain] = useState<NursingDomain>('Adult Health & Med-Surg');
  const [docYearLevel, setDocYearLevel] = useState<AcademicYearLevel>('Year 2 (Adult Health & Patho)');
  const [docDescription, setDocDescription] = useState('');
  const [docAuthor, setDocAuthor] = useState(AUTHOR_EMAIL);
  const [docTagsInput, setDocTagsInput] = useState('');
  const [docGuidelineType, setDocGuidelineType] = useState<'Clinical Procedure' | 'Emergency Protocol' | 'Practice Standard' | 'Pharmacopoeia' | 'Assessment Form'>('Clinical Procedure');
  const [docPageCount, setDocPageCount] = useState('12');
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [docDataUri, setDocDataUri] = useState<string>('');
  const [docUploadProgress, setDocUploadProgress] = useState<number>(0);
  const [isDocUploading, setIsDocUploading] = useState(false);
  const [docUploadSuccess, setDocUploadSuccess] = useState(false);
  const [syncToDrive, setSyncToDrive] = useState(true);

  // --- VIDEO UPLOAD STATES ---
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState<'basic' | 'medsurg' | 'maternal' | 'pediatric' | 'pharmacology' | 'psychiatric' | 'community'>('maternal');
  const [videoCategoryLabel, setVideoCategoryLabel] = useState('Maternal & Midwifery');
  const [videoChannelName, setVideoChannelName] = useState('Mr. Koko Nurses Class');
  const [videoInstitution, setVideoInstitution] = useState('Mr. Koko Clinical Educator');
  const [videoDuration, setVideoDuration] = useState('15:00');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadSuccess, setVideoUploadSuccess] = useState(false);
  const [videoKeySteps, setVideoKeySteps] = useState<string[]>([
    'Verify physician order and confirm patient identification.',
    'Explain the procedure clearly to patient and obtain verbal consent.',
    'Assemble all required sterile and non-sterile equipment on clean trolley.',
    'Perform hand hygiene and maintain strict aseptic technique throughout.'
  ]);
  const [newStepText, setNewStepText] = useState('');
  const [videoEquipment, setVideoEquipment] = useState('Sterile gloves, Antiseptic solution, Gauze swabs, Kidney dish, Documentation chart');
  const [videoExamTips, setVideoExamTips] = useState('State all critical steps out loud to the OSCE examiner to guarantee maximum rubric points.');

  // --- LOCAL/DRIVE INVENTORY STATES ---
  const [savedItems, setSavedItems] = useState<ResourceItem[]>([]);
  const [inventorySearch, setInventorySearch] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('datanurse_custom_resources');
      if (stored) {
        setSavedItems(JSON.parse(stored));
      }
    } catch (e) {}
  }, [activeTab]);

  // --- DOCUMENT FILE HANDLER ---
  const handleDocFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedDocFile(file);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    if (!docTitle) {
      setDocTitle(cleanTitle);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setDocDataUri(result);
    };
    reader.readAsDataURL(file);
  };

  // --- SUBMIT DOCUMENT ---
  const handleSubmitDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    setIsDocUploading(true);
    setDocUploadProgress(20);

    try {
      let driveUrl = '';
      const docId = `doc-${Date.now()}`;

      // Optionally sync directly to Google Drive
      if (syncToDrive && selectedDocFile && getAccessToken()) {
        try {
          const driveRes = await uploadFileToGoogleDrive(
            selectedDocFile,
            'DATANURSE_RESOURCES',
            (p) => setDocUploadProgress(p)
          );
          driveUrl = driveRes.webViewLink || driveRes.webContentLink || '';
        } catch (driveErr) {
          console.warn('Google Drive direct upload note:', driveErr);
        }
      }

      setDocUploadProgress(85);

      const ext = selectedDocFile?.name.split('.').pop()?.toUpperCase() || 'PDF';
      const cleanFormat = ext === 'DOCX' || ext === 'DOC' ? 'DOCX' : ext === 'TXT' ? 'TXT' : ext === 'EPUB' ? 'EPUB' : 'PDF';

      const newDocItem: ResourceItem = {
        id: docId,
        title: docTitle.trim(),
        category: docCategory,
        domain: docDomain,
        yearLevel: docYearLevel,
        description: docDescription.trim() || 'Uploaded clinical nursing resource synced to local library.',
        authorOrInstitution: docAuthor.trim() || AUTHOR_EMAIL,
        updatedAt: new Date().toISOString().split('T')[0],
        tags: docTagsInput ? docTagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [docCategory, docDomain.split(' ')[0]],
        isBookmarked: true,
        fileSize: selectedDocFile ? `${Math.round(selectedDocFile.size / 1024)} KB` : '1.2 MB',
        documentFormat: cleanFormat as any,
        documentUrl: driveUrl || undefined,
        documentDataUri: docDataUri || undefined,
        documentGuidelineType: docGuidelineType,
        pageCount: parseInt(docPageCount) || 10,
        isAvailableOffline: true,
        hasAttachment: Boolean(selectedDocFile || docDataUri || driveUrl),
        attachmentName: selectedDocFile ? selectedDocFile.name : `${docTitle.trim()}.${cleanFormat.toLowerCase()}`,
        attachmentType: cleanFormat as any,
        attachmentSize: selectedDocFile ? `${(selectedDocFile.size / 1024 / 1024).toFixed(2)} MB` : '1.2 MB',
        attachmentUrl: driveUrl || undefined,
        attachmentDataUri: docDataUri || undefined,
        attachmentContentText: docDescription.trim() || undefined,
        documentContentText: docDescription.trim() || undefined,
        moduleCode: docCategory === 'modules' ? 'NMCZ-' + Math.floor(100 + Math.random() * 900) : undefined,
        credits: docCategory === 'modules' ? 6 : undefined,
        semester: docCategory === 'modules' ? 'Semester 1' : undefined,
        examYear: docCategory === 'past_papers' ? new Date().getFullYear() : undefined,
        examPeriod: docCategory === 'past_papers' ? 'Final Examination' : undefined,
        edition: docCategory === 'textbooks' ? 'Official Reference Edition' : undefined,
        noteType: docCategory === 'notes' ? 'Clinical Cheat Sheet' : undefined,
        highYieldKeyPoints: [
          `Key focus for ${docDomain}: Review clinical protocols and competencies.`,
          `Verified nursing curriculum documentation for ${docYearLevel}.`,
          `Available for direct download, device reader preview, and offline study.`
        ]
      };

      // Save locally
      try {
        const existing = JSON.parse(localStorage.getItem('datanurse_custom_resources') || '[]');
        localStorage.setItem('datanurse_custom_resources', JSON.stringify([newDocItem, ...existing]));
      } catch (e) {}

      onAddResource(newDocItem);

      setDocUploadProgress(100);
      setDocUploadSuccess(true);
      setTimeout(() => {
        setDocUploadSuccess(false);
        setIsDocUploading(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error submitting document:', error);
      setIsDocUploading(false);
    }
  };

  // --- VIDEO FILE HANDLER ---
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedVideoFile(file);

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    if (!videoTitle) {
      setVideoTitle(cleanTitle);
    }
  };

  // --- SUBMIT VIDEO ---
  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    setIsVideoUploading(true);
    setVideoUploadProgress(20);

    try {
      let videoDirectUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';
      const videoId = `osce-${Date.now()}`;

      if (selectedVideoFile && getAccessToken()) {
        try {
          const driveRes = await uploadFileToGoogleDrive(
            selectedVideoFile,
            'OSCETUBE',
            (p) => setVideoUploadProgress(p)
          );
          videoDirectUrl = driveRes.webViewLink || driveRes.webContentLink || videoDirectUrl;
        } catch (driveErr) {
          console.warn('Drive video upload note:', driveErr);
        }
      }

      setVideoUploadProgress(85);

      const equipmentList = videoEquipment
        .split(',')
        .map((eq) => eq.trim())
        .filter(Boolean);

      const newVideoItem: OsceVideo = {
        id: videoId,
        title: videoTitle.trim(),
        category: videoCategory,
        categoryLabel: videoCategoryLabel,
        channelName: videoChannelName.trim() || 'OSCETUBE Clinical',
        creatorTag: 'custom',
        institutionBadge: videoInstitution.trim() || 'OSCETUBE Nursing Library',
        directUrl: videoDirectUrl,
        streamUrl: videoDirectUrl,
        duration: videoDuration.trim() || '15:00',
        thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60',
        description: `Zambian OSCE clinical skills procedure video synced to OSCETUBE library (${AUTHOR_EMAIL}).`,
        keySteps: videoKeySteps.length > 0 ? videoKeySteps : ['Follow standard clinical exam steps.'],
        equipmentNeeded: equipmentList,
        examTips: videoExamTips.trim(),
        isCustomUploaded: true,
        uploadedBy: AUTHOR_EMAIL,
        createdAt: new Date().toISOString()
      };

      // Save to cached videos
      try {
        const cached = JSON.parse(localStorage.getItem('datanurse_drive_oscetube_videos') || '[]');
        localStorage.setItem('datanurse_drive_oscetube_videos', JSON.stringify([newVideoItem, ...cached]));
      } catch (e) {}

      if (onAddVideo) {
        onAddVideo(newVideoItem);
      }

      setVideoUploadProgress(100);
      setVideoUploadSuccess(true);
      setTimeout(() => {
        setVideoUploadSuccess(false);
        setIsVideoUploading(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error submitting video:', error);
      setIsVideoUploading(false);
    }
  };

  const handleAddKeyStep = () => {
    if (!newStepText.trim()) return;
    setVideoKeySteps((prev) => [...prev, newStepText.trim()]);
    setNewStepText('');
  };

  const handleRemoveKeyStep = (index: number) => {
    setVideoKeySteps((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Upload & Sync Nursing Resources
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sync documents, past papers & OSCE videos directly ({AUTHOR_EMAIL})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900 px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`flex items-center space-x-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Upload Document / Notes / Paper</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`flex items-center space-x-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'videos'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>Upload OSCE Video</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
          {activeTab === 'documents' && (
            <form onSubmit={handleSubmitDocument} className="space-y-4">
              {/* File Attachment Dropzone */}
              <div className="p-4 rounded-xl border-2 border-dashed border-teal-300 dark:border-teal-700/60 bg-teal-50/40 dark:bg-teal-950/20 text-center space-y-2">
                <UploadCloud className="h-8 w-8 text-teal-600 dark:text-teal-400 mx-auto" />
                <div>
                  <label className="cursor-pointer text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline">
                    <span>Click to browse device file</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.epub"
                      onChange={handleDocFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Supports PDF, DOCX, TXT, EPUB (saved for native offline reader)
                  </p>
                </div>

                {selectedDocFile && (
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-teal-300 text-xs text-teal-800 dark:text-teal-200">
                    <FileText className="h-4 w-4" />
                    <span className="font-semibold">{selectedDocFile.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({(selectedDocFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g., Medical Surgical Nursing Clinical Guide 2026"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Resource Category
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="documents">Official Clinical Document</option>
                    <option value="past_papers">Past Exam Paper / Question Bank</option>
                    <option value="notes">Clinical Lecture Notes</option>
                    <option value="modules">Curriculum Syllabus Module</option>
                    <option value="textbooks">Nursing Reference Textbook</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nursing Domain
                  </label>
                  <select
                    value={docDomain}
                    onChange={(e) => setDocDomain(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Adult Health & Med-Surg">Adult Health & Med-Surg</option>
                    <option value="Maternal & Neonatal">Maternal & Neonatal</option>
                    <option value="Pediatric Nursing">Pediatric Nursing</option>
                    <option value="Pharmacology">Pharmacology</option>
                    <option value="Critical Care & Emergency">Critical Care & Emergency</option>
                    <option value="Mental Health & Psychiatric">Mental Health & Psychiatric</option>
                    <option value="Community & Public Health">Community & Public Health</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resource Description & Summary
                </label>
                <textarea
                  rows={2}
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  placeholder="Summary of guidelines, key topics, or competencies covered..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncToDrive}
                    onChange={(e) => setSyncToDrive(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>Sync copy to Google Drive ({AUTHOR_EMAIL})</span>
                </label>

                <button
                  type="submit"
                  disabled={isDocUploading || !docTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isDocUploading ? `Uploading (${docUploadProgress}%)...` : 'Save Resource'}
                </button>
              </div>

              {docUploadSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Resource added to your library successfully!</span>
                </div>
              )}
            </form>
          )}

          {activeTab === 'videos' && (
            <form onSubmit={handleSubmitVideo} className="space-y-4">
              {/* Video File Picker */}
              <div className="p-4 rounded-xl border-2 border-dashed border-teal-300 dark:border-teal-700/60 bg-teal-50/40 dark:bg-teal-950/20 text-center space-y-2">
                <Film className="h-8 w-8 text-teal-600 dark:text-teal-400 mx-auto" />
                <div>
                  <label className="cursor-pointer text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline">
                    <span>Select MP4 Video File</span>
                    <input
                      type="file"
                      accept="video/*,.mp4,.mkv,.webm"
                      onChange={handleVideoFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Direct video upload will sync to your Drive 'OSCETUBE' repository
                  </p>
                </div>

                {selectedVideoFile && (
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-teal-300 text-xs text-teal-800 dark:text-teal-200">
                    <Film className="h-4 w-4" />
                    <span className="font-semibold">{selectedVideoFile.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({(selectedVideoFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Lumbar Puncture Assistant & Patient Positioning"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clinical Category
                  </label>
                  <select
                    value={videoCategory}
                    onChange={(e) => {
                      setVideoCategory(e.target.value as any);
                      const labels: any = {
                        basic: 'Basic Nursing Care',
                        medsurg: 'Medical-Surgical OSCE',
                        maternal: 'Maternal & Midwifery',
                        pediatric: 'Pediatric & Neonatal',
                        pharmacology: 'Pharmacology'
                      };
                      setVideoCategoryLabel(labels[e.target.value] || 'OSCE Skills');
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="basic">Basic Nursing Care</option>
                    <option value="medsurg">Medical-Surgical OSCE</option>
                    <option value="maternal">Maternal & Midwifery</option>
                    <option value="pediatric">Pediatric & Neonatal</option>
                    <option value="pharmacology">Pharmacology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Channel / Educator Name
                  </label>
                  <input
                    type="text"
                    value={videoChannelName}
                    onChange={(e) => setVideoChannelName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Step Checklist Builder */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  OSCE Station Key Steps ({videoKeySteps.length})
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {videoKeySteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <span className="truncate">
                        <span className="font-bold mr-1">{idx + 1}.</span> {step}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyStep(idx)}
                        className="text-rose-500 hover:text-rose-700 ml-2 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyStep();
                      }
                    }}
                    placeholder="Add step (e.g., Cleanse puncture site with povidone iodine)..."
                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyStep}
                    className="px-3 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Add Step
                  </button>
                </div>
              </div>

              {/* Submit Video */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isVideoUploading || !videoTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isVideoUploading ? `Uploading Video (${videoUploadProgress}%)...` : 'Save Video to OSCETUBE'}
                </button>
              </div>

              {videoUploadSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>OSCE video registered into OSCETUBE library!</span>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

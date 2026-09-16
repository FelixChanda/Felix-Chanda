import React, { useState, useEffect } from 'react';
import {
  Terminal,
  X,
  RefreshCw,
  UploadCloud,
  FolderSync,
  HardDrive,
  Key,
  Database,
  Download,
  Upload,
  Check,
  AlertTriangle,
  Play,
  FileText,
  Shield,
  Smartphone,
  ExternalLink,
  Cpu,
  Trash2
} from 'lucide-react';
import {
  initGoogleDriveAuth,
  requestGoogleDriveAccess,
  disconnectGoogleDrive,
  getAccessToken,
  fetchOscetubeVideosFromDrive,
  syncResourcesFromGoogleDrive,
  uploadFileToGoogleDrive,
  AUTHOR_EMAIL
} from '../services/googleDriveService';
import { OsceVideo, ResourceItem } from '../types';

interface DeveloperConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: ResourceItem[];
  onUpdateResources: (updater: (prev: ResourceItem[]) => ResourceItem[]) => void;
  onUpdateVideos?: (videos: OsceVideo[]) => void;
}

export const DeveloperConsoleModal: React.FC<DeveloperConsoleModalProps> = ({
  isOpen,
  onClose,
  resources,
  onUpdateResources,
  onUpdateVideos
}) => {
  const [authToken, setAuthToken] = useState<string | null>(getAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSyncingVideos, setIsSyncingVideos] = useState(false);
  const [isSyncingResources, setIsSyncingResources] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Developer Console initialized. Ready for admin sync.`
  ]);

  // Manual Upload State
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [targetFolder, setTargetFolder] = useState<'OSCETUBE' | 'DATANURSE_RESOURCES'>('OSCETUBE');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // Status message
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const addLog = (msg: string) => {
    setLogMessages((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 30)]);
  };

  useEffect(() => {
    if (isOpen) {
      initGoogleDriveAuth((token) => {
        setAuthToken(token);
        addLog(`Google Drive token loaded for ${AUTHOR_EMAIL}`);
      });
      setAuthToken(getAccessToken());
    }
  }, [isOpen]);

  const handleConnectGoogleDrive = async () => {
    setIsAuthenticating(true);
    setStatusBanner(null);
    try {
      addLog(`Requesting Google Drive OAuth permissions for ${AUTHOR_EMAIL}...`);
      const token = await requestGoogleDriveAccess();
      setAuthToken(token);
      setStatusBanner({ type: 'success', text: `Connected successfully to Google Drive (${AUTHOR_EMAIL})` });
      addLog('Authentication successful! Scopes: drive.readonly, drive.file granted.');
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: err.message || 'Failed to authenticate Google Drive.' });
      addLog(`Auth Error: ${err.message || String(err)}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnectDrive = () => {
    disconnectGoogleDrive();
    setAuthToken(null);
    setStatusBanner({ type: 'info', text: 'Disconnected from Google Drive.' });
    addLog('Google Drive session disconnected.');
  };

  const handleSyncOscetubeVideos = async () => {
    setIsSyncingVideos(true);
    setStatusBanner(null);
    addLog('Querying Google Drive for "OSCETUBE" folder & video files...');
    try {
      const videos = await fetchOscetubeVideosFromDrive();
      if (videos.length > 0) {
        if (onUpdateVideos) onUpdateVideos(videos);
        setStatusBanner({ type: 'success', text: `Successfully synced ${videos.length} OSCE videos from Drive "OSCETUBE" folder!` });
        addLog(`Synced ${videos.length} videos from OSCETUBE folder.`);
      } else {
        setStatusBanner({
          type: 'info',
          text: 'No videos found in "OSCETUBE" folder yet. Create a folder named "OSCETUBE" in Drive or use manual upload below.'
        });
        addLog('No video files detected in OSCETUBE folder.');
      }
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: `Sync failed: ${err.message || 'Check connection'}` });
      addLog(`OSCETUBE sync error: ${err.message}`);
    } finally {
      setIsSyncingVideos(false);
    }
  };

  const handleSyncDriveResources = async () => {
    setIsSyncingResources(true);
    setStatusBanner(null);
    addLog('Scanning Google Drive for PDFs, notes, and curriculum documents...');
    try {
      const driveDocs = await syncResourcesFromGoogleDrive();
      if (driveDocs.length > 0) {
        onUpdateResources((prev) => {
          const prevMap = new Map(prev.map((r) => [r.id, r]));
          driveDocs.forEach((d) => prevMap.set(d.id, d));
          return Array.from(prevMap.values());
        });
        setStatusBanner({ type: 'success', text: `Imported ${driveDocs.length} curriculum documents from Google Drive!` });
        addLog(`Imported ${driveDocs.length} documents into active library.`);
      } else {
        setStatusBanner({ type: 'info', text: 'No new PDF/DOCX files found in Google Drive.' });
        addLog('No document files found.');
      }
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: `Document sync failed: ${err.message || 'Check connection'}` });
      addLog(`Doc sync error: ${err.message}`);
    } finally {
      setIsSyncingResources(false);
    }
  };

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setUploadSuccessMsg('');
    addLog(`Uploading "${selectedUploadFile.name}" to Google Drive [${targetFolder}]...`);

    try {
      const result = await uploadFileToGoogleDrive(selectedUploadFile, targetFolder, (p) => setUploadProgress(p));
      setUploadSuccessMsg(`Uploaded "${selectedUploadFile.name}" successfully to Drive!`);
      addLog(`Upload complete! Drive File ID: ${result.fileId}`);

      // If video, register in OSCETUBE cache
      if (selectedUploadFile.type.startsWith('video/') || selectedUploadFile.name.endsWith('.mp4')) {
        const streamUrl = `https://www.googleapis.com/drive/v3/files/${result.fileId}?alt=media`;
        const newVideo: OsceVideo = {
          id: `drive-osce-${result.fileId}`,
          title: selectedUploadFile.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          category: 'basic',
          categoryLabel: 'Basic Nursing Procedures',
          channelName: 'OSCETUBE Clinical Drive',
          creatorTag: 'oscetube',
          institutionBadge: 'OSCETUBE Nursing Library',
          directUrl: result.webViewLink || streamUrl,
          streamUrl,
          duration: 'Clinical Demo',
          thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60',
          description: `Uploaded from Developer Console to OSCETUBE folder (${AUTHOR_EMAIL}).`,
          keySteps: ['Follow clinical exam procedure step-by-step.'],
          equipmentNeeded: ['Standard OSCE tray and sterile pack'],
          examTips: 'Review standard rubric steps carefully before exam execution.',
          isCustomUploaded: true,
          uploadedBy: AUTHOR_EMAIL,
          createdAt: new Date().toISOString()
        };
        if (onUpdateVideos) {
          onUpdateVideos([newVideo]);
        }
      }

      setSelectedUploadFile(null);
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: `Upload failed: ${err.message}` });
      addLog(`Upload Error: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Database Backup (JSON Export / Import)
  const handleExportDatabase = () => {
    const backupData = {
      app: 'DATANURSE',
      exportedBy: AUTHOR_EMAIL,
      exportedAt: new Date().toISOString(),
      resourceCount: resources.length,
      resources
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datanurse_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`Exported database JSON with ${resources.length} items.`);
  };

  const handleImportDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.resources)) {
          onUpdateResources(() => parsed.resources);
          setStatusBanner({ type: 'success', text: `Restored ${parsed.resources.length} resources from JSON backup!` });
          addLog(`Imported ${parsed.resources.length} items from JSON backup.`);
        } else {
          throw new Error('Invalid backup file format');
        }
      } catch (err: any) {
        setStatusBanner({ type: 'error', text: `Failed to import JSON: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-teal-500/40 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold shadow-xs">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Developer Console Controls
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800">
                  DEVELOPER MODE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Google Drive sync, OSCETUBE video manager, and manual upload console ({AUTHOR_EMAIL})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Status Banner */}
          {statusBanner && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                statusBanner.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                  : statusBanner.type === 'error'
                  ? 'bg-rose-950/70 border-rose-800 text-rose-300'
                  : 'bg-teal-950/70 border-teal-800 text-teal-300'
              }`}
            >
              <Check className="h-4 w-4 shrink-0" />
              <span>{statusBanner.text}</span>
            </div>
          )}

          {/* 1. Google Drive Workspace Account Connection */}
          <section className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-start space-x-2.5">
                <div className="p-2 rounded-lg bg-teal-600/20 text-teal-400 shrink-0 mt-0.5">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Google Drive Workspace Integration</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connected target account: <span className="font-mono font-semibold text-teal-400">{AUTHOR_EMAIL}</span>
                  </p>
                  <div className="mt-2 text-[11px] text-slate-400 space-y-1">
                    <div>
                      • OAuth Status:{' '}
                      {authToken ? (
                        <span className="text-emerald-400 font-bold">Authenticated & Token Active</span>
                      ) : (
                        <span className="text-amber-400 font-bold">Requires Sign-In</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {authToken ? (
                  <button
                    type="button"
                    onClick={handleDisconnectDrive}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectGoogleDrive}
                    disabled={isAuthenticating}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Key className="h-4 w-4" />
                    <span>{isAuthenticating ? 'Connecting...' : 'Authorize Drive'}</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* 2. Sync Actions from Google Drive */}
          <section className="space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <FolderSync className="h-4 w-4 text-teal-400" />
              Drive Synchronization Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sync OSCETUBE Videos */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Play className="h-4 w-4 text-rose-400" />
                    OSCETUBE Folder Videos
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Fetches all procedure videos stored in your Google Drive <span className="font-bold text-white">'OSCETUBE'</span> folder.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSyncOscetubeVideos}
                  disabled={isSyncingVideos}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncingVideos ? 'animate-spin' : ''}`} />
                  <span>{isSyncingVideos ? 'Scanning OSCETUBE...' : 'Sync OSCETUBE Videos'}</span>
                </button>
              </div>

              {/* Sync Nursing Curriculum Docs */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-teal-400" />
                    Nursing Documents & PDFs
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Scans and downloads PDFs, lecture notes, and past exam papers from your Drive into the app library.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSyncDriveResources}
                  disabled={isSyncingResources}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncingResources ? 'animate-spin' : ''}`} />
                  <span>{isSyncingResources ? 'Scanning Docs...' : 'Sync Curriculum Resources'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* 3. Manual File Upload Direct to Google Drive */}
          <section className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <UploadCloud className="h-4 w-4 text-teal-400" />
              Manual Upload Console to Drive
            </h3>
            <p className="text-xs text-slate-400">
              Upload video clips or document PDFs directly from your local device to your Google Drive repository.
            </p>

            <form onSubmit={handleManualUpload} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Target Drive Folder</label>
                  <select
                    value={targetFolder}
                    onChange={(e) => setTargetFolder(e.target.value as any)}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white focus:ring-1 focus:ring-teal-400"
                  >
                    <option value="OSCETUBE">OSCETUBE (Clinical Procedure Videos)</option>
                    <option value="DATANURSE_RESOURCES">DATANURSE_RESOURCES (Curriculum & Notes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Choose File (MP4, PDF, DOCX)</label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedUploadFile(e.target.files?.[0] || null)}
                    className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
                  />
                </div>
              </div>

              {selectedUploadFile && (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs flex items-center justify-between">
                  <div className="truncate">
                    <span className="font-semibold text-white">{selectedUploadFile.name}</span>{' '}
                    <span className="text-slate-400 font-mono">({(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isUploading || !authToken}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isUploading ? `Uploading (${uploadProgress}%)...` : 'Upload Now'}</span>
                  </button>
                </div>
              )}

              {uploadSuccessMsg && (
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}
            </form>
          </section>

          {/* 4. Local Database Backup & Restore */}
          <section className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-teal-400" />
                  Database Backup & JSON Management
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Current active library items: <span className="font-bold text-white">{resources.length}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportDatabase}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export JSON</span>
                </button>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600/30 hover:bg-teal-600/40 text-teal-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-teal-500/40">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Import JSON</span>
                  <input type="file" accept=".json" onChange={handleImportDatabase} className="hidden" />
                </label>
              </div>
            </div>
          </section>

          {/* 5. Real-time Console Log Terminal */}
          <section className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Terminal className="h-3.5 w-3.5 text-teal-400" />
                Console Activity Log
              </span>
              <button
                type="button"
                onClick={() => setLogMessages([`[${new Date().toLocaleTimeString()}] Logs cleared.`])}
                className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Clear Log
              </button>
            </div>

            <div className="p-3 rounded-xl bg-black border border-slate-800 font-mono text-[11px] text-teal-400/90 h-32 overflow-y-auto space-y-1 select-text">
              {logMessages.map((msg, i) => (
                <div key={i} className="leading-tight">
                  {msg}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-slate-500">
            DATANURSE Admin Build • {AUTHOR_EMAIL}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Developer Console
          </button>
        </div>
      </div>
    </div>
  );
};

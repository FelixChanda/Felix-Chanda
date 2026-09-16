import React, { useState, useEffect, useRef } from 'react';
import {
  HardDrive,
  Download,
  ExternalLink,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowDownCircle,
  Gauge,
  Zap,
  RotateCcw
} from 'lucide-react';
import { OsceVideo } from '../types';
import {
  getAccessToken,
  requestGoogleDriveAccess,
  AUTHOR_EMAIL
} from '../services/googleDriveService';

interface DriveVideoPlayerProps {
  video: OsceVideo;
  onEnded?: () => void;
  onSwitchToYouTube?: () => void;
}

/**
 * Extracts a Google Drive file ID from various URL formats or custom IDs
 */
export function extractDriveFileId(video: OsceVideo): string | null {
  if (!video) return null;

  if (video.id && video.id.startsWith('drive-osce-')) {
    return video.id.replace('drive-osce-', '');
  }

  if (video.streamUrl) {
    const fileMatch = video.streamUrl.match(/\/files\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) return fileMatch[1];
    const idParamMatch = video.streamUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
    const dMatch = video.streamUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch && dMatch[1]) return dMatch[1];
  }

  if (video.directUrl) {
    const dMatch = video.directUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (dMatch && dMatch[1]) return dMatch[1];
    const idParamMatch = video.directUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
    const fileMatch = video.directUrl.match(/\/files\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) return fileMatch[1];
  }

  return null;
}

export const DriveVideoPlayer: React.FC<DriveVideoPlayerProps> = ({
  video,
  onEnded,
  onSwitchToYouTube
}) => {
  const [streamType, setStreamType] = useState<'embed' | 'blob'>('embed');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isDownlinking, setIsDownlinking] = useState<boolean>(false);
  const [downlinkProgress, setDownlinkProgress] = useState<number>(0);
  const [downlinkError, setDownlinkError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const driveFileId = extractDriveFileId(video);
  const drivePreviewUrl = driveFileId
    ? `https://drive.google.com/file/d/${driveFileId}/preview`
    : null;
  const driveDirectDownloadUrl = driveFileId
    ? `https://drive.google.com/uc?export=download&id=${driveFileId}`
    : video.directUrl || '#';
  const driveViewUrl = driveFileId
    ? `https://drive.google.com/file/d/${driveFileId}/view`
    : video.directUrl || '#';

  // Reset states when video changes
  useEffect(() => {
    setBlobUrl(null);
    setIsDownlinking(false);
    setDownlinkProgress(0);
    setDownlinkError(null);
    setStreamType('embed');
    setPlaybackSpeed(1.0);

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [video.id]);

  // Adjust playback speed when changed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, blobUrl]);

  // Handle direct high-speed downlinking of video stream from Google Drive API
  const handleDownlinkStream = async () => {
    if (!driveFileId) {
      setDownlinkError('Direct Drive File ID not detected. Streaming via Drive Cloud embed.');
      return;
    }

    let token = getAccessToken();
    if (!token) {
      try {
        const requested = await requestGoogleDriveAccess();
        if (!requested) {
          setDownlinkError('Google Drive authorization required for direct downlink.');
          return;
        }
        token = requested;
      } catch (err: any) {
        setDownlinkError(err?.message || 'Could not connect to Google Drive.');
        return;
      }
    }

    setIsDownlinking(true);
    setDownlinkProgress(20);
    setDownlinkError(null);

    try {
      setDownlinkProgress(45);
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error(`Drive downlink status: ${res.status}. Falling back to high-speed cloud stream.`);
      }

      setDownlinkProgress(80);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setBlobUrl(objectUrl);
      setStreamType('blob');
      setDownlinkProgress(100);
      setIsDownlinking(false);
    } catch (err: any) {
      console.warn('[Drive Video Player] Direct downlink fallback:', err);
      setDownlinkError('Using standard fast Drive streaming embed.');
      setIsDownlinking(false);
      setStreamType('embed');
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleToggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div
      ref={containerRef}
      id={`drive-player-${video.id}`}
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl flex flex-col justify-between group select-none"
    >
      {/* 1. VIDEO VIEWPORT */}
      <div className="relative w-full h-full flex-1 overflow-hidden bg-zinc-950 flex items-center justify-center">
        {streamType === 'blob' && blobUrl ? (
          /* Direct Downlinked Blob Video Stream */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={blobUrl}
              poster={video.thumbnailUrl}
              playsInline
              controls
              autoPlay
              className="w-full h-full object-contain"
              onPlaying={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                if (onEnded) onEnded();
              }}
            />
          </div>
        ) : drivePreviewUrl ? (
          /* Google Drive High-Speed Cloud Stream Embed */
          <div className="w-full h-full relative bg-zinc-950">
            <iframe
              src={drivePreviewUrl}
              title={video.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          /* Fallback when no Drive File ID is recognized */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-zinc-900 to-black">
            {video.thumbnailUrl && (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
              />
            )}
            <div className="relative z-10 max-w-md space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-teal-400">
                <HardDrive className="h-6 w-6" />
              </div>
              <h4 className="text-white font-bold text-base">{video.title}</h4>
              <p className="text-xs text-zinc-400">
                OSCETUBE Google Drive Video ({AUTHOR_EMAIL}).
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                <button
                  onClick={handleDownlinkStream}
                  disabled={isDownlinking}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <ArrowDownCircle className="h-4 w-4" />
                  <span>{isDownlinking ? `Downlinking (${downlinkProgress}%)...` : 'Downlink Stream'}</span>
                </button>
                {video.youtubeId && onSwitchToYouTube && (
                  <button
                    onClick={onSwitchToYouTube}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Play className="h-4 w-4" />
                    <span>Open in YouTube</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Downlink Buffering Overlay */}
        {isDownlinking && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-teal-400 animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Downlinking High-Speed Stream...</p>
              <p className="text-xs text-zinc-400">Pre-buffering clinical media directly from Google Drive</p>
            </div>
            <div className="w-52 h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
              <div
                className="h-full bg-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${downlinkProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. TOP DRIVE BADGE & ACTION OVERLAY */}
      <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between pointer-events-auto z-20">
        <div className="flex items-center space-x-2 min-w-0 pr-2">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-teal-600/90 text-white flex items-center gap-1.5 shadow-md border border-teal-400/30">
            <Zap className="h-3 w-3 text-teal-200" />
            <span>Drive Fast Player</span>
          </span>
          <span className="text-xs font-bold text-white truncate max-w-xs drop-shadow-md hidden sm:inline">
            {video.title}
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Playback Speed Pill */}
          <div className="relative">
            <button
              onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-[11px] font-bold border border-zinc-700/80 shadow-md flex items-center gap-1 transition cursor-pointer backdrop-blur-md"
              title="Adjust playback speed"
            >
              <Gauge className="h-3 w-3 text-teal-400" />
              <span>{playbackSpeed}x</span>
            </button>
            {isSpeedMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-24 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1 z-50 flex flex-col">
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackSpeed(speed);
                      setIsSpeedMenuOpen(false);
                    }}
                    className={`px-3 py-1 text-xs text-left font-semibold transition hover:bg-zinc-800 cursor-pointer ${
                      playbackSpeed === speed ? 'text-teal-400 font-bold bg-teal-950/40' : 'text-zinc-300'
                    }`}
                  >
                    {speed}x {speed === 1.0 && '(Normal)'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direct Downlink Button */}
          {driveFileId && (
            <a
              href={driveDirectDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-[11px] font-bold border border-zinc-700/80 shadow-md flex items-center gap-1.5 transition backdrop-blur-md cursor-pointer"
              title="Downlink full raw video file from Google Drive"
            >
              <Download className="h-3 w-3 text-teal-400" />
              <span className="hidden md:inline">Downlink MP4</span>
            </a>
          )}

          {/* Open in Google Drive */}
          {driveFileId && (
            <a
              href={driveViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 transition backdrop-blur-md"
              title="Open file in Google Drive web viewer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          {/* Switch to YouTube if available */}
          {video.youtubeId && onSwitchToYouTube && (
            <button
              onClick={onSwitchToYouTube}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold border border-red-400/40 shadow-md flex items-center gap-1 transition cursor-pointer backdrop-blur-md"
              title="Open in YouTube"
            >
              <Play className="h-3 w-3 fill-white" />
              <span>YouTube</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. BOTTOM DRIVE METADATA STRIP */}
      <div className="bg-zinc-900/95 border-t border-zinc-800/80 px-3 py-2 flex items-center justify-between text-xs text-zinc-400 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-teal-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>OSCETUBE Optimized Stream</span>
          </div>
          {video.fileSize && (
            <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 font-mono">
              {video.fileSize}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {streamType === 'embed' ? (
            <button
              onClick={handleDownlinkStream}
              disabled={isDownlinking}
              className="text-[11px] text-zinc-300 hover:text-teal-400 font-medium flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
            >
              <ArrowDownCircle className="h-3.5 w-3.5 text-teal-400" />
              <span>Direct Buffer Stream</span>
            </button>
          ) : (
            <button
              onClick={() => setStreamType('embed')}
              className="text-[11px] text-zinc-300 hover:text-teal-400 font-medium flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3 text-teal-400" />
              <span>Switch to Fast Embed</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Google Drive Integration Service for DATANURSE
 * Bound to author account: fchanda335@gmail.com
 * Supports:
 * - Scanning & streaming OSCE videos from the 'OSCETUBE' Google Drive folder
 * - Syncing academic documents, past papers, textbooks, and notes from Google Drive
 * - Direct manual file upload to Google Drive
 * - Local offline caching of Drive metadata
 */

import { OsceVideo, ResourceItem } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

const GOOGLE_DRIVE_CLIENT_ID =
  firebaseConfig.oAuthClientId ||
  '556223176676-ci9a64uvai5123tc8bs7r7eg2s9v3a3e.apps.googleusercontent.com';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file'
].join(' ');

export const AUTHOR_EMAIL = 'fchanda335@gmail.com';
const TOKEN_STORAGE_KEY = 'datanurse_drive_oauth_token';
const TOKEN_EXPIRY_KEY = 'datanurse_drive_token_expiry';
const OSCETUBE_FOLDER_ID_KEY = 'datanurse_oscetube_folder_id';

let tokenClient: any = null;
let currentAccessToken: string | null = null;

// Initialize Google Identity Services token client
export function initGoogleDriveAuth(onSuccess?: (token: string) => void): boolean {
  if (typeof window === 'undefined') return false;

  // Restore stored token if still valid
  const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (savedToken && expiry && Date.now() < parseInt(expiry)) {
    currentAccessToken = savedToken;
    if (onSuccess) onSuccess(savedToken);
    return true;
  }

  const google = (window as any).google;
  if (!google?.accounts?.oauth2) {
    // Dynamically load Google Identity Services if not already present
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setupTokenClient(onSuccess);
      };
      document.head.appendChild(script);
    }
    return false;
  }

  setupTokenClient(onSuccess);
  return true;
}

function setupTokenClient(onSuccess?: (token: string) => void) {
  const google = (window as any).google;
  if (!google?.accounts?.oauth2) return;

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_DRIVE_CLIENT_ID,
    scope: SCOPES,
    hint: AUTHOR_EMAIL,
    callback: (tokenResponse: any) => {
      if (tokenResponse && tokenResponse.access_token) {
        currentAccessToken = tokenResponse.access_token;
        const expiresInMs = (tokenResponse.expires_in || 3600) * 1000;
        localStorage.setItem(TOKEN_STORAGE_KEY, tokenResponse.access_token);
        localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresInMs));
        if (onSuccess) onSuccess(tokenResponse.access_token);
      }
    }
  });
}

/**
 * Request Google Drive OAuth token popup
 */
export async function requestGoogleDriveAccess(): Promise<string> {
  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      // Fallback if GSI script is loading
      initGoogleDriveAuth((token) => resolve(token));
      setTimeout(() => {
        if (!currentAccessToken) {
          reject(new Error('Google Identity Services not ready. Please try again in a moment.'));
        }
      }, 3000);
      return;
    }

    if (!tokenClient) {
      setupTokenClient((token) => resolve(token));
    }

    if (tokenClient) {
      tokenClient.callback = (tokenResponse: any) => {
        if (tokenResponse?.error) {
          reject(new Error(tokenResponse.error_description || tokenResponse.error));
          return;
        }
        if (tokenResponse?.access_token) {
          currentAccessToken = tokenResponse.access_token;
          const expiresInMs = (tokenResponse.expires_in || 3600) * 1000;
          localStorage.setItem(TOKEN_STORAGE_KEY, tokenResponse.access_token);
          localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expiresInMs));
          resolve(tokenResponse.access_token);
        }
      };
      tokenClient.requestAccessToken({ prompt: 'consent' });
    }
  });
}

/**
 * Get active access token or stored token
 */
export function getAccessToken(): string | null {
  if (currentAccessToken) return currentAccessToken;
  const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (savedToken && expiry && Date.now() < parseInt(expiry)) {
    currentAccessToken = savedToken;
    return savedToken;
  }
  return null;
}

/**
 * Sign out / Clear Google Drive OAuth token
 */
export function disconnectGoogleDrive() {
  currentAccessToken = null;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * Find or auto-discover the 'OSCETUBE' folder in Google Drive
 */
export async function findOscetubeFolderId(token?: string): Promise<string | null> {
  const authToken = token || getAccessToken();
  if (!authToken) return null;

  try {
    const q = "name = 'OSCETUBE' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&spaces=drive`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      const folderId = data.files[0].id;
      localStorage.setItem(OSCETUBE_FOLDER_ID_KEY, folderId);
      return folderId;
    }
  } catch (err) {
    console.warn('Could not query OSCETUBE folder:', err);
  }
  return localStorage.getItem(OSCETUBE_FOLDER_ID_KEY);
}

/**
 * Fetch all OSCE Video files from Google Drive (inside 'OSCETUBE' folder or video mimeTypes)
 */
export async function fetchOscetubeVideosFromDrive(token?: string): Promise<OsceVideo[]> {
  const authToken = token || getAccessToken();
  if (!authToken) {
    // Return cached videos or throw
    const cached = localStorage.getItem('datanurse_drive_oscetube_videos');
    return cached ? JSON.parse(cached) : [];
  }

  try {
    const folderId = await findOscetubeFolderId(authToken);
    let queryFilter = "trashed = false and (mimeType contains 'video/' or name contains '.mp4' or name contains '.mkv' or name contains '.webm')";
    if (folderId) {
      queryFilter = `'${folderId}' in parents and trashed = false`;
    }

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(queryFilter)}&fields=files(id,name,size,mimeType,createdTime,modifiedTime,thumbnailLink,webContentLink,webViewLink,description)&pageSize=50&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    if (!res.ok) {
      console.warn('Drive video list response was not ok:', res.status);
      const cached = localStorage.getItem('datanurse_drive_oscetube_videos');
      return cached ? JSON.parse(cached) : [];
    }

    const data = await res.json();
    const driveFiles = data.files || [];

    const parsedVideos: OsceVideo[] = driveFiles.map((file: any, index: number) => {
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

      // Derive clinical category from title
      const lower = cleanTitle.toLowerCase();
      let category: OsceVideo['category'] = 'basic';
      let categoryLabel = 'Basic Nursing Procedures';

      if (lower.includes('labor') || lower.includes('pv') || lower.includes('vaginal') || lower.includes('maternal') || lower.includes('deliver')) {
        category = 'maternal';
        categoryLabel = 'Maternal & Midwifery';
      } else if (lower.includes('baby') || lower.includes('neonat') || lower.includes('peds') || lower.includes('pediatric')) {
        category = 'pediatric';
        categoryLabel = 'Pediatric & Neonatal';
      } else if (lower.includes('cannula') || lower.includes('drug') || lower.includes('iv') || lower.includes('injection') || lower.includes('medication')) {
        category = 'pharmacology';
        categoryLabel = 'Pharmacology & IV Skills';
      } else if (lower.includes('surg') || lower.includes('wound') || lower.includes('catheter') || lower.includes('sterile') || lower.includes('pre-op')) {
        category = 'medsurg';
        categoryLabel = 'Medical-Surgical OSCE';
      } else if (lower.includes('psych') || lower.includes('mental') || lower.includes('depress') || lower.includes('bipolar')) {
        category = 'psychiatric';
        categoryLabel = 'Mental Health OSCE';
      }

      const streamUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${firebaseConfig.apiKey}`;
      const directUrl = file.webContentLink || file.webViewLink || streamUrl;

      return {
        id: `drive-osce-${file.id}`,
        title: cleanTitle,
        category,
        categoryLabel,
        channelName: 'OSCETUBE Clinical Drive',
        creatorTag: 'oscetube',
        channelSubscribers: 'Verified Zambian Clinical Repo',
        institutionBadge: 'OSCETUBE Nursing Library',
        directUrl,
        streamUrl,
        duration: 'Clinical Demo',
        views: 'Drive Stream',
        uploadDate: new Date(file.modifiedTime || file.createdTime).toLocaleDateString(),
        thumbnailUrl: file.thumbnailLink || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60',
        description: file.description || `High-definition Zambian OSCE clinical skills procedure video streamed directly from the OSCETUBE Google Drive repository (${AUTHOR_EMAIL}).`,
        keySteps: [
          'Verify patient identity, explain procedure, and obtain informed consent.',
          'Perform surgical/clinical hand hygiene according to standard IPC guidelines.',
          'Assemble all required sterile and clean equipment on sanitized trolley.',
          'Execute procedural steps systematically adhering to NMCZ clinical exam rubric.',
          'Ensure patient safety, comfort, and appropriate documentation.'
        ],
        equipmentNeeded: ['Sterile Procedure Pack', 'Appropriate PPE', 'Sanitized Clinical Tray', 'Documentation Chart'],
        examTips: 'OSCETUBE Drive Tip: Review each step sequence against national clinical assessment standards.',
        isCustomUploaded: true,
        uploadedBy: AUTHOR_EMAIL,
        cloudStoragePath: `OSCETUBE/${file.name}`,
        fileSize: file.size ? `${(parseInt(file.size) / (1024 * 1024)).toFixed(1)} MB` : undefined,
        createdAt: file.createdTime
      };
    });

    if (parsedVideos.length > 0) {
      localStorage.setItem('datanurse_drive_oscetube_videos', JSON.stringify(parsedVideos));
    }

    return parsedVideos;
  } catch (err) {
    console.error('Error fetching OSCETUBE videos from Drive:', err);
    const cached = localStorage.getItem('datanurse_drive_oscetube_videos');
    return cached ? JSON.parse(cached) : [];
  }
}

/**
 * Upload a file directly to Google Drive (into OSCETUBE or root)
 */
export async function uploadFileToGoogleDrive(
  file: File,
  folderName: 'OSCETUBE' | 'DATANURSE_RESOURCES' = 'OSCETUBE',
  onProgress?: (progressPercent: number) => void
): Promise<{ fileId: string; webViewLink?: string; webContentLink?: string }> {
  const authToken = getAccessToken();
  if (!authToken) {
    throw new Error('Google Drive not authenticated. Please connect your Google account in Developer Console.');
  }

  // Auto-find folder
  let targetFolderId: string | null = null;
  if (folderName === 'OSCETUBE') {
    targetFolderId = await findOscetubeFolderId(authToken);
  }

  const metadata: any = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream'
  };

  if (targetFolderId) {
    metadata.parents = [targetFolderId];
  }

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  if (onProgress) onProgress(30);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: form
    }
  );

  if (onProgress) onProgress(90);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive Upload Failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (onProgress) onProgress(100);

  return {
    fileId: data.id,
    webViewLink: data.webViewLink,
    webContentLink: data.webContentLink
  };
}

/**
 * Sync nursing curriculum resources from Google Drive
 */
export async function syncResourcesFromGoogleDrive(token?: string): Promise<ResourceItem[]> {
  const authToken = token || getAccessToken();
  if (!authToken) {
    return [];
  }

  try {
    const q = "trashed = false and (mimeType = 'application/pdf' or mimeType contains 'document' or mimeType contains 'text/plain' or name contains '.pdf' or name contains '.docx')";
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,size,mimeType,modifiedTime,webViewLink,webContentLink)&pageSize=50&orderBy=modifiedTime desc`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    const files = data.files || [];

    const newResources: ResourceItem[] = files.map((file: any) => {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      const cleanFormat = ext === 'DOCX' || ext === 'DOC' ? 'DOCX' : ext === 'TXT' ? 'TXT' : ext === 'EPUB' ? 'EPUB' : 'PDF';
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

      return {
        id: `drive-res-${file.id}`,
        title: cleanTitle,
        category: 'documents',
        domain: 'Adult Health & Med-Surg',
        yearLevel: 'Year 2 (Adult Health & Patho)',
        description: `Synced document from Google Drive (${AUTHOR_EMAIL}). Available for direct offline download and native device reader.`,
        authorOrInstitution: AUTHOR_EMAIL,
        updatedAt: new Date(file.modifiedTime).toISOString().split('T')[0],
        tags: ['Google Drive', 'Synced', cleanFormat],
        documentFormat: cleanFormat as any,
        documentUrl: file.webViewLink || file.webContentLink,
        attachmentName: file.name,
        attachmentType: cleanFormat as any,
        attachmentSize: file.size ? `${(parseInt(file.size) / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
        attachmentUrl: file.webContentLink || file.webViewLink,
        hasAttachment: true,
        isAvailableOffline: true
      };
    });

    return newResources;
  } catch (err) {
    console.error('Error syncing resources from Google Drive:', err);
    return [];
  }
}

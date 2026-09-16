import { jsPDF } from 'jspdf';
import { ResourceItem } from '../types';
import { triggerAdMobInterstitial } from './admobHelper';

/**
 * Utility to open clinical document resources either directly in the device's
 * native document reader (offline/online) or inside an in-app viewer.
 */

// Convert base64 data URI to standard Blob
export function dataUriToBlob(dataUri: string): Blob {
  try {
    const parts = dataUri.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
  } catch (e) {
    return new Blob([dataUri], { type: 'text/plain;charset=utf-8' });
  }
}

/**
 * Generates a real, valid binary PDF document (%PDF-1.4) using jsPDF.
 * Adobe Acrobat, WPS Office, system PDF Viewers, and browser PDF readers
 * will open this document cleanly without corruption or header errors.
 */
export function generatePdfBlobFromResource(resource: ResourceItem, isAttachment = false): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin + 8;
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, margin, pageWidth - margin, margin);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`DATANURSE Clinical Library - ${resource.title.slice(0, 50)}`, margin, margin - 2);
    }
  };

  // 1. Header Banner
  doc.setFillColor(13, 148, 136); // Teal 600
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('DATANURSE CLINICAL REFERENCE LIBRARY', margin + 6, y + 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Academic & Clinical Repository • Compiled by Chanda Felix (fchanda335@gmail.com)', margin + 6, y + 17);

  y += 30;

  // 2. Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const titleLines = doc.splitTextToSize(resource.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6.5 + 4;

  // 3. Metadata Table Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  const metaHeight = 22;
  doc.roundedRect(margin, y, contentWidth, metaHeight, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const col1X = margin + 4;
  const col2X = margin + 95;

  doc.setFont('helvetica', 'bold');
  doc.text('Category:', col1X, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text((resource.category || '').toUpperCase().replace('_', ' '), col1X + 18, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Domain:', col1X, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text((resource.domain || 'Nursing Specialties').slice(0, 35), col1X + 18, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Level:', col1X, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(resource.yearLevel || 'All Academic Years', col1X + 18, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Author / Inst:', col2X, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text((resource.authorOrInstitution || 'DATANURSE Medical Editor').slice(0, 36), col2X + 22, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Last Updated:', col2X, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(resource.updatedAt || '2026-09-14', col2X + 22, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Format / File:', col2X, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(isAttachment ? (resource.attachmentName || 'Attachment.pdf') : `${(resource.documentFormat || 'PDF').toUpperCase()} Document`, col2X + 22, y + 18);

  y += metaHeight + 8;

  // 4. Clinical Overview
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(13, 148, 136);
  doc.text('1. CLINICAL OVERVIEW & SUMMARY', margin, y);
  y += 2;
  doc.setDrawColor(13, 148, 136);
  doc.line(margin, y, margin + 65, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const descLines = doc.splitTextToSize(resource.description || 'Clinical reference overview.', contentWidth);
  checkPageBreak(descLines.length * 4.5 + 4);
  doc.text(descLines, margin, y);
  y += descLines.length * 4.5 + 8;

  // 5. High Yield Key Points
  if (resource.highYieldKeyPoints && resource.highYieldKeyPoints.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(13, 148, 136);
    doc.text('2. HIGH-YIELD CLINICAL PEARLS & ALERTS', margin, y);
    y += 2;
    doc.line(margin, y, margin + 75, y);
    y += 6;

    resource.highYieldKeyPoints.forEach((pt, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(13, 148, 136);
      doc.text(`[Alert ${idx + 1}]`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const ptLines = doc.splitTextToSize(pt, contentWidth - 18);
      checkPageBreak(ptLines.length * 4.5 + 2);
      doc.text(ptLines, margin + 18, y);
      y += Math.max(ptLines.length * 4.5 + 2, 5.5);
    });
    y += 5;
  }

  // 6. Learning Outcomes
  if (resource.learningOutcomes && resource.learningOutcomes.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(13, 148, 136);
    doc.text('3. CORE LEARNING OUTCOMES & COMPETENCIES', margin, y);
    y += 2;
    doc.line(margin, y, margin + 82, y);
    y += 6;

    resource.learningOutcomes.forEach((lo) => {
      const loLines = doc.splitTextToSize(`• ${lo}`, contentWidth - 4);
      checkPageBreak(loLines.length * 4.5 + 2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(loLines, margin + 2, y);
      y += loLines.length * 4.5 + 2;
    });
    y += 5;
  }

  // 7. Clinical Protocol Sections
  if (resource.sections && resource.sections.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(13, 148, 136);
    doc.text('4. EVIDENCE-BASED CLINICAL PROTOCOLS', margin, y);
    y += 2;
    doc.line(margin, y, margin + 78, y);
    y += 6;

    resource.sections.forEach((sec) => {
      checkPageBreak(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(sec.title, margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      const secLines = doc.splitTextToSize(sec.content, contentWidth);
      checkPageBreak(secLines.length * 4.5 + 3);
      doc.text(secLines, margin, y);
      y += secLines.length * 4.5 + 3;

      if (sec.bulletPoints && sec.bulletPoints.length > 0) {
        sec.bulletPoints.forEach((bp) => {
          const bpLines = doc.splitTextToSize(`- ${bp}`, contentWidth - 6);
          checkPageBreak(bpLines.length * 4.2 + 2);
          doc.text(bpLines, margin + 4, y);
          y += bpLines.length * 4.2 + 2;
        });
        y += 2;
      }

      if (sec.callout) {
        checkPageBreak(15);
        doc.setFillColor(254, 243, 199);
        doc.setDrawColor(245, 158, 11);
        const calloutLines = doc.splitTextToSize(`CLINICAL ALERT: ${sec.callout.text}`, contentWidth - 10);
        const calloutH = calloutLines.length * 4.2 + 5;
        doc.roundedRect(margin, y, contentWidth, calloutH, 1, 1, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(180, 83, 9);
        doc.text(calloutLines, margin + 5, y + 4);
        y += calloutH + 3;
      }

      y += 3;
    });
  } else if (resource.documentContentText) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(13, 148, 136);
    doc.text('4. CLINICAL PROTOCOL & GUIDELINE CONTENT', margin, y);
    y += 2;
    doc.line(margin, y, margin + 82, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const bodyLines = doc.splitTextToSize(resource.documentContentText, contentWidth);
    checkPageBreak(bodyLines.length * 4.5 + 4);
    doc.text(bodyLines, margin, y);
    y += bodyLines.length * 4.5 + 6;
  }

  // Page Numbers Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('DATANURSE Clinical Library • fchanda335@gmail.com', margin, pageHeight - 7);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 22, pageHeight - 7);
  }

  return doc.output('blob');
}

/**
 * Creates a downloadable document blob for device document readers
 * without editing or summarizing the original file content.
 */
export function createDocumentBlob(resource: ResourceItem, isAttachment = false): { blob: Blob; fileName: string; mimeType: string } {
  const extension = isAttachment
    ? (resource.attachmentType || 'PDF').toLowerCase()
    : (resource.documentFormat || 'PDF').toLowerCase();
  const safeTitle = resource.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
  const fileName = isAttachment
    ? (resource.attachmentName || `${safeTitle}_Attachment.${extension}`)
    : `${safeTitle}.${extension}`;

  const dataUri = isAttachment
    ? (resource.attachmentDataUri || resource.documentDataUri)
    : (resource.documentDataUri || resource.attachmentDataUri);

  // If exact raw base64 data URI exists, return original binary blob directly
  if (dataUri && dataUri.startsWith('data:')) {
    const blob = dataUriToBlob(dataUri);
    return { blob, fileName, mimeType: blob.type || (extension === 'pdf' ? 'application/pdf' : 'application/octet-stream') };
  }

  // Retrieve raw unedited content text
  let rawText = isAttachment
    ? (resource.attachmentContentText || resource.documentContentText || resource.description || '')
    : (resource.documentContentText || resource.description || '');

  if (!rawText && resource.sections && resource.sections.length > 0) {
    rawText = resource.sections
      .map((s) => `${s.title}\n${s.content}${s.bulletPoints ? '\n' + s.bulletPoints.map((b) => '• ' + b).join('\n') : ''}`)
      .join('\n\n');
  }

  if (!rawText) {
    rawText = resource.title;
  }

  if (extension === 'pdf') {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(rawText, contentWidth);
    doc.text(lines, margin, margin);
    const blob = doc.output('blob');
    return { blob, fileName, mimeType: 'application/pdf' };
  }

  const mimeType = extension === 'docx' 
    ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    : 'text/plain;charset=utf-8';

  const blob = new Blob([rawText], { type: mimeType });
  return { blob, fileName, mimeType };
}

/**
 * Triggers document download in original format without editing or summarizing
 */
export async function openInDeviceReader(
  resource: ResourceItem,
  onSuccess?: (msg: string) => void,
  onError?: (err: string) => void
): Promise<void> {
  try {
    // Trigger online full-screen AdMob interstitial ad on download
    triggerAdMobInterstitial('download', resource.title);

    const extension = (resource.documentFormat || 'PDF').toLowerCase();
    const safeTitle = resource.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const fileName = `${safeTitle || 'Nursing_Clinical_Document'}.${extension}`;

    // 1. Direct HTTP URL download if present
    const fileUrl = resource.documentUrl || resource.attachmentUrl;
    if (fileUrl && fileUrl.startsWith('http')) {
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = fileUrl;
      downloadAnchor.download = fileName;
      downloadAnchor.target = '_blank';
      downloadAnchor.rel = 'noopener noreferrer';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      setTimeout(() => document.body.removeChild(downloadAnchor), 3000);
      onSuccess?.(`Downloading original file "${fileName}"...`);
      return;
    }

    const { blob, fileName: finalFileName } = createDocumentBlob(resource, false);

    // Direct automatic download of original Blob
    const blobUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = finalFileName;
    downloadAnchor.target = '_blank';
    downloadAnchor.rel = 'noopener noreferrer';
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();

    setTimeout(() => {
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(blobUrl);
    }, 4000);

    onSuccess?.(`Downloading original file "${finalFileName}" (${(blob.size / 1024).toFixed(1)} KB)...`);
  } catch (err: any) {
    console.error('Failed to download document:', err);
    onError?.(err?.message || 'Could not download document.');
  }
}

/**
 * Specifically downloads a note or resource attachment in original format without editing or summarizing
 */
export async function openAttachmentInExternalReader(
  resource: ResourceItem,
  onSuccess?: (msg: string) => void,
  onError?: (err: string) => void
): Promise<void> {
  try {
    // Trigger online full-screen AdMob interstitial ad on attachment download
    triggerAdMobInterstitial('download', resource.attachmentName || resource.title);

    const extension = (resource.attachmentType || resource.documentFormat || 'PDF').toLowerCase();
    const safeTitle = resource.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const fileName =
      resource.attachmentName ||
      `${safeTitle}_Attachment.${extension}`;

    // 1. Direct HTTP URL download if present
    const fileUrl = resource.attachmentUrl || resource.documentUrl;
    if (fileUrl && fileUrl.startsWith('http')) {
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = fileUrl;
      downloadAnchor.download = fileName;
      downloadAnchor.target = '_blank';
      downloadAnchor.rel = 'noopener noreferrer';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      setTimeout(() => document.body.removeChild(downloadAnchor), 3000);
      onSuccess?.(`Downloading original file "${fileName}"...`);
      return;
    }

    const { blob, fileName: finalFileName } = createDocumentBlob(resource, true);

    // Direct automatic download of original Blob
    const blobUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = finalFileName;
    downloadAnchor.target = '_blank';
    downloadAnchor.rel = 'noopener noreferrer';
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();

    setTimeout(() => {
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(blobUrl);
    }, 4000);

    onSuccess?.(`Downloading original file "${finalFileName}" (${(blob.size / 1024).toFixed(1)} KB)...`);
  } catch (err: any) {
    console.error('Failed to download attachment:', err);
    onError?.(err?.message || 'Could not download attachment.');
  }
}

/**
 * Print or export document directly
 */
export function printDocument(resource: ResourceItem): void {
  const { blob } = createDocumentBlob(resource);
  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl);
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  }
}


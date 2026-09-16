export type ResourceCategory = 'modules' | 'past_papers' | 'textbooks' | 'notes' | 'documents';

export type AcademicYearLevel =
  | 'All Years'
  | 'Year 1 (Foundations)'
  | 'Year 2 (Adult Health & Patho)'
  | 'Year 3 (Specialties & Peds)'
  | 'Year 4 (Leadership & Intensive)';

export type NursingDomain =
  | 'Fundamentals & Assessment'
  | 'Pharmacology'
  | 'Adult Health & Med-Surg'
  | 'Maternal & Neonatal'
  | 'Pediatric Nursing'
  | 'Mental Health & Psychiatric'
  | 'Critical Care & Emergency'
  | 'Community & Public Health'
  | 'Leadership, Ethics & Legal';

export interface ModuleSyllabusUnit {
  unitNumber: number;
  title: string;
  durationWeeks: number;
  topics: string[];
  keyCompetencies: string[];
  clinicalHours?: number;
}

export interface PastPaperQuestion {
  id: string;
  number: number;
  type: 'multiple_choice' | 'scenario_case' | 'short_answer' | 'care_plan';
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  marks: number;
  markingScheme: string;
  clinicalRationale: string;
  highYieldTip?: string;
}

export interface TextbookChapter {
  chapterNumber: number;
  title: string;
  pageRange: string;
  keyPearls: string[];
  summary: string;
}

export interface ClinicalSection {
  title: string;
  content: string;
  bulletPoints?: string[];
  callout?: {
    type: 'warning' | 'pearl' | 'danger' | 'rule';
    text: string;
  };
}

export interface ResourceItem {
  id: string;
  title: string;
  category: ResourceCategory;
  domain: NursingDomain;
  yearLevel: AcademicYearLevel;
  description: string;
  authorOrInstitution: string;
  updatedAt: string;
  fileSize?: string;
  tags: string[];
  isBookmarked?: boolean;
  isFeatured?: boolean;
  downloadCount?: number;
  patchNotes?: string[];
  versionRelease?: string;

  // Specific to 'modules'
  moduleCode?: string;
  credits?: number;
  semester?: string;
  syllabus?: ModuleSyllabusUnit[];
  learningOutcomes?: string[];
  clinicalPlacementHours?: number;

  // Specific to 'past_papers'
  examYear?: number;
  examPeriod?: 'Midterm Examination' | 'Final Examination' | 'National Licensure Prep' | 'OSCE Clinical Exam';
  paperCode?: string;
  totalMarks?: number;
  durationMinutes?: number;
  questions?: PastPaperQuestion[];

  // Specific to 'textbooks'
  authors?: string;
  edition?: string;
  publisher?: string;
  publicationYear?: number;
  isbn?: string;
  coverAccent?: string;
  tableOfContents?: TextbookChapter[];
  keyTopicsCovered?: string[];
  sampleExcerpt?: string;

  // Specific to 'notes'
  noteType?: 'Clinical Cheat Sheet' | 'Drug Card' | 'Nursing Care Plan' | 'Pathophysiology Guide' | 'Lab Values Reference';
  readTimeMinutes?: number;
  sections?: ClinicalSection[];
  highYieldKeyPoints?: string[];
  hasAttachment?: boolean;
  attachmentName?: string;
  attachmentType?: 'PDF' | 'DOCX' | 'TXT' | 'EPUB';
  attachmentSize?: string;
  attachmentDataUri?: string;
  attachmentContentText?: string;
  attachmentUrl?: string;

  // Specific to 'documents' (Open online or offline in device reader)
  documentFormat?: 'PDF' | 'DOCX' | 'TXT' | 'EPUB';
  documentUrl?: string;
  documentDataUri?: string; // base64 / data blob for offline reading
  documentContentText?: string; // readable offline text content
  pageCount?: number;
  isAvailableOffline?: boolean;
  offlineStoredAt?: string;
  documentGuidelineType?: 'Clinical Procedure' | 'Emergency Protocol' | 'Practice Standard' | 'Pharmacopoeia' | 'Assessment Form';
}

export type ThemeMode = 'light' | 'dark';

export interface OptimumCondition {
  id: string;
  parameter: string;
  category: 'Vitals' | 'Hemodynamics' | 'Metabolic & Renal' | 'Acid-Base' | 'Perfusion';
  optimumRange: string;
  numericTarget: number;
  unit: string;
  clinicalSignificance: string;
  nursingInterventionIfAbnormal: string;
  standardAuthority: string;
  lastOnlineSync: string;
}

export interface AdMobConfig {
  enabled: boolean;
  testMode: boolean;
  appId: string;
  bannerUnitId: string;
  interstitialUnitId: string;
  showBannerBottom: boolean;
  showInlineAds: boolean;
}

export type FlashcardCategory =
  | 'Priority Action'
  | 'NCLEX Case'
  | 'Clinical Rationale'
  | 'Drug & Pharmacology'
  | 'Diagnostic Sign'
  | 'Core Recall';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: FlashcardCategory;
  explanation: string;
  keyPearl: string;
  difficulty?: 'Standard' | 'Clinical Challenge' | 'NCLEX High-Yield';
}

export interface FlashcardDeck {
  resourceId: string;
  resourceTitle: string;
  domain: string;
  generatedAt: string;
  cards: Flashcard[];
}

export interface OsceVideo {
  id: string;
  title: string;
  category: 'basic' | 'medsurg' | 'maternal' | 'pediatric' | 'pharmacology' | 'psychiatric' | 'community';
  categoryLabel: string;
  channelName: string;
  creatorTag: string; // e.g. 'mrkoko', 'silwamba', 'mwamba', 'nmcz', 'uth', 'unza', 'custom'
  channelSubscribers?: string;
  institutionBadge: string;
  channelUrl?: string;
  youtubeId?: string;
  directUrl?: string;
  streamUrl?: string;
  duration: string;
  views?: string;
  uploadDate?: string;
  thumbnailUrl: string;
  description: string;
  keySteps: string[];
  equipmentNeeded: string[];
  examTips: string;
  isCustomUploaded?: boolean;
  uploadedBy?: string;
  cloudStoragePath?: string;
  fileSize?: string;
  createdAt?: string;
}

export interface CloudStorageUploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progressPercentage: number;
  fileName: string;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  downloadUrl?: string;
  error?: string;
}

export interface NursingTopic {
  id: string;
  title: string;
  region: 'Zambia' | 'Global' | 'Both';
  institutionOrGuideline: string;
  category: 'National Health Priority' | 'Med-Surg & Adult Health' | 'Maternal & Neonatal' | 'Pediatrics & IMCI' | 'Pharmacology & Therapeutics' | 'Critical Care & Emergency' | 'Public Health & Epidemiology' | 'Leadership & Ethics';
  level: 'Undergraduate Diploma/BSc' | 'Postgraduate/Specialist' | 'Clinical Licensure (GNCZ/NMCZ)' | 'Global Standard (WHO)';
  summary: string;
  keyPearls: string[];
  priorityInterventions: string[];
  examFocus: string;
  recentUpdates?: string;
  sourceAuthority?: string;
  tags?: string[];
  lastUpdated?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  clinicalPearl?: string;
  category?: string;
  difficulty?: 'Standard' | 'Clinical Challenge' | 'NCLEX High-Yield';
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, number>;
  completedAt: string;
  mode: 'practice' | 'exam';
}

export interface QuizHistoryItem {
  id: string;
  resourceId: string;
  resourceTitle: string;
  category: string;
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  completedAt: string;
  mode: 'practice' | 'exam';
}



import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
  HardDrive,
  Download,
  Share2,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Stethoscope,
  ShieldCheck,
  Bell,
  RefreshCw,
  SlidersHorizontal,
  Building2,
  Eye,
  Clock,
  Sparkles,
  AlertCircle,
  FileText,
  ListChecks,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { OsceVideo } from '../types';
import { DriveVideoPlayer } from './DriveVideoPlayer';
import {
  fetchOscetubeVideosFromDrive,
  requestGoogleDriveAccess,
  getAccessToken,
  AUTHOR_EMAIL
} from '../services/googleDriveService';

export type { OsceVideo };

export const COMPREHENSIVE_OSCE_VIDEOS: OsceVideo[] = [
  // --- UNIVERSITY OF ZAMBIA (UNZA) SCHOOL OF NURSING SCIENCES ---
  {
    id: 'osce-unza-1',
    title: 'Sterile Central Venous Line (CVC) Care & Dressing Change — UNZA School of Nursing',
    category: 'medsurg',
    categoryLabel: 'Med-Surg & ICU',
    channelName: 'UNZA School of Nursing Sciences',
    creatorTag: 'unza',
    channelSubscribers: '52.4K students',
    institutionBadge: 'University of Zambia (UNZA)',
    youtubeId: '3JZ_D3ELwOQ',
    duration: '17:30',
    views: '88.4K views',
    uploadDate: '1 week ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=60',
    description: 'Demonstration by the UNZA Department of Clinical Nursing on aseptic non-touch technique (ANTT) for central venous line dressing changes, chlorhexidine skin prep, biopatch placement, and lumen heparin/saline flush protocols.',
    keySteps: [
      'Verify patient identity with 2 identifiers and confirm clinical need for CVC dressing renewal (every 7 days or if soiled).',
      'Position patient supine; turn patient head away from insertion site. Don procedural surgical mask for patient and nurse.',
      'Perform surgical hand hygiene and don clean gloves to carefully remove old transparent occlusive dressing.',
      'Inspect exit site for signs of CRBSI (erythema, tenderness, purulent exudate, tracking).',
      'Remove clean gloves, perform hand hygiene, and don sterile gloves.',
      'Scrub exit site with 2% Chlorhexidine gluconate in 70% isopropyl alcohol using friction back-and-forth for 30 seconds; allow to air dry completely for 2 minutes.',
      'Apply sterile chlorhexidine-impregnated sponge (Biopatch) blue side up.',
      'Apply sterile transparent semipermeable dressing centered over site.',
      'Flush lumens with 10mL Normal Saline using push-pause turbulent technique and clamp.',
      'Label dressing with date, time, lumen gauge, and nurse signature.'
    ],
    equipmentNeeded: ['Sterile CVC Dressing Kit', '2% Chlorhexidine in 70% Alcohol swab sticks', 'Biopatch disc', 'Transparent occlusive dressing (Tegaderm)', 'Sterile gloves & masks', '10mL Saline flush syringes'],
    examTips: 'UNZA Clinical Tip: Always let Chlorhexidine air dry completely for full 2 minutes before applying dressing. Fanning or blowing on the site immediately fails the station!'
  },
  {
    id: 'osce-unza-2',
    title: 'Assisting with Lumbar Puncture & CSF Manometry — UNZA Ridgeway Campus',
    category: 'medsurg',
    categoryLabel: 'Adult Health & Neuro',
    channelName: 'UNZA School of Nursing Sciences',
    creatorTag: 'unza',
    channelSubscribers: '52.4K students',
    institutionBadge: 'University of Zambia (UNZA)',
    youtubeId: '2mC_cE9g-Yg',
    duration: '20:10',
    views: '64.1K views',
    uploadDate: '2 weeks ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop&q=60',
    description: 'UNZA clinical tutorial on preparing the lumbar puncture sterile trolley, positioning the adult patient in lateral decubitus curled position (L3/L4 interspace), assisting with opening pressure manometer, and post-procedure flat bedrest.',
    keySteps: [
      'Confirm informed consent and check platelet count / coagulation profile (INR < 1.5).',
      'Position patient in lateral recumbent "fetal" position with chin tucked to chest and knees pulled tightly to abdomen.',
      'Expose lumbar spine and maintain patient alignment and psychological comfort.',
      'Assist clinician with sterile field preparation, skin disinfection, and local anesthesia infiltration (1% Lidocaine).',
      'Attach manometer to 3-way stopcock to measure opening CSF pressure (normal: 60-200 mmH2O).',
      'Collect 3-4 numbered sterile CSF tubes (1: Chemistry/Glucose, 2: Gram stain/Culture, 3: Cell count/Differential, 4: Special tests/GeneXpert).',
      'Apply sterile pressure adhesive dressing to puncture site after needle removal.',
      'Position patient strictly flat (supine without pillow) for 4-6 hours to prevent post-dural puncture headache.',
      'Send labeled CSF samples to laboratory immediately within 15 minutes.'
    ],
    equipmentNeeded: ['Lumbar puncture needle (20-22G Quincke/Whitacre)', 'CSF collection tubes 1-4', 'Manometer column with stopcock', '1% Lidocaine ampule', 'Sterile drapes & gauze'],
    examTips: 'UNZA Exam Pearl: Ensure patient lies strictly flat for 4-6 hours post-LP. Never delay CSF delivery to lab because cellular lysis occurs rapidly.'
  },

  // --- LEVY MWANAWASA MEDICAL UNIVERSITY (LMMU) ---
  {
    id: 'osce-lmmu-1',
    title: 'Emergency Magnesium Sulphate (MgSO4) Regimen for Severe Pre-Eclampsia — LMMU Clinical Skills',
    category: 'maternal',
    categoryLabel: 'Maternal & Midwifery',
    channelName: 'Levy Mwanawasa Medical University (LMMU)',
    creatorTag: 'lmmu',
    channelSubscribers: '38.6K students',
    institutionBadge: 'Levy Mwanawasa Med Univ (LMMU)',
    youtubeId: '9YfFh3lT_h0',
    duration: '16:40',
    views: '95.2K views',
    uploadDate: '3 weeks ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60',
    description: 'Standardized LMMU Obstetric Protocol: Zuspan / Pritchard Magnesium Sulphate loading dose (4g IV over 20 mins + 10g IM) and maintenance regimen. Vital safety checks: patellar reflexes, respiratory rate, and urine output.',
    keySteps: [
      'Confirm severe pre-eclampsia (BP ≥ 160/110 mmHg with proteinuria or imminent eclampsia symptoms).',
      'Prepare Loading Dose: 4g of 20% MgSO4 (20ml) infused IV slowly over 15-20 minutes.',
      'Prepare Pritchard IM Dose: 10g of 50% MgSO4 (5g in each buttock deep IM with 1ml 2% Lidocaine).',
      'Insert indwelling Foley catheter to monitor hourly urine output (must be ≥ 30 ml/hr).',
      'Perform mandatory clinical monitoring before EVERY maintenance dose: Deep tendon (patellar) reflexes present, Respiratory rate ≥ 16 bpm, Urine output ≥ 30 ml/hr.',
      'Administer Maintenance Dose: 5g of 50% MgSO4 IM alternate buttocks every 4 hours for 24 hours post-delivery.',
      'Have Calcium Gluconate 10% (1g in 10ml) immediately available at bedside as antidote for MgSO4 toxicity.'
    ],
    equipmentNeeded: ['50% MgSO4 ampules', '20% MgSO4 ampules', '10% Calcium Gluconate (Antidote)', 'Patellar reflex hammer', 'Foley catheter & urometer', 'Syringes & 21G needles'],
    examTips: 'LMMU Rule: STOP MgSO4 immediately if patellar reflexes are ABSENT, RR < 16/min, or urine < 30ml/hr. Administer 1g IV 10% Calcium Gluconate over 10 minutes.'
  },
  {
    id: 'osce-lmmu-2',
    title: 'Closed In-Line Endotracheal Tube Suctioning in Ventilated ICU Patient — LMMU ICU Lab',
    category: 'medsurg',
    categoryLabel: 'Critical Care & ICU',
    channelName: 'Levy Mwanawasa Medical University (LMMU)',
    creatorTag: 'lmmu',
    channelSubscribers: '38.6K students',
    institutionBadge: 'Levy Mwanawasa Med Univ (LMMU)',
    youtubeId: 'Kz1fF2z6v-c',
    duration: '13:50',
    views: '41.7K views',
    uploadDate: '1 month ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=60',
    description: 'LMMU Critical Care procedure on closed in-line tracheal suctioning, pre-oxygenation (100% FiO2 for 2 mins), vacuum pressure limits (-100 to -120 mmHg), catheter insertion depth, and post-suction lung auscultation.',
    keySteps: [
      'Assess clinical indications for suctioning (rhonchi on auscultation, visible secretions in ETT, ventilator high pressure alarm).',
      'Pre-oxygenate patient with 100% FiO2 on ventilator for at least 2 minutes.',
      'Verify wall suction pressure: set between -80 and -120 mmHg for adults.',
      'Advance closed suction catheter through ETT until resistance is met or patient coughs, then pull back 1-2 cm.',
      'Apply suction intermittently by depressing control valve while gently withdrawing catheter in continuous motion (max duration 10-15 seconds).',
      'Flush suction catheter sleeve with 5-10ml sterile saline.',
      'Return ventilator oxygen concentration to baseline setting.',
      'Re-auscultate bilateral lung fields to confirm secretion clearance and check SpO2.'
    ],
    equipmentNeeded: ['Closed in-line suction circuit', 'Suction regulator & canister', 'Sterile 0.9% Normal Saline flush ampule', 'Stethoscope', 'PPE (Mask, gloves)'],
    examTips: 'LMMU Safety Rule: Never suction for longer than 15 seconds! Prolonged suction induces severe vagal bradycardia and hypoxia.'
  },

  // --- UNIVERSITY TEACHING HOSPITALS (UTH - LUSAKA) ---
  {
    id: 'osce-uth-1',
    title: 'Underwater Seal Chest Tube Drainage Management & Emergency Clamping — UTH Lusaka',
    category: 'medsurg',
    categoryLabel: 'Surgical & Emergency Care',
    channelName: 'University Teaching Hospital Lusaka',
    creatorTag: 'uth',
    channelSubscribers: '61.2K students',
    institutionBadge: 'UTH Lusaka (National Referral)',
    youtubeId: 'XqZsoesa55w',
    duration: '18:15',
    views: '104.3K views',
    uploadDate: '2 weeks ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=60',
    description: 'Clinical masterclass from UTH Lusaka Thoracic Unit on managing underwater seal chest drainage systems, assessing tidaling / swing with respiration, checking for air leaks in the water seal chamber, and emergency disconnection protocol.',
    keySteps: [
      'Check chest drainage system is kept strictly BELOW chest level at all times.',
      'Verify 2 cm of sterile water in the water seal chamber.',
      'Assess "Tidaling" (fluctuation of water column with breathing: rises on inspiration in spontaneous breathing, falls on expiration).',
      'Check for continuous bubbling in water seal chamber (indicates active broncho-pleural air leak or loose tubing connection).',
      'Record hourly drainage output volume and color (alert surgeon if > 100-200 ml/hr fresh blood).',
      'Keep two padded Kelly hemostatic clamps and a bottle of sterile saline at bedside.',
      'If chest bottle breaks or disconnects: immediately submerge tube end in sterile water to re-establish seal, or clamp briefly.'
    ],
    equipmentNeeded: ['Underwater seal drainage unit', 'Sterile water bottle', '2 Padded Kelly clamps', 'Sterile gauze & occlusive petroleum dressing', 'Chest tube safety holder'],
    examTips: 'UTH Exam Alert: Never clamp a chest tube during patient transport unless the bottle is broken! Clamping can precipitate a fatal Tension Pneumothorax.'
  },
  {
    id: 'osce-uth-2',
    title: 'Adult Cardiopulmonary Resuscitation (BLS/ACLS) & Defibrillation — UTH Emergency Unit',
    category: 'medsurg',
    categoryLabel: 'Emergency & Resuscitation',
    channelName: 'University Teaching Hospital Lusaka',
    creatorTag: 'uth',
    channelSubscribers: '61.2K students',
    institutionBadge: 'UTH Lusaka (National Referral)',
    youtubeId: 'kJQP7kiw5Fk',
    duration: '15:20',
    views: '132.8K views',
    uploadDate: '3 weeks ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=60',
    description: 'UTH Lusaka Emergency resuscitation guidelines: high-quality CPR (rate 100-120 bpm, depth 5-6 cm, full chest recoil), manual/AED defibrillator pad placement, safe shock delivery, and IV Adrenaline 1mg every 3-5 mins.',
    keySteps: [
      'Assess scene safety, check responsiveness, call for emergency resuscitation team ("Code Blue") and bring crash cart.',
      'Check carotid pulse and breathing simultaneously for 5-10 seconds.',
      'Initiate high-quality chest compressions immediately at lower half of sternum: 30 compressions to 2 ventilations.',
      'Attach defibrillator / AED pads (Anterolateral: right subclavicular and left midaxillary).',
      'Analyze rhythm: Shockable (VF / Pulseless VT) vs Non-shockable (Asystole / PEA).',
      'For VF/pVT: Charge defibrillator to 200J biphasic, clear all personnel ("I am clear, you are clear, everybody is clear"), deliver shock.',
      'Resume CPR immediately for 2 full minutes without pause before rhythm re-check.',
      'Administer Adrenaline 1mg IV every 3-5 minutes and Amiodarone 300mg IV after 3rd shock.'
    ],
    equipmentNeeded: ['Manual Defibrillator / AED', 'Resuscitation backboard', 'Bag-Valve-Mask with oxygen reservoir', 'Airway adjuncts (Guedel)', 'Emergency drug tray (Adrenaline, Amiodarone)'],
    examTips: 'UTH Exam Pearl: Minimize compression interruptions to < 10 seconds. Resume CPR immediately after shock delivery before checking pulse!'
  },

  // --- APEX MEDICAL UNIVERSITY (LUSAKA) ---
  {
    id: 'osce-apex-1',
    title: 'Arterial Blood Gas (ABG) Radial Artery Sampling & Allen Test — Apex Medical University',
    category: 'pharmacology',
    categoryLabel: 'Critical Care & Diagnostics',
    channelName: 'Apex Medical University Skills Lab',
    creatorTag: 'apex',
    channelSubscribers: '29.1K students',
    institutionBadge: 'Apex Medical University',
    youtubeId: 'Oq5Qy8F5p-k',
    duration: '14:40',
    views: '48.9K views',
    uploadDate: '1 month ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60',
    description: 'Apex Medical University tutorial on performing the Modified Allen Test to verify collateral ulnar circulation, heparinized syringe prep, radial artery puncture at 45° angle, anaerobic expulsion of air bubbles, and ice bath transport.',
    keySteps: [
      'Perform Modified Allen Test: occlude both radial and ulnar arteries, have patient clench fist until blanched, release ulnar artery; palm must flush pink within 5-10 seconds.',
      'Position patient wrist dorsiflexed at 30° on a rolled towel.',
      'Palpate radial artery pulse at the radial styloid process.',
      'Clean skin with Chlorhexidine / alcohol swab and allow to dry.',
      'Insert pre-heparinized 23-25G needle at 45-degree angle with bevel facing upwards.',
      'Observe bright red arterial pulsatile flash into syringe hub (collect 1-2 mL).',
      'Withdraw needle and apply direct firm pressure over puncture site for at least 5 minutes (10 mins if on anticoagulants).',
      'Expel any air bubbles immediately, cap needle with safety seal, roll syringe between palms, and place in crushed ice slurry.'
    ],
    equipmentNeeded: ['Heparinized ABG syringe (with freeze-dried lithium heparin)', '23-25G needle', 'Alcohol swabs', 'Sterile gauze', 'Crushed ice container', 'Syringe cap'],
    examTips: 'Apex Clinical Rule: Never puncture the radial artery if the Modified Allen Test is NEGATIVE (hand remains pale > 10s). Use alternative site!'
  },

  // --- NDOLA TEACHING HOSPITAL (NTH) ---
  {
    id: 'osce-nth-1',
    title: 'Nasogastric (NG) Tube Insertion & Placement Confirmation — Ndola Teaching Hospital',
    category: 'basic',
    categoryLabel: 'Basic Clinical Nursing',
    channelName: 'Ndola Teaching Hospital Nursing School',
    creatorTag: 'nth',
    channelSubscribers: '33.4K students',
    institutionBadge: 'Ndola Teaching Hospital (NTH)',
    youtubeId: '7Pq-S557XQU',
    duration: '15:10',
    views: '54.2K views',
    uploadDate: '1 month ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=800&auto=format&fit=crop&q=60',
    description: 'NTH demonstration on measuring NEX distance (Nose to Earlobe to Xiphoid process), lubricating NG tube, patient swallowing coordination, pH litmus aspirate verification (pH ≤ 5.5), and secure nose taping.',
    keySteps: [
      'Measure tube insertion length: NEX method (Tip of Nose -> Earlobe -> Xiphoid process) and mark with tape/pen.',
      'Position patient upright in High-Fowler position (90°).',
      'Lubricate first 10-15 cm of tube with water-soluble lubricant.',
      'Insert tube through patent nostril aiming backwards along nasal floor.',
      'When tube reaches pharynx, ask patient to flex head forward and sip water through a straw or swallow continuously.',
      'Advance tube smoothly as patient swallows until measured mark reaches nostril.',
      'Verify stomach placement: Aspirate gastric contents and test on pH indicator strip (pH must be ≤ 5.5).',
      'Secure tube firmly to bridge of nose with hypoallergenic tape without nostril pressure necrosis.'
    ],
    equipmentNeeded: ['Ryle / Levin NG tube (14-16 Fr)', 'Water-soluble lubricant gel', '50mL Enfit / Catheter-tip syringe', 'pH indicator strips (0-6 scale)', 'Fixation tape', 'Glass of water'],
    examTips: 'NTH Rule: The whoosh test (air insufflation auscultation) is NO LONGER ACCEPTED as standalone confirmation. You must test aspirate pH (≤ 5.5) or obtain chest X-ray!'
  },

  // --- KITWE TEACHING HOSPITAL (KTH) ---
  {
    id: 'osce-kth-1',
    title: 'Manual Vacuum Aspiration (MVA) Assist & Post-Abortion Care — Kitwe Teaching Hospital',
    category: 'maternal',
    categoryLabel: 'Maternal & Midwifery',
    channelName: 'Kitwe Teaching Hospital Midwifery Lab',
    creatorTag: 'kth',
    channelSubscribers: '26.8K students',
    institutionBadge: 'Kitwe Teaching Hospital (KTH)',
    youtubeId: 'Kz1fF2z6v-c',
    duration: '19:45',
    views: '67.3K views',
    uploadDate: '3 weeks ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    description: 'Kitwe Teaching Hospital midwifery tutorial on preparing the Ipas MVA Plus double-valve syringe, creating vacuum (26 inches Hg), assisting with paracervical block, cannula selection, and inspection of evacuated tissue in water bath.',
    keySteps: [
      'Ensure informed consent and pre-medication analgesia (Paracetamol + Ibuprofen / Diazepam).',
      'Check MVA syringe: push plunger in, close dual valves, pull plunger back until tabs catch to lock vacuum.',
      'Drape patient in lithotomy position and perform bimanual pelvic exam to assess uterine size and version.',
      'Assist clinician with speculum insertion, tenaculum placement at 12 o’clock anterior cervical lip, and paracervical block.',
      'Select appropriate flexible Karman cannula size (in mm matching weeks of gestation).',
      'Connect cannula to charged MVA syringe and open dual valves to release vacuum into uterine cavity.',
      'Rotate cannula 360° with gentle in-and-out strokes until gritty texture is felt and red foam appears.',
      'Empty aspirated tissue into strainer, float in clear water in transparent dish to identify chorionic villi and gestational sac.'
    ],
    equipmentNeeded: ['Ipas MVA Plus Syringe', 'Karman Cannulas (4-12mm)', 'Graves / Cusco speculum', 'Tenaculum forceps', '1% Lidocaine for paracervical block', 'Tissue inspection strainer & dish'],
    examTips: 'KTH Tip: Always inspect evacuated tissue in water bath to confirm complete evacuation of pregnancy and rule out molar or ectopic pregnancy.'
  },

  // --- MR. KOKO NURSES CLASS (ZAMBIA) ---
  {
    id: 'osce-koko-1',
    title: 'Vaginal Examination (PV Exam) of Woman in Labor — Mr. Koko Nurses Class',
    category: 'maternal',
    categoryLabel: 'Maternal & Midwifery',
    channelName: 'Mr. Koko Nurses Class',
    creatorTag: 'mrkoko',
    channelSubscribers: '64.8K subscribers',
    institutionBadge: 'Mr. Koko Clinical Educator',
    youtubeId: '9YfFh3lT_h0',
    duration: '18:45',
    views: '84.3K views',
    uploadDate: '1 week ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=800&auto=format&fit=crop&q=60',
    description: 'Masterclass demonstration by Mr. Koko on performing digital vaginal examination during active labor. Covers vulvar hygiene, assessing cervical dilation (cm), effacement (%), station of presenting part, and membrane status.',
    keySteps: [
      'Obtain informed consent from laboring mother and ensure strict privacy with screens.',
      'Have mother empty bladder; position dorsal recumbent with knees flexed.',
      'Perform surgical hand hygiene and don sterile gloves.',
      'Inspect external genitalia for lesions, discharge, or bleeding.',
      'Separate labia using non-dominant thumb and forefinger.',
      'Insert index and middle fingers of dominant hand gently into vagina pointing downwards then upwards.',
      'Assess cervical dilation in centimeters (1 to 10 cm) and cervical effacement percentage.',
      'Identify fetal presenting part (vertex, breech) and station relative to ischial spines (-3 to +3).',
      'Assess membrane status (intact vs ruptured) and inspect liquor color (clear, meconium-stained, bloody).',
      'Withdraw fingers smoothly, assist mother, discard gloves into biohazard bin, and document findings immediately on Partograph.'
    ],
    equipmentNeeded: ['Sterile gloves', 'Antiseptic solution', 'Sterile cotton balls/gauze', 'Inco pad', 'Biohazard waste container', 'Partograph chart'],
    examTips: 'Mr. Koko Tip: Never perform PV exam if mother presents with bright red painless vaginal bleeding (suspected Placenta Previa). Always state "Contraindicated due to suspected placenta previa."'
  },

  // --- SILWAMBA NURSING TUTORIALS ---
  {
    id: 'osce-silwamba-1',
    title: 'Intramuscular & Subcutaneous Injection Landmarking — Silwamba Tutorials',
    category: 'pharmacology',
    categoryLabel: 'Pharmacology Nursing',
    channelName: 'Silwamba Nursing Tutorials',
    creatorTag: 'silwamba',
    channelSubscribers: '128K subscribers',
    institutionBadge: 'Senior Nurse Educator',
    youtubeId: 'kJQP7kiw5Fk',
    duration: '14:20',
    views: '112.5K views',
    uploadDate: '2 months ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60',
    description: 'Safe parenteral medication administration: 5 Rights verification, site landmarking (Ventrogluteal, Deltoid, Vastus Lateralis), Z-track technique, and sharps safety.',
    keySteps: [
      'Verify 5 Rights: Right Patient, Right Drug, Right Dose, Right Route, Right Time.',
      'Check medication vial expiration date and inspect for clarity/particulates.',
      'Draw medication using filter needle if breaking glass ampule.',
      'Select injection site: Ventrogluteal (preferred IM adult), Vastus Lateralis (pediatric), Deltoid (< 2ml).',
      'Landmark site accurately using anatomical bony prominences.',
      'Clean skin with alcohol swab using expanding circular motion; allow to dry completely.',
      'Administer IM injection at 90-degree angle using Z-track method to prevent tracking.',
      'Inject slowly (10 sec/ml), wait 10 seconds, then withdraw needle.',
      'Activate needle safety device immediately and discard directly into Sharps Container.',
      'Document drug name, dose, site, time, and patient response.'
    ],
    equipmentNeeded: ['Medication vial/ampule', 'Syringe (2-5ml)', '21-23G needle (IM)', 'Alcohol swabs', 'Sterile gauze', 'Sharps disposal box'],
    examTips: 'Never recap needles after injection! State "Disposing unsheathed needle immediately into puncture-resistant sharps container."'
  },

  // --- GLOBAL HEALTH / WHO SKILLS ---
  {
    id: 'osce-who-1',
    title: 'WHO Newborn Bag-Valve-Mask (BVM) Resuscitation in the Golden Minute — WHO Clinical Guidelines',
    category: 'pediatric',
    categoryLabel: 'Pediatric & Neonatal',
    channelName: 'Global Health & WHO Skills Hub',
    creatorTag: 'who',
    channelSubscribers: '410K healthcare workers',
    institutionBadge: 'WHO Global Health Standard',
    youtubeId: 'Oq5Qy8F5p-k',
    duration: '12:30',
    views: '240.6K views',
    uploadDate: '1 month ago',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop&q=60',
    description: 'WHO Global Standard for Helping Babies Breathe (HBB): the first Golden Minute of newborn life, suctioning indications, ventilation cadence (40-60 breaths/min), and heart rate evaluation.',
    keySteps: [
      'Keep warm: dry baby immediately on mother’s abdomen or pre-heated radiant warmer.',
      'Position neck slightly extended (sniffing position).',
      'Clear airway ONLY if baby not breathing and secretions obstruct mouth/nose (Mouth before Nose).',
      'Stimulate breathing by rubbing back once or twice.',
      'If not breathing within 60 seconds: initiate Positive Pressure Ventilation (PPV) with newborn bag and mask at 40-60 breaths per minute ("Breathe-Two-Three").',
      'Look for visible chest rise with every breath; adjust mask seal if chest does not rise.',
      'Check heart rate with stethoscope after 60 seconds of ventilation (if HR < 60 bpm, begin chest compressions).'
    ],
    equipmentNeeded: ['Self-inflating bag (230-250 mL)', 'Size 0 and 1 neonatal masks', 'Pre-warmed towels', 'Bulb syringe suction', 'Stethoscope'],
    examTips: 'WHO Rule: Ventilation cadence chant: "Squeeze - Release - Release" (40-60 breaths per minute). Chest rise is the best indicator of effective ventilation.'
  }
];

interface OsceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddResource?: () => void;
}

export const OsceModal: React.FC<OsceModalProps> = ({ isOpen, onClose }) => {
  const [videosList, setVideosList] = useState<OsceVideo[]>(COMPREHENSIVE_OSCE_VIDEOS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedInstitutionFilter, setSelectedInstitutionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeVideo, setActiveVideo] = useState<OsceVideo>(COMPREHENSIVE_OSCE_VIDEOS[0]);
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [driveSyncBanner, setDriveSyncBanner] = useState<string | null>(null);

  // Player preferences
  const [playerMode, setPlayerMode] = useState<'drive' | 'youtube'>('youtube');
  const [isSubscribed, setIsSubscribed] = useState<Record<string, boolean>>({});
  const [likedVideos, setLikedVideos] = useState<Record<string, 'liked' | 'disliked' | null>>({});
  const [savedVideos, setSavedVideos] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load cached or Drive videos on mount
  useEffect(() => {
    const cached = localStorage.getItem('datanurse_drive_oscetube_videos');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVideosList([...parsed, ...COMPREHENSIVE_OSCE_VIDEOS.filter((z) => !parsed.some((p: any) => p.id === z.id))]);
        }
      } catch (e) {}
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenInYouTube = () => {
    if (activeVideo.youtubeId) {
      const ytUrl = `https://www.youtube.com/watch?v=${activeVideo.youtubeId}`;
      window.open(ytUrl, '_blank', 'noopener,noreferrer');
      triggerToast('Opening video in YouTube...');
    } else if (activeVideo.directUrl) {
      window.open(activeVideo.directUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSyncFromDriveOscetube = async () => {
    setIsSyncingDrive(true);
    setDriveSyncBanner(null);
    try {
      const token = getAccessToken();
      if (!token) {
        await requestGoogleDriveAccess();
      }
      const driveVideos = await fetchOscetubeVideosFromDrive();
      if (driveVideos.length > 0) {
        setVideosList([...driveVideos, ...COMPREHENSIVE_OSCE_VIDEOS.filter((z) => !driveVideos.some((d) => d.id === z.id))]);
        setActiveVideo(driveVideos[0]);
        setDriveSyncBanner(`Synced ${driveVideos.length} videos from your Google Drive "OSCETUBE" folder!`);
      } else {
        setDriveSyncBanner('No videos found in "OSCETUBE" folder yet. Upload MP4 files to your Drive OSCETUBE folder.');
      }
    } catch (err: any) {
      setDriveSyncBanner(`Drive Sync Note: ${err.message || 'Connect Drive in Settings'}`);
    } finally {
      setIsSyncingDrive(false);
      setTimeout(() => setDriveSyncBanner(null), 5000);
    }
  };

  if (!isOpen) return null;

  // Filter list by category, institution, and search
  const filteredVideos = videosList.filter((video) => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesInstitution =
      selectedInstitutionFilter === 'all' ||
      video.creatorTag === selectedInstitutionFilter ||
      video.institutionBadge.toLowerCase().includes(selectedInstitutionFilter.toLowerCase()) ||
      video.channelName.toLowerCase().includes(selectedInstitutionFilter.toLowerCase());

    const matchesQuery =
      !searchQuery ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.channelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.institutionBadge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.keySteps.some((step) => step.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesInstitution && matchesQuery;
  });

  const institutions = [
    { id: 'all', label: 'All Institutions' },
    { id: 'unza', label: '🏛️ UNZA (Ridgeway)' },
    { id: 'lmmu', label: '🏥 LMMU' },
    { id: 'uth', label: '🩺 UTH Lusaka' },
    { id: 'apex', label: '🎓 Apex Medical Univ' },
    { id: 'nth', label: '🏥 Ndola Teaching' },
    { id: 'kth', label: '🏥 Kitwe Teaching' },
    { id: 'mrkoko', label: '👨‍🏫 Mr. Koko' },
    { id: 'silwamba', label: '👨‍🏫 Silwamba' },
    { id: 'who', label: '🌐 WHO / Global Health' }
  ];

  const categories = [
    { id: 'all', label: 'All Specialties' },
    { id: 'medsurg', label: 'Adult Health & Med-Surg' },
    { id: 'maternal', label: 'Maternal & Midwifery' },
    { id: 'pediatric', label: 'Pediatrics & Neonatal' },
    { id: 'pharmacology', label: 'Pharmacology & Injections' },
    { id: 'basic', label: 'Foundations & Nursing Care' }
  ];

  const toggleSubscribe = (channelName: string) => {
    setIsSubscribed((prev) => {
      const next = !prev[channelName];
      triggerToast(next ? `Subscribed to ${channelName}` : `Unsubscribed from ${channelName}`);
      return { ...prev, [channelName]: next };
    });
  };

  const toggleLike = (videoId: string) => {
    setLikedVideos((prev) => {
      const current = prev[videoId];
      const next = current === 'liked' ? null : 'liked';
      if (next === 'liked') triggerToast('Added to Liked OSCE Videos');
      return { ...prev, [videoId]: next };
    });
  };

  const toggleDislike = (videoId: string) => {
    setLikedVideos((prev) => {
      const current = prev[videoId];
      const next = current === 'disliked' ? null : 'disliked';
      return { ...prev, [videoId]: next };
    });
  };

  const toggleSave = (videoId: string) => {
    setSavedVideos((prev) => {
      const next = !prev[videoId];
      triggerToast(next ? 'Saved to OSCE Playlist' : 'Removed from Playlist');
      return { ...prev, [videoId]: next };
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin} - ${activeVideo.title}`);
      triggerToast('Procedure link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/90 backdrop-blur-md flex items-center justify-center animate-fadeIn p-0 sm:p-2 md:p-4">
      <div
        id="oscetube-master-modal"
        className="bg-[#0f0f0f] text-zinc-100 rounded-none sm:rounded-2xl max-w-7xl w-full h-full sm:h-[95vh] flex flex-col shadow-2xl border border-zinc-800 overflow-hidden relative"
      >
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-zinc-800/95 border border-teal-500/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fadeIn backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Header Bar with OSCETUBE Branding & Drive Sync */}
        <div className="h-14 px-3 sm:px-5 bg-[#0f0f0f] border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0 z-10">
          {/* Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div
              className="flex items-center space-x-1.5 cursor-pointer select-none"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedInstitutionFilter('all');
                setSearchQuery('');
              }}
            >
              <div className="h-7 w-9 bg-red-600 rounded-lg flex items-center justify-center shadow-md">
                <Play className="h-4 w-4 fill-white text-white ml-0.5" />
              </div>
              <div className="flex items-baseline space-x-0.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">OSCE</span>
                <span className="font-black text-base sm:text-lg tracking-tight text-red-500">TUBE</span>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center space-x-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
              <Building2 className="h-3 w-3 text-teal-400" />
              <span>Multi-Institution Hub</span>
            </span>
          </div>

          {/* Search Input Bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search procedures, institutions, or skills..."
                className="w-full pl-9 pr-8 py-1.5 bg-[#121212] border border-zinc-700 rounded-full text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-teal-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Sync Drive Videos Button */}
            <button
              onClick={handleSyncFromDriveOscetube}
              disabled={isSyncingDrive}
              className="px-3 py-1.5 rounded-full bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-800 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
              title="Sync video files from your Drive OSCETUBE folder"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin text-teal-400' : ''}`} />
              <span className="hidden md:inline">{isSyncingDrive ? 'Syncing...' : 'Sync Drive'}</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Close OSCE Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Institution Filter Bar */}
        <div className="px-3 sm:px-5 py-2 bg-[#141414] border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {institutions.map((inst) => (
            <button
              key={inst.id}
              onClick={() => setSelectedInstitutionFilter(inst.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedInstitutionFilter === inst.id
                  ? 'bg-red-600 text-white shadow-md font-bold'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {inst.label}
            </button>
          ))}
        </div>

        {/* Specialty Filter Chips */}
        <div className="px-3 sm:px-5 py-1.5 bg-[#0f0f0f] border-b border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Drive Sync Banner */}
        {driveSyncBanner && (
          <div className="bg-teal-950/90 border-b border-teal-800/80 px-4 py-2 text-xs font-semibold text-teal-200 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-teal-400" />
              <span>{driveSyncBanner}</span>
            </div>
            <button onClick={() => setDriveSyncBanner(null)} className="text-teal-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 2. Main Content Layout */}
        <div className="flex-1 overflow-y-auto bg-[#0f0f0f] p-2 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Video Player Stage & Procedure Reference Guide (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Video Player Stage (Drive Downlink Player vs YouTube Embed with "Open in YouTube" Button) */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl group">
                {playerMode === 'drive' || !activeVideo.youtubeId ? (
                  <DriveVideoPlayer
                    video={activeVideo}
                    onSwitchToYouTube={activeVideo.youtubeId ? () => setPlayerMode('youtube') : undefined}
                  />
                ) : (
                  <div className="w-full h-full relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />

                    {/* Top Prominent Action Bar: "Open in YouTube" Button */}
                    <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                      <button
                        onClick={handleOpenInYouTube}
                        className="px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold border border-red-400/40 shadow-xl flex items-center space-x-1.5 cursor-pointer backdrop-blur-md transition transform hover:scale-105"
                        title="Click to redirect and watch directly on YouTube"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Open in YouTube</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setPlayerMode('drive')}
                        className="px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white text-xs font-bold border border-teal-500/60 shadow-xl flex items-center space-x-1.5 cursor-pointer backdrop-blur-md"
                        title="Switch to Drive Downlink Player"
                      >
                        <HardDrive className="w-3.5 h-3.5 text-teal-400" />
                        <span className="hidden sm:inline">Drive Player</span>
                      </button>
                    </div>

                    {/* Bottom Floating Quick Redirect Overlay */}
                    <div
                      onClick={handleOpenInYouTube}
                      className="absolute bottom-2 left-3 z-20 px-3 py-1 rounded-lg bg-black/80 hover:bg-red-950/90 text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer backdrop-blur-md border border-zinc-700/80 transition"
                    >
                      <ExternalLink className="h-3 w-3 text-red-400" />
                      <span>Click here to open on YouTube app/browser</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Title & YouTube-style Action Bar */}
              <div className="space-y-3 bg-[#181818] p-4 sm:p-5 rounded-2xl border border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                      {activeVideo.categoryLabel}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span>{activeVideo.institutionBadge}</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Duration: {activeVideo.duration}
                    </span>
                  </div>
                  <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-white leading-snug">
                    {activeVideo.title}
                  </h1>
                </div>

                {/* Creator Header & YouTube Action Buttons */}
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
                  {/* Channel Info */}
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-sm">{activeVideo.channelName}</span>
                        <ShieldCheck className="h-4 w-4 text-teal-400 fill-teal-400/20" />
                      </div>
                      <div className="text-xs text-zinc-400">
                        {activeVideo.channelSubscribers || 'Verified Clinical Educator'}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSubscribe(activeVideo.channelName)}
                      className={`ml-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                        isSubscribed[activeVideo.channelName]
                          ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          : 'bg-white text-black hover:bg-zinc-200 shadow-md'
                      }`}
                    >
                      {isSubscribed[activeVideo.channelName] ? (
                        <>
                          <Bell className="w-3.5 h-3.5 fill-current text-zinc-400" />
                          <span>Subscribed</span>
                        </>
                      ) : (
                        <span>Subscribe</span>
                      )}
                    </button>
                  </div>

                  {/* YouTube Action Buttons (Open in YouTube, Like, Share, Save) */}
                  <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                    {/* Dedicated Open in YouTube Button */}
                    <button
                      onClick={handleOpenInYouTube}
                      className="px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-md flex items-center space-x-1.5 transition cursor-pointer"
                      title="Open and play this video on YouTube"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Open in YouTube</span>
                    </button>

                    {/* Like / Dislike Split Button */}
                    <div className="flex items-center bg-zinc-800/80 rounded-full border border-zinc-700 overflow-hidden">
                      <button
                        onClick={() => toggleLike(activeVideo.id)}
                        className={`px-3 py-1.5 flex items-center space-x-1.5 text-xs font-bold hover:bg-zinc-700 transition-colors cursor-pointer ${
                          likedVideos[activeVideo.id] === 'liked' ? 'text-red-500' : 'text-zinc-200'
                        }`}
                        title="I like this video"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${likedVideos[activeVideo.id] === 'liked' ? 'fill-current' : ''}`} />
                        <span>{likedVideos[activeVideo.id] === 'liked' ? 'Liked' : 'Like'}</span>
                      </button>
                      <div className="w-[1px] h-4 bg-zinc-700" />
                      <button
                        onClick={() => toggleDislike(activeVideo.id)}
                        className={`px-2.5 py-1.5 hover:bg-zinc-700 transition-colors cursor-pointer ${
                          likedVideos[activeVideo.id] === 'disliked' ? 'text-red-500' : 'text-zinc-400'
                        }`}
                        title="Dislike"
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 ${likedVideos[activeVideo.id] === 'disliked' ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={handleShare}
                      className="px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Share</span>
                    </button>

                    {/* Save to Playlist */}
                    <button
                      onClick={() => toggleSave(activeVideo.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer flex items-center space-x-1.5 ${
                        savedVideos[activeVideo.id]
                          ? 'bg-teal-950 text-teal-300 border-teal-700'
                          : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${savedVideos[activeVideo.id] ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline">{savedVideos[activeVideo.id] ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible YouTube Description Box */}
                <div className="p-3.5 rounded-xl bg-[#212121] border border-zinc-800 text-xs text-zinc-300 leading-relaxed space-y-2">
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>{activeVideo.views || '45.2K views'}</span>
                    <span>•</span>
                    <span>{activeVideo.uploadDate || 'Recent'}</span>
                    <span>•</span>
                    <span className="text-teal-400">{activeVideo.institutionBadge}</span>
                  </div>

                  <p className="text-zinc-300">{activeVideo.description}</p>

                  {activeVideo.examTips && (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs font-medium flex items-start gap-2 mt-2">
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{activeVideo.examTips}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Clean Clinical Procedure Reference Guide (Trolley Setup & Key Sequential Steps) */}
              <div className="bg-[#181818] p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Clinical Procedure Guide & Key Steps
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                    {activeVideo.keySteps.length} Key Steps
                  </span>
                </div>

                {/* Trolley Setup & Required Equipment */}
                {activeVideo.equipmentNeeded && activeVideo.equipmentNeeded.length > 0 && (
                  <div className="space-y-2 bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-teal-400" />
                      <span>Trolley Setup & Required Equipment:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeVideo.equipmentNeeded.map((eq, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-700/60"
                        >
                          • {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step List */}
                <div className="space-y-2 pt-1">
                  {activeVideo.keySteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-start space-x-3"
                    >
                      <div className="h-5 w-5 rounded-full bg-teal-600/30 text-teal-400 border border-teal-500/40 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Video Recommendations List & Up Next (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-extrabold text-white text-sm">
                  Clinical Videos ({filteredVideos.length})
                </span>
                <span className="text-xs text-zinc-400">
                  {selectedInstitutionFilter === 'all' ? 'All Institutions' : selectedInstitutionFilter.toUpperCase()}
                </span>
              </div>

              {/* Video List */}
              <div className="space-y-2.5 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
                {filteredVideos.map((video) => {
                  const isCurrent = activeVideo.id === video.id;
                  return (
                    <div
                      key={video.id}
                      onClick={() => {
                        setActiveVideo(video);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`p-2.5 rounded-xl border flex gap-3 cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-zinc-800/90 border-teal-500 shadow-md ring-1 ring-teal-500/50'
                          : 'bg-[#181818] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
                      }`}
                    >
                      {/* Video Thumbnail */}
                      <div className="relative w-28 h-18 rounded-lg overflow-hidden shrink-0 bg-black">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-white font-mono text-[9px] font-bold">
                          {video.duration}
                        </span>
                      </div>

                      {/* Video Meta */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                          {video.title}
                        </h4>
                        <div className="text-[11px] text-zinc-400 truncate">
                          {video.channelName}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-teal-400 border border-zinc-700">
                            {video.institutionBadge}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

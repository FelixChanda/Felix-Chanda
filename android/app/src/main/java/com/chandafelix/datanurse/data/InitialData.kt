package com.chandafelix.datanurse.data

import com.chandafelix.datanurse.model.*

object InitialData {
    val RESOURCES = listOf(
        ResourceItem(
            id = "mod-101",
            title = "Fundamentals of Nursing & Health Assessment",
            category = "modules",
            domain = "Fundamentals & Assessment",
            yearLevel = "Year 1 (Foundations)",
            moduleCode = "NUR-101",
            credits = 6,
            semester = "Year 1, Semester 1",
            clinicalPlacementHours = 90,
            authorOrInstitution = "Department of Nursing Education & Clinical Skills",
            updatedAt = "2024-08-15",
            description = "Core foundational principles of professional nursing practice, patient safety, infection control, comprehensive head-to-toe health assessment, and documentation standards.",
            tags = listOf("Foundations", "Vital Signs", "Health Assessment", "Infection Control", "Nursing Process"),
            isFeatured = true,
            learningOutcomes = listOf(
                "Master the five phases of the nursing process (ADPIE: Assessment, Diagnosis, Planning, Implementation, Evaluation).",
                "Accurately perform and document a full head-to-toe physiological health assessment.",
                "Demonstrate strict aseptic technique, hand hygiene protocols, and standard vs. transmission-based precautions.",
                "Measure, interpret, and escalate deviations in vital signs (BP, HR, RR, SpO2, Temp, Pain scale)."
            ),
            syllabus = listOf(
                ModuleSyllabusUnit(
                    unitNumber = 1,
                    title = "Professional Identity & The Nursing Process (ADPIE)",
                    durationWeeks = 3,
                    topics = listOf("History of Nursing", "Scope of Practice", "ADPIE Framework", "Clinical Documentation (SOAP / DAR)", "Therapeutic Communication"),
                    keyCompetencies = listOf("Formulate NANDA-I nursing diagnoses", "Distinguish subjective from objective data")
                ),
                ModuleSyllabusUnit(
                    unitNumber = 2,
                    title = "Infection Control, Asepsis & Patient Safety",
                    durationWeeks = 3,
                    topics = listOf("Chain of Infection", "Hand Hygiene Protocols", "Sterile Gloving & Field", "Fall Risk Prevention (Morse Scale)", "Pressure Injury Staging (Braden Scale)"),
                    keyCompetencies = listOf("Don and doff full PPE without contamination", "Perform Braden Pressure Injury Risk assessment")
                ),
                ModuleSyllabusUnit(
                    unitNumber = 3,
                    title = "Comprehensive Physical Assessment (Head-to-Toe)",
                    durationWeeks = 5,
                    topics = listOf("Inspection, Palpation, Percussion, Auscultation", "Neurological & Cranial Nerves", "Cardiovascular & Respiratory Assessment", "Abdominal & Genitourinary Examination"),
                    keyCompetencies = listOf("Auscultate normal vs adventitious lung sounds", "Perform peripheral vascular and pulse grading")
                ),
                ModuleSyllabusUnit(
                    unitNumber = 4,
                    title = "Basic Clinical Interventions & Medication Routes",
                    durationWeeks = 4,
                    topics = listOf("Enteral vs Parenteral Administration", "Subcutaneous & Intramuscular Injections (Z-track)", "Wound Care & Dressing Changes", "Urinary Catheterization Principles"),
                    keyCompetencies = listOf("Locate ventrogluteal injection landmark", "Aseptic urinary catheter insertion protocol")
                )
            )
        ),
        ResourceItem(
            id = "mod-204",
            title = "Pharmacology in Clinical Nursing Practice",
            category = "modules",
            domain = "Pharmacology",
            yearLevel = "Year 2 (Adult Health & Patho)",
            moduleCode = "NUR-204",
            credits = 5,
            semester = "Year 2, Semester 1",
            clinicalPlacementHours = 45,
            authorOrInstitution = "Clinical Pharmacology & Therapeutics Faculty",
            updatedAt = "2024-09-02",
            description = "Comprehensive study of pharmacodynamics, pharmacokinetics, high-alert medications, controlled substances, dosage calculations, and safe medication administration rights.",
            tags = listOf("Pharmacology", "Dosage Calculations", "High-Alert Drugs", "Antidotes", "Safety"),
            isFeatured = true,
            learningOutcomes = listOf(
                "Apply the 10 Rights of Medication Administration and prevent medication reconciliation errors.",
                "Execute error-free pediatric, adult, and weight-based dosage and intravenous drip calculations.",
                "Identify indications, adverse effects, contraindications, and nursing considerations for major drug classes.",
                "Recognize toxicities and immediately administer corresponding antidotes."
            ),
            syllabus = listOf(
                ModuleSyllabusUnit(
                    unitNumber = 1,
                    title = "Principles of Pharmacokinetics & Pharmacodynamics",
                    durationWeeks = 3,
                    topics = listOf("Absorption, Distribution, Metabolism (CYP450), Elimination", "Therapeutic Index & Peak/Trough Levels", "First-Pass Effect", "Teratogenic Categories"),
                    keyCompetencies = listOf("Calculate half-life and steady state", "Monitor vancomycin trough timing")
                ),
                ModuleSyllabusUnit(
                    unitNumber = 2,
                    title = "Autonomic & Cardiovascular Pharmacotherapy",
                    durationWeeks = 4,
                    topics = listOf("Antihypertensives (ACEi, ARBs, Beta Blockers, CCBs)", "Diuretics (Loop, Thiazide, K-Sparing)", "Cardiac Glycosides (Digoxin)", "Anticoagulants & Reversal Agents (Heparin, Warfarin, DOACs)"),
                    keyCompetencies = listOf("Assess apical pulse before Digoxin administration", "Monitor aPTT / PT / INR targets")
                )
            )
        ),
        ResourceItem(
            id = "paper-2023-licensure",
            title = "National Nursing Licensure Exam Prep 2023",
            category = "past_papers",
            domain = "Adult Health & Med-Surg",
            yearLevel = "Year 4 (Leadership & Intensive)",
            paperCode = "NLE-2023-A",
            examYear = 2023,
            examPeriod = "National Licensure Prep",
            totalMarks = 100,
            durationMinutes = 180,
            authorOrInstitution = "National Board of Nursing Examiners & Licensure Council",
            updatedAt = "2023-11-20",
            description = "Full comprehensive national licensure exam past paper featuring NCLEX/NMCZ-style multiple choice questions, priority triage scenarios, drug calculation items, and care plan formulations.",
            tags = listOf("Licensure Exam", "NCLEX-Style", "Past Paper", "Comprehensive", "Priority Nursing"),
            isFeatured = true,
            questions = listOf(
                PastPaperQuestion(
                    id = "q1",
                    number = 1,
                    type = "scenario_case",
                    questionText = "A 58-year-old male 2 hours post-op cardiac catheterization via femoral approach suddenly reports severe groin pain and lightheadedness. Blood pressure drops from 128/78 to 86/52 mmHg, HR increases to 118 bpm. Which nursing action takes IMMEDIATE priority?",
                    options = listOf(
                        "Increase the IV rate of normal saline and re-check vital signs in 15 minutes.",
                        "Perform a focused assessment of the femoral puncture site for expanding hematoma and palpate distal pedal pulses.",
                        "Administer IV push morphine for groin pain as prescribed.",
                        "Place the patient in High-Fowler position to facilitate breathing."
                    ),
                    correctOptionIndex = 1,
                    marks = 5,
                    markingScheme = "Full marks for selecting option B (focused puncture site assessment). 0 marks for options A, C, D.",
                    clinicalRationale = "Hypotension, tachycardia, and severe groin pain post-femoral catheterization strongly suggest retroperitoneal hemorrhage or acute arterial hematoma. Immediate inspection for hematoma and distal pulse check determines life-threatening vascular compromised status before escalating to provider.",
                    highYieldTip = "In post-cath patients, sudden hypotension + groin/back pain = Retroperitoneal Bleed until proven otherwise!"
                ),
                PastPaperQuestion(
                    id = "q2",
                    number = 2,
                    type = "multiple_choice",
                    questionText = "A client receiving continuous IV Heparin infusion for Deep Vein Thrombosis (DVT) exhibits a PTT of 115 seconds (Control: 30 seconds). What is the primary nursing intervention?",
                    options = listOf(
                        "Continue infusion at current rate as PTT is therapeutic.",
                        "Stop the Heparin infusion immediately, notify the physician, and prepare Protamine Sulfate.",
                        "Increase the Heparin rate by 100 units/hr.",
                        "Administer Vitamin K1 (Phytonadione) IV push."
                    ),
                    correctOptionIndex = 1,
                    marks = 5,
                    markingScheme = "Option B is correct. Heparin antidote is Protamine Sulfate. Vitamin K is for Warfarin.",
                    clinicalRationale = "Therapeutic PTT for Heparin is 1.5 to 2.5 times control (approx 45-75s). A PTT of 115s indicates critical over-anticoagulation with severe risk of spontaneous internal hemorrhage.",
                    highYieldTip = "Heparin Antidote = Protamine Sulfate. Warfarin Antidote = Vitamin K."
                )
            )
        ),
        ResourceItem(
            id = "txt-medsurg-brunner",
            title = "Brunner & Suddarth's Textbook of Medical-Surgical Nursing",
            category = "textbooks",
            domain = "Adult Health & Med-Surg",
            yearLevel = "Year 2 (Adult Health & Patho)",
            authors = "Janice L. Hinkle, Kerry H. Cheever",
            edition = "15th Edition",
            publisher = "Wolters Kluwer",
            publicationYear = 2022,
            isbn = "978-1975161033",
            coverAccent = "#0d9488",
            authorOrInstitution = "Lippincott Williams & Wilkins",
            updatedAt = "2024-01-10",
            description = "The gold-standard medical-surgical nursing reference textbook covering pathophysiology, clinical manifestations, medical management, nursing diagnoses, and evidence-based interventions.",
            tags = listOf("Med-Surg", "Textbook", "Gold Standard", "Pathophysiology", "Care Plans"),
            isFeatured = true,
            tableOfContents = listOf(
                TextbookChapter(
                    chapterNumber = 13,
                    title = "Management of Patients With Fluid and Electrolyte Disorders",
                    pageRange = "pp. 245 - 290",
                    keyPearls = listOf(
                        "Hyponatremia (<135 mEq/L) presents with confusion, seizures, and cerebral edema.",
                        "Hyperkalemia (>5.0 mEq/L) causes peaked T-waves, QRS widening, and cardiac arrest risk (treat with IV Calcium Gluconate + Insulin/Dextrose)."
                    ),
                    summary = "Detailed breakdown of osmolarity, fluid volume deficit vs excess, electrolyte imbalances, IV fluid selection (isotonic vs hypotonic vs hypertonic), and ABG interpretation."
                ),
                TextbookChapter(
                    chapterNumber = 27,
                    title = "Management of Patients With Coronary Vascular Disorders",
                    pageRange = "pp. 710 - 765",
                    keyPearls = listOf(
                        "MONA protocol for Acute Coronary Syndrome (ACS): Morphine, Oxygen, Nitroglycerin, Aspirin.",
                        "Troponin I & T are the most cardiac-specific biomarkers for Myocardial Infarction."
                    ),
                    summary = "Comprehensive pathophysiology of Atherosclerosis, Angina Pectoris, STEMI vs NSTEMI, percutaneous coronary interventions, and post-MI rehabilitation nursing care."
                )
            )
        ),
        ResourceItem(
            id = "note-drug-cards-cardio",
            title = "High-Yield Cardiovascular Pharmacology Drug Cards",
            category = "notes",
            domain = "Pharmacology",
            yearLevel = "Year 2 (Adult Health & Patho)",
            noteType = "Drug Card",
            readTimeMinutes = 15,
            authorOrInstitution = "Advanced Clinical Pharmacology Resource Team",
            updatedAt = "2024-07-22",
            description = "Concise high-yield nursing drug cards detailing mechanism of action, black box warnings, vital sign parameters, and patient education points for top cardiovascular agents.",
            tags = listOf("Pharmacology", "Drug Cards", "Cheat Sheet", "Cardiology", "NCLEX High Yield"),
            isFeatured = true,
            highYieldKeyPoints = listOf(
                "Digoxin: Hold if HR < 60 bpm. Therapeutic range: 0.5 - 2.0 ng/mL. Toxicity signs: yellow halos, N/V, bradycardia.",
                "Furosemide (Lasix): Loop diuretic. Monitor K+ levels (<3.5 mEq/L causes digoxin toxicity). Ototoxicity if pushed too fast IV.",
                "Spironolactone: Potassium-sparing diuretic. Avoid high potassium intake / salt substitutes.",
                "Metoprolol / Atenolol: Beta-1 blocker. Mask symptoms of hypoglycemia (except sweating). Hold if SBP < 100 or HR < 60."
            )
        ),
        ResourceItem(
            id = "doc-guideline-sepsis",
            title = "Surviving Sepsis Campaign International Clinical Guidelines",
            category = "documents",
            domain = "Critical Care & Emergency",
            yearLevel = "Year 4 (Leadership & Intensive)",
            documentGuidelineType = "Emergency Protocol",
            documentFormat = "PDF",
            pageCount = 38,
            authorOrInstitution = "Society of Critical Care Medicine (SCCM) & ESICM",
            updatedAt = "2024-03-01",
            description = "Official international evidence-based clinical practice guidelines for sepsis and septic shock management in emergency and intensive care units.",
            tags = listOf("Sepsis", "Clinical Guideline", "ICU", "1-Hour Bundle", "Protocols"),
            isFeatured = true,
            documentContentText = "1-HOUR SEPSIS BUNDLE PROTOCOL:\n1. Measure lactate level. Re-measure if initial lactate > 2 mmol/L.\n2. Obtain blood cultures prior to administration of antibiotics.\n3. Administer broad-spectrum antibiotics.\n4. Begin rapid administration of 30 mL/kg crystalloid for hypotension or lactate >= 4 mmol/L.\n5. Apply vasopressors (Norepinephrine target MAP >= 65 mmHg) during or after fluid resuscitation."
        )
    )

    val OPTIMUM_CONDITIONS = listOf(
        OptimumCondition(
            id = "opt-bp-sys",
            parameter = "Systolic Blood Pressure (SBP)",
            category = "Hemodynamics",
            optimumRange = "90 - 119 mmHg",
            numericTarget = 110.0,
            unit = "mmHg",
            clinicalSignificance = "Normal arterial pressure ensures vital end-organ microvascular perfusion without endothelial shear stress.",
            nursingInterventionIfAbnormal = "<90 mmHg: place supine, administer IV bolus, assess for shock. >140 mmHg: rest, verify cuff size, evaluate for end-organ signs.",
            standardAuthority = "AHA / ACC Guidelines 2024",
            lastOnlineSync = "2024-09-01"
        ),
        OptimumCondition(
            id = "opt-map",
            parameter = "Mean Arterial Pressure (MAP)",
            category = "Perfusion",
            optimumRange = "70 - 100 mmHg",
            numericTarget = 75.0,
            unit = "mmHg",
            clinicalSignificance = "Calculated as (2xDBP + SBP)/3. Minimum 65 mmHg is strictly required to sustain cerebral and renal capillary perfusion.",
            nursingInterventionIfAbnormal = "MAP < 65 mmHg demands immediate fluid resuscitation or vasopressor titration (norepinephrine) in ICU.",
            standardAuthority = "Surviving Sepsis Campaign",
            lastOnlineSync = "2024-09-01"
        ),
        OptimumCondition(
            id = "opt-spo2",
            parameter = "Oxygen Saturation (SpO2)",
            category = "Vitals",
            optimumRange = "95% - 100% (88-92% for COPD)",
            numericTarget = 98.0,
            unit = "%",
            clinicalSignificance = "Fraction of oxygen-saturated hemoglobin relative to total hemoglobin in arterial circulation.",
            nursingInterventionIfAbnormal = "SpO2 < 94%: elevate head of bed to Fowler position, verify probe waveform, initiate titrated supplemental oxygen.",
            standardAuthority = "British Thoracic Society / WHO",
            lastOnlineSync = "2024-09-01"
        ),
        OptimumCondition(
            id = "opt-hr",
            parameter = "Resting Heart Rate (Pulse)",
            category = "Vitals",
            optimumRange = "60 - 100 beats/min",
            numericTarget = 72.0,
            unit = "bpm",
            clinicalSignificance = "Eucardic sinoatrial node pacing ensuring adequate cardiac output.",
            nursingInterventionIfAbnormal = "<60: verify symptoms (dizziness, diaphoresis), hold beta-blockers/digoxin. >100: evaluate fever, pain, anxiety, dehydration, sepsis.",
            standardAuthority = "American College of Cardiology",
            lastOnlineSync = "2024-09-01"
        )
    )

    val OSCE_VIDEOS = listOf(
        OsceVideo(
            id = "osce-01",
            title = "Aseptic Technique & Wound Dressing Change",
            category = "basic",
            categoryLabel = "Basic Clinical Skills",
            channelName = "GNCZ & NMCZ Clinical Exam Vault",
            creatorTag = "GNCZ Licensure Standards",
            institutionBadge = "Verified OSCE Standard",
            duration = "12 mins",
            thumbnailUrl = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80",
            description = "Step-by-step clinical OSCE demonstration of sterile field preparation, wound swab collection, and non-touch dressing technique.",
            keySteps = listOf(
                "Perform 6-stage WHO hand hygiene",
                "Assemble sterile trolley using aseptic non-touch technique (ANTT)",
                "Don sterile gloves without touching outer surface",
                "Clean wound from cleanest area outward (center to periphery)",
                "Apply occlusive sterile dressing and dispose of waste in biohazard bag"
            ),
            equipmentNeeded = listOf("Dressing pack", "Sterile saline 0.9%", "Sterile gloves", "Wound swab kit", "Yellow waste bag"),
            examTips = "Maintain hand placement above waist level at all times once sterile gloves are donned!"
        ),
        OsceVideo(
            id = "osce-02",
            title = "Intravenous (IV) Cannulation & Drip Setup",
            category = "medsurg",
            categoryLabel = "Med-Surg Clinical Skills",
            channelName = "Nursing Skills Lab",
            creatorTag = "Clinical Skills Unit",
            institutionBadge = "GNCZ/NMCZ Exam Focus",
            duration = "15 mins",
            thumbnailUrl = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&q=80",
            description = "Full procedure for peripheral IV vein selection, 20G/18G cannula insertion, blood flashback verification, flushing, and IV infusion set priming.",
            keySteps = listOf(
                "Apply tourniquet 10-15cm above site",
                "Palpate vein and sanitize with 70% alcohol swab for 30s",
                "Insert cannula at 15-30 degree angle bevel up",
                "Observe primary and secondary blood flashback",
                "Advance catheter while retracting needle, release tourniquet, and flush with 5mL 0.9% saline"
            ),
            equipmentNeeded = listOf("20G Cannula", "Tourniquet", "Chlorhexidine/Alcohol swab", "Tegaderm dressing", "Saline flush syringe"),
            examTips = "Always verbalize patient consent, check allergies, and confirm vein rebound elasticity before puncturing."
        )
    )

    val NURSING_TOPICS = listOf(
        NursingTopic(
            id = "top-01",
            title = "Malaria Protocol & WHO Integrated Management",
            region = "Zambia",
            institutionOrGuideline = "National Malaria Elimination Centre & WHO",
            category = "National Health Priority",
            level = "Clinical Licensure (GNCZ/NMCZ)",
            summary = "National guidelines for severe vs uncomplicated Plasmodium falciparum malaria diagnosis, RDT rapid testing, IV Artesunate dosing, and Artemether-Lumefantrine (AL) administration.",
            keyPearls = listOf(
                "IV Artesunate 2.4 mg/kg at 0h, 12h, 24h, then daily is preferred over Quinine for severe malaria.",
                "Always check blood glucose (hypoglycemia is common in severe malaria and Quinine infusion)."
            ),
            priorityInterventions = listOf(
                "Obtain thick/thin blood smears or mRDT prior to first antimalarial dose.",
                "Monitor for hemoglobinuria (blackwater fever) and renal failure output."
            ),
            examFocus = "High-Yield for GNCZ/NMCZ Licensure Exam & Community Health OSCE."
        ),
        NursingTopic(
            id = "top-02",
            title = "IMCI (Integrated Management of Childhood Illness)",
            region = "Both",
            institutionOrGuideline = "WHO / UNICEF Guidelines",
            category = "Pediatrics & IMCI",
            level = "Undergraduate Diploma/BSc",
            summary = "Standard triage and assessment of children aged 2 months to 5 years presenting with General Danger Signs, Cough, Diarrhea, Fever, and Malnutrition.",
            keyPearls = listOf(
                "General Danger Signs: Unable to drink/breastfeed, vomits everything, convulsions, lethargic/unconscious.",
                "Fast breathing threshold: 2-11 months >= 50 breaths/min, 12-59 months >= 40 breaths/min."
            ),
            priorityInterventions = listOf(
                "Immediate referral for any child with a General Danger Sign.",
                "Administer Low Osmolality ORS + Zinc supplementation for 14 days in diarrhea."
            ),
            examFocus = "Essential for Pediatric Ward Rotations & Licensure Exam Care Plans."
        )
    )
}

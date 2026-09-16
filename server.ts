import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy-initialized Gemini client (server-side only)
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Quick Summary Endpoint
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { resource } = req.body;
    if (!resource || !resource.title) {
      return res.status(400).json({ error: 'Valid resource object is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        summary: [
          `Title: ${resource.title}`,
          `Category: ${resource.category}`,
          `Description: ${resource.description}`,
          `Please configure GEMINI_API_KEY for AI-powered summaries.`
        ]
      });
    }

    let resourceContentDigest = `Title: ${resource.title}\nDescription: ${resource.description}\n`;
    if (resource.highYieldKeyPoints) {
      resourceContentDigest += `Key Points: ${resource.highYieldKeyPoints.join('; ')}\n`;
    }
    if (resource.sections) {
      resourceContentDigest += `Sections: ${resource.sections.map((s: any) => s.title).join(', ')}\n`;
    }

    const prompt = `Please provide a brief, high-level bulleted summary (3-5 concise bullet points) for this nursing resource to help with rapid revision:\n${resourceContentDigest}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a concise nursing educator providing quick revision summaries. Return a JSON array of strings containing 3-5 high-yield bullet points.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const summaryData = JSON.parse(response.text?.trim() || '[]');
    res.json({ summary: summaryData });
  } catch (error: any) {
    console.warn('Summary generation error:', error?.message || error);
    res.json({
      summary: [
        `${req.body.resource.title}`,
        `${req.body.resource.description}`,
        'Detailed AI summary currently unavailable. Please review the main document.'
      ]
    });
  }
});

// Google Drive Files Auto-Summarizer Endpoint - Disabled per user directive
app.post('/api/summarize-drive-files', async (req, res) => {
  return res.json({ status: 'disabled', summaries: [], message: 'Automatic summarizing of attachments is disabled.' });
});

// Flashcard Generator Endpoint
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { resource, count = 8, focusMode = 'all' } = req.body;

    if (!resource || !resource.title) {
      return res.status(400).json({ error: 'Valid resource object is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return 200 with empty cards so client uses clinical fallback generator seamlessly
      return res.json({
        source: 'local_fallback_no_key',
        cards: [],
        message: 'No GEMINI_API_KEY configured. Utilizing standardized clinical curriculum generator.'
      });
    }

    // Build context-rich prompt based on nursing resource content
    let resourceContentDigest = `Title: ${resource.title}\n`;
    resourceContentDigest += `Category: ${resource.category}\n`;
    resourceContentDigest += `Domain / Specialty: ${resource.domain}\n`;
    resourceContentDigest += `Academic Year Level: ${resource.yearLevel}\n`;
    resourceContentDigest += `Description: ${resource.description}\n`;

    if (resource.moduleCode) resourceContentDigest += `Module Code: ${resource.moduleCode}\n`;
    if (resource.learningOutcomes?.length) {
      resourceContentDigest += `Learning Outcomes:\n- ${resource.learningOutcomes.join('\n- ')}\n`;
    }
    if (resource.syllabus?.length) {
      resourceContentDigest += `Syllabus Units:\n`;
      resource.syllabus.forEach((u: any) => {
        resourceContentDigest += `  * Unit ${u.unitNumber}: ${u.title} (Topics: ${u.topics?.join(', ')}; Competencies: ${u.keyCompetencies?.join(', ')})\n`;
      });
    }
    if (resource.questions?.length) {
      resourceContentDigest += `Past Exam Questions:\n`;
      resource.questions.forEach((q: any) => {
        resourceContentDigest += `  * Q${q.number}: ${q.questionText}\n    Marking Scheme: ${q.markingScheme}\n    Rationale: ${q.clinicalRationale}\n`;
      });
    }
    if (resource.tableOfContents?.length) {
      resourceContentDigest += `Textbook Chapters:\n`;
      resource.tableOfContents.forEach((ch: any) => {
        resourceContentDigest += `  * Ch ${ch.chapterNumber}: ${ch.title} - ${ch.summary}\n    Pearls: ${ch.keyPearls?.join('; ')}\n`;
      });
    }
    if (resource.highYieldKeyPoints?.length) {
      resourceContentDigest += `High-Yield Points:\n- ${resource.highYieldKeyPoints.join('\n- ')}\n`;
    }
    if (resource.sections?.length) {
      resource.sections.forEach((s: any) => {
        resourceContentDigest += `Section "${s.title}": ${s.content}\n`;
        if (s.callout) resourceContentDigest += `Alert (${s.callout.type}): ${s.callout.text}\n`;
      });
    }

    const focusInstructions =
      focusMode === 'nclex'
        ? 'Focus specifically on NCLEX-RN high-yield scenario questions, priority nursing action questions (who to see first, airway/breathing/circulation priority), and safety alerts.'
        : focusMode === 'pharmacology'
        ? 'Focus specifically on drug mechanisms, high-alert administration rules, toxicities, contraindications, antidote pairings, and patient education.'
        : focusMode === 'rationales'
        ? 'Focus specifically on differentiating signs, pathophysiology rationales, and clinical diagnostic interpretations.'
        : 'Provide a balanced mix of Priority Actions, NCLEX Scenarios, Diagnostic Signs, and Core Recall questions.';

    const systemInstruction = `You are a Senior Nurse Educator and NCLEX-RN exam board specialist creating high-yield active-recall quiz cards for nursing students from the DATANURSE nursing database.
You must construct exactly ${count} quiz cards directly based on the provided nursing resource.
Every flashcard must have:
- question: Clear, challenging, clinically accurate nursing question (e.g., patient presentation, clinical priority, or medication alert).
- answer: Direct, unambiguous target clinical answer.
- category: One of 'Priority Action', 'NCLEX Case', 'Clinical Rationale', 'Drug & Pharmacology', 'Diagnostic Sign', or 'Core Recall'.
- explanation: Clear, evidence-based nursing rationale explaining WHY this answer is correct and why other assumptions fail.
- keyPearl: High-yield memory pearl, NCLEX tip, or critical patient safety warning.
- difficulty: 'Standard', 'Clinical Challenge', or 'NCLEX High-Yield'.

Ensure 100% clinical accuracy, professional nursing terminology (e.g., ADPIE, ABCs, NANDA guidelines), and clear distinction between subjective and objective signs.`;

    const prompt = `Resource Information:\n${resourceContentDigest}\n\nTask:\nGenerate ${count} flashcards adhering to focus: ${focusInstructions}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: [
                  'Priority Action',
                  'NCLEX Case',
                  'Clinical Rationale',
                  'Drug & Pharmacology',
                  'Diagnostic Sign',
                  'Core Recall'
                ]
              },
              explanation: { type: Type.STRING },
              keyPearl: { type: Type.STRING },
              difficulty: {
                type: Type.STRING,
                enum: ['Standard', 'Clinical Challenge', 'NCLEX High-Yield']
              }
            },
            required: ['question', 'answer', 'category', 'explanation', 'keyPearl']
          }
        }
      }
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error('Empty response from Gemini model');
    }

    const cards = JSON.parse(responseText);
    const sanitizedCards = cards.map((c: any, index: number) => ({
      ...c,
      id: c.id || `ai-card-${resource.id}-${index + 1}`
    }));

    return res.json({
      source: 'gemini_api',
      cards: sanitizedCards
    });
  } catch (error: any) {
    console.warn('Gemini generation unavailable, generating structured clinical cards:', error?.message || error);
    // Provide guaranteed high-yield cards derived from the resource
    const fallbackCards = buildServerClinicalCards(req.body.resource, req.body.count || 8);
    return res.json({
      source: 'clinical_curriculum_engine',
      cards: fallbackCards,
      note: 'Generated via structured clinical engine (Gemini model experiencing temporary high demand).'
    });
  }
});

function buildServerClinicalCards(resource: any, targetCount: number = 8) {
  const list: any[] = [];
  let idx = 1;

  if (resource.questions && Array.isArray(resource.questions)) {
    resource.questions.forEach((q: any) => {
      let ans = q.markingScheme;
      if (q.options && q.correctOptionIndex !== undefined) {
        ans = `${q.options[q.correctOptionIndex]} (Option ${String.fromCharCode(65 + q.correctOptionIndex)})`;
      }
      list.push({
        id: `card-${resource.id}-${idx++}`,
        question: q.questionText,
        answer: ans,
        category: q.type === 'scenario_case' ? 'NCLEX Case' : 'Clinical Rationale',
        explanation: q.clinicalRationale || q.markingScheme,
        keyPearl: q.highYieldTip || 'Priority rule: Assess physiological stability before delegating.',
        difficulty: 'NCLEX High-Yield'
      });
    });
  }

  if (resource.syllabus && Array.isArray(resource.syllabus)) {
    resource.syllabus.forEach((u: any) => {
      if (u.keyCompetencies) {
        u.keyCompetencies.forEach((comp: string) => {
          list.push({
            id: `card-${resource.id}-${idx++}`,
            question: `In "${resource.title}", Unit ${u.unitNumber} (${u.title}): What clinical protocol demonstrates "${comp}"?`,
            answer: `Adhere strictly to evidence-based nursing procedures covering: ${u.topics?.slice(0, 3).join(', ')}.`,
            category: 'Priority Action',
            explanation: `Unit ${u.unitNumber} core competencies emphasize ${u.title}.`,
            keyPearl: 'Competency Check: Verify patient identity using 2 identifiers prior to any bedside procedure.',
            difficulty: 'Standard'
          });
        });
      }
    });
  }

  if (resource.tableOfContents && Array.isArray(resource.tableOfContents)) {
    resource.tableOfContents.forEach((ch: any) => {
      if (ch.keyPearls) {
        ch.keyPearls.forEach((p: string) => {
          list.push({
            id: `card-${resource.id}-${idx++}`,
            question: `Chapter ${ch.chapterNumber} ("${ch.title}") Key Pearl: What is the essential clinical guideline?`,
            answer: p,
            category: 'Clinical Rationale',
            explanation: ch.summary,
            keyPearl: `High-yield takeaway from ${resource.title}.`,
            difficulty: 'NCLEX High-Yield'
          });
        });
      }
    });
  }

  if (resource.highYieldKeyPoints && Array.isArray(resource.highYieldKeyPoints)) {
    resource.highYieldKeyPoints.forEach((pt: string) => {
      list.push({
        id: `card-${resource.id}-${idx++}`,
        question: `Clinical High-Yield Alert for ${resource.title}: What must the nurse prioritize?`,
        answer: pt,
        category: 'Priority Action',
        explanation: `Essential safety recommendation for ${resource.domain}.`,
        keyPearl: 'Safety Alert: Never bypass independent double-check for high-alert medications.',
        difficulty: 'NCLEX High-Yield'
      });
    });
  }

  if (list.length === 0) {
    list.push({
      id: `card-${resource.id}-default-1`,
      question: `What are the primary clinical objectives of ${resource.title}?`,
      answer: resource.description || 'Mastery of specialized nursing assessment, evidence-based care, and patient safety protocols.',
      category: 'Core Recall',
      explanation: `Core domain: ${resource.domain} (${resource.yearLevel}).`,
      keyPearl: 'Remember the ADPIE nursing process framework.',
      difficulty: 'Standard'
    });
  }

  return list.slice(0, Math.max(targetCount, 5));
}

// Multiple-Choice Quiz Generator Endpoint
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { resource, count = 5, difficulty = 'balanced', focusTopic = '' } = req.body;

    if (!resource || !resource.title) {
      return res.status(400).json({ error: 'Valid resource object is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallbackQuestions = buildServerClinicalQuiz(resource, count, difficulty);
      return res.json({
        source: 'clinical_curriculum_engine',
        questions: fallbackQuestions,
        message: 'No GEMINI_API_KEY configured. Loaded standardized clinical curriculum quiz questions.'
      });
    }

    // Build context-rich digest from the selected nursing module or document
    let resourceContentDigest = `Title: ${resource.title}\n`;
    resourceContentDigest += `Category: ${resource.category}\n`;
    resourceContentDigest += `Domain / Specialty: ${resource.domain}\n`;
    resourceContentDigest += `Academic Year Level: ${resource.yearLevel}\n`;
    resourceContentDigest += `Description: ${resource.description}\n`;

    if (resource.moduleCode) resourceContentDigest += `Module Code: ${resource.moduleCode}\n`;
    if (resource.learningOutcomes?.length) {
      resourceContentDigest += `Learning Outcomes:\n- ${resource.learningOutcomes.join('\n- ')}\n`;
    }
    if (resource.syllabus?.length) {
      resourceContentDigest += `Syllabus Units:\n`;
      resource.syllabus.forEach((u: any) => {
        resourceContentDigest += `  * Unit ${u.unitNumber}: ${u.title} (Topics: ${u.topics?.join(', ')}; Competencies: ${u.keyCompetencies?.join(', ')})\n`;
      });
    }
    if (resource.questions?.length) {
      resourceContentDigest += `Past Exam Questions:\n`;
      resource.questions.forEach((q: any) => {
        resourceContentDigest += `  * Q${q.number}: ${q.questionText}\n    Marking Scheme: ${q.markingScheme}\n    Rationale: ${q.clinicalRationale}\n`;
        if (q.options) resourceContentDigest += `    Options: ${q.options.join(' | ')}\n`;
      });
    }
    if (resource.tableOfContents?.length) {
      resourceContentDigest += `Textbook Chapters:\n`;
      resource.tableOfContents.forEach((ch: any) => {
        resourceContentDigest += `  * Ch ${ch.chapterNumber}: ${ch.title} - ${ch.summary}\n    Pearls: ${ch.keyPearls?.join('; ')}\n`;
      });
    }
    if (resource.highYieldKeyPoints?.length) {
      resourceContentDigest += `High-Yield Points:\n- ${resource.highYieldKeyPoints.join('\n- ')}\n`;
    }
    if (resource.sections?.length) {
      resource.sections.forEach((s: any) => {
        resourceContentDigest += `Section "${s.title}": ${s.content}\n`;
        if (s.callout) resourceContentDigest += `Alert (${s.callout.type}): ${s.callout.text}\n`;
      });
    }
    if (resource.documentContentText) {
      resourceContentDigest += `Document Full Text Excerpt:\n${resource.documentContentText.slice(0, 3000)}\n`;
    }
    if (resource.attachmentContentText) {
      resourceContentDigest += `Attachment Full Text Excerpt:\n${resource.attachmentContentText.slice(0, 3000)}\n`;
    }

    const focusInstructions = focusTopic
      ? `Ensure questions specifically target the topic: "${focusTopic}".`
      : difficulty === 'nclex'
      ? 'Focus specifically on NCLEX Next-Gen style case scenarios, priority delegation, airway/breathing/circulation (ABCs), triage, and patient safety alerts.'
      : difficulty === 'pharmacology'
      ? 'Focus specifically on mechanism of action, therapeutic drug ranges, adverse drug events, antidotes, and patient administration teaching.'
      : 'Provide a rigorous, balanced mix of clinical assessment, priority nursing interventions, diagnostic findings, and pathophysiology concepts.';

    const systemInstruction = `You are a Senior Nurse Educator and Clinical Examination Specialist for the DATANURSE Nursing Portal.
Create a high-yield, multiple-choice quiz of exactly ${count} questions directly based on the provided nursing module, syllabus, textbook, or document content.
Each question MUST strictly have:
1. question: A clear, clinically realistic nursing question (e.g., patient presentation, assessment finding, priority nursing action, or medication decision).
2. options: Exactly 4 distinct, plausible multiple-choice options (array of 4 strings). One option must be the clearly correct best nursing answer; the remaining 3 distractors must be plausible clinical misconceptions or secondary actions.
3. correctAnswerIndex: Integer 0, 1, 2, or 3 pointing to the correct option.
4. explanation: A comprehensive, evidence-based clinical rationale explaining why the correct choice is correct AND why the distractors are incorrect or non-priority.
5. clinicalPearl: A high-yield takeaway, NCLEX exam pearl, or patient safety rule.
6. category: One of 'Priority Action', 'Pharmacology', 'Assessment & Diagnostics', 'Clinical Scenario', 'Pathophysiology', 'Ethics & Legal', or 'Core Concepts'.
7. difficulty: 'Standard', 'Clinical Challenge', or 'NCLEX High-Yield'.

Adhere strictly to standard nursing frameworks (ADPIE, ABCs, Maslow's Hierarchy, NANDA, WHO, and National Nursing Standards).`;

    const prompt = `Resource Content Data:\n${resourceContentDigest}\n\nTask:\nGenerate ${count} multiple choice questions adhering to: ${focusInstructions}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              clinicalPearl: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: [
                  'Priority Action',
                  'Pharmacology',
                  'Assessment & Diagnostics',
                  'Clinical Scenario',
                  'Pathophysiology',
                  'Ethics & Legal',
                  'Core Concepts'
                ]
              },
              difficulty: {
                type: Type.STRING,
                enum: ['Standard', 'Clinical Challenge', 'NCLEX High-Yield']
              }
            },
            required: ['question', 'options', 'correctAnswerIndex', 'explanation', 'clinicalPearl']
          }
        }
      }
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error('Empty response from Gemini model');
    }

    const rawQuestions = JSON.parse(responseText);
    const sanitizedQuestions = rawQuestions.map((q: any, idx: number) => {
      // Ensure exactly 4 options and valid index
      let opts = Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];
      while (opts.length < 4) {
        opts.push(`Alternative clinical intervention ${opts.length + 1}`);
      }
      if (opts.length > 4) {
        opts = opts.slice(0, 4);
      }
      let correctIdx = typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4 ? q.correctAnswerIndex : 0;

      return {
        id: q.id || `quiz-q-${resource.id}-${idx + 1}-${Date.now()}`,
        question: q.question || 'Clinical Nursing Question',
        options: opts,
        correctAnswerIndex: correctIdx,
        explanation: q.explanation || 'Evidence-based clinical nursing rationale.',
        clinicalPearl: q.clinicalPearl || 'High-Yield Clinical Pearl: Always assess before intervening.',
        category: q.category || 'Clinical Scenario',
        difficulty: q.difficulty || 'NCLEX High-Yield'
      };
    });

    return res.json({
      source: 'gemini_api',
      questions: sanitizedQuestions
    });
  } catch (error: any) {
    console.warn('Gemini quiz generation error, using clinical curriculum engine:', error?.message || error);
    const fallbackQuestions = buildServerClinicalQuiz(req.body.resource, req.body.count || 5, req.body.difficulty);
    return res.json({
      source: 'clinical_curriculum_engine',
      questions: fallbackQuestions,
      note: 'Generated via structured clinical curriculum engine.'
    });
  }
});

function buildServerClinicalQuiz(resource: any, targetCount: number = 5, _difficulty: string = 'balanced') {
  const list: any[] = [];
  let idx = 1;

  // 1. From existing past paper questions
  if (resource.questions && Array.isArray(resource.questions) && resource.questions.length > 0) {
    resource.questions.forEach((q: any) => {
      let options: string[] = [];
      let correctIdx = 0;

      if (q.options && Array.isArray(q.options) && q.options.length >= 4) {
        options = q.options.slice(0, 4);
        correctIdx = typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0;
      } else {
        const correctText = q.markingScheme || 'Administer high-flow oxygen and position the patient upright';
        options = [
          correctText,
          'Immediately administer sedative analgesics and document response',
          'Place patient in deep Trendelenburg position and monitor vitals q4h',
          'Notify family and await attending physician consult before baseline assessment'
        ];
        correctIdx = 0;
      }

      list.push({
        id: `quiz-fallback-${resource.id}-${idx++}`,
        question: q.questionText,
        options,
        correctAnswerIndex: correctIdx,
        explanation: q.clinicalRationale || q.markingScheme || 'Accurate clinical priority according to evidence-based nursing protocols.',
        clinicalPearl: q.highYieldTip || 'Priority: Always stabilize airway and breathing before secondary diagnostics.',
        category: q.type === 'scenario_case' ? 'Clinical Scenario' : 'Priority Action',
        difficulty: 'NCLEX High-Yield'
      });
    });
  }

  // 2. From syllabus units and competencies
  if (resource.syllabus && Array.isArray(resource.syllabus) && resource.syllabus.length > 0) {
    resource.syllabus.forEach((unit: any) => {
      const topic1 = unit.topics?.[0] || 'clinical assessment';
      const topic2 = unit.topics?.[1] || 'safe drug administration';
      const comp = unit.keyCompetencies?.[0] || 'evidence-based care';

      list.push({
        id: `quiz-fallback-${resource.id}-${idx++}`,
        question: `In "${resource.title}", Unit ${unit.unitNumber} (${unit.title}): A nurse is demonstrating competency in "${comp}". Which clinical action is most appropriate?`,
        options: [
          `Implement validated protocols focusing on ${topic1}, verifying patient identification and documenting findings immediately.`,
          `Administer prescribed treatments first and complete patient physical assessment post-procedure.`,
          `Delegate high-risk patient assessments to unlicensed assistive personnel (UAP).`,
          `Withhold all interventions until the next shift handover is completed.`
        ],
        correctAnswerIndex: 0,
        explanation: `Unit ${unit.unitNumber} core competencies require direct adherence to evidence-based standards, thorough initial assessment, and immediate clinical documentation.`,
        clinicalPearl: `ADPIE Protocol: Assessment must always precede nursing intervention unless immediate resuscitation is warranted.`,
        category: 'Priority Action',
        difficulty: 'Standard'
      });

      if (unit.topics && unit.topics.length >= 2) {
        list.push({
          id: `quiz-fallback-${resource.id}-${idx++}`,
          question: `Regarding ${unit.title} (${resource.moduleCode || 'Module'}): What is the primary priority when managing ${topic2}?`,
          options: [
            `Maintain strict aseptic technique, monitor baseline parameters, and recognize adverse physiological responses promptly.`,
            `Rely exclusively on subjective patient feedback without reviewing objective lab values.`,
            `Discontinue monitoring once initial vital signs are recorded as stable.`,
            `Document vitals at the end of the 12-hour shift rather than in real time.`
          ],
          correctAnswerIndex: 0,
          explanation: `Safe nursing management of ${topic2} necessitates continuous baseline monitoring, rigorous aseptic protocols, and prompt escalation of clinical deterioration.`,
          clinicalPearl: `Safety Alert: Never bypass two-nurse verification for high-alert medications and critical infusions.`,
          category: 'Assessment & Diagnostics',
          difficulty: 'Clinical Challenge'
        });
      }
    });
  }

  // 3. From high yield key points
  if (resource.highYieldKeyPoints && Array.isArray(resource.highYieldKeyPoints) && resource.highYieldKeyPoints.length > 0) {
    resource.highYieldKeyPoints.forEach((point: string) => {
      list.push({
        id: `quiz-fallback-${resource.id}-${idx++}`,
        question: `Clinical High-Yield Practice for "${resource.title}": Which recommendation reflects the standard of care?`,
        options: [
          point,
          'Delay escalation of unstable vital signs until the next scheduled round.',
          'Rely solely on automated monitors without manual clinical verification.',
          'Skip standard hand hygiene protocols if using clean examination gloves.'
        ],
        correctAnswerIndex: 0,
        explanation: `Core guideline: ${point}. This directly aligns with the established nursing practice standards for ${resource.domain}.`,
        clinicalPearl: 'High-Yield Pearl: Patient safety and early recognition of clinical deterioration prevent adverse outcomes.',
        category: 'Priority Action',
        difficulty: 'NCLEX High-Yield'
      });
    });
  }

  // 4. From clinical sections
  if (resource.sections && Array.isArray(resource.sections) && resource.sections.length > 0) {
    resource.sections.forEach((sec: any) => {
      list.push({
        id: `quiz-fallback-${resource.id}-${idx++}`,
        question: `Regarding "${sec.title}" in ${resource.title}: What is the critical nursing consideration?`,
        options: [
          `Prioritize patient physiological stabilization, monitor for complications, and adhere to clinical guidelines.`,
          `Administer medications before checking patient allergies and baseline lab values.`,
          `Assume asymptomatic patients do not require continuous observation or documentation.`,
          `Discharge the patient without providing written and verbal discharge education.`
        ],
        correctAnswerIndex: 0,
        explanation: `${sec.content ? sec.content.slice(0, 180) + '...' : 'Evidence-based nursing management mandates vigilant monitoring and adherence to clinical protocols.'}`,
        clinicalPearl: sec.callout?.text || 'Clinical Rule: Always assess airway, breathing, circulation, and neurological status.',
        category: 'Clinical Scenario',
        difficulty: 'Standard'
      });
    });
  }

  // Ensure minimum question count
  if (list.length === 0) {
    list.push({
      id: `quiz-fallback-${resource.id}-default-1`,
      question: `What is the primary clinical objective for the study of "${resource.title}" (${resource.domain})?`,
      options: [
        `Develop comprehensive clinical competence, critical thinking, and patient safety mastery across ${resource.domain}.`,
        `Memorize theoretical definitions without applying clinical assessment frameworks.`,
        `Focus solely on administrative charting rather than bedside direct patient care.`,
        `Limit clinical evaluations to standard laboratory test result reviews.`
      ],
      correctAnswerIndex: 0,
      explanation: `The foundational objective of ${resource.title} is integrating clinical theory with bedside nursing practice, ethical guidelines, and patient safety.`,
      clinicalPearl: 'ADPIE Framework: Assessment, Diagnosis, Planning, Implementation, Evaluation.',
      category: 'Core Concepts',
      difficulty: 'Standard'
    });
  }

  return list.slice(0, Math.max(targetCount, 5));
}

// Direct install route shortcuts
app.get(['/install', '/apk', '/pwa'], (_req, res) => {
  res.redirect('/?install=true');
});

// Dynamic Gemini AI Sourced Nursing Topics (Zambia & Global)
app.post('/api/nursing-topics', async (req, res) => {
  try {
    const { region = 'all', category = 'all', searchQuery = '' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        source: 'local_clinical_database',
        topics: getCuratedNursingTopics(region, category, searchQuery),
        message: 'Loaded standardized GNCZ & WHO Clinical Topics repository.'
      });
    }

    const prompt = `You are the Lead Nursing Education Specialist for the General Nursing Council of Zambia (GNCZ), Nursing and Midwifery Council of Zambia (NMCZ), and the World Health Organization (WHO) Global Nursing Guidelines.
Generate an up-to-date, comprehensive list of 10 high-yield nursing curriculum topics covering priority areas in Zambia (e.g., Malaria elimination, TB/HIV, Cholera outbreak protocol, EmONC maternal care, IMCI pediatric triage, Zambian GNCZ exam focus) and Global health priorities (e.g. WHO sepsis guidelines, emergency airway, antimicrobials, evidence-based care).
Filter parameters requested by user:
- Region: ${region}
- Category: ${category}
- Search Filter: ${searchQuery || 'None'}

Return a JSON array of 8-10 topic objects adhering strictly to this structure:
- id: string (e.g., 'topic-zambia-malaria-2026', 'topic-global-sepsis-2026')
- title: string (Clear clinical topic title)
- region: 'Zambia' | 'Global' | 'Both'
- institutionOrGuideline: string (e.g., 'GNCZ 2025/2026 Curriculum', 'Ministry of Health Zambia', 'WHO EmONC Guidelines', 'NMCZ Standards')
- category: 'National Health Priority' | 'Med-Surg & Adult Health' | 'Maternal & Neonatal' | 'Pediatrics & IMCI' | 'Pharmacology & Therapeutics' | 'Critical Care & Emergency' | 'Public Health & Epidemiology' | 'Leadership & Ethics'
- level: 'Undergraduate Diploma/BSc' | 'Postgraduate/Specialist' | 'Clinical Licensure (GNCZ/NMCZ)' | 'Global Standard (WHO)'
- summary: string (3-4 concise sentences summarizing the core clinical concept and pathophysiological basis)
- keyPearls: string[] (3-4 bullet points of high-yield exam pearls and priority patient safety alerts)
- priorityInterventions: string[] (4 sequential nursing steps following ADPIE or emergency response)
- examFocus: string (What examiners frequently test in GNCZ/NMCZ/NCLEX licensure exams)
- recentUpdates: string (2025/2026 updated treatment guidelines, drug regimens, or national policy changes)
- sourceAuthority: string (e.g., 'MoH Zambia / GNCZ 2026', 'WHO Global Guidelines')
- tags: string[] (3-5 searchable keywords)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an authoritative nursing curriculum specialist providing high-yield, structured clinical nursing topics with 100% medical accuracy and practical exam relevance.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              region: { type: Type.STRING, enum: ['Zambia', 'Global', 'Both'] },
              institutionOrGuideline: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: [
                  'National Health Priority',
                  'Med-Surg & Adult Health',
                  'Maternal & Neonatal',
                  'Pediatrics & IMCI',
                  'Pharmacology & Therapeutics',
                  'Critical Care & Emergency',
                  'Public Health & Epidemiology',
                  'Leadership & Ethics'
                ]
              },
              level: {
                type: Type.STRING,
                enum: [
                  'Undergraduate Diploma/BSc',
                  'Postgraduate/Specialist',
                  'Clinical Licensure (GNCZ/NMCZ)',
                  'Global Standard (WHO)'
                ]
              },
              summary: { type: Type.STRING },
              keyPearls: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              priorityInterventions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              examFocus: { type: Type.STRING },
              recentUpdates: { type: Type.STRING },
              sourceAuthority: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['id', 'title', 'region', 'institutionOrGuideline', 'category', 'level', 'summary', 'keyPearls', 'priorityInterventions', 'examFocus']
          }
        }
      }
    });

    const parsedTopics = JSON.parse(response.text?.trim() || '[]');
    return res.json({
      source: 'gemini_ai_live',
      topics: parsedTopics.length > 0 ? parsedTopics : getCuratedNursingTopics(region, category, searchQuery),
      lastUpdated: new Date().toISOString()
    });
  } catch (err: any) {
    console.warn('Gemini topic generation error:', err?.message || err);
    return res.json({
      source: 'fallback_curated_topics',
      topics: getCuratedNursingTopics(req.body.region, req.body.category, req.body.searchQuery),
      lastUpdated: new Date().toISOString()
    });
  }
});

// Deep dive interactive explanation on any nursing topic
app.post('/api/nursing-topic-deepdive', async (req, res) => {
  try {
    const { topicTitle, question } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        answer: `Clinical summary for ${topicTitle}: Focus on ABCs, vital signs monitoring, strict asepsis, Zambian standard clinical treatment guidelines (MoH Zambia), and GNCZ assessment rubrics.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Topic: ${topicTitle}\nQuestion from nursing student: ${question || 'Explain the pathophysiology, priority nursing care plan (ADPIE), drug administration guidelines, and common licensure exam traps for this topic.'}`,
      config: {
        systemInstruction: 'You are an experienced clinical nurse educator in Zambia providing high-yield, structured, bulleted clinical explanations for nursing students.'
      }
    });

    return res.json({ answer: response.text });
  } catch (err: any) {
    return res.json({
      answer: 'Live AI clinical tutoring is temporarily unavailable. Please refer to the key pearls and standard procedure notes.'
    });
  }
});

function getCuratedNursingTopics(region: string = 'all', category: string = 'all', searchQuery: string = '') {
  const curated = [
    {
      id: 'topic-zm-malaria-01',
      title: 'Severe & Complicated Malaria Management in Zambia',
      region: 'Zambia',
      institutionOrGuideline: 'National Malaria Elimination Centre (NMEC) / MoH Zambia Guidelines',
      category: 'National Health Priority',
      level: 'Clinical Licensure (GNCZ/NMCZ)',
      summary: 'Clinical diagnosis and emergency management of severe Plasmodium falciparum malaria with cerebral manifestations, severe anemia, acute kidney injury, or lactic acidosis in adults and children under 5.',
      keyPearls: [
        'First-line emergency drug: Intravenous/Intramuscular Artesunate (2.4 mg/kg for adults, 3.0 mg/kg for children <20kg) given at 0, 12, and 24 hours.',
        'Always check Blood Glucose immediately: Severe malaria causes refractory hypoglycemia, especially in pregnant women and toddlers.',
        'Never fluid-overload cerebral malaria patients: Maintain euvolemia to prevent fatal cerebral edema and pulmonary edema.'
      ],
      priorityInterventions: [
        '1. Rapid Triage: Assess airway, breathing, consciousness level (Blantyre/Glasgow coma scale), and blood glucose.',
        '2. Obtain urgent RDT & thick/thin blood smear, hemoglobin, and electrolytes.',
        '3. Reconstitute Artesunate powder with 5% sodium bicarbonate then dilute with 0.9% Normal Saline and administer immediately.',
        '4. Monitor hourly urine output (<0.5 ml/kg/hr indicates Acute Kidney Injury) and neuro checks.'
      ],
      examFocus: 'Artesunate reconstitution steps, calculation of pediatric dosage (<20kg = 3.0mg/kg), and differential diagnosis of cerebral malaria vs bacterial meningitis.',
      recentUpdates: 'Updated Zambian National Guidelines emphasize immediate parenteral Artesunate over Quinine infusion due to lower hypoglycemia and cardiac mortality risks.',
      sourceAuthority: 'NMEC Zambia & GNCZ Exam Board',
      tags: ['Malaria', 'Artesunate', 'Infectious Disease', 'Zambia Priority', 'Pediatric Emergency']
    },
    {
      id: 'topic-zm-cholera-02',
      title: 'Cholera Outbreak Emergency Response & CTC Triage Protocol',
      region: 'Zambia',
      institutionOrGuideline: 'Zambia National Public Health Institute (ZNPHI) / WHO',
      category: 'Public Health & Epidemiology',
      level: 'Clinical Licensure (GNCZ/NMCZ)',
      summary: 'Standardized nursing workflow inside Cholera Treatment Centers (CTCs): triage classification (Plan A, B, C for dehydration), rapid Ringers Lactate bolus protocols, cholera cot nursing, and infection prevention.',
      keyPearls: [
        'Plan C (Severe Dehydration): Administer 100 ml/kg of IV Ringers Lactate rapidly (30 ml/kg in first 30 mins for adults, then 70 ml/kg over 2.5 hours).',
        'Oral Rehydration Solution (ORS) must be given concurrently as soon as patient can swallow safely.',
        'Strict disinfection: 0.5% Chlorine solution for vomitus/stool spills and body bag preparation; 0.05% Chlorine solution for handwashing.'
      ],
      priorityInterventions: [
        '1. Triage by skin turgor, radial pulse, thirst, and mental status into Plan A, B, or C.',
        '2. Secure two large-bore IV cannulas (16G or 18G) immediately for Plan C patients.',
        '3. Position patient on specialized Cholera Cot with calibrated bucket to measure liquid stool losses hourly.',
        '4. Administer single-dose oral Doxycycline 300mg (or Azithromycin for pregnant/pediatric) after vomiting subsides.'
      ],
      examFocus: 'Plan C IV fluid calculation for adults vs infants, ORS preparation formula, and chlorine dilution math for infection control.',
      recentUpdates: 'Incorporation of Oral Cholera Vaccine (OCV - Euvichol-Plus) mass campaigns and zinc supplementation (20mg daily x 14 days) in all pediatric cholera cases.',
      sourceAuthority: 'ZNPHI & MoH Zambia',
      tags: ['Cholera', 'Fluid Resuscitation', 'Infection Control', 'ZNPHI', 'Dehydration']
    },
    {
      id: 'topic-zm-emonc-03',
      title: 'Emergency Obstetric & Neonatal Care (EmONC) — Postpartum Hemorrhage',
      region: 'Both',
      institutionOrGuideline: 'WHO / NMCZ National Midwifery Standards',
      category: 'Maternal & Neonatal',
      level: 'Clinical Licensure (GNCZ/NMCZ)',
      summary: 'Management of primary Postpartum Hemorrhage (PPH) due to the 4 Ts (Tone, Tissue, Trauma, Thrombin). Rapid deployment of the PPH emergency bundle: uterotonics, uterine massage, bimanual compression, and balloon tamponade.',
      keyPearls: [
        'Uterine Atony is responsible for 80% of PPH cases: Immediately perform vigorous fundal massage until uterus is contracted like a cricket ball.',
        'First-line pharmacotherapy: Oxytocin 10-20 IU in 500ml Normal Saline at 60 drops/min, followed by Ergometrine 0.5mg IM (contraindicated in hypertension/preeclampsia) or Misoprostol 800mcg rectally.',
        'Non-pneumatic Anti-Shock Garment (NASG) application while preparing for surgical intervention or blood transfusion.'
      ],
      priorityInterventions: [
        '1. Call for help ("Code PPH") and massage uterine fundus continuously.',
        '2. Catheterize urinary bladder with Foley catheter to relieve bladder distension.',
        '3. Establish two large-bore IV lines (16G) and infuse crystalloids while crossmatching 2-4 units whole blood.',
        '4. Perform internal bimanual uterine compression if bleeding continues.'
      ],
      examFocus: '4 Ts etiology, contraindications to Ergometrine (hypertension), and steps of Active Management of the Third Stage of Labor (AMTSL).',
      recentUpdates: 'WHO 2024/2025 updated guidelines mandate use of calibrated under-buttocks drapes to accurately measure blood loss instead of visual estimation.',
      sourceAuthority: 'NMCZ Midwifery Board & WHO',
      tags: ['PPH', 'EmONC', 'Midwifery', 'Obstetric Emergency', 'Oxytocin']
    },
    {
      id: 'topic-gl-sepsis-04',
      title: 'Surviving Sepsis Campaign: 1-Hour Sepsis Bundle',
      region: 'Global',
      institutionOrGuideline: 'Surviving Sepsis Campaign / International Consensus Guidelines',
      category: 'Critical Care & Emergency',
      level: 'Global Standard (WHO)',
      summary: 'Rapid identification of sepsis and septic shock using qSOFA / SOFA scores. Execution of the critical 1-Hour Sepsis Resuscitation Bundle to cut mortality rates.',
      keyPearls: [
        'Measure serum lactate immediately: Lactate > 2 mmol/L indicates tissue hypoperfusion; Lactate > 4 mmol/L indicates severe metabolic crisis.',
        'Obtain blood cultures BEFORE administering broad-spectrum antibiotics (do not delay antibiotics > 45 mins if culture is delayed).',
        'Administer 30 mL/kg of IV crystalloid (Balanced crystalloid/Ringers) within 3 hours for hypotension or lactate ≥ 4 mmol/L.'
      ],
      priorityInterventions: [
        '1. Recognize signs: Temperature >38.3°C or <36°C, HR >90, RR >20, altered mental status, MAP <65 mmHg.',
        '2. Draw 2 sets of peripheral blood cultures (aerobic + anaerobic).',
        '3. Start IV broad-spectrum empiric antibiotics within 60 minutes of presentation.',
        '4. Start Norepinephrine (first-choice vasopressor) if MAP remains < 65 mmHg despite adequate fluid challenge.'
      ],
      examFocus: 'Target Mean Arterial Pressure (MAP ≥ 65 mmHg), calculation of MAP ( [2 x DBP + SBP] / 3 ), and priority order of sepsis bundle actions.',
      recentUpdates: 'Prefer balanced crystalloids (Plasma-Lyte / Ringers) over 0.9% Saline to prevent hyperchloremic metabolic acidosis and acute kidney injury.',
      sourceAuthority: 'Surviving Sepsis Campaign & WHO',
      tags: ['Sepsis', 'Critical Care', 'Emergency', 'Hemodynamics', 'Infection']
    },
    {
      id: 'topic-zm-hiv-tb-05',
      title: 'Zambian Consolidated HIV ART & TB-DOTS Co-Infection Protocol',
      region: 'Zambia',
      institutionOrGuideline: 'Ministry of Health Zambia National HIV/AIDS Guidelines',
      category: 'National Health Priority',
      level: 'Clinical Licensure (GNCZ/NMCZ)',
      summary: 'Comprehensive management of People Living with HIV (PLHIV) and TB co-infection. Covers Dolutegravir (DTG)-based First-Line regimens (TLD: Tenofovir + Lamivudine + Dolutegravir), Viral Load monitoring, and TPT (TB Preventive Treatment with 3HP/6H).',
      keyPearls: [
        'First-Line adult regimen in Zambia: TLD (Tenofovir 300mg + Lamivudine 300mg + Dolutegravir 50mg) taken once daily with or without food.',
        'If patient is co-infected with active TB and taking Rifampicin: Double the Dolutegravir dose (DTG 50mg BID) due to CYP3A4 enzyme induction by Rifampicin.',
        'Undetectable = Untransmittable (U=U): Viral load <50 copies/ml eliminates sexual transmission of HIV.'
      ],
      priorityInterventions: [
        '1. Perform 4-symptom TB screening at every clinical encounter (Cough, Fever, Night Sweats, Weight Loss).',
        '2. Test for Cryptococcal Antigen (CrAg) in all clients with CD4 < 200 cells/uL prior to ART initiation.',
        '3. Counsel patient on adherence barriers, pill burden, and viral load milestone schedule (6 months, 12 months, annually).',
        '4. Screen for renal function (Serum Creatinine/eGFR) prior to and during Tenofovir (TDF) therapy.'
      ],
      examFocus: 'TLD components and dosing, management of drug interactions between Rifampicin and DTG, and Immune Reconstitution Inflammatory Syndrome (IRIS).',
      recentUpdates: 'Adoption of 3HP (once-weekly Isoniazid + Rifapentine for 3 months) as preferred short-course TB preventive treatment across Zambian ART clinics.',
      sourceAuthority: 'MoH Zambia & GNCZ',
      tags: ['HIV', 'Tuberculosis', 'ART', 'Dolutegravir', 'Zambia Guidelines']
    },
    {
      id: 'topic-gl-pediatric-06',
      title: 'Pediatric Advanced Life Support & IMCI Emergency Triage (ETAT)',
      region: 'Both',
      institutionOrGuideline: 'WHO Emergency Triage Assessment & Treatment / GNCZ Pediatrics',
      category: 'Pediatrics & IMCI',
      level: 'Undergraduate Diploma/BSc',
      summary: 'Emergency Triage, Assessment, and Treatment (ETAT) protocol for children under 5 presenting to health facilities. Rapid categorization into Emergency Signs, Priority Signs, and Non-urgent queue.',
      keyPearls: [
        'Emergency Signs (ABCD): Airway/Breathing (stridor, central cyanosis, severe respiratory distress), Circulation (weak/fast pulse, cap refill >3s, cold hands), Coma/Convulsion, Dehydration (severe lethargy).',
        'Intraosseous (IO) access must be established within 90 seconds if peripheral IV access cannot be secured in a decompensating child.',
        'Pediatric Bolus Fluid standard: 10-20 mL/kg of Normal Saline or Ringers over 10-20 minutes (except in Severe Acute Malnutrition where fluid is restricted).'
      ],
      priorityInterventions: [
        '1. Immediate triage at clinic gate: look for chest indrawing, stridor at rest, and lethargy.',
        '2. Deliver high-flow oxygen via nasal prongs at 1-2 L/min for hypoxemia (SpO2 < 90%).',
        '3. Check rapid blood glucose (Dextrose stick) for any convulsing or unconscious child; treat with 5 mL/kg 10% Dextrose IV bolus.',
        '4. Position unconscious child in recovery position to prevent aspiration.'
      ],
      examFocus: 'ETAT triage prioritization, pediatric drug calculations based on weight, and differentiating SAM (Severe Acute Malnutrition) fluid rules vs normal shock.',
      recentUpdates: 'Emphasis on early Bubble CPAP in secondary Zambian district hospitals for neonatal and infant severe bronchiolitis/pneumonia.',
      sourceAuthority: 'WHO & Paediatric Association of Zambia',
      tags: ['ETAT', 'IMCI', 'Pediatrics', 'Resuscitation', 'Oxygen Therapy']
    }
  ];

  return curated.filter((t) => {
    const matchesRegion = region === 'all' || t.region.toLowerCase() === region.toLowerCase() || t.region === 'Both';
    const matchesCategory = category === 'all' || t.category.toLowerCase().includes(category.toLowerCase());
    const matchesQuery =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.institutionOrGuideline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesCategory && matchesQuery;
  });
}


// Endpoint to serve Android TWA / PWA Package Download
app.get('/api/download-apk-package', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="DATANURSE-Android-Package.json"');
  res.send(JSON.stringify({
    appName: "DATANURSE (Nursing Database)",
    packageName: "com.datanurse.app",
    version: "1.2.0",
    author: "Chanda Felix",
    appIcon: "/pwa-512x512.png",
    pwaCapabilities: [
      "Offline Database & SW Pre-caching",
      "WebAPK Native Android Minting",
      "AdMob Verified Banner Support",
      "Firebase Cloud Storage & Real-time Auto-Sync Integration"
    ],
    instructions: [
      "For Android: Open in Google Chrome / Samsung Internet -> Tap 3 Dots -> Tap 'Install App' or 'Add to Home Screen' to auto-mint native WebAPK.",
      "For PC (Windows/Mac/Linux): Open in Chrome / Edge / Brave -> Click Install Icon in URL address bar -> Runs as desktop window."
    ]
  }, null, 2));
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DATANURSE Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

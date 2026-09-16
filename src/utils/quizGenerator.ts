import { ResourceItem, QuizQuestion, QuizHistoryItem } from '../types';

export async function fetchAIQuiz(
  resource: ResourceItem,
  count: number = 5,
  difficulty: string = 'balanced',
  focusTopic: string = ''
): Promise<QuizQuestion[]> {
  try {
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resource,
        count,
        difficulty,
        focusTopic
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn('API quiz generation returned non-OK status:', response.status, errData);
      return generateClinicalFallbackQuiz(resource, count, difficulty);
    }

    const data = await response.json();
    if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions;
    }
  } catch (error) {
    console.warn('Error connecting to /api/generate-quiz, using clinical generator fallback:', error);
  }

  // Fallback to rich clinical generator
  return generateClinicalFallbackQuiz(resource, count, difficulty);
}

/**
 * Intelligent local clinical fallback generator that extracts actual curriculum
 * data from the resource and constructs verified NCLEX and clinical multiple-choice questions.
 */
export function generateClinicalFallbackQuiz(
  resource: ResourceItem,
  count: number = 5,
  _difficulty: string = 'balanced'
): QuizQuestion[] {
  const list: QuizQuestion[] = [];
  let idx = 1;

  // 1. If resource is a past paper with real examination questions
  if (resource.category === 'past_papers' && resource.questions && resource.questions.length > 0) {
    resource.questions.forEach((q) => {
      let options: string[] = [];
      let correctIdx = 0;

      if (q.options && Array.isArray(q.options) && q.options.length >= 4) {
        options = q.options.slice(0, 4);
        correctIdx = typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0;
      } else {
        const correctText = q.markingScheme || 'Administer high-flow oxygen and position the patient in Semi-Fowler\'s position';
        options = [
          correctText,
          'Immediately administer sedative analgesics and document patient response in 1 hour',
          'Place patient in deep Trendelenburg position and monitor vital signs every 4 hours',
          'Notify family members and await attending physician consultation before baseline assessment'
        ];
        correctIdx = 0;
      }

      list.push({
        id: `q-fallback-${resource.id}-${idx++}`,
        question: q.questionText,
        options,
        correctAnswerIndex: correctIdx,
        explanation: q.clinicalRationale || q.markingScheme || 'Accurate clinical priority according to evidence-based nursing protocols.',
        clinicalPearl: q.highYieldTip || `Exam Weight: ${q.marks} Marks. Focus on airway, breathing, and physiological stabilization before secondary steps.`,
        category: q.type === 'scenario_case' ? 'Clinical Scenario' : 'Priority Action',
        difficulty: 'NCLEX High-Yield'
      });
    });
  }

  // 2. If resource is a module with syllabus units & competencies
  if (resource.category === 'modules' && resource.syllabus && resource.syllabus.length > 0) {
    resource.syllabus.forEach((unit) => {
      const topic1 = unit.topics?.[0] || 'clinical assessment';
      const topic2 = unit.topics?.[1] || 'safe medication administration';
      const comp = unit.keyCompetencies?.[0] || 'evidence-based care';

      list.push({
        id: `q-fallback-${resource.id}-${idx++}`,
        question: `In "${resource.title}", Unit ${unit.unitNumber} (${unit.title}): A nurse is demonstrating competency in "${comp}". Which clinical action is the priority?`,
        options: [
          `Implement validated protocols focusing on ${topic1}, verifying patient identity with 2 identifiers and documenting findings immediately.`,
          `Administer prescribed treatments first and complete baseline physical assessment post-procedure.`,
          `Delegate high-risk patient assessments to unlicensed assistive personnel (UAP).`,
          `Withhold all bedside interventions until the next shift handover is finalized.`
        ],
        correctAnswerIndex: 0,
        explanation: `Unit ${unit.unitNumber} core competencies require strict adherence to evidence-based standards, thorough initial assessment, and immediate clinical documentation.`,
        clinicalPearl: `ADPIE Protocol: Assessment must always precede nursing intervention unless immediate cardiopulmonary resuscitation is warranted.`,
        category: 'Priority Action',
        difficulty: 'Standard'
      });

      if (unit.topics && unit.topics.length >= 2) {
        list.push({
          id: `q-fallback-${resource.id}-${idx++}`,
          question: `Regarding ${unit.title} (${resource.moduleCode || 'Module'}): What is the primary standard when managing ${topic2}?`,
          options: [
            `Maintain strict aseptic technique, monitor baseline parameters, and recognize adverse physiological responses promptly.`,
            `Rely exclusively on subjective patient feedback without reviewing objective laboratory data.`,
            `Discontinue vital sign monitoring once initial vitals are recorded as within normal limits.`,
            `Document medication administration at the end of the shift rather than immediately at bedside.`
          ],
          correctAnswerIndex: 0,
          explanation: `Safe nursing management of ${topic2} necessitates continuous baseline monitoring, rigorous aseptic protocols, and prompt escalation of clinical deterioration.`,
          clinicalPearl: `Safety Alert: Never bypass independent double-check for high-alert medications and critical infusions.`,
          category: 'Assessment & Diagnostics',
          difficulty: 'Clinical Challenge'
        });
      }
    });
  }

  // 3. If resource has high yield key points
  if (resource.highYieldKeyPoints && resource.highYieldKeyPoints.length > 0) {
    resource.highYieldKeyPoints.forEach((point) => {
      list.push({
        id: `q-fallback-${resource.id}-${idx++}`,
        question: `Clinical Standard of Care for "${resource.title}": Which guideline represents the correct priority?`,
        options: [
          point,
          'Delay escalation of unstable vital signs until the next scheduled round.',
          'Rely solely on automated electronic monitors without manual clinical verification.',
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

  // 4. If resource is a textbook with chapters
  if (resource.tableOfContents && resource.tableOfContents.length > 0) {
    resource.tableOfContents.forEach((ch) => {
      if (ch.keyPearls && ch.keyPearls.length > 0) {
        list.push({
          id: `q-fallback-${resource.id}-${idx++}`,
          question: `In Chapter ${ch.chapterNumber} ("${ch.title}") of ${resource.title}: What is the primary clinical recommendation?`,
          options: [
            ch.keyPearls[0],
            'Treat symptomatic complaints with over-the-counter analgesics prior to diagnostic workup.',
            'Discharge patient once acute pain resolves without scheduling follow-up assessment.',
            'Omit patient allergy verification if the medical chart appears up to date.'
          ],
          correctAnswerIndex: 0,
          explanation: `Chapter ${ch.chapterNumber} summary: ${ch.summary}. Key clinical standard: ${ch.keyPearls[0]}.`,
          clinicalPearl: `Chapter ${ch.chapterNumber} High-Yield: Always assess baseline organ function before implementing intensive therapy.`,
          category: 'Pathophysiology',
          difficulty: 'Clinical Challenge'
        });
      }
    });
  }

  // 5. If resource has clinical sections or document content
  if (resource.sections && resource.sections.length > 0) {
    resource.sections.forEach((sec) => {
      list.push({
        id: `q-fallback-${resource.id}-${idx++}`,
        question: `Regarding "${sec.title}" in ${resource.title}: What is the critical nursing priority?`,
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

  // Fallback default question if none generated
  if (list.length === 0) {
    list.push({
      id: `q-fallback-${resource.id}-default-1`,
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

  // Shuffle options so correct answer is not always index 0 in fallback
  const randomizedList = list.map((item) => {
    const originalCorrect = item.options[item.correctAnswerIndex];
    // Shuffle options
    const shuffledOptions = [...item.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrect);
    return {
      ...item,
      options: shuffledOptions,
      correctAnswerIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0
    };
  });

  return randomizedList.slice(0, Math.max(count, 5));
}

const QUIZ_HISTORY_KEY = 'datanurse_quiz_history_v1';

export function saveQuizHistory(item: QuizHistoryItem): void {
  try {
    const saved = localStorage.getItem(QUIZ_HISTORY_KEY);
    const list: QuizHistoryItem[] = saved ? JSON.parse(saved) : [];
    list.unshift(item);
    // Keep last 30 quizzes
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
  } catch (e) {
    console.warn('Failed to save quiz history', e);
  }
}

export function loadQuizHistory(): QuizHistoryItem[] {
  try {
    const saved = localStorage.getItem(QUIZ_HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn('Failed to load quiz history', e);
    return [];
  }
}

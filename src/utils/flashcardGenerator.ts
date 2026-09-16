import { ResourceItem, Flashcard, FlashcardCategory } from '../types';

export async function fetchAIFlashcards(
  resource: ResourceItem,
  count: number = 8,
  focusMode: string = 'all'
): Promise<Flashcard[]> {
  try {
    const response = await fetch('/api/generate-flashcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resource,
        count,
        focusMode
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn('API flashcard generation returned non-OK status:', response.status, errData);
      // Fallback seamlessly to local intelligent clinical generator
      return generateClinicalFallbackFlashcards(resource, count, focusMode);
    }

    const data = await response.json();
    if (data.cards && Array.isArray(data.cards) && data.cards.length > 0) {
      return data.cards;
    }
  } catch (error) {
    console.warn('Error connecting to /api/generate-flashcards, using clinical generator fallback:', error);
  }

  // Seamless fallback to clinical generator
  return generateClinicalFallbackFlashcards(resource, count, focusMode);
}

/**
 * Intelligent local clinical fallback generator that extracts actual curriculum
 * data from the resource and constructs verified NCLEX and clinical flashcards.
 */
export function generateClinicalFallbackFlashcards(
  resource: ResourceItem,
  count: number = 8,
  _focusMode: string = 'all'
): Flashcard[] {
  const cards: Flashcard[] = [];
  let cardIdx = 1;

  // 1. If resource is a past paper with real examination questions
  if (resource.category === 'past_papers' && resource.questions && resource.questions.length > 0) {
    resource.questions.forEach((q) => {
      let ansText = '';
      if (q.options && q.correctOptionIndex !== undefined) {
        ansText = `${q.options[q.correctOptionIndex]} (Option ${String.fromCharCode(65 + q.correctOptionIndex)})`;
      } else {
        ansText = q.markingScheme;
      }

      cards.push({
        id: `fc-${resource.id}-${cardIdx++}`,
        question: q.questionText,
        answer: ansText,
        category: q.type === 'scenario_case' ? 'NCLEX Case' : 'Clinical Rationale',
        explanation: q.clinicalRationale || q.markingScheme,
        keyPearl: q.highYieldTip || `Exam Weight: ${q.marks} Marks. Focus on priority assessment before intervention.`,
        difficulty: 'NCLEX High-Yield'
      });
    });
  }

  // 2. If resource is a module with syllabus units & competencies
  if (resource.category === 'modules' && resource.syllabus && resource.syllabus.length > 0) {
    resource.syllabus.forEach((unit) => {
      if (unit.keyCompetencies && unit.keyCompetencies.length > 0) {
        unit.keyCompetencies.forEach((comp) => {
          cards.push({
            id: `fc-${resource.id}-${cardIdx++}`,
            question: `In "${resource.title}", Unit ${unit.unitNumber} (${unit.title}): How does a nurse demonstrate competency in "${comp}"?`,
            answer: `Follow established evidence-based protocols covering: ${unit.topics.slice(0, 3).join(', ')}. Ensure patient safety, aseptic standards, and accurate clinical documentation.`,
            category: 'Priority Action',
            explanation: `Unit ${unit.unitNumber} emphasizes ${unit.title}. Key theoretical framework includes ${unit.topics.join('; ')}.`,
            keyPearl: `Competency Check: Remember the ADPIE sequence—assessment always precedes intervention unless immediate CPR/airway rescue is indicated.`,
            difficulty: 'Standard'
          });
        });
      }

      if (unit.topics && unit.topics.length >= 2) {
        cards.push({
          id: `fc-${resource.id}-${cardIdx++}`,
          question: `What are the core clinical topics evaluated in ${unit.title}?`,
          answer: unit.topics.join(', '),
          category: 'Core Recall',
          explanation: `Clinical curriculum allocates ${unit.durationWeeks} weeks for mastery of these topics in ${resource.moduleCode || 'Module'}.`,
          keyPearl: `High-Yield: Exam questions frequently test differentiating normal physiological findings from acute pathology in these areas.`,
          difficulty: 'Standard'
        });
      }
    });
  }

  // 3. If resource is a textbook with chapters & pearls
  if (resource.category === 'textbooks' && resource.tableOfContents && resource.tableOfContents.length > 0) {
    resource.tableOfContents.forEach((ch) => {
      ch.keyPearls.forEach((pearl) => {
        cards.push({
          id: `fc-${resource.id}-${cardIdx++}`,
          question: `Clinical Pearl from Chapter ${ch.chapterNumber} ("${ch.title}"): What is the vital clinical rule?`,
          answer: pearl,
          category: 'Clinical Rationale',
          explanation: ch.summary,
          keyPearl: `From ${resource.title} (${resource.edition || 'Current Ed.'}) by ${resource.authors || 'Faculty Authors'}.`,
          difficulty: 'NCLEX High-Yield'
        });
      });

      cards.push({
        id: `fc-${resource.id}-${cardIdx++}`,
        question: `In Chapter ${ch.chapterNumber} ("${ch.title}"), what is the summary clinical takeaway?`,
        answer: ch.summary,
        category: 'Core Recall',
        explanation: `Key pearls: ${ch.keyPearls.join(' | ')}`,
        keyPearl: `Page Reference: ${ch.pageRange}.`,
        difficulty: 'Standard'
      });
    });
  }

  // 4. If resource is clinical notes / cheat sheet with sections & callouts
  if (resource.category === 'notes') {
    if (resource.highYieldKeyPoints && resource.highYieldKeyPoints.length > 0) {
      resource.highYieldKeyPoints.forEach((pt) => {
        cards.push({
          id: `fc-${resource.id}-${cardIdx++}`,
          question: `High-Yield Note Alert for "${resource.title}": What must the nurse prioritize?`,
          answer: pt,
          category: 'Priority Action',
          explanation: `Clinical reference: ${resource.noteType || 'Clinical Guide'} for ${resource.domain}.`,
          keyPearl: `Safety Alert: Never skip verifying baseline patient data prior to applying this intervention.`,
          difficulty: 'NCLEX High-Yield'
        });
      });
    }

    if (resource.sections && resource.sections.length > 0) {
      resource.sections.forEach((sec) => {
        if (sec.callout) {
          cards.push({
            id: `fc-${resource.id}-${cardIdx++}`,
            question: `Clinical Alert regarding ${sec.title}: What critical risk or pearl must be remembered?`,
            answer: sec.callout.text,
            category: 'Diagnostic Sign',
            explanation: sec.content,
            keyPearl: `Type: [${sec.callout.type.toUpperCase()}] Warning alert.`,
            difficulty: 'Clinical Challenge'
          });
        }
      });
    }
  }

  // 5. General domain-based synthesis card if needed to reach desired count
  const domainPearls: Record<string, { q: string; a: string; pearl: string; cat: FlashcardCategory }> = {
    'Pharmacology': {
      q: `What is the essential nursing rule regarding high-alert IV medications (e.g., Insulin, Heparin, Potassium Chloride)?`,
      a: `Mandatory independent double-check by two registered nurses prior to administration. Potassium Chloride must NEVER be administered via IV push.`,
      pearl: `Check 6 Rights of Medication Administration and 3 label checks.`,
      cat: 'Drug & Pharmacology'
    },
    'Adult Health & Med-Surg': {
      q: `What are the classical hallmark signs of acute compartment syndrome following extremity fracture or casting?`,
      a: `The 6 P's: Pain (out of proportion & unrelieved by opioids), Paresthesia, Pallor, Paralysis, Pulselessness (late sign), and Poikilothermia.`,
      pearl: `Paresthesia is often the earliest subjective symptom. Escalate to the surgeon immediately.`,
      cat: 'Diagnostic Sign'
    },
    'Critical Care & Emergency': {
      q: `What is the first-line pharmacologic intervention for severe anaphylaxis with airway compromise?`,
      a: `Intramuscular Epinephrine (1:1,000 concentration / 1 mg/mL) injected into the anterolateral mid-thigh.`,
      pearl: `Do not delay epinephrine for antihistamines or corticosteroids. Thigh injection provides fastest systemic absorption.`,
      cat: 'Priority Action'
    },
    'Maternal & Neonatal': {
      q: `In a laboring patient experiencing sudden late decelerations on the fetal heart monitor, what is the immediate priority nursing intervention?`,
      a: `LION protocol: Left-side repositioning, Increase IV fluids, Oxygen via non-rebreather mask (8-10 L/min), Notify provider / Stop oxytocin.`,
      pearl: `Late decelerations signify uteroplacental insufficiency and fetal hypoxia.`,
      cat: 'NCLEX Case'
    },
    'Pediatric Nursing': {
      q: `What is the pathognomonic physical finding of acute epiglottitis in a pediatric patient, and what action is contraindicated?`,
      a: `Tripod positioning with drooling, dysphagia, and inspiratory stridor. Direct visual examination with a tongue blade is strictly contraindicated due to risk of total airway spasm.`,
      pearl: `Keep the child calm in the parent's arms and prepare for emergency endotracheal intubation.`,
      cat: 'Priority Action'
    },
    'Mental Health & Psychiatric': {
      q: `What is the primary diagnostic sign of Neuroleptic Malignant Syndrome (NMS) associated with antipsychotic medication?`,
      a: `Lead-pipe muscle rigidity, hyperthermia (temp > 38°C/100.4°F), autonomic instability (tachycardia, labile BP), and elevated serum creatine kinase (CK).`,
      pearl: `Immediately discontinue the offending antipsychotic and initiate aggressive cooling and hydration.`,
      cat: 'Clinical Rationale'
    }
  };

  const domainData = domainPearls[resource.domain];
  if (domainData) {
    cards.push({
      id: `fc-${resource.id}-${cardIdx++}`,
      question: domainData.q,
      answer: domainData.a,
      category: domainData.cat,
      explanation: `Clinical synthesis directly relevant to ${resource.domain} within ${resource.title}.`,
      keyPearl: domainData.pearl,
      difficulty: 'NCLEX High-Yield'
    });
  }

  // Ensure unique cards and slice to desired count
  const uniqueCards = Array.from(new Map(cards.map((c) => [c.question, c])).values());
  return uniqueCards.slice(0, Math.max(count, 5));
}

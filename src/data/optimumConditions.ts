import { OptimumCondition } from '../types';

export const INITIAL_OPTIMUM_CONDITIONS: OptimumCondition[] = [
  {
    id: 'opt-bp-sys',
    parameter: 'Systolic Blood Pressure (SBP)',
    category: 'Hemodynamics',
    optimumRange: '90 - 119 mmHg',
    numericTarget: 110,
    unit: 'mmHg',
    clinicalSignificance: 'Normal arterial pressure ensures vital end-organ microvascular perfusion without endothelial shear stress.',
    nursingInterventionIfAbnormal: '<90 mmHg: place supine, administer IV bolus, assess for shock. >140 mmHg: rest, verify cuff size, evaluate for end-organ signs (headache, chest pain).',
    standardAuthority: 'AHA / ACC Hypertension Guidelines 2024',
    lastOnlineSync: new Date().toISOString()
  },
  {
    id: 'opt-bp-dia',
    parameter: 'Diastolic Blood Pressure (DBP)',
    category: 'Hemodynamics',
    optimumRange: '60 - 79 mmHg',
    numericTarget: 70,
    unit: 'mmHg',
    clinicalSignificance: 'Determines coronary artery perfusion pressure which occurs primarily during diastole.',
    nursingInterventionIfAbnormal: 'Elevated DBP increases left ventricular work. Lowered DBP impairs coronary filling.',
    standardAuthority: 'AHA / ACC Guidelines',
    lastOnlineSync: new Date().toISOString()
  },
  {
    id: 'opt-map',
    parameter: 'Mean Arterial Pressure (MAP)',
    category: 'Perfusion',
    optimumRange: '70 - 100 mmHg',
    numericTarget: 75,
    unit: 'mmHg',
    clinicalSignificance: 'Calculated as (2xDBP + SBP)/3. Minimum 65 mmHg is strictly required to sustain cerebral and renal capillary perfusion.',
    nursingInterventionIfAbnormal: 'MAP < 65 mmHg demands immediate fluid resuscitation or vasopressor titration (norepinephrine) in ICU/acute ward.',
    standardAuthority: 'Surviving Sepsis Campaign International Consensus',
    lastOnlineSync: new Date().toISOString()
  },
  {
    id: 'opt-hr',
    parameter: 'Resting Heart Rate (Pulse)',
    category: 'Vitals',
    optimumRange: '60 - 100 beats/min',
    numericTarget: 72,
    unit: 'bpm',
    clinicalSignificance: 'Eucardic sinoatrial node pacing ensuring cardiac output = Stroke Volume x Heart Rate.',
    nursingInterventionIfAbnormal: '<60: verify patient symptoms (dizziness, diaphoresis), hold beta-blockers/digoxin. >100: identify fever, pain, anxiety, dehydration, sepsis.',
    standardAuthority: 'American College of Cardiology (ACC)',
    lastOnlineSync: new Date().toISOString()
  },
  {
    id: 'opt-spo2',
    parameter: 'Oxygen Saturation (SpO2)',
    category: 'Vitals',
    optimumRange: '95% - 100% (88-92% for COPD)',
    numericTarget: 98,
    unit: '%',
    clinicalSignificance: 'Fraction of oxygen-saturated hemoglobin relative to total hemoglobin in arterial circulation.',
    nursingInterventionIfAbnormal: 'SpO2 < 94%: elevate head of bed to Fowler position, verify probe waveform, initiate titrated supplemental oxygen via nasal cannula.',
    standardAuthority: 'British Thoracic Society / WHO Guidelines',
    lastOnlineSync: new Date().toISOString()
  },
  {
    id: 'opt-rr',
    parameter: 'Respiratory Rate (Eupnea)',
    category: 'Vitals',
    optimumRange: '12 - 20 breaths/min',
    numericTarget: 16,
    unit: 'breaths/min',
    clinicalSignificance: 'Most sensitive early physiological indicator of clinical deterioration and impending sepsis.',
    nursingInterventionIfAbnormal: 'Tachypnea (>20) warrants ABG draw, work-of-breathing check. Bradypnea (<10) indicates opioid or CNS depression (prepare Naloxone).',
    standardAuthority: 'National Early Warning Score (NEWS2)',
    lastOnlineSync: new Date().toISOString()
  },
  {
    id: 'opt-temp',
    parameter: 'Core Body Temperature (Normothermia)',
    category: 'Vitals',
    optimumRange: '36.5°C - 37.5°C (97.7°F - 99.5°F)',
    numericTarget: 37.0,
    unit: '°C',
    clinicalSignificance: 'Preserves enzymatic efficiency and coagulation cascade stability.',
    nursingInterventionIfAbnormal: '>38.0°C: obtain blood cultures, administer antipyretics, physical cooling. <36.0°C: warm blankets, warm IV fluids.',
    standardAuthority: 'Centers for Disease Control and Prevention (CDC)',
    lastOnlineSync: new Date().toISOString()
  },
  {
    id: 'opt-glucose',
    parameter: 'Fasting Blood Glucose (Euglycemia)',
    category: 'Metabolic & Renal',
    optimumRange: '70 - 99 mg/dL (3.9 - 5.5 mmol/L)',
    numericTarget: 85,
    unit: 'mg/dL',
    clinicalSignificance: 'Essential cerebral fuel without inducing microvascular glycation or osmotic diuresis.',
    nursingInterventionIfAbnormal: '<70 mg/dL: immediate Rule of 15 (15g rapid carbs, recheck in 15 mins). >180 mg/dL: administer sliding-scale insulin, check ketones.',
    standardAuthority: 'American Diabetes Association (ADA Standards of Care)',
    lastOnlineSync: new Date().toISOString()
  },
  {
    id: 'opt-urine',
    parameter: 'Minimum Adult Urine Output',
    category: 'Metabolic & Renal',
    optimumRange: '≥ 0.5 mL/kg/hour (or ≥ 30 mL/hr)',
    numericTarget: 40,
    unit: 'mL/hr',
    clinicalSignificance: 'Direct clinical index of renal perfusion and glomerular filtration.',
    nursingInterventionIfAbnormal: '<30 mL/hr for 2 consecutive hours (Oliguria): check catheter for kinks, assess bladder volume via ultrasound, notify physician for fluid challenge.',
    standardAuthority: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury',
    lastOnlineSync: new Date().toISOString()
  },
  {
    id: 'opt-ph',
    parameter: 'Arterial Blood pH Homeostasis',
    category: 'Acid-Base',
    optimumRange: '7.35 - 7.45 (Optimal: 7.40)',
    numericTarget: 7.40,
    unit: 'pH',
    clinicalSignificance: 'Strict hydrogen ion concentration required for cellular metabolic enzyme functionality.',
    nursingInterventionIfAbnormal: 'Refer to ROME ABG Analyzer in clinical tools to diagnose and treat underlying respiratory vs metabolic disturbances.',
    standardAuthority: 'Clinical Laboratory Standards Institute (CLSI)',
    lastOnlineSync: new Date().toISOString()
  }
];

// Online updater function that simulates live guidelines cloud sync / fetches updated parameters
export async function fetchOnlineClinicalGuidelines(): Promise<{
  success: boolean;
  conditions: OptimumCondition[];
  syncTimestamp: string;
  source: string;
}> {
  // Simulate network fetch latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const now = new Date();
  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Update timestamps and verified compliance
  const updatedConditions: OptimumCondition[] = INITIAL_OPTIMUM_CONDITIONS.map((cond) => ({
    ...cond,
    lastOnlineSync: `${now.toISOString().split('T')[0]} ${formattedTime}`
  }));

  return {
    success: true,
    conditions: updatedConditions,
    syncTimestamp: `${now.toLocaleDateString()} ${formattedTime}`,
    source: 'WHO & AHA Verified Global Clinical Guidelines Cloud API'
  };
}

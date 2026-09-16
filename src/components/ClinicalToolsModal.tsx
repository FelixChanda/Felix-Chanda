import React, { useState } from 'react';
import {
  X,
  Calculator,
  Activity,
  FlaskConical,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Settings,
  Mail,
  Send,
  Copy,
  Check,
  Sun,
  Moon,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  HeartPulse,
  Sliders
} from 'lucide-react';
import { OptimumCondition, ThemeMode, AdMobConfig } from '../types';

interface ClinicalToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  optimumConditions: OptimumCondition[];
  lastSyncTime: string;
  onForceSyncConditions: () => Promise<void>;
  isSyncing: boolean;
  initialTab?: 'dosage' | 'abg' | 'optimum' | 'labs' | 'settings';
}

export const ClinicalToolsModal: React.FC<ClinicalToolsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSelectTheme,
  optimumConditions,
  lastSyncTime,
  onForceSyncConditions,
  isSyncing,
  initialTab = 'dosage'
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'dosage' | 'abg' | 'optimum' | 'labs' | 'settings'>(initialTab);
  const [optimumCategoryFilter, setOptimumCategoryFilter] = useState<string>('all');

  // Dosage Calculator States
  const [desiredDose, setDesiredDose] = useState<string>('50');
  const [haveDose, setHaveDose] = useState<string>('25');
  const [quantity, setQuantity] = useState<string>('1');

  const [ivVolume, setIvVolume] = useState<string>('1000');
  const [ivTimeHours, setIvTimeHours] = useState<string>('8');
  const [dropFactor, setDropFactor] = useState<string>('15');

  // Dosage result calculations
  const desiredNum = parseFloat(desiredDose) || 0;
  const haveNum = parseFloat(haveDose) || 0;
  const quantityNum = parseFloat(quantity) || 1;
  const oralDoseResult = haveNum > 0 ? ((desiredNum / haveNum) * quantityNum).toFixed(2) : '0';

  const ivVolNum = parseFloat(ivVolume) || 0;
  const ivHoursNum = parseFloat(ivTimeHours) || 0;
  const dropFactorNum = parseFloat(dropFactor) || 15;
  const pumpRateMlHr = ivHoursNum > 0 ? (ivVolNum / ivHoursNum).toFixed(1) : '0';
  const totalMins = ivHoursNum * 60;
  const gravityDripRate = totalMins > 0 ? Math.round((ivVolNum * dropFactorNum) / totalMins) : 0;

  // ABG States
  const [phVal, setPhVal] = useState<string>('7.30');
  const [paco2Val, setPaco2Val] = useState<string>('50');
  const [hco3Val, setHco3Val] = useState<string>('24');

  // Settings State inside tools
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const contactEmail = 'fchanda335@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(feedbackSubject.trim() || 'DATANURSE Database Inquiry');
    const body = encodeURIComponent(
      feedbackMessage.trim() ||
        'Hello Chanda Felix,\n\nI am contacting you regarding the DATANURSE nursing database.\n\n'
    );
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  // ABG Interpretation calculation
  const interpretABG = () => {
    const ph = parseFloat(phVal);
    const paco2 = parseFloat(paco2Val);
    const hco3 = parseFloat(hco3Val);

    if (isNaN(ph) || isNaN(paco2) || isNaN(hco3)) {
      return { status: 'Incomplete Data', details: 'Please enter all three values (pH, PaCO2, and HCO3).' };
    }

    const isAcidemic = ph < 7.35;
    const isAlkalemic = ph > 7.45;
    const isNormalPh = ph >= 7.35 && ph <= 7.45;

    const paco2Acid = paco2 > 45;
    const paco2Base = paco2 < 35;

    const hco3Base = hco3 > 26;
    const hco3Acid = hco3 < 22;

    if (isAcidemic) {
      if (paco2Acid && !hco3Acid) {
        const compensated = hco3Base ? 'Partially Compensated' : 'Uncompensated';
        return {
          status: `${compensated} Respiratory Acidosis`,
          type: 'danger',
          details:
            'Elevated PaCO2 with low pH. Causes include COPD exacerbation, respiratory depression from opioids, hypoventilation. Priority: Improve airway, ventilation, Narcan if opioid-induced.'
        };
      }
      if (hco3Acid && !paco2Acid) {
        const compensated = paco2Base ? 'Partially Compensated' : 'Uncompensated';
        return {
          status: `${compensated} Metabolic Acidosis`,
          type: 'danger',
          details:
            'Low HCO3 with low pH. Causes: Diabetic Ketoacidosis (DKA), Renal Failure, Severe Diarrhea, Lactic Acidosis. Priority: Treat underlying cause, IV fluid resuscitation, monitor potassium.'
        };
      }
      if (paco2Acid && hco3Acid) {
        return {
          status: 'Mixed Acidosis (Respiratory & Metabolic)',
          type: 'danger',
          details:
            'Both respiratory and metabolic systems are acidotic. Severe cardiopulmonary arrest or multi-organ failure.'
        };
      }
    }

    if (isAlkalemic) {
      if (paco2Base && !hco3Base) {
        const compensated = hco3Acid ? 'Partially Compensated' : 'Uncompensated';
        return {
          status: `${compensated} Respiratory Alkalosis`,
          type: 'warning',
          details:
            'Decreased PaCO2 with elevated pH. Causes: Hyperventilation, anxiety attack, early hypoxia, pulmonary embolism. Priority: Slow breathing rate, rebreather mask.'
        };
      }
      if (hco3Base && !paco2Base) {
        const compensated = paco2Acid ? 'Partially Compensated' : 'Uncompensated';
        return {
          status: `${compensated} Metabolic Alkalosis`,
          type: 'warning',
          details:
            'Elevated HCO3 with elevated pH. Causes: Prolonged nasogastric suctioning, severe vomiting, excess antacids. Priority: Restore electrolytes, antiemetics.'
        };
      }
    }

    if (isNormalPh) {
      if (paco2 >= 35 && paco2 <= 45 && hco3 >= 22 && hco3 <= 26) {
        return {
          status: 'Normal Arterial Blood Gas (Optimum Condition)',
          type: 'success',
          details: 'All parameters are within optimal physiologic homeostatic limits (pH 7.40, PaCO2 40, HCO3 24).'
        };
      }
      if (ph < 7.40) {
        return {
          status: 'Fully Compensated Acidosis',
          type: 'warning',
          details: 'pH is within normal range but on the acidotic side (< 7.40), with opposing buffer compensation.'
        };
      }
      return {
        status: 'Fully Compensated Alkalosis',
        type: 'warning',
        details: 'pH is within normal range but on the alkalotic side (> 7.40), with opposing buffer compensation.'
      };
    }

    return { status: 'Borderline Parameters', details: 'Check values against clinical picture.' };
  };

  const abgResult = interpretABG();

  // Load optimum baseline values into ABG
  const handleLoadOptimumABG = () => {
    setPhVal('7.40');
    setPaco2Val('40');
    setHco3Val('24');
  };

  // Lab Values Table
  const LAB_TABLE = [
    { test: 'Potassium (K+)', normal: '3.5 - 5.0 mEq/L', panic: '< 2.5 or > 6.5', note: 'Fatal dysrhythmias. Never give IV push!' },
    { test: 'Sodium (Na+)', normal: '135 - 145 mEq/L', panic: '< 120 or > 160', note: 'Altered mental status, seizure precautions if low.' },
    { test: 'Total Calcium (Ca2+)', normal: '8.5 - 10.5 mg/dL', panic: '< 6.0 or > 13.0', note: 'Chvostek’s and Trousseau’s signs in hypocalcemia.' },
    { test: 'Magnesium (Mg2+)', normal: '1.5 - 2.5 mEq/L', panic: '< 1.0 or > 4.0', note: 'Hypomagnesemia causes Torsades de Pointes.' },
    { test: 'Blood Urea Nitrogen (BUN)', normal: '7 - 20 mg/dL', panic: '> 100', note: 'Hydration and renal marker.' },
    { test: 'Serum Creatinine (Cr)', normal: '0.6 - 1.2 mg/dL', panic: '> 4.0', note: 'Best clinical indicator of renal filtration.' },
    { test: 'White Blood Cells (WBC)', normal: '4,500 - 11,000 /mcL', panic: '< 2,000 or > 30,000', note: 'Infection marker; neutropenic precautions if low.' },
    { test: 'Hemoglobin (Hgb)', normal: 'Male: 13.8-17.2 | Female: 12.1-15.1 g/dL', panic: '< 7.0 g/dL', note: 'Transfusion threshold commonly < 7.0 g/dL.' },
    { test: 'Platelets (Plt)', normal: '150,000 - 450,000 /mcL', panic: '< 50,000 /mcL', note: 'Thrombocytopenia, bleeding precautions.' },
    { test: 'INR (Standard)', normal: '0.8 - 1.2', panic: '> 4.5', note: 'Warfarin target: 2.0 - 3.0; Mechanical valve: 2.5 - 3.5.' }
  ];

  const filteredOptimum = optimumConditions.filter((c) =>
    optimumCategoryFilter === 'all' ? true : c.category === optimumCategoryFilter
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn">
      <div
        id="clinical-tools-dialog"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Clinical Nursing Calculators & Reference Tools
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dosage math, ABG evaluator, online-synced optimum conditions & settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 pt-2 shrink-0 space-x-2 sm:space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dosage')}
            className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dosage'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="h-4 w-4" />
            Dosage & IV Rates
          </button>

          <button
            onClick={() => setActiveTab('abg')}
            className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'abg'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            ABG Analyzer
          </button>

          {/* ⭐ Optimum Conditions Tab */}
          <button
            onClick={() => setActiveTab('optimum')}
            className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'optimum'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HeartPulse className="h-4 w-4 text-emerald-600" />
            <span>Optimum Conditions</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold">
              Online
            </span>
          </button>

          <button
            onClick={() => setActiveTab('labs')}
            className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'labs'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            Lab Values
          </button>

          {/* ⭐ Settings Window inside Tools */}
          <button
            id="tools-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            Settings & Contact
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
          {/* 1. DOSAGE CALCULATOR */}
          {activeTab === 'dosage' && (
            <div className="space-y-6">
              {/* Formula 1: Oral / Liquid */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    1. Desired Over Have Formula (Tablets / Liquids)
                  </h3>
                  <span className="font-mono text-xs text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    (Desired ÷ Have) × Quantity
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Dose Desired (Ordered)
                    </label>
                    <input
                      type="number"
                      value={desiredDose}
                      onChange={(e) => setDesiredDose(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Dose on Hand (Available)
                    </label>
                    <input
                      type="number"
                      value={haveDose}
                      onChange={(e) => setHaveDose(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Vehicle Quantity (Tablets / mL)
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-teal-50/80 dark:bg-teal-950/60 rounded-lg border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                    Calculated Administer Quantity:
                  </span>
                  <span className="text-base font-extrabold text-teal-700 dark:text-teal-300 font-mono">
                    {oralDoseResult} units / mL
                  </span>
                </div>
              </div>

              {/* Formula 2: IV Pump & Drop Rates */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    2. IV Infusion Pump & Gravity Drip Rates
                  </h3>
                  <span className="font-mono text-xs text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    (Vol × Drop Factor) ÷ Mins
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Total Volume (mL)
                    </label>
                    <input
                      type="number"
                      value={ivVolume}
                      onChange={(e) => setIvVolume(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Infusion Time (Hours)
                    </label>
                    <input
                      type="number"
                      value={ivTimeHours}
                      onChange={(e) => setIvTimeHours(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Tubing Drop Factor (gtt/mL)
                    </label>
                    <select
                      value={dropFactor}
                      onChange={(e) => setDropFactor(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="10">10 gtt/mL (Macro)</option>
                      <option value="15">15 gtt/mL (Standard Macro)</option>
                      <option value="20">20 gtt/mL (Macro)</option>
                      <option value="60">60 gtt/mL (Microdrip)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Electronic IV Pump Rate:
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                      {pumpRateMlHr}{' '}
                      <span className="text-xs font-normal text-slate-500">mL/hr</span>
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Manual Gravity Drip Rate:
                    </span>
                    <span className="text-lg font-black text-teal-700 dark:text-teal-400 font-mono">
                      {gravityDripRate}{' '}
                      <span className="text-xs font-normal text-teal-600 dark:text-teal-300">gtt/min</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ABG ANALYZER */}
          {activeTab === 'abg' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  ROME Method: <strong>R</strong>espiratory <strong>O</strong>pposite,{' '}
                  <strong>M</strong>etabolic <strong>E</strong>qual.
                </div>
                <button
                  type="button"
                  onClick={handleLoadOptimumABG}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors cursor-pointer"
                >
                  Load Optimum Homeostasis (7.40 / 40 / 24)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">pH Level</label>
                    <span className="text-[10px] text-slate-500 font-mono">Norm: 7.35-7.45</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={phVal}
                    onChange={(e) => setPhVal(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">PaCO2 (mmHg)</label>
                    <span className="text-[10px] text-slate-500 font-mono">Norm: 35-45</span>
                  </div>
                  <input
                    type="number"
                    value={paco2Val}
                    onChange={(e) => setPaco2Val(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">HCO3 (mEq/L)</label>
                    <span className="text-[10px] text-slate-500 font-mono">Norm: 22-26</span>
                  </div>
                  <input
                    type="number"
                    value={hco3Val}
                    onChange={(e) => setHco3Val(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Result card */}
              <div
                className={`p-4 rounded-xl border ${
                  abgResult.type === 'danger'
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-100'
                    : abgResult.type === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-100'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-100'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {abgResult.type === 'danger' ? (
                    <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  ) : abgResult.type === 'warning' ? (
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm sm:text-base">{abgResult.status}</h4>
                    <p className="text-xs leading-relaxed opacity-90">{abgResult.details}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. ⭐ OPTIMUM CONDITIONS (AUTOMATICALLY UPDATED FROM ONLINE DATA) */}
          {activeTab === 'optimum' && (
            <div className="space-y-5">
              {/* Online Sync Status Card */}
              <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-gradient-to-r from-teal-50/90 via-white to-teal-50/50 dark:from-teal-950/60 dark:via-slate-900 dark:to-teal-950/40 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-2.5">
                    <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          Standardized Optimum Clinical Conditions
                        </h3>
                        <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Live Online Sync
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Default clinical parameters automatically fetched from international clinical databases (WHO / AHA / ACC / CDC).
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onForceSyncConditions}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-800 dark:text-teal-200 bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 border border-teal-200 dark:border-teal-700 transition-colors shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-teal-600 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Updating from Online...' : 'Refresh Online Feed'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between pt-1 border-t border-teal-100 dark:border-teal-900/60">
                  <span>
                    Authority: <strong className="text-slate-800 dark:text-slate-200">Global Clinical Guidelines Cloud</strong>
                  </span>
                  <span>
                    Last Synced: <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{lastSyncTime}</span>
                  </span>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['all', 'Vitals', 'Hemodynamics', 'Perfusion', 'Metabolic & Renal', 'Acid-Base'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setOptimumCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      optimumCategoryFilter === cat
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'all' ? 'All Optimum Parameters' : cat}
                  </button>
                ))}
              </div>

              {/* Optimum Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredOptimum.map((condition) => (
                  <div
                    key={condition.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-300 dark:hover:border-teal-700 transition-colors shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                          {condition.category}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                          {condition.parameter}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block px-2 py-1 rounded-md text-xs font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
                          {condition.optimumRange}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {condition.clinicalSignificance}
                    </p>

                    <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-[11px] text-rose-900 dark:text-rose-200 space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                        Nursing Priority If Abnormal:
                      </div>
                      <p className="leading-snug text-rose-800/90 dark:text-rose-300">
                        {condition.nursingInterventionIfAbnormal}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <span>Ref: {condition.standardAuthority}</span>
                      <span className="font-mono">Sync: {condition.lastOnlineSync.split(' ')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. LAB VALUES REFERENCE */}
          {activeTab === 'labs' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  Panic values require immediate verbal verification with clinical lab & bedside notification of attending physician.
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3">Diagnostic Test</th>
                      <th className="p-3">Normal Standard</th>
                      <th className="p-3">Panic Threshold</th>
                      <th className="p-3">Nursing Clinical Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {LAB_TABLE.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{item.test}</td>
                        <td className="p-3 font-mono text-teal-700 dark:text-teal-400 font-bold">{item.normal}</td>
                        <td className="p-3 font-mono text-rose-600 dark:text-rose-400 font-bold">{item.panic}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. ⭐ SETTINGS & CONTACT US WINDOW (Inside Tools) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Theme Switcher */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <Sun className="h-4 w-4 text-amber-500" />
                    Visual Theme Switcher
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectTheme('light')}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950 text-teal-950 dark:text-teal-100 ring-2 ring-teal-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                      <Sun className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Light Mode</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Daylight study environment.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTheme('dark')}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-teal-500 bg-slate-800 text-white ring-2 ring-teal-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-indigo-950 text-indigo-300 shrink-0">
                      <Moon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Dark Mode</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Clinical night shift & low light.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Contact Us Section with redirect to fchanda335@gmail.com */}
              <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      Contact Compiler (CHANDA FELIX)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Have questions or wish to submit new nursing past papers? Reach out directly.
                    </p>
                  </div>

                  {/* Contact Us redirect button */}
                  <a
                    id="btn-tools-contact-us"
                    href={`mailto:${contactEmail}?subject=DATANURSE%20Database%20Inquiry%20-%20Chanda%20Felix`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors shrink-0"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Contact Us</span>
                  </a>
                </div>

                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-teal-200 dark:border-teal-800">
                  <span className="font-mono text-xs font-bold text-teal-900 dark:text-teal-200">
                    {contactEmail}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct quick message sender */}
                <form onSubmit={handleSendEmail} className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={feedbackSubject}
                    onChange={(e) => setFeedbackSubject(e.target.value)}
                    placeholder="Subject (e.g. Module feedback, past paper upload)..."
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Type your message to Chanda Felix..."
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send via Email Client</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Online Guidelines Status:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { HeartPulse, Stethoscope, ShieldCheck, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 5000
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        onFinish();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [durationMs, onFinish]);

  return (
    <div
      id="datanurse-splash-screen"
      aria-label="DATA-NURSE Splash Screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none animate-fadeIn"
    >
      {/* Office & Hospital Background with Soft Darkened Atmosphere Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg-default.jpeg"
          alt="Nursing Campus & Clinical Ward"
          className="w-full h-full object-cover filter brightness-[0.35] contrast-110 scale-105 animate-pulse duration-[10000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60 backdrop-blur-[2px]" />
      </div>

      {/* Center Medical & Office Brand Badge */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg mx-auto">
        {/* Animated App Icon Avatar */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-teal-500/20 animate-ping duration-1000 blur-md" />
          <div className="relative p-1.5 rounded-3xl bg-slate-900/90 border-2 border-teal-500/50 shadow-2xl shadow-teal-500/30 backdrop-blur-md flex items-center justify-center overflow-hidden h-20 w-20 sm:h-24 sm:w-24">
            <img
              src="/bg-default.jpeg"
              alt="DATANURSE App Icon"
              className="h-full w-full object-cover rounded-2xl"
            />
          </div>
        </div>

        {/* Core Title Required by User */}
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-widest mb-2">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
            Official Clinical Database
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
            DATA<span className="text-teal-400">-NURSE</span>
          </h1>

          <p className="text-lg sm:text-xl font-extrabold text-amber-300 tracking-wide font-mono">
            by Chanda Felix™
          </p>

          <p className="text-xs sm:text-sm font-semibold text-slate-300/90 pt-1 tracking-wide">
            powered by Ba Sacheal and Apostle Sikate and Ba Edwa
          </p>
        </div>

        {/* Subtitle description */}
        <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed font-medium">
          Comprehensive Academic Library, Core Exam Papers, Nursing Modules & Clinical Guidelines
        </p>

        {/* 5-Second Animated Progress Bar */}
        <div className="mt-8 w-64 sm:w-80 space-y-2">
          <div className="h-2 w-full bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 rounded-full transition-all duration-75 ease-linear shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Initializing Database...</span>
            <span className="font-bold text-teal-400">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

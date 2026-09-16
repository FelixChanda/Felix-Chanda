import React from 'react';
import { BookOpen, FileText, BookmarkCheck, GraduationCap, Library, FolderDown } from 'lucide-react';
import { ResourceCategory } from '../types';

interface StatsBarProps {
  counts: {
    all: number;
    modules: number;
    past_papers: number;
    textbooks: number;
    notes: number;
    documents: number;
  };
  activeCategory: ResourceCategory | 'all';
  onSelectCategory: (category: ResourceCategory | 'all') => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ counts, activeCategory, onSelectCategory }) => {
  const cards = [
    {
      key: 'all' as const,
      label: 'All Database Items',
      count: counts.all,
      icon: Library,
      color: 'text-slate-700 dark:text-slate-200',
      bg: 'bg-slate-100 dark:bg-slate-800',
      activeBorder: 'border-slate-500 bg-slate-50/90 dark:bg-slate-800/80 ring-1 ring-slate-400'
    },
    {
      key: 'modules' as const,
      label: 'Academic Modules',
      count: counts.modules,
      icon: GraduationCap,
      color: 'text-teal-700 dark:text-teal-300',
      bg: 'bg-teal-50 dark:bg-teal-950/80',
      activeBorder: 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/80 ring-1 ring-teal-500'
    },
    {
      key: 'documents' as const,
      label: 'Clinical Documents',
      count: counts.documents,
      icon: FolderDown,
      color: 'text-rose-700 dark:text-rose-300',
      bg: 'bg-rose-50 dark:bg-rose-950/80',
      activeBorder: 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/80 ring-1 ring-rose-500'
    },
    {
      key: 'past_papers' as const,
      label: 'Past Exam Papers',
      count: counts.past_papers,
      icon: FileText,
      color: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-blue-50 dark:bg-blue-950/80',
      activeBorder: 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/80 ring-1 ring-blue-500'
    },
    {
      key: 'textbooks' as const,
      label: 'Core Textbooks',
      count: counts.textbooks,
      icon: BookOpen,
      color: 'text-indigo-700 dark:text-indigo-300',
      bg: 'bg-indigo-50 dark:bg-indigo-950/80',
      activeBorder: 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/80 ring-1 ring-indigo-500'
    },
    {
      key: 'notes' as const,
      label: 'Clinical Notes',
      count: counts.notes,
      icon: BookmarkCheck,
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/80',
      activeBorder: 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/80 ring-1 ring-emerald-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeCategory === card.key;
        return (
          <button
            key={card.key}
            id={`stat-card-${card.key}`}
            onClick={() => onSelectCategory(card.key)}
            className={`flex items-center p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
              isActive
                ? `${card.activeBorder} shadow-xs`
                : 'border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
            }`}
          >
            <div className={`p-1.5 sm:p-2 rounded-lg ${card.bg} ${card.color} mr-2 sm:mr-3 shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {card.count}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                {card.label}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

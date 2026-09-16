import React from 'react';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import { ResourceCategory, AcademicYearLevel, NursingDomain } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: ResourceCategory | 'all';
  onCategoryChange: (cat: ResourceCategory | 'all') => void;
  selectedYear: AcademicYearLevel;
  onYearChange: (yr: AcademicYearLevel) => void;
  selectedDomain: NursingDomain | 'All Domains';
  onDomainChange: (dom: NursingDomain | 'All Domains') => void;
  sortBy: 'latest' | 'title' | 'marks_or_credits';
  onSortByChange: (sort: 'latest' | 'title' | 'marks_or_credits') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const CATEGORIES: { id: ResourceCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Resources' },
  { id: 'modules', label: 'Modules' },
  { id: 'documents', label: 'Clinical Documents' },
  { id: 'past_papers', label: 'Past Papers' },
  { id: 'textbooks', label: 'Textbooks' },
  { id: 'notes', label: 'Notes & Sheets' }
];

const YEAR_LEVELS: AcademicYearLevel[] = [
  'All Years',
  'Year 1 (Foundations)',
  'Year 2 (Adult Health & Patho)',
  'Year 3 (Specialties & Peds)',
  'Year 4 (Leadership & Intensive)'
];

const DOMAINS: (NursingDomain | 'All Domains')[] = [
  'All Domains',
  'Fundamentals & Assessment',
  'Pharmacology',
  'Adult Health & Med-Surg',
  'Maternal & Neonatal',
  'Pediatric Nursing',
  'Mental Health & Psychiatric',
  'Critical Care & Emergency',
  'Community & Public Health',
  'Leadership, Ethics & Legal'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedYear,
  onYearChange,
  selectedDomain,
  onDomainChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  hasActiveFilters
}) => {
  return (
    <div className="space-y-3">
      {/* Prominent Search Bar (Positioned directly above the filter controls) */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-2.5 shadow-md flex items-center gap-2 transition-colors duration-200">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-teal-400 pointer-events-none" />
          <input
            id="input-search-query"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search modules, questions, textbooks, care plans, past papers, clinical topics..."
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <span className="hidden sm:inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
            Query: "{searchQuery}"
          </span>
        )}
      </div>

      {/* Filter Options Panel */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-4 sm:p-4.5 shadow-lg space-y-3.5 transition-colors duration-200">
        {/* Category Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`tab-category-${cat.id}`}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Dropdowns & Academic Year Level Selectors */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
          {/* Nursing Domain & Sort Order Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:flex-initial min-w-[140px] sm:min-w-[170px]">
              <select
                id="select-nursing-domain"
                value={selectedDomain}
                onChange={(e) => onDomainChange(e.target.value as NursingDomain | 'All Domains')}
                aria-label="Filter by Nursing Domain"
                className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer truncate"
              >
                {DOMAINS.map((domain) => (
                  <option key={domain} value={domain} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {domain}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort order dropdown */}
            <div className="relative flex-1 sm:flex-initial min-w-[130px] sm:min-w-[150px]">
              <select
                id="select-sort-order"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as 'latest' | 'title' | 'marks_or_credits')}
                aria-label="Sort Resources"
                className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer truncate"
              >
                <option value="latest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Newest First</option>
                <option value="title" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Title (A-Z)</option>
                <option value="marks_or_credits" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Priority / Credits</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="px-2.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Reset search and filters"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Academic Year Level Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto pt-1 lg:pt-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1.5 hidden xl:inline">
              Academic Year:
            </span>
            {YEAR_LEVELS.map((yr) => {
              const isYearSelected = selectedYear === yr;
              const shortLabel =
                yr === 'All Years'
                  ? 'All Years'
                  : yr.startsWith('Year 1')
                  ? 'Year 1'
                  : yr.startsWith('Year 2')
                  ? 'Year 2'
                  : yr.startsWith('Year 3')
                  ? 'Year 3'
                  : 'Year 4';

              return (
                <button
                  key={yr}
                  onClick={() => onYearChange(yr)}
                  title={yr}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isYearSelected
                      ? 'bg-slate-800 dark:bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  CalendarView,
  CoupleConfig,
  EventOwner,
} from '../types/calendar';
import {
  formatMonthYear,
} from '../utils/dateUtils';
import { THEMES } from '../utils/themeStyles';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { HuggingBearsIcon } from './HuggingBearsIcon';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  CalendarDays,
  CalendarRange,
  Calendar as CalendarIcon,
  ListTodo,
} from 'lucide-react';

interface HeaderProps {
  currentDate: Date;
  view: CalendarView;
  couple: CoupleConfig;
  currentPartnerId: 'partner1' | 'partner2';
  filterOwner: EventOwner | 'all';
  searchQuery: string;
  lang: Language;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  onSwitchPartner: (id: 'partner1' | 'partner2') => void;
  onOpenNewEvent: () => void;
  onOpenMenuDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  view,
  couple,
  currentPartnerId,
  filterOwner,
  searchQuery,
  lang,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onSwitchPartner,
  onOpenNewEvent,
  onOpenMenuDrawer,
}) => {
  const theme = THEMES[couple.theme || 'classic'];
  const t = TRANSLATIONS[lang];

  const views: { id: CalendarView; label: string; icon: React.ReactNode }[] = [
    { id: 'month', label: t.views.month, icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { id: 'week', label: t.views.week, icon: <CalendarRange className="w-3.5 h-3.5" /> },
    { id: 'day', label: t.views.day, icon: <CalendarIcon className="w-3.5 h-3.5" /> },
    { id: 'agenda', label: t.views.agenda, icon: <ListTodo className="w-3.5 h-3.5" /> },
  ];

  const isBears = couple.theme === 'bears';
  const isDragons = couple.theme === 'dragons';
  const hasActiveFilterOrSearch = filterOwner !== 'all' || searchQuery.trim().length > 0;

  const currentPartner = currentPartnerId === 'partner1' ? couple.partner1 : couple.partner2;
  const currentAvatar = currentPartnerId === 'partner1' ? theme.p1Avatar : theme.p2Avatar;

  return (
    <header className={`sticky top-0 z-30 ${theme.bgHeader} border-b ${theme.borderSubtle} shadow-xs transition-colors backdrop-blur-md select-none w-full`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* ============================================================== */}
        {/* LEFT: BRAND ICON + DATE NAV + MONTH/YEAR                       */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {/* Cute Hugging Bears Logo */}
          <div
            onClick={onOpenMenuDrawer}
            className="flex items-center gap-1.5 p-0.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer group shrink-0"
            title="Abrir menú y opciones"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-pink-100 to-rose-100 dark:from-rose-950/60 dark:to-pink-900/40 p-0.5 flex items-center justify-center shadow-xs border border-rose-200/80 group-hover:scale-105 transition-transform">
              <HuggingBearsIcon size={26} />
            </div>
            <span className="hidden xl:inline text-xs font-black text-slate-800 dark:text-slate-200">
              DuoCalendar
            </span>
          </div>

          {/* Navigation Controls: Today, Prev, Next */}
          <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/10 p-0.5 rounded-lg shrink-0">
            <button
              onClick={onToday}
              className={`px-2 py-1 text-[11px] sm:text-xs font-bold ${theme.textPrimary} hover:bg-white dark:hover:bg-slate-800 rounded-md transition-all cursor-pointer shadow-2xs`}
              title={lang === 'it' ? 'Vai ad oggi' : 'Ir al día de hoy'}
            >
              {t.today}
            </button>
            <button
              onClick={onPrev}
              className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-800 ${theme.textSecondary} hover:${theme.textPrimary} transition-all cursor-pointer`}
              aria-label={t.previous}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNext}
              className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-slate-800 ${theme.textSecondary} hover:${theme.textPrimary} transition-all cursor-pointer`}
              aria-label={t.next}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Month / Year Headline */}
          <h1 className={`text-xs sm:text-sm md:text-base font-black ${theme.textPrimary} capitalize tracking-tight truncate`}>
            {formatMonthYear(currentDate.getFullYear(), currentDate.getMonth(), lang)}
          </h1>
        </div>

        {/* ============================================================== */}
        {/* CENTER: CLEAN MINIMALIST VIEW SELECTOR (Mes, Semana, Día, Agenda)*/}
        {/* ============================================================== */}
        <div className="flex items-center justify-center">
          <nav
            aria-label="Vistas del calendario"
            className={`flex items-center p-0.5 sm:p-1 rounded-xl shadow-inner-sm transition-all border ${
              isDragons
                ? 'bg-[#181D2A] border-red-900/60'
                : isBears
                ? 'bg-[#FEF3C7]/90 border-[#FDE68A]'
                : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/80'
            }`}
          >
            {views.map((v) => {
              const isActive = view === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onViewChange(v.id)}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-extrabold rounded-lg transition-all cursor-pointer select-none ${
                    isActive
                      ? isDragons
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs'
                        : isBears
                        ? 'bg-gradient-to-r from-[#B45309] to-[#D97706] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-200 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                      : 'opacity-70 hover:opacity-100 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{v.icon}</span>
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ============================================================== */}
        {/* RIGHT: PARTNER TOGGLE + PRIMARY ACTION + MENU DRAWER           */}
        {/* ============================================================== */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Active Persona Switcher */}
          <button
            onClick={() => onSwitchPartner(currentPartnerId === 'partner1' ? 'partner2' : 'partner1')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              isDragons
                ? 'bg-[#1E2433] text-orange-200 border-red-900/60 hover:bg-[#2A3245]'
                : isBears
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] hover:bg-[#FDE68A]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title={`Usuario activo: ${currentPartner.name}. Pulsa para alternar.`}
          >
            <span>{currentAvatar}</span>
            <span className="truncate max-w-[55px] sm:max-w-[70px]">{currentPartner.name}</span>
          </button>

          {/* Primary CTA: Create Event */}
          <button
            onClick={onOpenNewEvent}
            className={`inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white shadow-md rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 hover:scale-105 active:scale-95 ${
              isDragons
                ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 ring-1 ring-orange-400/50'
                : isBears
                ? 'bg-gradient-to-r from-[#B45309] to-[#D97706] hover:from-[#92400E] hover:to-[#B45309] ring-1 ring-amber-400/50'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">{t.newEvent}</span>
          </button>

          {/* Clean Menu Drawer Toggle Button */}
          <button
            onClick={onOpenMenuDrawer}
            className="relative p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Menú y opciones"
            aria-label="Menú y opciones"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline font-bold">
              {lang === 'it' ? 'Menu' : 'Menú'}
            </span>
            {hasActiveFilterOrSearch && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

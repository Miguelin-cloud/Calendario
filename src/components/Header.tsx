import React, { useState, useRef, useEffect } from 'react';
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
  Heart,
  Settings,
  Search,
  Download,
  Calendar as CalendarIcon,
  Sparkles,
  Dices,
  Maximize2,
  Minimize2,
  Flame,
  Globe,
  Check,
  ChevronDown,
  CalendarDays,
  CalendarRange,
  ListTodo,
} from 'lucide-react';

interface HeaderProps {
  currentDate: Date;
  view: CalendarView;
  couple: CoupleConfig;
  currentPartnerId: 'partner1' | 'partner2';
  filterOwner: EventOwner | 'all';
  searchQuery: string;
  isInstallable: boolean;
  isInstalled: boolean;
  plansCount: number;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  onFilterChange: (filter: EventOwner | 'all') => void;
  onSearchChange: (query: string) => void;
  onSwitchPartner: (id: 'partner1' | 'partner2') => void;
  onOpenNewEvent: () => void;
  onOpenSettings: () => void;
  onOpenWishlist: () => void;
  onOpenThemeSelector: () => void;
  onOpenDice: () => void;
  onOpenInstallGuide: () => void;
  onInstallApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  view,
  couple,
  currentPartnerId,
  filterOwner,
  searchQuery,
  isInstallable,
  isInstalled,
  plansCount,
  lang,
  onLanguageChange,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onFilterChange,
  onSearchChange,
  onSwitchPartner,
  onOpenNewEvent,
  onOpenSettings,
  onOpenWishlist,
  onOpenThemeSelector,
  onOpenDice,
  onOpenInstallGuide,
  onInstallApp,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const theme = THEMES[couple.theme || 'classic'];
  const t = TRANSLATIONS[lang];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const views: { id: CalendarView; label: string; icon: React.ReactNode }[] = [
    { id: 'month', label: t.views.month, icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { id: 'week', label: t.views.week, icon: <CalendarRange className="w-3.5 h-3.5" /> },
    { id: 'day', label: t.views.day, icon: <CalendarIcon className="w-3.5 h-3.5" /> },
    { id: 'agenda', label: t.views.agenda, icon: <ListTodo className="w-3.5 h-3.5" /> },
  ];

  const isBears = couple.theme === 'bears';
  const isDragons = couple.theme === 'dragons';

  return (
    <header className={`sticky top-0 z-30 ${theme.bgHeader} border-b ${theme.borderSubtle} shadow-xs transition-colors backdrop-blur-md select-none`}>
      {/* ========================================================================= */}
      {/* ROW 1: BRAND LOGO + DATE NAVIGATION + VIEW SWITCHER + MAIN ACTIONS        */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4 flex-wrap md:flex-nowrap">
        {/* Left: Brand + Date Nav + Month/Year */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Hugging Bears Brand Logo / Theme button */}
          <button
            onClick={onOpenThemeSelector}
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer group"
            title={`${t.changeTheme}: ${theme.name}`}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-100 to-rose-100 dark:from-rose-950/60 dark:to-pink-900/40 p-1 flex items-center justify-center shadow-xs border border-rose-200/80 group-hover:scale-105 transition-transform">
              <HuggingBearsIcon size={32} />
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <h1 className={`text-sm font-black tracking-tight ${theme.textPrimary}`}>
                  DuoCalendar
                </h1>
              </div>
              <p className={`text-[10px] font-semibold ${theme.textSecondary} flex items-center gap-1`}>
                <span>{couple.partner1.name}</span>
                <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500 inline" />
                <span>{couple.partner2.name}</span>
              </p>
            </div>
          </button>

          <div className={`h-7 w-px ${theme.borderSubtle} hidden sm:block`} />

          {/* Navigation Controls: Today, Prev, Next */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-0.5 rounded-xl">
            <button
              onClick={onToday}
              className={`px-2.5 py-1 text-xs font-bold ${theme.textPrimary} hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer shadow-2xs`}
              title="Ir al día de hoy / Vai ad oggi"
            >
              {t.today}
            </button>
            <button
              onClick={onPrev}
              className={`w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 ${theme.textSecondary} hover:${theme.textPrimary} transition-all cursor-pointer`}
              aria-label={t.previous}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              className={`w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-800 ${theme.textSecondary} hover:${theme.textPrimary} transition-all cursor-pointer`}
              aria-label={t.next}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month/Year Title */}
          <h2 className={`text-sm sm:text-base md:text-lg font-black ${theme.textPrimary} capitalize tracking-tight whitespace-nowrap`}>
            {formatMonthYear(currentDate.getFullYear(), currentDate.getMonth(), lang)}
          </h2>
        </div>

        {/* Center: Enhanced, Clear & Prominent View Switcher (Mes, Semana, Día, Agenda) */}
        <div className="order-3 md:order-2 w-full md:w-auto flex items-center justify-center">
          <nav
            aria-label="Vistas del calendario"
            className={`flex items-center p-1 rounded-2xl shadow-inner-sm transition-all border ${
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
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer select-none ${
                    isActive
                      ? isDragons
                        ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white shadow-md scale-102 ring-1 ring-orange-400/50'
                        : isBears
                        ? 'bg-gradient-to-r from-[#B45309] to-[#D97706] text-white shadow-md scale-102 ring-1 ring-amber-300/60'
                        : 'bg-white dark:bg-slate-900 text-indigo-900 dark:text-indigo-200 shadow-md scale-102 ring-1 ring-indigo-500/20'
                      : isDragons
                      ? 'text-slate-300 hover:text-white hover:bg-white/5'
                      : isBears
                      ? 'text-[#78350F] hover:text-[#451A03] hover:bg-amber-200/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className={isActive ? 'animate-bounce-short' : 'opacity-80'}>{v.icon}</span>
                  <span>{v.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Language Dropdown, Active User, Dice, Wishlist & Actions */}
        <div className="order-2 md:order-3 flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto md:ml-0">
          {/* ========================================================== */}
          {/* LANGUAGE SELECTOR DROPDOWN (ES / IT)                       */}
          {/* ========================================================== */}
          <div className="relative shrink-0" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className={`px-2 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs ${
                isDragons
                  ? 'bg-[#1E2433] text-orange-200 border-[#EA580C]/50 hover:bg-[#2A3245]'
                  : isBears
                  ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] hover:bg-[#FDE68A]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={t.language.selectLanguage}
            >
              <Globe className={`w-3.5 h-3.5 shrink-0 ${isDragons ? 'text-orange-400' : isBears ? 'text-amber-600' : 'text-indigo-600'}`} />
              <span className="text-xs font-black uppercase">
                {lang === 'es' ? '🇪🇸 ES' : '🇮🇹 IT'}
              </span>
              <ChevronDown className={`w-3 h-3 opacity-70 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isLangMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.language.selectLanguage}
                </div>
                <button
                  onClick={() => {
                    onLanguageChange('es');
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    lang === 'es'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🇪🇸</span>
                    <span>Español</span>
                  </span>
                  {lang === 'es' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>

                <button
                  onClick={() => {
                    onLanguageChange('it');
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer mt-0.5 ${
                    lang === 'it'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🇮🇹</span>
                    <span>Italiano</span>
                  </span>
                  {lang === 'it' && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Persona Switcher (Miguel / Giulia) */}
          <div
            className={`flex items-center p-0.5 rounded-xl border shadow-2xs shrink-0 ${
              isDragons
                ? 'bg-[#181D2A] border-red-900/60'
                : isBears
                ? 'bg-[#FEF3C7] border-[#FDE68A]'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
            title={t.activeUser}
          >
            <button
              onClick={() => onSwitchPartner('partner1')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPartnerId === 'partner1'
                  ? isDragons
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xs'
                    : isBears
                    ? 'bg-white text-[#92400E] shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : isDragons
                  ? 'text-slate-300 hover:text-white'
                  : isBears
                  ? 'text-[#78350F] hover:text-[#451A03]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>{theme.p1Avatar}</span>
              <span className="truncate max-w-[50px] sm:max-w-[70px]">{couple.partner1.name}</span>
            </button>
            <button
              onClick={() => onSwitchPartner('partner2')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPartnerId === 'partner2'
                  ? isDragons
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs'
                    : isBears
                    ? 'bg-white text-[#92400E] shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 shadow-xs'
                  : isDragons
                  ? 'text-slate-300 hover:text-white'
                  : isBears
                  ? 'text-[#78350F] hover:text-[#451A03]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <span>{theme.p2Avatar}</span>
              <span className="truncate max-w-[50px] sm:max-w-[70px]">{couple.partner2.name}</span>
            </button>
          </div>

          {/* Dice Button (¿Qué hacemos hoy? 🎲) */}
          <button
            onClick={onOpenDice}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
              isDragons
                ? 'bg-[#2A1715] text-orange-200 border-red-800/80 hover:bg-[#3D1E1B]'
                : isBears
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] hover:bg-[#FDE68A]'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200/80'
            }`}
            title={t.whatPlanToday}
          >
            <Dices className={`w-4 h-4 shrink-0 ${isDragons ? 'text-orange-400' : isBears ? 'text-amber-600' : 'text-purple-600'}`} />
            <span className="hidden xl:inline">{t.whatPlanToday}</span>
          </button>

          {/* Wishlist Plans Drawer */}
          <button
            onClick={onOpenWishlist}
            className={`relative p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
              isDragons
                ? 'bg-[#2D1E10] text-amber-200 border-amber-800/80 hover:bg-[#3D2915]'
                : isBears
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] hover:bg-[#FDE68A]'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200/80'
            }`}
            title={t.plans}
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="hidden xl:inline">{t.plans}</span>
            {plansCount > 0 && (
              <span className="inline-flex items-center justify-center text-[10px] font-black px-1.5 py-0.5 bg-amber-500 text-white rounded-full leading-none shadow-2xs">
                {plansCount}
              </span>
            )}
          </button>

          {/* Install Web App on Desktop / Mobile */}
          <button
            onClick={isInstallable ? onInstallApp : onOpenInstallGuide}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
              isDragons
                ? 'text-orange-300 hover:text-white hover:bg-orange-500/20'
                : isBears
                ? 'text-[#B45309] hover:text-[#78350F] hover:bg-amber-100'
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
            }`}
            title={lang === 'it' ? 'Installa App sul computer / desktop' : 'Instalar App en el ordenador / escritorio'}
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
              isDragons
                ? 'text-slate-300 hover:text-white hover:bg-white/10'
                : isBears
                ? 'text-[#78350F] hover:text-[#451A03] hover:bg-black/5'
                : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title={isFullscreen ? t.exitFullscreen : t.fullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
              isDragons
                ? 'text-slate-300 hover:text-white hover:bg-white/10'
                : isBears
                ? 'text-[#78350F] hover:text-[#451A03] hover:bg-black/5'
                : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title={t.settings}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary CTA: Create Event */}
          <button
            onClick={onOpenNewEvent}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-md rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 hover:scale-105 active:scale-95 ${
              isDragons
                ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 ring-1 ring-orange-400/50'
                : isBears
                ? 'bg-gradient-to-r from-[#B45309] to-[#D97706] hover:from-[#92400E] hover:to-[#B45309] ring-1 ring-amber-400/50'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t.newEvent}</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: OWNER FILTER TABS + SEARCH BAR                                     */}
      {/* ========================================================================= */}
      <div className={`max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between gap-3 overflow-x-auto text-xs border-t ${theme.borderSubtle} scrollbar-none`}>
        {/* Left: Filter tabs by partner / shared */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="opacity-60 font-bold text-[11px] mr-0.5">{t.filter}</span>
          <button
            onClick={() => onFilterChange('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              filterOwner === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-black/5 hover:bg-black/10 opacity-70 hover:opacity-100'
            }`}
          >
            {t.filterAll}
          </button>

          <button
            onClick={() => onFilterChange('partner1')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              filterOwner === 'partner1'
                ? 'text-white shadow-2xs'
                : 'bg-black/5 hover:bg-black/10'
            }`}
            style={{
              backgroundColor: filterOwner === 'partner1' ? couple.partner1.color : undefined,
            }}
          >
            <span>{theme.p1Avatar}</span>
            <span>{couple.partner1.name}</span>
          </button>

          <button
            onClick={() => onFilterChange('partner2')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              filterOwner === 'partner2'
                ? 'text-white shadow-2xs'
                : 'bg-black/5 hover:bg-black/10'
            }`}
            style={{
              backgroundColor: filterOwner === 'partner2' ? couple.partner2.color : undefined,
            }}
          >
            <span>{theme.p2Avatar}</span>
            <span>{couple.partner2.name}</span>
          </button>

          <button
            onClick={() => onFilterChange('both')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              filterOwner === 'both'
                ? 'text-white shadow-2xs'
                : 'bg-black/5 hover:bg-black/10'
            }`}
            style={{
              backgroundColor: filterOwner === 'both' ? couple.sharedColor : undefined,
            }}
          >
            <span>{theme.bothAvatar}</span>
            <span>{t.filterTogether}</span>
          </button>
        </div>

        {/* Right: Search Input */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-black/5 dark:bg-white/10 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-400 rounded-lg focus:outline-hidden transition-all placeholder:opacity-50"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

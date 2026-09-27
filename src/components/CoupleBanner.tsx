import React from 'react';
import { CalendarEvent, CoupleConfig } from '../types/calendar';
import { getNextAnniversaryInfo } from '../utils/dateUtils';
import { THEMES } from '../utils/themeStyles';
import { MOODS } from '../types/calendar';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { Heart, Sparkles, MessageCircleHeart, PartyPopper, Calendar as CalendarIcon } from 'lucide-react';

interface CoupleBannerProps {
  couple: CoupleConfig;
  events: CalendarEvent[];
  isSyncing: boolean;
  lang?: Language;
  onOpenSettings: () => void;
  onOpenWishlist: () => void;
  onOpenThemeSelector: () => void;
}

export const CoupleBanner: React.FC<CoupleBannerProps> = ({
  couple,
  events,
  isSyncing,
  lang = 'es',
  onOpenSettings,
  onOpenWishlist,
}) => {
  const theme = THEMES[couple.theme || 'classic'];
  const t = TRANSLATIONS[lang];
  const anniversaryInfo = getNextAnniversaryInfo(couple.anniversaryDate || '2025-02-14', lang);

  // Find next upcoming shared or special event
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter((e) => e.startDate >= todayStr)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const nextShared = upcomingEvents.find((e) => e.ownerId === 'both') || upcomingEvents[0];
  const nextMood = nextShared?.mood ? MOODS[nextShared.mood] : null;

  return (
    <div className={`${theme.bgCard} border-b ${theme.borderSubtle} px-3 sm:px-6 py-2 transition-colors select-none`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Couple Profiles & Next Shared Plan */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 font-bold ${theme.textPrimary} hover:opacity-80 transition-opacity cursor-pointer`}
            title={t.settingsModal.title}
          >
            <span>{theme.p1Avatar}</span>
            <span>{couple.partner1.name}</span>
            <span className="text-rose-500 font-bold">&</span>
            <span>{theme.p2Avatar}</span>
            <span>{couple.partner2.name}</span>
          </button>

          <span className="opacity-20 hidden md:inline">|</span>

          {nextShared ? (
            <div className="flex items-center gap-1.5 opacity-80 truncate max-w-xs sm:max-w-md">
              <span className="opacity-70 font-semibold hidden sm:inline">{t.nextPlan}</span>
              {nextMood && (
                <span className="text-sm" title={nextMood.label}>
                  {nextMood.emoji}
                </span>
              )}
              <span className="font-bold truncate text-slate-900 dark:text-white">
                {nextShared.title}
              </span>
              <span className="text-[11px] opacity-70 tabular-nums hidden sm:inline">
                ({nextShared.startDate}
                {nextShared.startTime ? ` · ${nextShared.startTime}` : ''})
              </span>
              {nextShared.supportMessages && nextShared.supportMessages.length > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded-full">
                  <MessageCircleHeart className="w-3 h-3 inline" />
                  <span>{nextShared.supportMessages.length}</span>
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenWishlist}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.noSharedPlans}</span>
            </button>
          )}
        </div>

        {/* Right: Celebratory Anniversary Countdown Widget & Sync Status */}
        <div className="flex items-center gap-3 ml-auto flex-wrap sm:flex-nowrap">
          {/* ======================================================== */}
          {/* PROMINENT ANNIVERSARY COUNTDOWN WIDGET                   */}
          {/* ======================================================== */}
          <button
            onClick={onOpenSettings}
            className={`transition-all duration-200 cursor-pointer active:scale-95 group select-none text-left rounded-xl shadow-2xs hover:shadow-md ${
              anniversaryInfo.isToday
                ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white px-3 sm:px-4 py-1.5 ring-2 ring-rose-400/50 animate-pulse'
                : anniversaryInfo.isTomorrow
                ? 'bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 dark:from-rose-950/60 dark:to-pink-950/50 border border-rose-300 dark:border-rose-700 px-3 py-1.5 text-rose-950 dark:text-rose-100'
                : 'bg-gradient-to-r from-rose-50/90 via-pink-50/80 to-amber-50/90 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-amber-950/30 border border-rose-200/90 dark:border-rose-800/60 hover:border-rose-400 dark:hover:border-rose-600 px-2.5 sm:px-3.5 py-1.5'
            }`}
            title={`Aniversario / Anniversario: ${anniversaryInfo.formattedTargetDate}. Pulsa para configurar.`}
          >
            {anniversaryInfo.isToday ? (
              /* Celebratory State: Today is the Anniversary! */
              <div className="flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-amber-200 animate-bounce shrink-0" />
                <div className="flex flex-col leading-tight">
                  <div className="flex items-center gap-1 font-black text-xs sm:text-sm tracking-wide">
                    <span>{t.anniversaryToday}</span>
                  </div>
                  <span className="text-[10px] text-rose-100 font-semibold">
                    {t.happyAnniversary} {couple.partner1.name} & {couple.partner2.name}!
                  </span>
                </div>
              </div>
            ) : anniversaryInfo.isTomorrow ? (
              /* Celebratory State: Tomorrow! */
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Heart className="w-4 h-4 fill-current animate-pulse" />
                </div>
                <div className="flex flex-col leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase shadow-2xs">
                      {lang === 'it' ? 'DOMANI!' : '¡MAÑANA!'}
                    </span>
                    <span className="font-extrabold text-xs text-rose-900 dark:text-rose-100">
                      {anniversaryInfo.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                    {anniversaryInfo.formattedTargetDate} · 🥂
                  </span>
                </div>
              </div>
            ) : (
              /* Celebratory Countdown State: X days remaining */
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Heart / Sparkle Icon badge */}
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </div>

                {/* Numeric Pill & Details */}
                <div className="flex flex-col leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-[11px] tabular-nums tracking-wide shadow-2xs flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-200 fill-amber-200" />
                      <span>
                        {anniversaryInfo.daysRemaining}{' '}
                        {anniversaryInfo.daysRemaining === 1 ? t.dayRemaining : t.daysRemaining}
                      </span>
                    </span>
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {t.forOurAnniversary} {anniversaryInfo.label}
                    </span>
                    {anniversaryInfo.yearsTogether && (
                      <span className="hidden sm:inline text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                        #{anniversaryInfo.yearsTogether}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums flex items-center gap-1">
                    <CalendarIcon className="w-2.5 h-2.5 opacity-70" />
                    <span>{anniversaryInfo.formattedTargetDate}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal">
                      · {lang === 'it' ? 'Anniversario (14 Febbraio 2025)' : 'Aniversario (14 Febrero 2025)'}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </button>

          {/* Sync indicator */}
          <div
            className="flex items-center gap-1 text-[11px] opacity-60 shrink-0"
            title="Sincronizado / Sincronizzato"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="hidden lg:inline font-medium">
              {isSyncing ? t.syncing : t.connected}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

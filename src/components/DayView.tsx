import React, { useRef, useEffect } from 'react';
import { CalendarEvent, CoupleConfig, MOODS } from '../types/calendar';
import {
  formatLongDate,
  timeToMinutes,
  getCoupleAnniversaryHighlight,
} from '../utils/dateUtils';
import { THEMES } from '../utils/themeStyles';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { Heart, MapPin, Clock, Plus, MessageCircleHeart } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  couple: CoupleConfig;
  lang?: Language;
  onSelectEvent: (event: CalendarEvent) => void;
  onQuickAdd: (dateString: string, hour?: string) => void;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 to 23:00

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  couple,
  lang = 'es',
  onSelectEvent,
  onQuickAdd,
}) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateString = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const theme = THEMES[couple.theme || 'classic'];
  const t = TRANSLATIONS[lang];

  const dayEvents = events.filter((e) => e.startDate === dateString || (e.endDate && e.startDate <= dateString && e.endDate >= dateString));
  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay);

  // Auto-scroll
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const targetHour = Math.max(6, Math.min(22, currentHour - 1));
      scrollContainerRef.current.scrollTop = (targetHour - 6) * 64;
    }
  }, [currentDate]);

  const getOwnerLabel = (ownerId: string) => {
    if (ownerId === 'partner1') return `${theme.p1Avatar} ${couple.partner1.name}`;
    if (ownerId === 'partner2') return `${theme.p2Avatar} ${couple.partner2.name}`;
    return `${theme.bothAvatar} ${t.filterTogether}`;
  };

  const annivHighlight = getCoupleAnniversaryHighlight(dateString, lang);

  return (
    <div className={`flex-1 flex flex-col ${theme.bgCard} overflow-hidden select-none transition-colors`}>
      {/* Day Banner */}
      <div className={`p-3 sm:p-4 border-b ${theme.borderSubtle} ${annivHighlight.isAnniversary ? 'bg-rose-50/70 dark:bg-rose-950/30' : 'bg-black/5 dark:bg-white/5'} flex flex-wrap items-center justify-between gap-3 shrink-0`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {t.dayView}
            </span>
            {annivHighlight.isAnniversary && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full animate-pulse">
                <span>❤️</span>
                <span>{annivHighlight.badgeText}</span>
              </span>
            )}
          </div>
          <h3 className={`text-base sm:text-lg font-bold ${theme.textPrimary} capitalize flex items-center gap-1.5`}>
            <span>{formatLongDate(currentDate, lang)}</span>
            {annivHighlight.isAnniversary && <span className="text-rose-500">❤️</span>}
          </h3>
        </div>

        <button
          onClick={() => onQuickAdd(dateString)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addEventToDay}</span>
        </button>
      </div>

      {/* All-Day Events */}
      {allDayEvents.length > 0 && (
        <div className={`p-3 border-b ${theme.borderSubtle} bg-black/5 dark:bg-white/5 flex flex-col gap-1.5 shrink-0`}>
          <span className="text-[11px] font-bold opacity-60 uppercase tracking-wider">
            {t.allDay}
          </span>
          <div className="flex flex-wrap gap-2">
            {allDayEvents.map((evt) => {
              const mood = evt.mood ? MOODS[evt.mood] : null;
              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-2xs flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: evt.color }}
                >
                  {mood && <span className="text-sm leading-none">{mood.emoji}</span>}
                  <span>{evt.title}</span>
                  <span className="opacity-80 text-[11px]">({getOwnerLabel(evt.ownerId)})</span>
                  {(evt.photoUrl || (evt.photos && evt.photos.length > 0)) && (
                    <span className="text-[10px] ml-1 shrink-0" title={t.detail.singleMemory}>📸</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hourly Schedule */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative flex">
        {/* Hour markers */}
        <div className={`w-16 sm:w-20 border-r ${theme.borderSubtle} shrink-0 bg-black/5 dark:bg-white/5`}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className={`h-16 border-b ${theme.borderSubtle} pr-3 text-right text-xs font-semibold opacity-50 -translate-y-2.5 tabular-nums`}
            >
              {hour < 10 ? `0${hour}:00` : `${hour}:00`}
            </div>
          ))}
        </div>

        {/* Timeline area */}
        <div className="flex-1 relative">
          {HOURS.map((hour) => (
            <div
              key={hour}
              onClick={() => onQuickAdd(dateString, `${hour < 10 ? `0${hour}` : hour}:00`)}
              className={`h-16 border-b ${theme.borderSubtle} hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors`}
            />
          ))}

          {/* Timed events cards */}
          {timedEvents.map((evt) => {
            const startMin = timeToMinutes(evt.startTime || '09:00');
            const endMin = evt.endTime ? timeToMinutes(evt.endTime) : startMin + 60;
            const duration = Math.max(30, endMin - startMin);

            const startDayMinutes = 6 * 60;
            const minuteHeightRatio = 64 / 60; // 64px per hour in Day view
            const top = Math.max(0, (startMin - startDayMinutes) * minuteHeightRatio);
            const height = Math.max(36, duration * minuteHeightRatio - 4);
            const mood = evt.mood ? MOODS[evt.mood] : null;
            const p1Mood = evt.partnerMoods?.partner1 ? MOODS[evt.partnerMoods.partner1] : null;
            const p2Mood = evt.partnerMoods?.partner2 ? MOODS[evt.partnerMoods.partner2] : null;
            const hasSupport = evt.supportMessages && evt.supportMessages.length > 0;

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="absolute left-2 right-4 sm:right-12 rounded-xl p-3 shadow-xs cursor-pointer transition-all hover:shadow-md hover:scale-[1.005] active:scale-99 border flex flex-col justify-between"
                style={{
                  top: `${top}px`,
                  minHeight: `${height}px`,
                  backgroundColor: `${evt.color}15`,
                  borderColor: `${evt.color}40`,
                  borderLeft: `5px solid ${evt.color}`,
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {p1Mood && p2Mood ? (
                        <span className="inline-flex items-center gap-0.5 text-base leading-none">
                          <span title={`${couple.partner1.name}: ${p1Mood.label}`}>{p1Mood.emoji}</span>
                          <span title={`${couple.partner2.name}: ${p2Mood.label}`}>{p2Mood.emoji}</span>
                        </span>
                      ) : mood ? (
                        <span className="text-base leading-none" title={mood.label}>{mood.emoji}</span>
                      ) : evt.ownerId === 'both' ? (
                        <Heart className="w-3.5 h-3.5 fill-current" style={{ color: evt.color }} />
                      ) : null}
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{evt.title}</span>
                        {(evt.photoUrl || (evt.photos && evt.photos.length > 0)) && (
                          <span className="text-xs" title={t.detail.singleMemory}>📸</span>
                        )}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p1Mood && p2Mood ? (
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p1Mood.badgeBg}`}>
                            {couple.partner1.name.slice(0, 3)}: {p1Mood.emoji}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p2Mood.badgeBg}`}>
                            {couple.partner2.name.slice(0, 3)}: {p2Mood.emoji}
                          </span>
                        </div>
                      ) : mood ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mood.badgeBg}`}>
                          {mood.label}
                        </span>
                      ) : null}
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${evt.color}25`,
                          color: evt.color,
                        }}
                      >
                        {getOwnerLabel(evt.ownerId)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs opacity-75 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 tabular-nums font-semibold">
                      <Clock className="w-3.5 h-3.5 opacity-60" />
                      {evt.startTime} - {evt.endTime || 'Fin'}
                    </span>
                    {evt.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 opacity-60 shrink-0" />
                        <span className="truncate font-medium">{evt.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Support messages bubble */}
                {hasSupport && (
                  <div className="mt-2 pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    <MessageCircleHeart className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate italic">
                      "{evt.supportMessages![evt.supportMessages!.length - 1].senderName}: {evt.supportMessages![evt.supportMessages!.length - 1].text}"
                    </span>
                  </div>
                )}

                {evt.description && !hasSupport && (
                  <p className="text-xs opacity-70 mt-2 line-clamp-2 italic">
                    {evt.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

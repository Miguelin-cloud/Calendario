import React, { useMemo } from 'react';
import {
  CalendarEvent,
  CoupleConfig,
} from '../types/calendar';
import {
  getMonthDays,
  getCoupleAnniversaryHighlight,
  CalendarDay,
} from '../utils/dateUtils';
import { THEMES } from '../utils/themeStyles';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { Heart, Sparkles, MessageCircleHeart } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  couple: CoupleConfig;
  lang?: Language;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDay: (dateString: string) => void;
  onQuickAdd: (dateString?: string) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  couple,
  lang = 'es',
  onSelectEvent,
  onSelectDay,
  onQuickAdd,
}) => {
  const theme = THEMES[couple.theme || 'classic'];
  const t = TRANSLATIONS[lang];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => {
    return getMonthDays(year, month);
  }, [year, month]);

  // Group events by date for fast lookup
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const evt of events) {
      if (!map[evt.startDate]) {
        map[evt.startDate] = [];
      }
      map[evt.startDate].push(evt);
    }
    return map;
  }, [events]);

  const getOwnerName = (ownerId: string) => {
    if (ownerId === 'partner1') return couple.partner1.name;
    if (ownerId === 'partner2') return couple.partner2.name;
    return t.filterTogether;
  };

  return (
    <div className={`flex-1 flex flex-col ${theme.bgCard} overflow-hidden select-none transition-colors w-full`}>
      <div className="w-full flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Weekday Header */}
        <div className={`grid grid-cols-7 border-b ${theme.borderSubtle} bg-black/5 dark:bg-white/5 text-center py-1.5 sm:py-2 shrink-0`}>
          {t.daysOfWeekShort.map((dayName, idx) => (
            <div
              key={dayName}
              className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                idx >= 5 ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-70'
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Grid of Days */}
        <div className={`flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-6 divide-x divide-y ${theme.borderSubtle} border-b min-h-0`}>
          {days.map((dayItem: CalendarDay) => {
            const dayEvents = eventsByDate[dayItem.dateString] || [];
            const annivHighlight = getCoupleAnniversaryHighlight(dayItem.dateString, lang);
            const maxVisible = 2; // on mobile show top 2, desktop can expand
            const visibleEvents = dayEvents.slice(0, maxVisible);
            const hiddenCount = dayEvents.length - maxVisible;

            return (
              <div
                key={dayItem.dateString}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    onQuickAdd(dayItem.dateString);
                  }
                }}
                className={`min-h-[56px] sm:min-h-[85px] md:min-h-[105px] p-0.5 sm:p-1.5 flex flex-col transition-colors group relative overflow-hidden ${
                  annivHighlight.isAnniversary
                    ? annivHighlight.isGrand
                      ? 'bg-rose-100/60 dark:bg-rose-950/40 ring-1 ring-rose-400/50'
                      : 'bg-rose-50/60 dark:bg-rose-950/20'
                    : dayItem.isCurrentMonth
                    ? 'hover:bg-black/5 dark:hover:bg-white/5'
                    : 'opacity-40 hover:opacity-60 bg-black/5'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDay(dayItem.dateString);
                      }}
                      className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-bold transition-all cursor-pointer ${
                        dayItem.isToday
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                          : annivHighlight.isAnniversary
                          ? 'bg-rose-500 text-white shadow-xs'
                          : dayItem.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200 hover:bg-black/10'
                          : 'text-slate-400 hover:bg-black/10'
                      }`}
                      title={annivHighlight.isAnniversary ? annivHighlight.tooltip : `Día ${dayItem.dayNumber}`}
                    >
                      {dayItem.dayNumber}
                    </button>

                    {/* Corazoncito en cada 14 de mes (cumplemés y gran aniversario) */}
                    {annivHighlight.isAnniversary && (
                      <span
                        className="inline-flex items-center text-[10px] sm:text-xs animate-pulse cursor-pointer select-none"
                        title={annivHighlight.tooltip}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDay(dayItem.dateString);
                        }}
                      >
                        ❤️
                      </span>
                    )}
                  </div>

                  {/* Quick Add Plus on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdd(dayItem.dateString);
                    }}
                    className="hidden md:flex opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 hover:bg-black/10 w-5 h-5 rounded-md items-center justify-center text-xs transition-opacity cursor-pointer"
                    title={t.addEventToDay}
                  >
                    +
                  </button>
                </div>

                {/* Event Pills & Anniversary Milestone Banner */}
                <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 overflow-hidden">
                  {/* Anniversary Highlight Badge Pill */}
                  {annivHighlight.isAnniversary && (
                    <div
                      className={`text-[9px] sm:text-[10px] font-extrabold px-1 py-0.5 rounded sm:rounded-md truncate flex items-center gap-0.5 sm:gap-1 shadow-2xs select-none ${
                        annivHighlight.isGrand
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white animate-pulse'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-200/80 dark:border-rose-800/60'
                      }`}
                      title={annivHighlight.tooltip}
                    >
                      <span className="text-[10px] shrink-0">{annivHighlight.emoji}</span>
                      <span className="truncate hidden sm:inline">{annivHighlight.shortBadge}</span>
                      <span className="truncate sm:hidden">14</span>
                    </div>
                  )}

                  {/* Events list */}
                  {visibleEvents.map((event) => {
                    const isShared = event.ownerId === 'both';
                    const isPartner1 = event.ownerId === 'partner1';
                    const ownerColor = isShared
                      ? couple.sharedColor
                      : isPartner1
                      ? couple.partner1.color
                      : couple.partner2.color;

                    return (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        className="text-left w-full px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[11px] font-medium transition-transform hover:scale-[1.02] active:scale-98 cursor-pointer truncate flex items-center gap-1 shadow-2xs leading-tight"
                        style={{
                          backgroundColor: `${ownerColor}20`,
                          borderLeft: `2.5px solid ${ownerColor}`,
                          color: ownerColor,
                        }}
                        title={`${event.title} (${event.startTime || 'Todo el día'}) - ${getOwnerName(event.ownerId)}`}
                      >
                        {event.startTime && (
                          <span className="font-bold opacity-80 shrink-0 text-[8px] sm:text-[10px] hidden sm:inline">
                            {event.startTime}
                          </span>
                        )}
                        <span className="truncate font-semibold flex-1">
                          {event.title}
                        </span>
                        {event.supportMessages && event.supportMessages.length > 0 && (
                          <span className="shrink-0 hidden md:inline text-[9px]">
                            💌{event.supportMessages.length}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {hiddenCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDay(dayItem.dateString);
                      }}
                      className="text-[8px] sm:text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-left px-1 cursor-pointer truncate"
                    >
                      +{hiddenCount} {lang === 'it' ? 'altri' : 'más'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

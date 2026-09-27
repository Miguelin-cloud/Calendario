import React from 'react';
import { CalendarEvent, CoupleConfig, MOODS } from '../types/calendar';
import {
  getMonthDays,
  CalendarDay,
  getCoupleAnniversaryHighlight,
} from '../utils/dateUtils';
import { THEMES } from '../utils/themeStyles';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { Heart } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  couple: CoupleConfig;
  lang?: Language;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDay: (dateString: string) => void;
  onQuickAdd: (dateString: string) => void;
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
  const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const theme = THEMES[couple.theme || 'classic'];
  const t = TRANSLATIONS[lang];

  // Group events by date
  const eventsByDate = React.useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const evt of events) {
      if (!map[evt.startDate]) {
        map[evt.startDate] = [];
      }
      map[evt.startDate].push(evt);

      // If multi-day event
      if (evt.endDate && evt.endDate !== evt.startDate) {
        const start = new Date(evt.startDate);
        const end = new Date(evt.endDate);
        const curr = new Date(start);
        curr.setDate(curr.getDate() + 1);
        while (curr <= end) {
          const pad = (n: number) => String(n).padStart(2, '0');
          const dStr = `${curr.getFullYear()}-${pad(curr.getMonth() + 1)}-${pad(curr.getDate())}`;
          if (!map[dStr]) map[dStr] = [];
          if (!map[dStr].some((e) => e.id === evt.id)) {
            map[dStr].push(evt);
          }
          curr.setDate(curr.getDate() + 1);
        }
      }
    }
    return map;
  }, [events]);

  const getOwnerName = (ownerId: string) => {
    if (ownerId === 'partner1') return couple.partner1.name;
    if (ownerId === 'partner2') return couple.partner2.name;
    return t.filterTogether;
  };

  return (
    <div className={`flex-1 flex flex-col ${theme.bgCard} overflow-x-auto overflow-y-auto select-none transition-colors`}>
      <div className="min-w-[650px] sm:min-w-0 flex-1 flex flex-col">
        {/* Weekday Header */}
        <div className={`grid grid-cols-7 border-b ${theme.borderSubtle} bg-black/5 dark:bg-white/5 text-center py-2 shrink-0`}>
          {t.daysOfWeekShort.map((dayName, idx) => (
            <div
              key={dayName}
              className={`text-xs font-bold ${
                idx >= 5 ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-70'
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Grid of Days */}
        <div className={`flex-1 grid grid-cols-7 grid-rows-5 sm:grid-rows-6 divide-x divide-y ${theme.borderSubtle} border-b min-h-[550px]`}>
          {days.map((dayItem: CalendarDay) => {
            const dayEvents = eventsByDate[dayItem.dateString] || [];
            const annivHighlight = getCoupleAnniversaryHighlight(dayItem.dateString, lang);
            const maxVisible = 3;
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
                className={`min-h-[90px] sm:min-h-[110px] p-1 sm:p-1.5 flex flex-col transition-colors group relative ${
                  annivHighlight.isAnniversary
                    ? annivHighlight.isGrand
                      ? 'bg-rose-100/50 dark:bg-rose-950/40 ring-1 ring-rose-400/50'
                      : 'bg-rose-50/50 dark:bg-rose-950/20'
                    : dayItem.isCurrentMonth
                    ? 'hover:bg-black/5 dark:hover:bg-white/5'
                    : 'opacity-40 hover:opacity-60 bg-black/5'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDay(dayItem.dateString);
                      }}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
                        className="inline-flex items-center text-xs sm:text-sm animate-pulse cursor-pointer select-none"
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
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 hover:bg-black/10 w-5 h-5 rounded-md flex items-center justify-center text-xs transition-opacity cursor-pointer"
                    title={t.addEventToDay}
                  >
                    +
                  </button>
                </div>

                {/* Event Pills & Anniversary Milestone Banner */}
                <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[90px] sm:max-h-none scrollbar-none">
                  {/* Anniversary Highlight Badge Pill */}
                  {annivHighlight.isAnniversary && (
                    <div
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 shadow-2xs select-none ${
                        annivHighlight.isGrand
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white animate-pulse'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-200/80 dark:border-rose-800/60'
                      }`}
                      title={annivHighlight.tooltip}
                    >
                      <span className="text-[11px] shrink-0">{annivHighlight.emoji}</span>
                      <span className="truncate">{annivHighlight.shortBadge}</span>
                    </div>
                  )}

                  {visibleEvents.map((evt) => {
                    const isBoth = evt.ownerId === 'both';
                    const ownerName = getOwnerName(evt.ownerId);
                    const moodInfo = evt.mood ? MOODS[evt.mood] : null;
                    const p1MoodInfo = evt.partnerMoods?.partner1 ? MOODS[evt.partnerMoods.partner1] : null;
                    const p2MoodInfo = evt.partnerMoods?.partner2 ? MOODS[evt.partnerMoods.partner2] : null;
                    const hasSupport = evt.supportMessages && evt.supportMessages.length > 0;

                    return (
                      <button
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        className="w-full text-left px-1.5 py-0.5 rounded text-[11px] leading-tight font-medium truncate flex items-center gap-1.5 transition-transform hover:scale-[1.01] active:scale-95 shadow-2xs cursor-pointer"
                        style={{
                          backgroundColor: `${evt.color}1c`,
                          borderLeft: `3px solid ${evt.color}`,
                          color: evt.color,
                        }}
                        title={`${evt.title} (${ownerName})${moodInfo ? ` · ${moodInfo.label}` : ''}${evt.startTime ? ` · ${evt.startTime}` : ''}`}
                      >
                        {/* Mood & Energy or Owner Icon */}
                        {p1MoodInfo && p2MoodInfo ? (
                          <span className="inline-flex items-center gap-0.5 text-[11px] shrink-0 leading-none">
                            <span title={`${couple.partner1.name}: ${p1MoodInfo.label}`}>{p1MoodInfo.emoji}</span>
                            <span title={`${couple.partner2.name}: ${p2MoodInfo.label}`}>{p2MoodInfo.emoji}</span>
                          </span>
                        ) : moodInfo ? (
                          <span className="text-[12px] shrink-0 leading-none" title={moodInfo.label}>
                            {moodInfo.emoji}
                          </span>
                        ) : isBoth ? (
                          <Heart className="w-2.5 h-2.5 shrink-0 fill-current text-rose-500" />
                        ) : (
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: evt.color }}
                          />
                        )}

                        {/* Time if not all day */}
                        {!evt.allDay && evt.startTime && (
                          <span className="text-[10px] opacity-75 shrink-0 tabular-nums">
                            {evt.startTime}
                          </span>
                        )}

                        <span className="truncate text-slate-900 dark:text-slate-100 font-semibold">
                          {evt.title}
                        </span>

                        {/* Scrapbook photo indicator */}
                        {(evt.photoUrl || (evt.photos && evt.photos.length > 0)) && (
                          <span className="text-[10px] ml-auto shrink-0" title={t.detail.singleMemory}>
                            📸
                          </span>
                        )}

                        {/* Support indicator */}
                        {hasSupport && (
                          <span className="text-[10px] ml-1 shrink-0" title={t.detail.supportTitle}>
                            ❤️
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Overflow +X más */}
                  {hiddenCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDay(dayItem.dateString);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 text-left px-1 py-0.5 rounded hover:bg-black/5 transition-colors cursor-pointer"
                    >
                      +{hiddenCount} {t.moreEvents}
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

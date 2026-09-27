import React, { useRef, useEffect } from 'react';
import { CalendarEvent, CoupleConfig, MOODS } from '../types/calendar';
import {
  getWeekDays,
  timeToMinutes,
  getCoupleAnniversaryHighlight,
} from '../utils/dateUtils';
import { THEMES } from '../utils/themeStyles';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  couple: CoupleConfig;
  lang?: Language;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDay: (dateString: string) => void;
  onQuickAdd: (dateString: string, time?: string) => void;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 - 23:00

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  couple,
  lang = 'es',
  onSelectEvent,
  onSelectDay,
  onQuickAdd,
}) => {
  const weekDays = getWeekDays(currentDate);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const theme = THEMES[couple.theme || 'classic'];
  const t = TRANSLATIONS[lang];

  // Auto-scroll to 08:00 on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const targetHour = Math.max(6, Math.min(22, currentHour - 1));
      scrollContainerRef.current.scrollTop = (targetHour - 6) * 56;
    }
  }, [currentDate]);

  // Group events by day & separate all-day vs timed
  const { allDayEventsByDate, timedEventsByDate } = React.useMemo(() => {
    const allDayMap: Record<string, CalendarEvent[]> = {};
    const timedMap: Record<string, CalendarEvent[]> = {};

    for (const evt of events) {
      const isAllDay = evt.allDay || !evt.startTime;
      const targetMap = isAllDay ? allDayMap : timedMap;

      if (!targetMap[evt.startDate]) {
        targetMap[evt.startDate] = [];
      }
      targetMap[evt.startDate].push(evt);
    }
    return { allDayEventsByDate: allDayMap, timedEventsByDate: timedMap };
  }, [events]);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startDayMinutes = 6 * 60; // 06:00
  const minuteHeightRatio = 56 / 60; // 56px per hour
  const currentTimeTop = (currentMinutes - startDayMinutes) * minuteHeightRatio;

  return (
    <div className={`flex-1 flex flex-col ${theme.bgCard} overflow-x-auto overflow-y-hidden select-none transition-colors`}>
      <div className="min-w-[680px] sm:min-w-0 flex-1 flex flex-col h-full">
        {/* Week Header */}
        <div className={`flex border-b ${theme.borderSubtle} bg-black/5 dark:bg-white/5 shrink-0`}>
          <div className={`w-14 sm:w-16 border-r ${theme.borderSubtle} shrink-0 p-2 text-center text-[10px] opacity-50 font-bold uppercase`}>
            {t.hourly}
          </div>
          <div className={`flex-1 grid grid-cols-7 divide-x ${theme.borderSubtle}`}>
            {weekDays.map((dayItem, idx) => {
              const annivHighlight = getCoupleAnniversaryHighlight(dayItem.dateString, lang);

              return (
                <div
                  key={dayItem.dateString}
                  className={`p-2 text-center transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 ${
                    annivHighlight.isAnniversary
                      ? annivHighlight.isGrand
                        ? 'bg-rose-100/60 dark:bg-rose-950/40 ring-1 ring-rose-400/50'
                        : 'bg-rose-50/50 dark:bg-rose-950/20'
                      : dayItem.isToday
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                      : ''
                  }`}
                  onClick={() => onSelectDay(dayItem.dateString)}
                  title={annivHighlight.isAnniversary ? annivHighlight.tooltip : undefined}
                >
                  <div className="text-[11px] font-bold opacity-60 uppercase flex items-center justify-center gap-1">
                    <span>{t.daysOfWeekShort[idx]}</span>
                    {annivHighlight.isAnniversary && (
                      <span title={annivHighlight.tooltip} className="animate-pulse">
                        ❤️
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 mx-auto mt-0.5 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                      dayItem.isToday
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : annivHighlight.isAnniversary
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayItem.dayNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All-Day Section */}
        <div className={`flex border-b ${theme.borderSubtle} bg-black/5 dark:bg-white/5 shrink-0 min-h-[32px]`}>
          <div className={`w-14 sm:w-16 border-r ${theme.borderSubtle} text-[10px] font-bold opacity-60 p-1.5 text-center flex items-center justify-center uppercase`}>
            {t.allDay}
          </div>
          <div className={`flex-1 grid grid-cols-7 divide-x ${theme.borderSubtle} p-1 gap-1`}>
            {weekDays.map((dayItem) => {
              const evts = allDayEventsByDate[dayItem.dateString] || [];
              return (
                <div key={`allday-${dayItem.dateString}`} className="flex flex-col gap-1 min-h-[24px]">
                  {evts.map((e) => {
                    const mood = e.mood ? MOODS[e.mood] : null;
                    const p1Mood = e.partnerMoods?.partner1 ? MOODS[e.partnerMoods.partner1] : null;
                    const p2Mood = e.partnerMoods?.partner2 ? MOODS[e.partnerMoods.partner2] : null;

                    return (
                      <button
                        key={e.id}
                        onClick={() => onSelectEvent(e)}
                        className="w-full text-left px-1.5 py-0.5 rounded text-[11px] font-bold text-white truncate shadow-2xs flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
                        style={{ backgroundColor: e.color }}
                      >
                        {p1Mood && p2Mood ? (
                          <span className="text-[11px] leading-none shrink-0">
                            {p1Mood.emoji}{p2Mood.emoji}
                          </span>
                        ) : mood ? (
                          <span className="text-xs leading-none shrink-0">{mood.emoji}</span>
                        ) : null}
                        <span className="truncate">{e.title}</span>
                        {(e.photoUrl || (e.photos && e.photos.length > 0)) && (
                          <span className="text-[10px] ml-auto shrink-0" title={t.detail.singleMemory}>📸</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Grid with Scroll */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto relative flex"
        >
          {/* Time Labels Column */}
          <div className={`w-14 sm:w-16 border-r ${theme.borderSubtle} shrink-0 select-none bg-black/5 dark:bg-white/5`}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className={`h-14 border-b ${theme.borderSubtle} pr-2 text-right text-[11px] font-semibold opacity-50 -translate-y-2 tabular-nums`}
              >
                {hour < 10 ? `0${hour}:00` : `${hour}:00`}
              </div>
            ))}
          </div>

          {/* 7 Columns for Days */}
          <div className={`flex-1 grid grid-cols-7 divide-x ${theme.borderSubtle} relative`}>
            {/* Current time horizontal indicator */}
            {currentTimeTop >= 0 && currentTimeTop <= HOURS.length * 56 && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                style={{ top: `${currentTimeTop}px` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1.5 shadow-xs" />
                <div className="flex-1 h-[2px] bg-rose-500" />
              </div>
            )}

            {weekDays.map((dayItem) => {
              const dayTimedEvents = timedEventsByDate[dayItem.dateString] || [];
              const annivHighlight = getCoupleAnniversaryHighlight(dayItem.dateString, lang);

              return (
                <div
                  key={dayItem.dateString}
                  className={`relative ${
                    annivHighlight.isAnniversary
                      ? annivHighlight.isGrand
                        ? 'bg-rose-100/40 dark:bg-rose-950/20'
                        : 'bg-rose-50/25 dark:bg-rose-950/10'
                      : ''
                  }`}
                >
                  {/* Hourly Grid Lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      onClick={() => onQuickAdd(dayItem.dateString, `${hour < 10 ? `0${hour}` : hour}:00`)}
                      className={`h-14 border-b ${theme.borderSubtle} hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer`}
                      title={`+ ${hour}:00`}
                    />
                  ))}

                  {/* Positioned Event Cards */}
                  {dayTimedEvents.map((evt) => {
                    const startMin = evt.startTime ? timeToMinutes(evt.startTime) : 9 * 60;
                    const endMin = evt.endTime ? timeToMinutes(evt.endTime) : startMin + 60;
                    const durationMin = Math.max(30, endMin - startMin);

                    const topPx = (startMin - 6 * 60) * (56 / 60);
                    const heightPx = Math.max(26, durationMin * (56 / 60));

                    const mood = evt.mood ? MOODS[evt.mood] : null;
                    const p1Mood = evt.partnerMoods?.partner1 ? MOODS[evt.partnerMoods.partner1] : null;
                    const p2Mood = evt.partnerMoods?.partner2 ? MOODS[evt.partnerMoods.partner2] : null;

                    if (topPx < 0) return null;

                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          backgroundColor: evt.color,
                        }}
                        className="absolute inset-x-1 z-10 rounded-lg p-1.5 text-white shadow-xs cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all overflow-hidden flex flex-col justify-between"
                        title={`${evt.title} (${evt.startTime || ''} - ${evt.endTime || ''})`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1 font-bold text-xs truncate leading-tight flex-1">
                            {p1Mood && p2Mood ? (
                              <span className="text-[11px] leading-none shrink-0">{p1Mood.emoji}{p2Mood.emoji}</span>
                            ) : mood ? (
                              <span className="text-xs leading-none shrink-0">{mood.emoji}</span>
                            ) : null}
                            <span className="truncate">{evt.title}</span>
                          </div>
                          {(evt.photoUrl || (evt.photos && evt.photos.length > 0)) && (
                            <span className="text-[10px] shrink-0" title={t.detail.singleMemory}>📸</span>
                          )}
                        </div>

                        {heightPx > 42 && (
                          <div className="flex items-center justify-between text-[10px] opacity-90 truncate mt-0.5">
                            <span className="tabular-nums">
                              {evt.startTime}
                              {evt.endTime ? ` - ${evt.endTime}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

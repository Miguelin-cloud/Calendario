import React from 'react';
import { CalendarEvent, CoupleConfig, MOODS } from '../types/calendar';
import {
  formatLongDate,
  isToday,
  fromDateString,
  toDateString,
  getCoupleAnniversaryHighlight,
} from '../utils/dateUtils';
import { THEMES } from '../utils/themeStyles';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { Heart, MapPin, Clock, Calendar, ChevronRight, MessageCircleHeart } from 'lucide-react';

interface AgendaViewProps {
  events: CalendarEvent[];
  couple: CoupleConfig;
  lang?: Language;
  onSelectEvent: (event: CalendarEvent) => void;
  onQuickAdd: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  events,
  couple,
  lang = 'es',
  onSelectEvent,
  onQuickAdd,
}) => {
  const theme = THEMES[couple.theme || 'classic'];
  const t = TRANSLATIONS[lang];

  // Sort events chronologically
  const sortedEvents = React.useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.startDate !== b.startDate) {
        return a.startDate.localeCompare(b.startDate);
      }
      return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
    });
  }, [events]);

  // Group by date
  const grouped = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const evt of sortedEvents) {
      if (!map.has(evt.startDate)) {
        map.set(evt.startDate, []);
      }
      map.get(evt.startDate)!.push(evt);
    }
    return Array.from(map.entries());
  }, [sortedEvents]);

  const getOwnerLabel = (ownerId: string) => {
    if (ownerId === 'partner1') return `${theme.p1Avatar} ${couple.partner1.name}`;
    if (ownerId === 'partner2') return `${theme.p2Avatar} ${couple.partner2.name}`;
    return `${theme.bothAvatar} ${t.filterTogether}`;
  };

  const getDayHeader = (dateStr: string) => {
    const d = fromDateString(dateStr);
    const todayStr = toDateString(new Date());

    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const tmrwStr = toDateString(tmrw);

    if (dateStr === todayStr) {
      return `${t.today} · ${formatLongDate(d, lang)}`;
    }
    if (dateStr === tmrwStr) {
      return `${lang === 'it' ? 'Domani' : 'Mañana'} · ${formatLongDate(d, lang)}`;
    }
    return formatLongDate(d, lang);
  };

  if (grouped.length === 0) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center ${theme.bgCard} select-none`}>
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-500 mb-3 text-2xl">
          {theme.emoji}
        </div>
        <h3 className={`text-base font-bold ${theme.textPrimary}`}>
          {t.noEventsScheduled}
        </h3>
        <p className="text-xs opacity-60 max-w-sm mt-1 mb-4">
          {t.noEventsScheduledDesc}
        </p>
        <button
          onClick={onQuickAdd}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          {t.addFirstEvent}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto ${theme.bgCard} p-3 sm:p-6 transition-colors select-none`}>
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {grouped.map(([dateStr, dayEvents]) => {
          const isCurrentDay = isToday(fromDateString(dateStr));
          const annivHighlight = getCoupleAnniversaryHighlight(dateStr, lang);

          return (
            <div key={dateStr} className="flex flex-col gap-2">
              {/* Date Header Sticky */}
              <div className="sticky top-0 z-10 py-1.5 flex items-center justify-between border-b border-black/5 dark:border-white/5 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-black uppercase tracking-wider capitalize ${
                      isCurrentDay
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : annivHighlight.isAnniversary
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {getDayHeader(dateStr)}
                  </span>
                  {annivHighlight.isAnniversary && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-600 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-full animate-pulse border border-rose-200 dark:border-rose-900">
                      <span>❤️</span>
                      <span>{annivHighlight.badgeText}</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold opacity-50">
                  {dayEvents.length} {dayEvents.length === 1 ? (lang === 'it' ? 'evento' : 'evento') : (lang === 'it' ? 'eventi' : 'eventos')}
                </span>
              </div>

              {/* Day Event Cards */}
              <div className="flex flex-col gap-2">
                {dayEvents.map((evt) => {
                  const mood = evt.mood ? MOODS[evt.mood] : null;
                  const p1Mood = evt.partnerMoods?.partner1 ? MOODS[evt.partnerMoods.partner1] : null;
                  const p2Mood = evt.partnerMoods?.partner2 ? MOODS[evt.partnerMoods.partner2] : null;
                  const hasSupport = evt.supportMessages && evt.supportMessages.length > 0;

                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Left color pill bar */}
                        <div
                          className="w-1.5 self-stretch rounded-full shrink-0"
                          style={{ backgroundColor: evt.color }}
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {p1Mood && p2Mood ? (
                              <span className="inline-flex items-center gap-0.5 text-base leading-none">
                                <span title={`${couple.partner1.name}: ${p1Mood.label}`}>{p1Mood.emoji}</span>
                                <span title={`${couple.partner2.name}: ${p2Mood.label}`}>{p2Mood.emoji}</span>
                              </span>
                            ) : mood ? (
                              <span className="text-base leading-none" title={mood.label}>
                                {mood.emoji}
                              </span>
                            ) : null}
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors truncate flex items-center gap-1.5">
                              <span>{evt.title}</span>
                              {(evt.photoUrl || (evt.photos && evt.photos.length > 0)) && (
                                <span className="text-xs" title={t.detail.singleMemory}>📸</span>
                              )}
                            </h4>

                            {p1Mood && p2Mood ? (
                              <div className="flex items-center gap-1">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p1Mood.badgeBg}`}>
                                  {couple.partner1.name}: {p1Mood.emoji}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p2Mood.badgeBg}`}>
                                  {couple.partner2.name}: {p2Mood.emoji}
                                </span>
                              </div>
                            ) : mood ? (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mood.badgeBg}`}>
                                {mood.label}
                              </span>
                            ) : null}

                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${evt.color}18`,
                                color: evt.color,
                              }}
                            >
                              {getOwnerLabel(evt.ownerId)}
                            </span>
                          </div>

                          {/* Time & Location */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold tabular-nums">
                              <Clock className="w-3.5 h-3.5 opacity-60" />
                              {evt.allDay ? (
                                <span>{t.allDay}</span>
                              ) : (
                                <span>
                                  {evt.startTime}
                                  {evt.endTime ? ` - ${evt.endTime}` : ''}
                                </span>
                              )}
                            </span>

                            {evt.location && (
                              <span className="flex items-center gap-1 font-medium truncate">
                                <MapPin className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                <span className="truncate">{evt.location}</span>
                              </span>
                            )}
                          </div>

                          {/* Support Message Snippet */}
                          {hasSupport && (
                            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-600 font-semibold italic truncate">
                              <MessageCircleHeart className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                "{evt.supportMessages![evt.supportMessages!.length - 1].senderName}: {evt.supportMessages![evt.supportMessages!.length - 1].text}"
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

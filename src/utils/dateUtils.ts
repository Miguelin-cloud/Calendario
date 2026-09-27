import { Language, TRANSLATIONS } from './i18n';

export const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const MONTH_NAMES_IT = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

export const DAY_NAMES_ES = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export const DAY_NAMES_IT = [
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato',
  'Domenica',
];

export const DAY_NAMES_SHORT_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const DAY_NAMES_SHORT_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
}

export function fromDateString(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayNumber: number;
}

/**
 * Generates weeks for month view starting on Monday
 */
export function getMonthDays(year: number, month: number): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week: JS Date getDay() gives 0 for Sunday, 1 for Monday...
  // Convert so Monday = 0, Sunday = 6
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset === -1) startOffset = 6;

  const days: CalendarDay[] = [];
  const today = new Date();

  // Days from previous month
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDate - i);
    days.push({
      date: d,
      dateString: toDateString(d),
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      dayNumber: d.getDate(),
    });
  }

  // Days in current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      dateString: toDateString(d),
      isCurrentMonth: true,
      isToday: isSameDay(d, today),
      dayNumber: i,
    });
  }

  // Fill remaining days to complete the 35 or 42 grid
  const totalSlots = days.length <= 35 ? 35 : 42;
  const remaining = totalSlots - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({
      date: d,
      dateString: toDateString(d),
      isCurrentMonth: false,
      isToday: isSameDay(d, today),
      dayNumber: i,
    });
  }

  return days;
}

/**
 * Generates the 7 days of the week for a given date
 */
export function getWeekDays(date: Date): CalendarDay[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));

  const week: CalendarDay[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    week.push({
      date: cur,
      dateString: toDateString(cur),
      isCurrentMonth: true,
      isToday: isSameDay(cur, today),
      dayNumber: cur.getDate(),
    });
  }

  return week;
}

/**
 * Formats a date into a friendly string respecting language (ES/IT)
 */
export function formatLongDate(date: Date, lang: Language = 'es'): string {
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const monthIndex = date.getMonth();
  const dayNames = lang === 'it' ? DAY_NAMES_IT : DAY_NAMES_ES;
  const monthNames = lang === 'it' ? MONTH_NAMES_IT : MONTH_NAMES_ES;

  if (lang === 'it') {
    return `${dayNames[dayIndex]}, ${date.getDate()} ${monthNames[monthIndex]} ${date.getFullYear()}`;
  }
  return `${dayNames[dayIndex]}, ${date.getDate()} de ${monthNames[monthIndex]} de ${date.getFullYear()}`;
}

export function formatMonthYear(year: number, month: number, lang: Language = 'es'): string {
  const monthNames = lang === 'it' ? MONTH_NAMES_IT : MONTH_NAMES_ES;
  return `${monthNames[month]} ${year}`;
}

/**
 * Calculates days difference between today and a target date
 */
export function getDaysUntil(targetDateStr: string): number {
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export interface AnniversaryMilestoneInfo {
  daysRemaining: number;
  isToday: boolean;
  isTomorrow: boolean;
  targetDate: Date;
  formattedTargetDate: string; // e.g. "14 de Febrero" / "14 Febbraio"
  yearsTogether?: number; // e.g. 2
  label: string; // e.g. "2º Aniversario" or "2º Anniversario"
  isCustomMilestone: boolean;
}

/**
 * Calculates the next recurring anniversary countdown, automatically advancing
 * to next year once passed, with ordinal years count and milestone fallback.
 */
export function getNextAnniversaryInfo(
  anniversaryDateStr = '2025-02-14',
  lang: Language = 'es'
): AnniversaryMilestoneInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = (anniversaryDateStr || '2025-02-14').split('-').map(Number);
  const origYear = parts[0] || 2025;
  const origMonth = parts[1] || 2;
  const origDay = parts[2] || 14;

  const currentYear = today.getFullYear();
  let nextAnniv = new Date(currentYear, origMonth - 1, origDay);
  nextAnniv.setHours(0, 0, 0, 0);

  // If this year's anniversary has already passed, next anniversary is next year
  if (nextAnniv.getTime() < today.getTime()) {
    nextAnniv = new Date(currentYear + 1, origMonth - 1, origDay);
    nextAnniv.setHours(0, 0, 0, 0);
  }

  const diffTime = nextAnniv.getTime() - today.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const yearsTogether =
    origYear && origYear < nextAnniv.getFullYear()
      ? nextAnniv.getFullYear() - origYear
      : 1;

  const monthNames = lang === 'it' ? MONTH_NAMES_IT : MONTH_NAMES_ES;
  const formattedTargetDate =
    lang === 'it'
      ? `${origDay} ${monthNames[origMonth - 1]}`
      : `${origDay} de ${monthNames[origMonth - 1]}`;

  let label = lang === 'it' ? 'Anniversario' : 'Aniversario';
  if (origMonth === 2 && origDay === 14) {
    if (yearsTogether && yearsTogether > 0) {
      label = lang === 'it' ? `${yearsTogether}º Anniversario` : `${yearsTogether}º Aniversario`;
    }
  } else if (yearsTogether && yearsTogether > 0) {
    label = lang === 'it' ? `${yearsTogether}º Anniversario` : `${yearsTogether}º Aniversario`;
  }

  return {
    daysRemaining,
    isToday: daysRemaining === 0,
    isTomorrow: daysRemaining === 1,
    targetDate: nextAnniv,
    formattedTargetDate,
    yearsTogether,
    label,
    isCustomMilestone: false,
  };
}

/**
 * Checks if a day is the couple's monthly anniversary (day 14 of every month)
 * or the grand annual anniversary (February 14, 2025).
 */
export function getCoupleAnniversaryHighlight(dateOrString: Date | string, lang: Language = 'es') {
  const d = typeof dateOrString === 'string' ? fromDateString(dateOrString) : dateOrString;
  const day = d.getDate();
  const month = d.getMonth() + 1; // 1-12

  const isGrandAnniversary = month === 2 && day === 14;
  const isMonthlyFourteenth = day === 14;

  if (isGrandAnniversary) {
    return {
      isAnniversary: true,
      isGrand: true,
      badgeText: lang === 'it' ? '💖 San Valentino & Grande Anniversario! 🥂' : '💖 ¡San Valentín & Gran Aniversario! 🥂',
      shortBadge: '💖 San Valentín',
      emoji: '💖',
      tooltip:
        lang === 'it'
          ? '14 Febbraio · ¡Grande Anniversario di Miguel & Giulia (14 Feb 2025) & San Valentino! ❤️🥂'
          : '14 de Febrero · ¡Gran Aniversario de Miguel & Giulia (14 Feb 2025) & San Valentín! ❤️🥂',
    };
  }

  if (isMonthlyFourteenth) {
    const monthName = (lang === 'it' ? MONTH_NAMES_IT : MONTH_NAMES_ES)[month - 1];
    return {
      isAnniversary: true,
      isGrand: false,
      badgeText: lang === 'it' ? '💕 Meseversario (14)' : '💕 Cumplemés (14)',
      shortBadge: '💕 Meseversario',
      emoji: '💕',
      tooltip:
        lang === 'it'
          ? `14 ${monthName} · ¡Meseversario di Miguel & Giulia! 💖🥂`
          : `14 de ${monthName} · ¡Cumplemés de Miguel & Giulia! 💖🥂`,
    };
  }

  return {
    isAnniversary: false,
    isGrand: false,
    badgeText: '',
    shortBadge: '',
    emoji: '',
    tooltip: '',
  };
}

/**
 * Convert time string HH:mm to minutes from midnight
 */
export function timeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

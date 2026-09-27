import { CalendarEvent } from '../types/calendar';

export function createGoogleCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.location || '');

  let dates = '';
  if (event.allDay) {
    const s = event.startDate.replace(/-/g, '');
    const end = new Date(event.endDate || event.startDate);
    end.setDate(end.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    const e = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}`;
    dates = `${s}/${e}`;
  } else {
    const sDate = event.startDate.replace(/-/g, '');
    const sTime = (event.startTime || '09:00').replace(/:/g, '') + '00';
    const eDate = (event.endDate || event.startDate).replace(/-/g, '');
    const eTime = (event.endTime || '10:00').replace(/:/g, '') + '00';
    dates = `${sDate}T${sTime}/${eDate}T${eTime}`;
  }

  return `${baseUrl}&text=${title}&details=${details}&location=${location}&dates=${dates}`;
}

export function exportEventToIcs(event: CalendarEvent): void {
  const formatDateForIcs = (dateStr: string, timeStr?: string, allDay = false) => {
    const cleanDate = dateStr.replace(/-/g, '');
    if (allDay) {
      return cleanDate;
    }
    const cleanTime = (timeStr || '09:00').replace(/:/g, '') + '00';
    return `${cleanDate}T${cleanTime}`;
  };

  const dtStart = formatDateForIcs(event.startDate, event.startTime, event.allDay);
  const dtEnd = formatDateForIcs(
    event.endDate || event.startDate,
    event.endTime || (event.startTime ? '10:00' : undefined),
    event.allDay
  );

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DuoCalendar//Calendario de Pareja//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@duocalendar.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    event.allDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`,
    event.allDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`,
    `SUMMARY:${event.title.replace(/\n/g, ' ')}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location ? `LOCATION:${event.location.replace(/\n/g, ' ')}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${event.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

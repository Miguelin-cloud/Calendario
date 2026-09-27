import React, { useState, useEffect } from 'react';
import {
  CalendarEvent,
  CoupleConfig,
  EventOwner,
  EventCategory,
  EventMoodKey,
  CATEGORY_LIST,
  MOODS,
  PRESET_PALETTES,
} from '../types/calendar';
import { THEMES } from '../utils/themeStyles';
import { Language, TRANSLATIONS } from '../utils/i18n';
import {
  X,
  Clock,
  MapPin,
  FileText,
  Calendar,
  Bell,
  Heart,
  Palette,
  Check,
  Smile,
} from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  eventToEdit?: CalendarEvent | null;
  initialDate?: string;
  initialHour?: string;
  couple: CoupleConfig;
  defaultOwnerId: 'partner1' | 'partner2';
  lang?: Language;
  onClose: () => void;
  onSave: (eventData: Partial<CalendarEvent> & { title: string; startDate: string }) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  eventToEdit,
  initialDate,
  initialHour,
  couple,
  defaultOwnerId,
  lang = 'es',
  onClose,
  onSave,
}) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;
  const theme = THEMES[couple.theme || 'classic'];
  const t = TRANSLATIONS[lang];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [allDay, setAllDay] = useState(false);
  const [ownerId, setOwnerId] = useState<EventOwner>(defaultOwnerId);
  const [color, setColor] = useState(couple.partner1.color);
  const [category, setCategory] = useState<EventCategory>('other');
  const [mood, setMood] = useState<EventMoodKey | undefined>(undefined);
  const [p1Mood, setP1Mood] = useState<EventMoodKey | undefined>(undefined);
  const [p2Mood, setP2Mood] = useState<EventMoodKey | undefined>(undefined);
  const [activeMoodTab, setActiveMoodTab] = useState<'partner1' | 'partner2'>('partner1');
  const [location, setLocation] = useState('');
  const [reminder, setReminder] = useState('none');
  const [showColorCustom, setShowColorCustom] = useState(false);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || '');
      setStartDate(eventToEdit.startDate);
      setEndDate(eventToEdit.endDate || eventToEdit.startDate);
      setStartTime(eventToEdit.startTime || '10:00');
      setEndTime(eventToEdit.endTime || '11:00');
      setAllDay(eventToEdit.allDay);
      setOwnerId(eventToEdit.ownerId);
      setColor(eventToEdit.color);
      setCategory(eventToEdit.category);
      setMood(eventToEdit.mood);
      setP1Mood(eventToEdit.partnerMoods?.partner1 || (eventToEdit.ownerId === 'partner1' ? eventToEdit.mood : undefined));
      setP2Mood(eventToEdit.partnerMoods?.partner2 || (eventToEdit.ownerId === 'partner2' ? eventToEdit.mood : undefined));
      setLocation(eventToEdit.location || '');
      setReminder(eventToEdit.reminder || 'none');
    } else {
      const targetDate = initialDate || todayStr;
      setTitle('');
      setDescription('');
      setStartDate(targetDate);
      setEndDate(targetDate);
      setStartTime(initialHour || '10:00');
      const startH = parseInt(initialHour?.split(':')[0] || '10', 10);
      setEndTime(`${pad((startH + 1) % 24)}:00`);
      setAllDay(false);
      setOwnerId(defaultOwnerId);
      setColor(defaultOwnerId === 'partner1' ? couple.partner1.color : couple.partner2.color);
      setCategory('romantic');
      setMood(undefined);
      setP1Mood(undefined);
      setP2Mood(undefined);
      setLocation('');
      setReminder('none');
    }
  }, [eventToEdit, initialDate, initialHour, defaultOwnerId, couple, todayStr, isOpen]);

  const handleOwnerChange = (newOwner: EventOwner) => {
    setOwnerId(newOwner);
    if (newOwner === 'partner1') {
      setColor(couple.partner1.color);
      setActiveMoodTab('partner1');
    } else if (newOwner === 'partner2') {
      setColor(couple.partner2.color);
      setActiveMoodTab('partner2');
    } else {
      setColor(couple.sharedColor);
      setActiveMoodTab('partner1');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    // Determine primary mood and partnerMoods
    const primaryMood =
      ownerId === 'partner1'
        ? p1Mood || mood
        : ownerId === 'partner2'
        ? p2Mood || mood
        : mood || p1Mood || p2Mood;

    const partnerMoods =
      p1Mood || p2Mood
        ? {
            partner1: p1Mood,
            partner2: p2Mood,
          }
        : undefined;

    onSave({
      id: eventToEdit?.id,
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate: endDate || startDate,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      allDay,
      ownerId,
      color,
      category,
      mood: primaryMood,
      partnerMoods,
      location: location.trim(),
      reminder: reminder === 'none' ? undefined : reminder,
    });
    onClose();
  };

  const moodList = Object.values(MOODS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {eventToEdit ? t.modal.editTitle : t.modal.createTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <input
              type="text"
              required
              autoFocus
              placeholder={t.modal.titlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base sm:text-lg font-bold px-3 py-2 border-b-2 border-slate-200 dark:border-slate-700 focus:border-indigo-600 focus:outline-hidden transition-colors placeholder:font-normal placeholder:opacity-50 text-slate-900 dark:text-white bg-transparent"
            />
          </div>

          {/* Owner Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold opacity-75">
              {t.modal.whoseEvent}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleOwnerChange('partner1')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  ownerId === 'partner1'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:bg-indigo-950/50 dark:text-indigo-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 opacity-70'
                }`}
              >
                <span>{theme.p1Avatar}</span>
                <span className="truncate">{couple.partner1.name}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOwnerChange('partner2')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  ownerId === 'partner2'
                    ? 'border-rose-500 bg-rose-50/70 text-rose-950 dark:bg-rose-950/50 dark:text-rose-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 opacity-70'
                }`}
              >
                <span>{theme.p2Avatar}</span>
                <span className="truncate">{couple.partner2.name}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOwnerChange('both')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  ownerId === 'both'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-950 dark:bg-purple-950/50 dark:text-purple-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 opacity-70'
                }`}
              >
                <span>{theme.bothAvatar}</span>
                <span className="truncate">{t.filterTogether}</span>
              </button>
            </div>
          </div>

          {/* MOOD & ENERGY SELECTOR */}
          <div className="p-3.5 bg-gradient-to-br from-purple-50/80 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200/80 dark:border-purple-800/40 rounded-2xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-purple-600" />
                <span>{t.modal.moodSectionTitle}</span>
              </label>
              {(mood || p1Mood || p2Mood) && (
                <button
                  type="button"
                  onClick={() => {
                    setMood(undefined);
                    setP1Mood(undefined);
                    setP2Mood(undefined);
                  }}
                  className="text-[10px] text-purple-600 dark:text-purple-300 hover:underline font-semibold cursor-pointer"
                >
                  {lang === 'it' ? 'Azzera selezione' : 'Limpiar selección'}
                </button>
              )}
            </div>

            {/* If event is for both, offer selector per partner */}
            {ownerId === 'both' ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-800/70 p-1 rounded-xl border border-purple-100 dark:border-purple-900/50 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveMoodTab('partner1')}
                    className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeMoodTab === 'partner1'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-black/5'
                    }`}
                  >
                    <span>{theme.p1Avatar}</span>
                    <span>{couple.partner1.name}</span>
                    {p1Mood && <span className="ml-1">{MOODS[p1Mood].emoji}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMoodTab('partner2')}
                    className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeMoodTab === 'partner2'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-black/5'
                    }`}
                  >
                    <span>{theme.p2Avatar}</span>
                    <span>{couple.partner2.name}</span>
                    {p2Mood && <span className="ml-1">{MOODS[p2Mood].emoji}</span>}
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  {activeMoodTab === 'partner1'
                    ? `${lang === 'it' ? 'Come si sente' : '¿Cómo se siente'} ${couple.partner1.name}?`
                    : `${lang === 'it' ? 'Come si sente' : '¿Cómo se siente'} ${couple.partner2.name}?`}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {moodList.map((m) => {
                    const currentSelected =
                      activeMoodTab === 'partner1' ? p1Mood === m.key : p2Mood === m.key;
                    const moodTranslation = t.moods[m.key as keyof typeof t.moods];
                    const labelText = moodTranslation ? moodTranslation.label.replace(/^[^\s]+\s*/, '') : m.label.replace(/^[^\s]+\s*/, '');
                    const descText = moodTranslation ? moodTranslation.desc : m.description;

                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          if (activeMoodTab === 'partner1') {
                            setP1Mood(currentSelected ? undefined : m.key);
                            if (!mood) setMood(m.key);
                          } else {
                            setP2Mood(currentSelected ? undefined : m.key);
                            if (!mood) setMood(m.key);
                          }
                        }}
                        className={`py-2 px-2 rounded-xl text-left text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          currentSelected
                            ? `${m.badgeBg} border-current shadow-xs scale-[1.02] font-bold ring-1 ring-purple-400`
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100 hover:bg-slate-50'
                        }`}
                        title={descText}
                      >
                        <span className="text-base leading-none">{m.emoji}</span>
                        <span className="truncate text-[11px]">{labelText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Single owner mood & energy selector */
              <div className="flex flex-col gap-2">
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                  <span>
                    {ownerId === 'partner1' ? theme.p1Avatar : theme.p2Avatar}{' '}
                    {ownerId === 'partner1' ? couple.partner1.name : couple.partner2.name}:
                  </span>
                  <span>{t.modal.howFeelsTitle}</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {moodList.map((m) => {
                    const currentKey = ownerId === 'partner1' ? (p1Mood || mood) : (p2Mood || mood);
                    const isSelected = currentKey === m.key;
                    const moodTranslation = t.moods[m.key as keyof typeof t.moods];
                    const labelText = moodTranslation ? moodTranslation.label.replace(/^[^\s]+\s*/, '') : m.label.replace(/^[^\s]+\s*/, '');
                    const descText = moodTranslation ? moodTranslation.desc : m.description;

                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => {
                          const nextVal = isSelected ? undefined : m.key;
                          setMood(nextVal);
                          if (ownerId === 'partner1') setP1Mood(nextVal);
                          if (ownerId === 'partner2') setP2Mood(nextVal);
                        }}
                        className={`py-2 px-2 rounded-xl text-left text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isSelected
                            ? `${m.badgeBg} border-current shadow-xs scale-[1.02] font-bold ring-1 ring-purple-400`
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100 hover:bg-slate-50'
                        }`}
                        title={descText}
                      >
                        <span className="text-base leading-none">{m.emoji}</span>
                        <span className="truncate text-[11px]">{labelText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Color Palette Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold opacity-75 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>{t.modal.colorLabel}</span>
              </label>
              <button
                type="button"
                onClick={() => setShowColorCustom(!showColorCustom)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                {showColorCustom ? (lang === 'it' ? 'Tavolozza rapida' : 'Ver paleta rápida') : (lang === 'it' ? 'Scegli altro colore' : 'Elegir otro color')}
              </button>
            </div>

            {!showColorCustom ? (
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_PALETTES.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setColor(p.color)}
                    className="w-6 h-6 rounded-full relative flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: p.color }}
                    title={p.name}
                  >
                    {color.toLowerCase() === p.color.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-8 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#4F46E5"
                  className="text-xs font-mono px-2.5 py-1.5 border border-slate-200 rounded-lg w-28 uppercase bg-transparent text-slate-800 dark:text-slate-100"
                />
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="bg-black/5 dark:bg-white/5 p-3.5 rounded-xl border border-black/5 dark:border-white/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold opacity-80 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 opacity-60" />
                <span>{t.modal.startDate} & {t.modal.endDate}</span>
              </span>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t.modal.allDayToggle}</span>
              </label>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold opacity-60 block mb-1">
                  {t.modal.startDate}
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate < e.target.value) setEndDate(e.target.value);
                    }}
                    className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold opacity-60 block mb-1">
                  {t.modal.endDate}
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="date"
                    required
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Time row (if not all day) */}
            {!allDay && (
              <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-black/5 dark:border-white/5">
                <div>
                  <label className="text-[11px] font-semibold opacity-60 block mb-1">
                    {lang === 'it' ? 'Ora inizio' : 'Hora inicio'}
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold opacity-60 block mb-1">
                    {lang === 'it' ? 'Ora fine' : 'Hora fin'}
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold opacity-75">
              {t.modal.categoryLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CATEGORY_LIST.map((cat) => {
                const isSelected = category === cat.id;
                const catLabel = t.categories[cat.id as keyof typeof t.categories] || cat.label;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all truncate cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 opacity-80'
                    }`}
                  >
                    <span className="truncate">{catLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold opacity-75 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 opacity-60" />
              <span>{lang === 'it' ? 'Luogo o Indirizzo' : 'Ubicación'}</span>
            </label>
            <input
              type="text"
              placeholder={t.modal.locationPlaceholder}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Description & Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold opacity-75 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 opacity-60" />
              <span>{lang === 'it' ? 'Note o Dettagli' : 'Notas o descripción'}</span>
            </label>
            <textarea
              rows={2}
              placeholder={t.modal.notesPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          {/* Reminder */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-bold opacity-75 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 opacity-60" />
              <span>{t.modal.reminderLabel}</span>
            </span>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 opacity-80 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="none">{t.modal.noReminder}</option>
              <option value="15m">{t.modal.reminder15m}</option>
              <option value="1h">{t.modal.reminder1h}</option>
              <option value="1d">{t.modal.reminder1d}</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              {t.modal.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 shadow-sm rounded-xl transition-all cursor-pointer"
            >
              {eventToEdit ? t.modal.saveChanges : t.modal.createButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

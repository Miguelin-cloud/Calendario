import React, { useState, useRef, useEffect } from 'react';
import {
  CalendarEvent,
  CoupleConfig,
  MOODS,
  EventPhoto,
} from '../types/calendar';
import {
  formatLongDate,
  fromDateString,
} from '../utils/dateUtils';
import {
  createGoogleCalendarUrl,
  exportEventToIcs,
} from '../utils/icsExport';
import { THEMES } from '../utils/themeStyles';
import { Language, TRANSLATIONS } from '../utils/i18n';
import {
  X,
  Clock,
  MapPin,
  Calendar,
  Download,
  Edit2,
  Trash2,
  MessageCircleHeart,
  Send,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  Plus,
  Sparkles,
  ExternalLink,
  Link2,
  Check,
  Heart,
  AlertCircle,
} from 'lucide-react';

interface EventDetailModalProps {
  isOpen: boolean;
  event: CalendarEvent | null;
  couple: CoupleConfig;
  currentPartnerId: 'partner1' | 'partner2';
  lang?: Language;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onSendSupportMessage: (eventId: string, text: string, emoji?: string) => void;
  onAttachPhoto: (
    eventId: string,
    photoUrl: string,
    caption?: string,
    addedBy?: 'partner1' | 'partner2'
  ) => Promise<void> | void;
  onRemovePhoto?: (eventId: string, photoId?: string) => Promise<void> | void;
}

// Client-side image compression to ~100-200KB JPEG for fast storage and responsive sync
function compressImage(file: File, maxDim = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const QUICK_CAPTION_EMOJIS = ['❤️', '📸', '🥂', '🌹', '✨', '🥰', '🍕', '🎉'];
const QUICK_CAPTIONS = [
  '¡Qué día tan bonito pasamos juntos! ❤️',
  'Momento inolvidable para el recuerdo ✨',
  '¡Nuestra cita favorita! 🍷🍝',
  'Risas, mimos y amor del bueno 🥰',
];

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  event,
  couple,
  currentPartnerId,
  lang = 'es',
  onClose,
  onEdit,
  onDelete,
  onSendSupportMessage,
  onAttachPhoto,
  onRemovePhoto,
}) => {
  const t = TRANSLATIONS[lang];
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Scrapbook photo states
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const [photoCaptionInput, setPhotoCaptionInput] = useState('');
  const [photoAddedBy, setPhotoAddedBy] = useState<'partner1' | 'partner2'>(currentPartnerId);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [zoomedPhoto, setZoomedPhoto] = useState<EventPhoto | null>(null);
  const [photoToDeleteId, setPhotoToDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep author aligned with current user
  useEffect(() => {
    setPhotoAddedBy(currentPartnerId);
  }, [currentPartnerId, isOpen]);

  if (!isOpen || !event) return null;

  const theme = THEMES[couple.theme || 'classic'];
  const mood = event.mood ? MOODS[event.mood] : null;

  // Determine if the event has passed
  const isPassed = (() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const currentTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    if (event.endDate < todayStr) return true;
    if (event.endDate === todayStr) {
      if (!event.allDay && event.endTime) {
        return event.endTime <= currentTime;
      }
      return false;
    }
    return false;
  })();

  const getOwnerInfo = () => {
    if (event.ownerId === 'partner1') {
      return { name: couple.partner1.name, color: couple.partner1.color, avatar: theme.p1Avatar, isBoth: false };
    }
    if (event.ownerId === 'partner2') {
      return { name: couple.partner2.name, color: couple.partner2.color, avatar: theme.p2Avatar, isBoth: false };
    }
    return { name: 'Juntos / Los dos', color: couple.sharedColor, avatar: theme.bothAvatar, isBoth: true };
  };

  const owner = getOwnerInfo();
  const startDateObj = fromDateString(event.startDate);
  const isMultiDay = event.endDate && event.endDate !== event.startDate;
  const endDateObj = isMultiDay ? fromDateString(event.endDate) : null;

  const p1Mood = event.partnerMoods?.partner1 ? MOODS[event.partnerMoods.partner1] : null;
  const p2Mood = event.partnerMoods?.partner2 ? MOODS[event.partnerMoods.partner2] : null;

  // Photos collection: check both photos array and legacy photoUrl
  const allPhotos: EventPhoto[] = event.photos && event.photos.length > 0
    ? event.photos
    : event.photoUrl
    ? [{
        id: 'legacy-photo',
        url: event.photoUrl,
        caption: event.photoCaption,
        addedBy: 'partner1',
        addedAt: event.updatedAt || new Date().toISOString(),
      }]
    : [];

  const googleMapsUrl = event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`
    : null;

  const googleCalendarUrl = createGoogleCalendarUrl(event);

  const handleDelete = () => {
    onDelete(event.id);
    setShowConfirmDelete(false);
    onClose();
  };

  const handleSendQuick = (phrase: string) => {
    onSendSupportMessage(event.id, phrase, '❤️');
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    onSendSupportMessage(event.id, customMsg.trim(), '💌');
    setCustomMsg('');
    setShowCustomInput(false);
  };

  // Handle Photo selection from camera or file picker
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const compressedDataUrl = await compressImage(file);
      setSelectedPhotoPreview(compressedDataUrl);
      setShowUrlInput(false);
    } catch (err) {
      console.error('Error reading/compressing photo:', err);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) return;
    setSelectedPhotoPreview(photoUrlInput.trim());
    setShowUrlInput(false);
  };

  const handleConfirmSavePhoto = async () => {
    if (!selectedPhotoPreview) return;
    await onAttachPhoto(event.id, selectedPhotoPreview, photoCaptionInput.trim(), photoAddedBy);
    setSelectedPhotoPreview(null);
    setPhotoCaptionInput('');
    setPhotoUrlInput('');
  };

  const handleCancelPhoto = () => {
    setSelectedPhotoPreview(null);
    setPhotoCaptionInput('');
    setPhotoUrlInput('');
    setShowUrlInput(false);
  };

  const handleConfirmDeletePhoto = async (photoId: string) => {
    if (onRemovePhoto) {
      await onRemovePhoto(event.id, photoId);
    }
    setPhotoToDeleteId(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
          {/* Top colored banner */}
          <div
            className="h-3 w-full"
            style={{ backgroundColor: event.color }}
          />

          <div className="p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${event.color}20`,
                      color: event.color,
                    }}
                  >
                    <span>{owner.avatar}</span>
                    <span>{owner.name}</span>
                  </span>

                  {/* Past / Memory badge */}
                  {isPassed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <span>✓ Finalizado</span>
                    </span>
                  ) : null}

                  {allPhotos.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <span>📸 {allPhotos.length} {allPhotos.length === 1 ? 'recuerdo' : 'recuerdos'}</span>
                    </span>
                  )}

                  {p1Mood && (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${p1Mood.badgeBg}`}>
                      <span>{theme.p1Avatar} {couple.partner1.name}:</span>
                      <span>{p1Mood.emoji} {p1Mood.label.replace(/^[^\s]+\s*/, '')}</span>
                    </span>
                  )}

                  {p2Mood && (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${p2Mood.badgeBg}`}>
                      <span>{theme.p2Avatar} {couple.partner2.name}:</span>
                      <span>{p2Mood.emoji} {p2Mood.label.replace(/^[^\s]+\s*/, '')}</span>
                    </span>
                  )}

                  {!p1Mood && !p2Mood && mood && (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${mood.badgeBg}`}>
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {event.title}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mood explanation banner */}
            {p1Mood && p2Mood ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${p1Mood.badgeBg}`}>
                  <span className="text-2xl">{p1Mood.emoji}</span>
                  <div className="text-xs">
                    <span className="font-bold block">{couple.partner1.name}: {p1Mood.label}</span>
                    <span className="opacity-90">{p1Mood.description}</span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${p2Mood.badgeBg}`}>
                  <span className="text-2xl">{p2Mood.emoji}</span>
                  <div className="text-xs">
                    <span className="font-bold block">{couple.partner2.name}: {p2Mood.label}</span>
                    <span className="opacity-90">{p2Mood.description}</span>
                  </div>
                </div>
              </div>
            ) : mood ? (
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${mood.badgeBg}`}>
                <span className="text-2xl">{mood.emoji}</span>
                <div className="text-xs">
                  <span className="font-bold block">{mood.label}</span>
                  <span className="opacity-90">{mood.description}</span>
                </div>
              </div>
            ) : null}

            {/* Details list */}
            <div className="flex flex-col gap-3 py-2 border-y border-slate-100 dark:border-slate-800 text-xs">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {formatLongDate(startDateObj)}
                    {endDateObj && ` — ${formatLongDate(endDateObj)}`}
                  </div>
                  <div className="text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                    {event.allDay ? (
                      <span>Todo el día</span>
                    ) : (
                      <span>
                        {event.startTime || 'Hora por definir'}
                        {event.endTime ? ` - ${event.endTime}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {event.location}
                    </div>
                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-[11px] inline-flex items-center gap-1 mt-0.5"
                      >
                        <span>Ver en Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* DIGITAL SCRAPBOOK / ÁLBUM DE RECUERDOS COMPARTIDO           */}
            {/* ============================================================ */}
            <div className={`p-4 rounded-2xl flex flex-col gap-3 shadow-xs border transition-all ${
              isPassed
                ? 'bg-gradient-to-br from-amber-50/90 via-rose-50/50 to-orange-50/60 dark:from-slate-800 dark:via-amber-950/20 dark:to-slate-800/80 border-amber-300/80 dark:border-amber-700/50'
                : 'bg-gradient-to-br from-amber-50/60 via-purple-50/30 to-indigo-50/40 dark:from-slate-800/70 dark:to-slate-800/50 border-amber-200/60 dark:border-slate-700'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs ${
                    isPassed
                      ? 'bg-amber-500 text-white dark:bg-amber-600'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                  }`}>
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Álbum de Recuerdos & Scrapbook</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </h4>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">
                      {isPassed
                        ? '✨ Evento finalizado: inmortalizad vuestra experiencia con fotos y dedicatorias'
                        : 'Podéis adjuntar fotos y recuerdos en cuanto haya tenido lugar este plan'}
                    </p>
                  </div>
                </div>

                {/* Upload Buttons */}
                <div className="flex items-center gap-1.5">
                  {/* File / Camera upload */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Subir foto desde la cámara o galería del dispositivo"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{allPhotos.length > 0 ? 'Añadir foto' : 'Subir foto'}</span>
                  </button>

                  {/* URL link button */}
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="p-1.5 bg-white dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl text-xs transition-colors"
                    title="Añadir foto mediante enlace o URL de imagen"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* URL Input Bar (Toggled) */}
              {showUrlInput && !selectedPhotoPreview && (
                <form
                  onSubmit={handleApplyUrl}
                  className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-amber-300 dark:border-amber-700/60 shadow-xs flex items-center gap-2 animate-in fade-in duration-150"
                >
                  <Link2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <input
                    type="url"
                    required
                    placeholder="Pega la URL de una foto (https://...)"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-amber-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  >
                    Cargar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              {/* Photo Preview & Caption Editor Modal Card (When a file or URL is picked) */}
              {selectedPhotoPreview && (
                <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border-2 border-amber-400 dark:border-amber-600 shadow-lg animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <span>Nuevo Recuerdo para el Scrapbook</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelPhoto}
                      className="text-slate-400 hover:text-slate-600 text-xs px-1 py-0.5 rounded"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Photo Preview */}
                  <div className="relative rounded-xl overflow-hidden max-h-56 bg-slate-100 dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                    <img
                      src={selectedPhotoPreview}
                      alt="Vista previa del recuerdo"
                      className="w-full h-auto max-h-56 object-cover"
                    />
                  </div>

                  {/* Who is adding the photo */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Foto tomada o subida por:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPhotoAddedBy('partner1')}
                        className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border transition-all ${
                          photoAddedBy === 'partner1'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <span>{theme.p1Avatar}</span>
                        <span>{couple.partner1.name}</span>
                        {photoAddedBy === 'partner1' && <Check className="w-3 h-3 ml-0.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPhotoAddedBy('partner2')}
                        className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border transition-all ${
                          photoAddedBy === 'partner2'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <span>{theme.p2Avatar}</span>
                        <span>{couple.partner2.name}</span>
                        {photoAddedBy === 'partner2' && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Caption & quick emoji chips */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Pie de foto / dedicatoria del recuerdo:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: ¡Qué tarde más bonita juntos! ❤️"
                      value={photoCaptionInput}
                      onChange={(e) => setPhotoCaptionInput(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-amber-500 font-medium"
                      autoFocus
                    />

                    {/* Quick Emojis & Phrase suggestions */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold">Añadir:</span>
                      {QUICK_CAPTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setPhotoCaptionInput((prev) => `${prev} ${emoji}`.trim())}
                          className="hover:scale-125 transition-transform text-xs cursor-pointer select-none"
                          title={`Insertar ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {QUICK_CAPTIONS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPhotoCaptionInput(preset)}
                          className="text-[10px] px-2 py-0.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-md border border-amber-200/60 dark:border-amber-800/40 transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={handleCancelPhoto}
                      className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                      Descartar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSavePhoto}
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>Guardar en el Scrapbook</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Gallery / Polaroid Cards */}
              {allPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {allPhotos.map((photo, idx) => {
                    const isP2 = photo.addedBy === 'partner2';
                    const authorName = isP2 ? couple.partner2.name : couple.partner1.name;
                    const authorAvatar = isP2 ? theme.p2Avatar : theme.p1Avatar;
                    const authorColor = isP2 ? couple.partner2.color : couple.partner1.color;
                    const isConfirmingThis = photoToDeleteId === photo.id;

                    return (
                      <div
                        key={photo.id || `photo-${idx}`}
                        className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-amber-200/90 dark:border-slate-700 shadow-xs hover:shadow-md transition-all flex flex-col gap-2 group relative"
                      >
                        {/* Polaroid Image Wrapper */}
                        <div
                          className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer border border-black/5 dark:border-white/5"
                          onClick={() => setZoomedPhoto(photo)}
                          title="Haz clic para ver la foto en grande"
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption || 'Foto del recuerdo'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="p-2 rounded-full bg-white/95 text-slate-900 shadow-lg flex items-center gap-1 text-xs font-bold">
                              <ZoomIn className="w-3.5 h-3.5" />
                              <span>Ver foto</span>
                            </span>
                          </div>
                        </div>

                        {/* Caption & Metadata */}
                        <div className="flex flex-col gap-1 text-[11px]">
                          {photo.caption ? (
                            <p className="font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 italic">
                              "{photo.caption}"
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic">
                              Recuerdo sin pie de foto
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                            <span
                              className="font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                              style={{
                                backgroundColor: `${authorColor}15`,
                                color: authorColor,
                              }}
                            >
                              <span>{authorAvatar}</span>
                              <span>{authorName}</span>
                            </span>

                            {/* Delete button or confirm */}
                            {!isConfirmingThis ? (
                              <button
                                type="button"
                                onClick={() => setPhotoToDeleteId(photo.id)}
                                className="text-slate-400 hover:text-rose-500 opacity-60 hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Eliminar esta foto del álbum"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 animate-in fade-in">
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDeletePhoto(photo.id)}
                                  className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-1.5 py-0.5 rounded shadow-2xs"
                                >
                                  Borrar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPhotoToDeleteId(null)}
                                  className="text-[10px] text-slate-500 hover:text-slate-700 px-1 py-0.5"
                                >
                                  Cancelar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* No photos yet state - Prominent prompt for couples after event has passed */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer group ${
                    isPassed
                      ? 'border-amber-400 bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 shadow-xs'
                      : 'border-amber-300/80 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                    isPassed
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                  }`}>
                    <Camera className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                      {isPassed
                        ? '¡Inmortalizad este recuerdo juntos!'
                        : 'Guarda fotos y tickets de este plan'}
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-sm mt-0.5">
                      {isPassed
                        ? 'Este plan ya ha tenido lugar. Pulsa aquí para subir vuestras fotos y crear vuestro álbum digital compartido.'
                        : 'Podéis adjuntar fotos ahora o en cuanto haya tenido lugar la cita o actividad.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Subir foto del recuerdo</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Support Messages Section */}
            <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                  <MessageCircleHeart className="w-4 h-4 text-rose-500" />
                  <span>Mensajitos de Amor & Apoyo de la Pareja</span>
                </span>
                {event.supportMessages && event.supportMessages.length > 0 && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-full">
                    {event.supportMessages.length} mensajes
                  </span>
                )}
              </div>

              {/* Message list */}
              {event.supportMessages && event.supportMessages.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {event.supportMessages.map((msg) => {
                    const isSenderP1 = msg.senderId === 'partner1';
                    return (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-xl text-xs flex items-start gap-2 shadow-2xs ${
                          isSenderP1
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 self-start max-w-[90%]'
                            : 'bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 self-end max-w-[90%]'
                        }`}
                      >
                        <span className="text-base shrink-0">{msg.emoji || '❤️'}</span>
                        <div>
                          <span className="font-bold text-[11px] block opacity-75">
                            {msg.senderName}:
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {msg.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 italic">
                  Aún no hay mensajitos para este evento. ¡Mándale un detalle de cariño para que lo lea!
                </p>
              )}

              {/* Quick send buttons */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-rose-200/60 dark:border-rose-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  Mandar ánimo rápido a {owner.name}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSendQuick('¡Ánimo vida mía, te saldrá genial! ❤️💪')}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-rose-100 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-semibold border border-rose-200 dark:border-rose-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    ❤️ ¡Tú puedes amor!
                  </button>
                  <button
                    onClick={() => handleSendQuick('In bocca al lupo amore mio! 🍀❤️')}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-rose-100 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-semibold border border-rose-200 dark:border-rose-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    🍀 In bocca al lupo!
                  </button>
                  <button
                    onClick={() => handleSendQuick('¡Te espero luego con tu comida favorita y mimos! 🍕🤗')}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-rose-100 text-slate-800 dark:text-slate-200 rounded-lg text-[11px] font-semibold border border-rose-200 dark:border-rose-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    🤗 Mimos luego
                  </button>
                  <button
                    onClick={() => setShowCustomInput(!showCustomInput)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    ✍️ Escribir...
                  </button>
                </div>

                {/* Custom message input */}
                {showCustomInput && (
                  <form onSubmit={handleSendCustom} className="flex gap-1.5 mt-1.5">
                    <input
                      type="text"
                      required
                      placeholder={`Escribe algo bonito para ${owner.name}...`}
                      value={customMsg}
                      onChange={(e) => setCustomMsg(e.target.value)}
                      className="flex-1 text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 rounded-lg focus:outline-hidden focus:border-rose-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Enviar</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Google Calendar & ICS export shortcuts */}
            <div className="flex items-center gap-2">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-2.5 text-center text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                title="Abrir y guardar en Google Calendar"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Google Calendar</span>
              </a>

              <button
                onClick={() => exportEventToIcs(event)}
                className="py-2 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Descargar archivo .ics para el móvil u ordenador"
              >
                <Download className="w-3.5 h-3.5 opacity-60" />
                <span>.ICS</span>
              </button>
            </div>

            {/* Bottom actions: Edit, Delete */}
            <div className="pt-2 flex items-center justify-between gap-2">
              {!showConfirmDelete ? (
                <>
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="px-3 py-1.5 text-xs font-bold opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      onClick={() => {
                        onEdit(event);
                        onClose();
                      }}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-200">
                    ¿Seguro que queréis borrar este evento?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
                    >
                      Sí, borrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom modal when clicking on a Scrapbook photo */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setZoomedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close button */}
            <button
              onClick={() => setZoomedPhoto(null)}
              className="absolute -top-10 sm:-top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              title="Cerrar imagen"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Photo */}
            <img
              src={zoomedPhoto.url}
              alt={zoomedPhoto.caption || 'Recuerdo en grande'}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            {/* Bottom Polaroid metadata bar */}
            <div className="w-full max-w-xl bg-white/10 backdrop-blur-md rounded-2xl p-3 text-white text-center flex flex-col gap-1 border border-white/15">
              {zoomedPhoto.caption && (
                <p className="text-sm font-semibold italic text-amber-200">
                  "{zoomedPhoto.caption}"
                </p>
              )}
              <div className="flex items-center justify-center gap-3 text-xs text-white/80">
                <span>
                  {zoomedPhoto.addedBy === 'partner2' ? theme.p2Avatar : theme.p1Avatar}{' '}
                  Subida por{' '}
                  <strong className="text-white">
                    {zoomedPhoto.addedBy === 'partner2' ? couple.partner2.name : couple.partner1.name}
                  </strong>
                </span>
                <span>•</span>
                <span>{event.title}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

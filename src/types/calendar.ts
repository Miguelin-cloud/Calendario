export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export type EventOwner = 'partner1' | 'partner2' | 'both';

export type AppTheme = 'classic' | 'bears' | 'dragons';

export type EventCategory =
  | 'romantic'
  | 'work'
  | 'leisure'
  | 'health'
  | 'trip'
  | 'home'
  | 'other';

export type EventMoodKey =
  | 'excited'
  | 'nervous'
  | 'tired'
  | 'fire'
  | 'love'
  | 'zen'
  | 'lazy'
  | 'party'
  | 'focus'
  | 'relaxed'; // backwards-compatible alias

export interface EventMood {
  key: EventMoodKey;
  emoji: string;
  label: string;
  category: 'energy' | 'mood' | 'vibe';
  description: string;
  badgeBg: string;
  badgeText: string;
}

export interface SupportMessage {
  id: string;
  senderId: 'partner1' | 'partner2';
  senderName: string;
  text: string;
  emoji: string;
  createdAt: string;
}

export interface PartnerConfig {
  id: string;
  name: string;
  color: string;
  avatarBg: string;
  avatarIcon?: string;
}

export interface CoupleConfig {
  partner1: PartnerConfig;
  partner2: PartnerConfig;
  sharedColor: string;
  anniversaryDate?: string;
  theme: AppTheme;
}

export interface EventPhoto {
  id: string;
  url: string;
  caption?: string;
  addedBy: 'partner1' | 'partner2';
  addedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  allDay: boolean;
  ownerId: EventOwner;
  color: string;
  category: EventCategory;
  mood?: EventMoodKey;
  partnerMoods?: {
    partner1?: EventMoodKey;
    partner2?: EventMoodKey;
  };
  supportMessages?: SupportMessage[];
  photos?: EventPhoto[];
  photoUrl?: string; // Primary scrapbook photo
  photoCaption?: string;
  location?: string;
  reminder?: string;
  isMemory?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastModifiedBy?: 'partner1' | 'partner2';
}

export interface WishlistPlan {
  id: string;
  title: string;
  notes?: string;
  suggestedBy: 'partner1' | 'partner2';
  category: 'dinner' | 'trip' | 'movie' | 'activity' | 'relax';
  estimatedCost?: string;
  completed: boolean;
  scheduledEventId?: string;
  createdAt: string;
}

export interface CategoryInfo {
  id: EventCategory;
  label: string;
  icon: string;
}

export const CATEGORY_LIST: CategoryInfo[] = [
  { id: 'romantic', label: 'Cita / Romántico', icon: 'Heart' },
  { id: 'leisure', label: 'Ocio & Amigos', icon: 'Sparkles' },
  { id: 'work', label: 'Trabajo / Estudio', icon: 'Briefcase' },
  { id: 'trip', label: 'Viaje / Escapada', icon: 'Plane' },
  { id: 'health', label: 'Salud / Médico', icon: 'Activity' },
  { id: 'home', label: 'Hogar & Recados', icon: 'Home' },
  { id: 'other', label: 'Otro evento', icon: 'Calendar' },
];

export const MOODS: Record<EventMoodKey, EventMood> = {
  excited: {
    key: 'excited',
    emoji: '😊',
    label: '😊 Excited',
    category: 'mood',
    description: '¡Ilusionado/a y con muchísimas ganas de que llegue!',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    badgeText: 'text-emerald-800',
  },
  nervous: {
    key: 'nervous',
    emoji: '😰',
    label: '😰 Nervous',
    category: 'mood',
    description: 'Entrevistas, exámenes, médico... ¡necesita apoyo y mimos!',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeText: 'text-amber-800',
  },
  tired: {
    key: 'tired',
    emoji: '😴',
    label: '😴 Tired',
    category: 'energy',
    description: 'Cansado/a, con sueño o poca batería corporal',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: 'text-slate-700',
  },
  fire: {
    key: 'fire',
    emoji: '🔥',
    label: '🔥 Energetic',
    category: 'energy',
    description: '¡A tope de energía, imparable y con fuerza!',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
    badgeText: 'text-orange-800',
  },
  love: {
    key: 'love',
    emoji: '🥰',
    label: '🥰 Romantic',
    category: 'vibe',
    description: 'Modo amor / innamorati, cena especial, caricias o mimos',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    badgeText: 'text-rose-800',
  },
  zen: {
    key: 'zen',
    emoji: '🧘',
    label: '🧘 Zen & Relax',
    category: 'energy',
    description: 'Tranquilidad, descanso, paz mental o desconexión',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    badgeText: 'text-teal-800',
  },
  relaxed: {
    key: 'relaxed',
    emoji: '🧘',
    label: '🧘 Zen & Relax',
    category: 'energy',
    description: 'Tranquilidad, descanso, paz mental o desconexión',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    badgeText: 'text-teal-800',
  },
  lazy: {
    key: 'lazy',
    emoji: '🥱',
    label: '🥱 Lazy',
    category: 'energy',
    description: 'Pereza máxima... toca hacerlo pero qué pocas ganas',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    badgeText: 'text-purple-800',
  },
  party: {
    key: 'party',
    emoji: '🥳',
    label: '🥳 Party & Fun',
    category: 'vibe',
    description: 'Fiesta, diversión con amigos, risas y copas',
    badgeBg: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
    badgeText: 'text-fuchsia-800',
  },
  focus: {
    key: 'focus',
    emoji: '🎯',
    label: '🎯 Focus',
    category: 'energy',
    description: 'Concentración total en trabajo o estudio',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    badgeText: 'text-blue-800',
  },
};

export const QUICK_SUPPORT_PHRASES = [
  '¡Ánimo vida mía, te saldrá espectacular! ❤️💪',
  '¡Mucha suerte amore! Estoy súper orgulloso/a de ti 🍀✨',
  '¡Tranqui, que tú vales oro! Te espero luego con un abrazo gigante 🤗',
  '¡A comerte el mundo, fiera! 🔥👑',
  '¡Te tengo preparado tu postre / comida favorita para celebrarlo! 🍕😋',
];

export const PRESET_PALETTES = [
  { name: 'Índigo Real', color: '#4F46E5' },
  { name: 'Rosa Coral', color: '#F43F5E' },
  { name: 'Lavanda Violeta', color: '#8B5CF6' },
  { name: 'Esmeralda Fresco', color: '#10B981' },
  { name: 'Ámbar Cálido', color: '#F59E0B' },
  { name: 'Azul Cielo', color: '#0EA5E9' },
  { name: 'Fucsia Pasión', color: '#D946EF' },
  { name: 'Turquesa Mar', color: '#14B8A6' },
  { name: 'Rubí Rojo', color: '#EF4444' },
  { name: 'Grafito Elegante', color: '#475569' },
];

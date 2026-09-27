import { AppTheme } from '../types/calendar';

export interface ThemeDefinition {
  id: AppTheme;
  name: string;
  subtitle: string;
  tagline: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  sharedColor: string;
  // CSS styling tokens
  bgMain: string;
  bgCard: string;
  bgHeader: string;
  borderSubtle: string;
  borderAccent: string;
  textPrimary: string;
  textSecondary: string;
  accentPill: string;
  fontDisplay: string;
  bannerGradient: string;
  badgeStyle: string;
  p1Avatar: string;
  p2Avatar: string;
  bothAvatar: string;
  decorIcon: string;
  decorStickers: string[];
  themeMoodGreeting: string;
}

export const THEMES: Record<AppTheme, ThemeDefinition> = {
  classic: {
    id: 'classic',
    name: 'Clásico Elegante',
    subtitle: 'Limpio & Minimalista',
    tagline: 'Estilo Google Calendar moderno y refinado',
    emoji: '🗓️',
    primaryColor: '#4F46E5',
    secondaryColor: '#F43F5E',
    sharedColor: '#8B5CF6',
    bgMain: 'bg-slate-100',
    bgCard: 'bg-white',
    bgHeader: 'bg-white',
    borderSubtle: 'border-slate-200',
    borderAccent: 'border-indigo-300',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-500',
    accentPill: 'bg-slate-100 text-slate-700',
    fontDisplay: 'font-sans tracking-tight',
    bannerGradient: 'from-indigo-600 via-purple-600 to-rose-500',
    badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    p1Avatar: '👨‍💻',
    p2Avatar: '👩‍🎨',
    bothAvatar: '❤️',
    decorIcon: 'Sparkles',
    decorStickers: ['🗓️', '✨', '☕', '❤️'],
    themeMoodGreeting: '¡Organizando vuestros mejores momentos juntos!',
  },
  bears: {
    id: 'bears',
    name: 'Ositos de Amor & Miel 🧸🍯',
    subtitle: 'Orsetti & Coccole',
    tagline: 'Mimos, miel, abrazos achuchables y patitas para Miguel & Giulia',
    emoji: '🧸',
    primaryColor: '#B45309', // Warm Honey Brown
    secondaryColor: '#E11D48', // Sweet Strawberry Honey
    sharedColor: '#D97706', // Golden Honey Amber
    bgMain: 'bg-[#FFF8F0]',
    bgCard: 'bg-[#FFFDFB]',
    bgHeader: 'bg-[#FFF9F2]/95',
    borderSubtle: 'border-[#EEDDCC]',
    borderAccent: 'border-[#F59E0B]',
    textPrimary: 'text-[#451A03]',
    textSecondary: 'text-[#78350F]',
    accentPill: 'bg-[#FEF3C7] text-[#92400E]',
    fontDisplay: 'font-sans font-bold tracking-normal',
    bannerGradient: 'from-[#B45309] via-[#F59E0B] to-[#E11D48]',
    badgeStyle: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    p1Avatar: '🐻', // Papa Bear Miguel
    p2Avatar: '🧸', // Teddy Bear Giulia
    bothAvatar: '🍯', // Tarro de Miel Compartido
    decorIcon: 'Heart',
    decorStickers: ['🐻', '🧸', '🍯', '🐾', '🐝', '🥞', '🥐', '🌸', '💛', '🧇'],
    themeMoodGreeting: '¡Un día lleno de mimos dulces, miel y amor!',
  },
  dragons: {
    id: 'dragons',
    name: 'Dragones de Fuego & Furia 🐉🔥',
    subtitle: 'Furia & Fiamme',
    tagline: 'Llamas míticas, volcanes, espadas ardientes y pasión de dragones',
    emoji: '🐉',
    primaryColor: '#F97316', // Fiery Orange
    secondaryColor: '#EF4444', // Crimson Flame
    sharedColor: '#F59E0B', // Solar Gold
    bgMain: 'bg-[#0B0D13]',
    bgCard: 'bg-[#151922]',
    bgHeader: 'bg-[#151922]/95',
    borderSubtle: 'border-[#262D3D]',
    borderAccent: 'border-[#F97316]/60',
    textPrimary: 'text-[#F1F5F9]',
    textSecondary: 'text-[#94A3B8]',
    accentPill: 'bg-[#1E2433] text-[#FDBA74]',
    fontDisplay: 'font-sans font-black tracking-wide',
    bannerGradient: 'from-[#DC2626] via-[#EA580C] to-[#F59E0B]',
    badgeStyle: 'bg-[#7C2D12]/60 text-[#FDBA74] border-[#EA580C]/50',
    p1Avatar: '🐲', // Dragón de Fuego Miguel
    p2Avatar: '🐉', // Dragona Mística Giulia
    bothAvatar: '⚔️', // Espadas de Fuego Gemelas
    decorIcon: 'Flame',
    decorStickers: ['🐉', '🐲', '🔥', '⚔️', '💎', '🌋', '🛡️', '🏰', '👑', '⚡'],
    themeMoodGreeting: '¡Que la furia y la pasión del fuego guíen vuestro día!',
  },
};

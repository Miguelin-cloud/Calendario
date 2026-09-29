import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  BellRing,
  BellOff,
  Search,
  Sparkles,
  Dices,
  Palette,
  Globe,
  Settings,
  Download,
  Heart,
  Check,
  Calendar,
  Users,
  Volume2,
} from 'lucide-react';
import { CoupleConfig, EventOwner } from '../types/calendar';
import { THEMES } from '../utils/themeStyles';
import { Language, TRANSLATIONS } from '../utils/i18n';
import {
  getNotificationPermission,
  requestNotificationPermission,
  areNotificationsEnabled,
  setNotificationsEnabled,
  triggerEventNotification,
  playNotificationChime,
  NotificationPermissionState,
} from '../utils/notifications';
import { getNextAnniversaryInfo } from '../utils/dateUtils';

interface CalendarOptionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  couple: CoupleConfig;
  lang: Language;
  currentPartnerId: 'partner1' | 'partner2';
  filterOwner: EventOwner | 'all';
  searchQuery: string;
  plansCount: number;
  isInstallable: boolean;
  isInstalled: boolean;
  onFilterChange: (filter: EventOwner | 'all') => void;
  onSearchChange: (query: string) => void;
  onSwitchPartner: (id: 'partner1' | 'partner2') => void;
  onLanguageChange: (lang: Language) => void;
  onOpenSettings: () => void;
  onOpenWishlist: () => void;
  onOpenThemeSelector: () => void;
  onOpenDice: () => void;
  onOpenInstallGuide: () => void;
  onInstallApp: () => void;
}

export const CalendarOptionsDrawer: React.FC<CalendarOptionsDrawerProps> = ({
  isOpen,
  onClose,
  couple,
  lang,
  currentPartnerId,
  filterOwner,
  searchQuery,
  plansCount,
  isInstallable,
  isInstalled,
  onFilterChange,
  onSearchChange,
  onSwitchPartner,
  onLanguageChange,
  onOpenSettings,
  onOpenWishlist,
  onOpenThemeSelector,
  onOpenDice,
  onOpenInstallGuide,
  onInstallApp,
}) => {
  const [notifState, setNotifState] = useState<NotificationPermissionState>('default');
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [testSent, setTestSent] = useState(false);

  const theme = THEMES[couple.theme || 'classic'];
  const t = TRANSLATIONS[lang];
  const isIt = lang === 'it';
  const anniversaryInfo = getNextAnniversaryInfo(couple.anniversaryDate || '2025-02-14', lang);

  useEffect(() => {
    if (isOpen) {
      setNotifState(getNotificationPermission());
      setNotifEnabled(areNotificationsEnabled());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleNotifications = async () => {
    if (notifState !== 'granted') {
      const granted = await requestNotificationPermission();
      setNotifState(getNotificationPermission());
      if (granted) {
        setNotifEnabled(true);
        triggerEventNotification({
          title: isIt ? '🔔 Notifiche attivate!' : '🔔 ¡Notificaciones activadas!',
          body: isIt
            ? 'Riceverai avvisi quando il tuo partner aggiunge o modifica un evento.'
            : 'Recibirás avisos en tu pantalla cuando tu pareja añada o cambie eventos.',
        });
      }
    } else {
      const next = !notifEnabled;
      setNotifEnabled(next);
      setNotificationsEnabled(next);
      if (next) {
        playNotificationChime();
      }
    }
  };

  const handleTestNotification = () => {
    setTestSent(true);
    triggerEventNotification({
      title: isIt ? '❤️ Notifica di prova' : '❤️ Notificación de prueba',
      body: isIt
        ? `${couple.partner2.name} e ${couple.partner1.name}: il calendario condiviso funziona in tempo reale!`
        : `${couple.partner1.name} y ${couple.partner2.name}: ¡El calendario sincroniza en tiempo real!`,
    });
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
              ⚙️
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {isIt ? 'Menu & Opzioni' : 'Menú y Opciones'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {couple.partner1.name} ❤️ {couple.partner2.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* ============================================================== */}
          {/* 1. NOTIFICACIONES PUSH EN EL NAVEGADOR                        */}
          {/* ============================================================== */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  {notifEnabled && notifState === 'granted' ? (
                    <BellRing className="w-4 h-4 animate-bounce-short" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    {isIt ? 'Notifiche in tempo reale' : 'Notificaciones en tiempo real'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {isIt
                      ? 'Ricevi un avviso sonoro e su schermo quando il partner aggiunge o modifica un evento.'
                      : 'Recibe un aviso sonoro y en pantalla cuando tu pareja añade o cambia un evento.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 gap-2">
              <button
                onClick={handleToggleNotifications}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                  notifEnabled && notifState === 'granted'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {notifEnabled && notifState === 'granted' ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{isIt ? 'Notifiche Attive' : 'Notificaciones Activas'}</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>{isIt ? 'Attiva Notifiche' : 'Activar Notificaciones'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleTestNotification}
                className="py-2 px-3 rounded-xl font-semibold text-xs border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                title="Probar sonido y aviso"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{testSent ? (isIt ? 'Inviata!' : '¡Enviada!') : (isIt ? 'Prova' : 'Probar')}</span>
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 2. BUSCADOR DE EVENTOS                                         */}
          {/* ============================================================== */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isIt ? 'Cerca nel calendario' : 'Buscar en el calendario'}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={isIt ? 'Cerca evento, luogo o nota...' : 'Buscar evento, lugar o nota...'}
                className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. FILTRAR POR PERSONA (TODOS / MIGUEL / GIULIA / JUNTOS)      */}
          {/* ============================================================== */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isIt ? 'Filtra eventi' : 'Filtrar eventos'}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onFilterChange('all')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  filterOwner === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isIt ? 'Tutti gli eventi' : 'Todos los eventos'}</span>
              </button>

              <button
                onClick={() => onFilterChange('both')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  filterOwner === 'both'
                    ? 'text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor: filterOwner === 'both' ? couple.sharedColor : undefined,
                }}
              >
                <span>{theme.bothAvatar}</span>
                <span>{isIt ? 'Insieme ❤️' : 'Juntos ❤️'}</span>
              </button>

              <button
                onClick={() => onFilterChange('partner1')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  filterOwner === 'partner1'
                    ? 'text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor: filterOwner === 'partner1' ? couple.partner1.color : undefined,
                }}
              >
                <span>{theme.p1Avatar}</span>
                <span>{couple.partner1.name}</span>
              </button>

              <button
                onClick={() => onFilterChange('partner2')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  filterOwner === 'partner2'
                    ? 'text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor: filterOwner === 'partner2' ? couple.partner2.color : undefined,
                }}
              >
                <span>{theme.p2Avatar}</span>
                <span>{couple.partner2.name}</span>
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. HERRAMIENTAS Y ACCIONES DE PAREJA                            */}
          {/* ============================================================== */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isIt ? 'Attività & Coccole' : 'Actividades y Planes'}
            </label>

            {/* Dados para citas */}
            <button
              onClick={() => {
                onClose();
                onOpenDice();
              }}
              className="w-full p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 hover:bg-purple-100/80 transition-all flex items-center justify-between text-purple-900 dark:text-purple-200 font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-200 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300 text-sm">
                  <Dices className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs">{t.whatPlanToday}</div>
                  <div className="text-[10px] text-purple-700/70 dark:text-purple-300/70 font-normal">
                    {isIt ? 'Tira i dadi per decidere cosa fare' : 'Tira los dados para elegir cita o plan'}
                  </div>
                </div>
              </div>
              <span className="text-sm">🎲</span>
            </button>

            {/* Lista de deseos */}
            <button
              onClick={() => {
                onClose();
                onOpenWishlist();
              }}
              className="w-full p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100/80 transition-all flex items-center justify-between text-amber-900 dark:text-amber-200 font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-200 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300 text-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs">{t.plans}</div>
                  <div className="text-[10px] text-amber-700/70 dark:text-amber-300/70 font-normal">
                    {isIt ? 'Lista dei desideri e idee future' : 'Ideas románticas y planes futuros'}
                  </div>
                </div>
              </div>
              {plansCount > 0 ? (
                <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black">
                  {plansCount}
                </span>
              ) : (
                <span className="text-sm">✨</span>
              )}
            </button>
          </div>

          {/* ============================================================== */}
          {/* 5. PERSONALIZACIÓN Y AJUSTES                                   */}
          {/* ============================================================== */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isIt ? 'Personalizzazione' : 'Personalización'}
            </label>

            {/* Tema */}
            <button
              onClick={() => {
                onClose();
                onOpenThemeSelector();
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>{t.changeTheme}</span>
              </div>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <span>{theme.emoji}</span>
                <span>{theme.name.split(' ')[0]}</span>
              </span>
            </button>

            {/* Idioma */}
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>{t.language.selectLanguage}</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => onLanguageChange('es')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    lang === 'es'
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🇪🇸 ES
                </button>
                <button
                  onClick={() => onLanguageChange('it')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                    lang === 'it'
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🇮🇹 IT
                </button>
              </div>
            </div>

            {/* Ajustes de pareja */}
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-500" />
                <span>{t.settings}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {anniversaryInfo.daysRemaining === 0
                  ? (isIt ? '¡Oggi è il nostro anniversario! ❤️' : '¡Hoy es nuestro aniversario! ❤️')
                  : `${anniversaryInfo.daysRemaining} ${isIt ? 'giorni all\'anniversario' : 'días para el aniversario'}`}
              </span>
            </button>

            {/* Instalar App */}
            {!isInstalled && (
              <button
                onClick={() => {
                  onClose();
                  if (isInstallable) {
                    onInstallApp();
                  } else {
                    onOpenInstallGuide();
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/50 transition-colors flex items-center justify-between font-semibold text-indigo-900 dark:text-indigo-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{isIt ? 'Installa applicazione' : 'Instalar aplicación'}</span>
                </div>
                <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-md">
                  PWA
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 text-center">
          <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1">
            <span>DuoCalendar</span>
            <span>·</span>
            <span>{couple.partner1.name}</span>
            <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
            <span>{couple.partner2.name}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

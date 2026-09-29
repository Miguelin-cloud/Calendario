/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { CalendarView, CalendarEvent, WishlistPlan } from './types/calendar';
import { useCalendarData } from './hooks/useCalendarData';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { fromDateString, toDateString } from './utils/dateUtils';
import { THEMES } from './utils/themeStyles';
import { Language, TRANSLATIONS } from './utils/i18n';
import { Header } from './components/Header';
import { CalendarOptionsDrawer } from './components/CalendarOptionsDrawer';
import { NotificationToast } from './components/NotificationToast';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';
import { AgendaView } from './components/AgendaView';
import { EventModal } from './components/EventModal';
import { EventDetailModal } from './components/EventDetailModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CoupleSettingsModal } from './components/CoupleSettingsModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { CoupleDiceModal } from './components/CoupleDiceModal';
import { PWAInstallGuideModal } from './components/PWAInstallGuideModal';
import {
  Plus,
  WifiOff,
} from 'lucide-react';

export default function App() {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [view, setView] = useState<CalendarView>('month');

  // Multi-language state (Spanish / Italian) with persistence
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('duocalendar_lang');
      if (saved === 'it' || saved === 'es') return saved;
    } catch {}
    return 'es';
  });

  const handleLanguageChange = useCallback((newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('duocalendar_lang', newLang);
    } catch {}
  }, []);

  // Modals state
  const [isOptionsDrawerOpen, setIsOptionsDrawerOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [initialDateForModal, setInitialDateForModal] = useState<string | undefined>();
  const [initialHourForModal, setInitialHourForModal] = useState<string | undefined>();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);

  // Data & Hooks
  const {
    couple,
    events,
    plans,
    currentPartnerId,
    filterOwner,
    searchQuery,
    isSyncing,
    loading,
    activeToast,
    dismissToast,
    setFilterOwner,
    setSearchQuery,
    switchPartner,
    saveEvent,
    deleteEvent,
    sendSupportMessage,
    attachPhotoToEvent,
    removePhotoFromEvent,
    saveCoupleConfig,
    setTheme,
    savePlan,
    deletePlan,
    resetDemo,
  } = useCalendarData();

  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const theme = THEMES[couple.theme || 'classic'];

  // Navigation: Prev, Next, Today
  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (view === 'month' || view === 'agenda') {
        next.setMonth(next.getMonth() - 1);
      } else if (view === 'week') {
        next.setDate(next.getDate() - 7);
      } else if (view === 'day') {
        next.setDate(next.getDate() - 1);
      }
      return next;
    });
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (view === 'month' || view === 'agenda') {
        next.setMonth(next.getMonth() + 1);
      } else if (view === 'week') {
        next.setDate(next.getDate() + 7);
      } else if (view === 'day') {
        next.setDate(next.getDate() + 1);
      }
      return next;
    });
  }, [view]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Event modal actions
  const handleQuickAdd = useCallback((dateString?: string, hour?: string) => {
    setEventToEdit(null);
    setInitialDateForModal(dateString || toDateString(new Date()));
    setInitialHourForModal(hour);
    setIsEventModalOpen(true);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditFromDetail = useCallback((event: CalendarEvent) => {
    setIsDetailModalOpen(false);
    setEventToEdit(event);
    setInitialDateForModal(undefined);
    setInitialHourForModal(undefined);
    setIsEventModalOpen(true);
  }, []);

  const handleSelectDay = useCallback((dateString: string) => {
    setCurrentDate(fromDateString(dateString));
    setView('day');
  }, []);

  const handleSchedulePlan = useCallback((plan: WishlistPlan) => {
    setEventToEdit(null);
    setInitialDateForModal(toDateString(new Date()));
    setInitialHourForModal('20:00');
    setIsEventModalOpen(true);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        handleToday();
      } else if (e.key === 'm' || e.key === 'M') {
        setView('month');
      } else if (e.key === 'w' || e.key === 'W') {
        setView('week');
      } else if (e.key === 'd' || e.key === 'D') {
        setView('day');
      } else if (e.key === 'a' || e.key === 'A') {
        setView('agenda');
      } else if (e.key === 'c' || e.key === 'C') {
        handleQuickAdd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToday, handleQuickAdd]);

  return (
    <div className={`theme-${couple.theme || 'classic'} min-h-[100dvh] lg:h-screen lg:overflow-hidden ${theme.bgMain} flex flex-col ${theme.fontDisplay} antialiased ${theme.textPrimary} transition-colors duration-300 relative`}>
      {/* Real-time In-App Push Notification Toast */}
      <NotificationToast toast={activeToast} onDismiss={dismissToast} />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2 shadow-xs z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>
            {lang === 'it'
              ? 'Modalità offline — Le modifiche sono salvate localmente e verranno sincronizzate alla riconnessione.'
              : 'Modo sin conexión — Los cambios se guardan localmente y se sincronizarán al reconectar.'}
          </span>
        </div>
      )}

      {/* Clean Minimalist Header (Single Row) */}
      <Header
        currentDate={currentDate}
        view={view}
        couple={couple}
        currentPartnerId={currentPartnerId}
        filterOwner={filterOwner}
        searchQuery={searchQuery}
        lang={lang}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={setView}
        onSwitchPartner={switchPartner}
        onOpenNewEvent={() => handleQuickAdd()}
        onOpenMenuDrawer={() => setIsOptionsDrawerOpen(true)}
      />

      {/* Main Calendar Viewport (Expands cleanly and gets 100% focus) */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto sm:px-4 sm:py-2.5 overflow-hidden min-h-0">
        <div className={`flex-1 flex flex-col ${theme.bgCard} sm:rounded-2xl sm:shadow-xs sm:border ${theme.borderSubtle} overflow-hidden transition-colors min-h-0`}>
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              couple={couple}
              lang={lang}
              onSelectEvent={handleSelectEvent}
              onSelectDay={handleSelectDay}
              onQuickAdd={handleQuickAdd}
            />
          )}

          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              couple={couple}
              lang={lang}
              onSelectEvent={handleSelectEvent}
              onSelectDay={handleSelectDay}
              onQuickAdd={handleQuickAdd}
            />
          )}

          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              events={events}
              couple={couple}
              lang={lang}
              onSelectEvent={handleSelectEvent}
              onQuickAdd={handleQuickAdd}
            />
          )}

          {view === 'agenda' && (
            <AgendaView
              events={events}
              couple={couple}
              lang={lang}
              onSelectEvent={handleSelectEvent}
              onQuickAdd={() => handleQuickAdd()}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile: Quick Add Event */}
      <div className="fixed bottom-5 right-4 sm:hidden z-30">
        <button
          onClick={() => handleQuickAdd()}
          className="w-13 h-13 rounded-full text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform bg-slate-900 hover:bg-slate-800"
          title={lang === 'it' ? 'Nuovo evento' : 'Añadir nuevo evento'}
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Slide-over Options & Utilities Drawer */}
      <CalendarOptionsDrawer
        isOpen={isOptionsDrawerOpen}
        onClose={() => setIsOptionsDrawerOpen(false)}
        couple={couple}
        lang={lang}
        currentPartnerId={currentPartnerId}
        filterOwner={filterOwner}
        searchQuery={searchQuery}
        plansCount={plans.filter((p) => !p.completed).length}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onFilterChange={setFilterOwner}
        onSearchChange={setSearchQuery}
        onSwitchPartner={switchPartner}
        onLanguageChange={handleLanguageChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenThemeSelector={() => setIsThemeModalOpen(true)}
        onOpenDice={() => setIsDiceModalOpen(true)}
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
        onInstallApp={install}
      />

      {/* Create / Edit Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        couple={couple}
        defaultOwnerId={currentPartnerId}
        initialDate={initialDateForModal}
        initialHour={initialHourForModal}
        eventToEdit={eventToEdit}
        lang={lang}
        onClose={() => {
          setIsEventModalOpen(false);
          setEventToEdit(null);
        }}
        onSave={saveEvent}
      />

      {/* Event Details & Scrapbook Modal */}
      <EventDetailModal
        isOpen={isDetailModalOpen}
        event={selectedEvent}
        couple={couple}
        currentPartnerId={currentPartnerId}
        lang={lang}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEditFromDetail}
        onDelete={async (id) => {
          await deleteEvent(id);
          setIsDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        onSendSupportMessage={async (eventId: string, text: string, emoji?: string) => {
          const safeEmoji = emoji || '❤️';
          await sendSupportMessage(eventId, text, safeEmoji);
          setSelectedEvent((prev) => {
            if (prev && prev.id === eventId) {
              const newMsg = {
                id: `sup-${Date.now()}`,
                senderId: currentPartnerId,
                senderName: currentPartnerId === 'partner1' ? couple.partner1.name : couple.partner2.name,
                text,
                emoji: safeEmoji,
                createdAt: new Date().toISOString(),
              };
              return {
                ...prev,
                supportMessages: [...(prev.supportMessages || []), newMsg],
              };
            }
            return prev;
          });
        }}
        onAttachPhoto={async (eventId: string, photoUrl: string, caption?: string) => {
          await attachPhotoToEvent(eventId, photoUrl, caption);
          setSelectedEvent((prev) => {
            if (prev && prev.id === eventId) {
              const author = currentPartnerId;
              const newPhoto = {
                id: `photo-${Date.now()}`,
                url: photoUrl,
                caption,
                addedBy: author,
                addedAt: new Date().toISOString(),
              };
              return {
                ...prev,
                photoUrl,
                photoCaption: caption || prev.photoCaption,
                photos: [...(prev.photos || []), newPhoto],
                isMemory: true,
              };
            }
            return prev;
          });
        }}
        onRemovePhoto={async (eventId: string, photoId?: string) => {
          await removePhotoFromEvent(eventId, photoId);
          setSelectedEvent((prev) => {
            if (prev && prev.id === eventId) {
              const filtered = photoId ? (prev.photos || []).filter((p) => p.id !== photoId) : [];
              return {
                ...prev,
                photos: filtered,
                photoUrl: filtered.length > 0 ? filtered[filtered.length - 1].url : undefined,
                photoCaption: filtered.length > 0 ? filtered[filtered.length - 1].caption : undefined,
                isMemory: filtered.length > 0,
              };
            }
            return prev;
          });
        }}
      />

      {/* Wishlist & Romantic Date Plans Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        plans={plans}
        couple={couple}
        currentPartnerId={currentPartnerId}
        lang={lang}
        onClose={() => setIsWishlistOpen(false)}
        onSavePlan={savePlan}
        onDeletePlan={deletePlan}
        onSchedulePlan={handleSchedulePlan}
      />

      {/* Couple Customization Settings Modal */}
      <CoupleSettingsModal
        isOpen={isSettingsOpen}
        couple={couple}
        lang={lang}
        onClose={() => setIsSettingsOpen(false)}
        onSave={saveCoupleConfig}
        onResetDemo={resetDemo}
      />

      {/* Theme Selector Modal (Clásico, Ositos 🧸, Dragones de Fuego 🐉) */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        currentTheme={couple.theme || 'classic'}
        lang={lang}
        onClose={() => setIsThemeModalOpen(false)}
        onSelectTheme={(t) => {
          setTheme(t);
          setIsThemeModalOpen(false);
        }}
      />

      {/* Couple Spontaneous Ideas / Dice Modal */}
      <CoupleDiceModal
        isOpen={isDiceModalOpen}
        plans={plans}
        couple={couple}
        lang={lang}
        onClose={() => setIsDiceModalOpen(false)}
        onSchedulePlan={(title, notes) => {
          setEventToEdit(null);
          setInitialDateForModal(toDateString(new Date()));
          setInitialHourForModal('20:00');
          setIsEventModalOpen(true);
          setIsDiceModalOpen(false);
        }}
      />

      {/* PWA Home Screen Installation Guide Modal */}
      <PWAInstallGuideModal
        isOpen={isInstallGuideOpen}
        isInstallable={isInstallable}
        lang={lang}
        onClose={() => setIsInstallGuideOpen(false)}
        onDirectInstall={install}
      />
    </div>
  );
}

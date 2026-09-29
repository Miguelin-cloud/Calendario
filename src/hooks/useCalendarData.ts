import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CoupleConfig,
  CalendarEvent,
  WishlistPlan,
  EventOwner,
  AppTheme,
  SupportMessage,
  EventPhoto,
} from '../types/calendar';
import {
  db,
  cleanForFirestore,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { triggerEventNotification } from '../utils/notifications';
import { ToastNotification } from '../components/NotificationToast';

const LOCAL_STORAGE_KEY = 'duocalendar_cache_v4';
const CURRENT_PARTNER_KEY = 'duocalendar_current_user_v1';

const DEFAULT_COUPLE: CoupleConfig = {
  partner1: {
    id: 'partner1',
    name: 'Miguel',
    color: '#4F46E5',
    avatarBg: '#E0E7FF',
  },
  partner2: {
    id: 'partner2',
    name: 'Giulia',
    color: '#F43F5E',
    avatarBg: '#FFE4E6',
  },
  sharedColor: '#8B5CF6',
  anniversaryDate: '2025-02-14',
  theme: 'bears',
};

export function useCalendarData() {
  const [couple, setCouple] = useState<CoupleConfig>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.couple) {
          if (parsed.couple.partner2?.name === 'Ella' || !parsed.couple.partner2?.name) {
            parsed.couple.partner2.name = 'Giulia';
          }
          return parsed.couple;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_COUPLE;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.events)) return parsed.events;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [plans, setPlans] = useState<WishlistPlan[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.plans)) return parsed.plans;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [currentPartnerId, setCurrentPartnerId] = useState<'partner1' | 'partner2'>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_PARTNER_KEY);
      if (saved === 'partner2' || saved === 'partner1') return saved;
    } catch {
      // ignore
    }
    return 'partner1';
  });

  const [filterOwner, setFilterOwner] = useState<EventOwner | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);

  const initialEventsLoadedRef = useRef(false);
  const currentPartnerIdRef = useRef(currentPartnerId);
  currentPartnerIdRef.current = currentPartnerId;
  const coupleRef = useRef(couple);
  coupleRef.current = couple;

  // Auto-dismiss toast after 4.5 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [activeToast]);

  // Sync to local cache
  const updateCache = useCallback((c: CoupleConfig, evts: CalendarEvent[], pls: WishlistPlan[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ couple: c, events: evts, plans: pls }));
    } catch {
      // storage quota or disabled
    }
  }, []);

  // --------------------------------------------------------------------------
  // REAL-TIME FIRESTORE LISTENERS (LIVE SYNC ACROSS ALL PHONES, PCS & VERCEL)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let unsubscribeCouple: (() => void) | null = null;
    let unsubscribeEvents: (() => void) | null = null;
    let unsubscribePlans: (() => void) | null = null;

    try {
      // 1. Couple Config Listener
      const coupleDocRef = doc(db, 'couple', 'config');
      unsubscribeCouple = onSnapshot(
        coupleDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as CoupleConfig;
            setCouple((prev) => {
              const updated = { ...prev, ...data };
              updateCache(updated, events, plans);
              return updated;
            });
          } else {
            // Seed initial config if not exists
            const cleanInit = cleanForFirestore(DEFAULT_COUPLE as unknown as Record<string, unknown>);
            setDoc(coupleDocRef, cleanInit).catch((err) => {
              handleFirestoreError(err, OperationType.WRITE, 'couple/config');
            });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'couple/config');
        }
      );

      // 2. Real-time Events Listener with Live Push/Sound Alerts
      const eventsColRef = collection(db, 'events');
      unsubscribeEvents = onSnapshot(
        eventsColRef,
        (snapshot) => {
          setIsSyncing(true);
          const remoteEvents: CalendarEvent[] = [];
          snapshot.forEach((docSnap) => {
            remoteEvents.push(docSnap.data() as CalendarEvent);
          });

          // Sort by date & time
          remoteEvents.sort((a, b) => {
            const dateCmp = a.startDate.localeCompare(b.startDate);
            if (dateCmp !== 0) return dateCmp;
            return (a.startTime || '').localeCompare(b.startTime || '');
          });

          // Check for remote additions or modifications to alert partner
          if (initialEventsLoadedRef.current && !snapshot.metadata.hasPendingWrites) {
            snapshot.docChanges().forEach((change) => {
              const eventData = change.doc.data() as CalendarEvent;
              // If the change was done by the other partner or is shared:
              const isFromPartner = eventData.lastModifiedBy
                ? eventData.lastModifiedBy !== currentPartnerIdRef.current
                : eventData.ownerId !== currentPartnerIdRef.current;

              if (isFromPartner) {
                const partnerName =
                  currentPartnerIdRef.current === 'partner1'
                    ? coupleRef.current.partner2.name
                    : coupleRef.current.partner1.name;

                if (change.type === 'added') {
                  const title = `✨ ${partnerName} añadió un evento`;
                  const body = `${eventData.title} · ${eventData.startDate}${eventData.startTime ? ' a las ' + eventData.startTime : ''}`;
                  triggerEventNotification({ title, body, tag: `event-add-${eventData.id}` });
                  setActiveToast({
                    id: `toast-${Date.now()}`,
                    title,
                    body,
                    type: 'event',
                  });
                } else if (change.type === 'modified') {
                  // Check if a new romantic support note was added
                  const lastMsg = eventData.supportMessages && eventData.supportMessages.length > 0
                    ? eventData.supportMessages[eventData.supportMessages.length - 1]
                    : null;

                  if (lastMsg && lastMsg.senderId !== currentPartnerIdRef.current) {
                    const title = `💌 Mensaje de amor de ${partnerName}`;
                    const body = `"${lastMsg.text}" en ${eventData.title}`;
                    triggerEventNotification({ title, body, tag: `msg-${eventData.id}` });
                    setActiveToast({
                      id: `toast-${Date.now()}`,
                      title,
                      body,
                      type: 'message',
                    });
                  } else {
                    const title = `✏️ ${partnerName} modificó un evento`;
                    const body = `${eventData.title} ha sido actualizado.`;
                    triggerEventNotification({ title, body, tag: `event-mod-${eventData.id}` });
                    setActiveToast({
                      id: `toast-${Date.now()}`,
                      title,
                      body,
                      type: 'event',
                    });
                  }
                }
              }
            });
          }

          initialEventsLoadedRef.current = true;
          setEvents(remoteEvents);
          updateCache(coupleRef.current, remoteEvents, plans);
          setTimeout(() => setIsSyncing(false), 400);
        },
        (error) => {
          setIsSyncing(false);
          handleFirestoreError(error, OperationType.LIST, 'events');
        }
      );

      // 3. Real-time Wishlist Plans Listener
      const plansColRef = collection(db, 'plans');
      unsubscribePlans = onSnapshot(
        plansColRef,
        (snapshot) => {
          const remotePlans: WishlistPlan[] = [];
          snapshot.forEach((docSnap) => {
            remotePlans.push(docSnap.data() as WishlistPlan);
          });
          setPlans(remotePlans);
          updateCache(coupleRef.current, events, remotePlans);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'plans');
        }
      );
    } catch (err) {
      console.warn('Firestore real-time subscription error:', err);
    }

    return () => {
      if (unsubscribeCouple) unsubscribeCouple();
      if (unsubscribeEvents) unsubscribeEvents();
      if (unsubscribePlans) unsubscribePlans();
    };
  }, [updateCache]);

  // Change current active user persona
  const switchPartner = (id: 'partner1' | 'partner2') => {
    setCurrentPartnerId(id);
    try {
      localStorage.setItem(CURRENT_PARTNER_KEY, id);
    } catch {
      // ignore
    }
  };

  // Add or edit event in Real-Time Cloud Firestore
  const saveEvent = async (eventData: Partial<CalendarEvent> & { title: string; startDate: string }) => {
    const id = eventData.id || `evt-${Date.now()}`;
    const now = new Date().toISOString();
    const updatedEvent: CalendarEvent = {
      id,
      title: eventData.title,
      description: eventData.description || '',
      startDate: eventData.startDate,
      endDate: eventData.endDate || eventData.startDate,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      allDay: !!eventData.allDay,
      ownerId: eventData.ownerId || currentPartnerId,
      color: eventData.color || (eventData.ownerId === 'partner2' ? couple.partner2.color : couple.partner1.color),
      category: eventData.category || 'other',
      mood: eventData.mood,
      supportMessages: eventData.supportMessages || [],
      location: eventData.location,
      reminder: eventData.reminder,
      createdAt: eventData.createdAt || now,
      updatedAt: now,
      lastModifiedBy: currentPartnerId,
    };

    // Optimistic UI update
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === id);
      const next = exists ? prev.map((e) => (e.id === id ? updatedEvent : e)) : [...prev, updatedEvent];
      updateCache(couple, next, plans);
      return next;
    });

    // Write cleaned data to Firestore Real-Time Cloud
    try {
      const cleaned = cleanForFirestore(updatedEvent as unknown as Record<string, unknown>);
      await setDoc(doc(db, 'events', id), cleaned);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `events/${id}`);
    }

    return updatedEvent;
  };

  // Send support message to an event in Real-Time
  const sendSupportMessage = async (eventId: string, text: string, emoji = '❤️') => {
    const sender = currentPartnerId === 'partner1' ? couple.partner1 : couple.partner2;
    const newMsg: SupportMessage = {
      id: `sup-${Date.now()}`,
      senderId: currentPartnerId,
      senderName: sender.name,
      text,
      emoji,
      createdAt: new Date().toISOString(),
    };

    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const updatedEvent: CalendarEvent = {
      ...targetEvent,
      supportMessages: [...(targetEvent.supportMessages || []), newMsg],
      updatedAt: new Date().toISOString(),
      lastModifiedBy: currentPartnerId,
    };

    setEvents((prev) => {
      const next = prev.map((e) => (e.id === eventId ? updatedEvent : e));
      updateCache(couple, next, plans);
      return next;
    });

    try {
      const cleaned = cleanForFirestore(updatedEvent as unknown as Record<string, unknown>);
      await setDoc(doc(db, 'events', eventId), cleaned);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `events/${eventId}`);
    }
  };

  // Attach photo to event scrapbook in Real-Time
  const attachPhotoToEvent = async (
    eventId: string,
    photoUrl: string,
    caption?: string,
    addedBy?: 'partner1' | 'partner2'
  ) => {
    const photoId = `photo-${Date.now()}`;
    const author = addedBy || currentPartnerId;
    const newPhoto: EventPhoto = {
      id: photoId,
      url: photoUrl,
      caption: caption || '',
      addedBy: author,
      addedAt: new Date().toISOString(),
    };

    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const existingPhotos = targetEvent.photos || [];
    const updatedEvent: CalendarEvent = {
      ...targetEvent,
      photoUrl: photoUrl,
      photoCaption: caption || targetEvent.photoCaption,
      photos: [...existingPhotos, newPhoto],
      isMemory: true,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: currentPartnerId,
    };

    setEvents((prev) => {
      const next = prev.map((e) => (e.id === eventId ? updatedEvent : e));
      updateCache(couple, next, plans);
      return next;
    });

    try {
      const cleaned = cleanForFirestore(updatedEvent as unknown as Record<string, unknown>);
      await setDoc(doc(db, 'events', eventId), cleaned);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `events/${eventId}`);
    }
  };

  // Remove photo from event in Real-Time
  const removePhotoFromEvent = async (eventId: string, photoId?: string) => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const filtered = photoId ? (targetEvent.photos || []).filter((p) => p.id !== photoId) : [];
    const updatedEvent: CalendarEvent = {
      ...targetEvent,
      photos: filtered,
      photoUrl: filtered.length > 0 ? filtered[filtered.length - 1].url : undefined,
      photoCaption: filtered.length > 0 ? filtered[filtered.length - 1].caption : undefined,
      isMemory: filtered.length > 0,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: currentPartnerId,
    };

    setEvents((prev) => {
      const next = prev.map((e) => (e.id === eventId ? updatedEvent : e));
      updateCache(couple, next, plans);
      return next;
    });

    try {
      const cleaned = cleanForFirestore(updatedEvent as unknown as Record<string, unknown>);
      await setDoc(doc(db, 'events', eventId), cleaned);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `events/${eventId}`);
    }
  };

  // Delete event in Real-Time Cloud Firestore
  const deleteEvent = async (id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      updateCache(couple, next, plans);
      return next;
    });

    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `events/${id}`);
    }
  };

  // Save couple profile config in Real-Time
  const saveCoupleConfig = async (newConfig: Partial<CoupleConfig>) => {
    const updated: CoupleConfig = {
      ...couple,
      ...newConfig,
    };
    setCouple(updated);
    updateCache(updated, events, plans);

    try {
      const cleaned = cleanForFirestore(updated as unknown as Record<string, unknown>);
      await setDoc(doc(db, 'couple', 'config'), cleaned);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'couple/config');
    }
  };

  // Change theme quickly
  const setTheme = (theme: AppTheme) => {
    saveCoupleConfig({ theme });
  };

  // Add / edit wishlist plan in Real-Time
  const savePlan = async (planData: Partial<WishlistPlan> & { title: string }) => {
    const id = planData.id || `plan-${Date.now()}`;
    const newPlan: WishlistPlan = {
      id,
      title: planData.title,
      notes: planData.notes,
      suggestedBy: planData.suggestedBy || currentPartnerId,
      category: planData.category || 'dinner',
      estimatedCost: planData.estimatedCost,
      completed: !!planData.completed,
      scheduledEventId: planData.scheduledEventId,
      createdAt: planData.createdAt || new Date().toISOString(),
    };

    setPlans((prev) => {
      const exists = prev.some((p) => p.id === id);
      const next = exists ? prev.map((p) => (p.id === id ? newPlan : p)) : [...prev, newPlan];
      updateCache(couple, events, next);
      return next;
    });

    try {
      const cleaned = cleanForFirestore(newPlan as unknown as Record<string, unknown>);
      await setDoc(doc(db, 'plans', id), cleaned);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `plans/${id}`);
    }
  };

  // Delete plan in Real-Time
  const deletePlan = async (id: string) => {
    setPlans((prev) => {
      const next = prev.filter((p) => p.id !== id);
      updateCache(couple, events, next);
      return next;
    });

    try {
      await deleteDoc(doc(db, 'plans', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `plans/${id}`);
    }
  };

  // Reset demo
  const resetDemo = async () => {
    try {
      const cleaned = cleanForFirestore(DEFAULT_COUPLE as unknown as Record<string, unknown>);
      await setDoc(doc(db, 'couple', 'config'), cleaned);
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered events
  const filteredEvents = events.filter((e) => {
    if (filterOwner !== 'all' && e.ownerId !== filterOwner) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchDesc = e.description?.toLowerCase().includes(q);
      const matchLoc = e.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) {
        return false;
      }
    }
    return true;
  });

  return {
    couple,
    events: filteredEvents,
    allEvents: events,
    plans,
    currentPartnerId,
    currentPartner: currentPartnerId === 'partner1' ? couple.partner1 : couple.partner2,
    otherPartner: currentPartnerId === 'partner1' ? couple.partner2 : couple.partner1,
    filterOwner,
    searchQuery,
    loading,
    isSyncing,
    activeToast,
    dismissToast: () => setActiveToast(null),
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
  };
}

import { useState, useEffect, useCallback } from 'react';
import {
  CoupleConfig,
  CalendarEvent,
  WishlistPlan,
  EventOwner,
  AppTheme,
  SupportMessage,
  EventPhoto,
} from '../types/calendar';

const LOCAL_STORAGE_KEY = 'duocalendar_cache_v2';
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
  theme: 'classic',
};

export function useCalendarData() {
  const [couple, setCouple] = useState<CoupleConfig>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.couple) {
          if (parsed.couple.partner2.name === 'Ella' || !parsed.couple.partner2.name) {
            parsed.couple.partner2.name = 'Giulia';
          }
          if (!parsed.couple.theme) {
            parsed.couple.theme = 'classic';
          }
          return parsed.couple;
        }
      }
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [currentPartnerId, setCurrentPartnerId] = useState<'partner1' | 'partner2'>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_PARTNER_KEY);
      if (saved === 'partner2' || saved === 'partner1') return saved;
    } catch (e) {
      // ignore
    }
    return 'partner1';
  });

  const [filterOwner, setFilterOwner] = useState<EventOwner | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync to local cache
  const updateCache = useCallback((c: CoupleConfig, evts: CalendarEvent[], pls: WishlistPlan[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ couple: c, events: evts, plans: pls }));
    } catch (e) {
      // storage quota or disabled
    }
  }, []);

  // Fetch from server
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setIsSyncing(true);
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data.couple) {
          if (data.couple.partner2.name === 'Ella') {
            data.couple.partner2.name = 'Giulia';
          }
          if (!data.couple.theme) {
            data.couple.theme = 'classic';
          }
          setCouple(data.couple);
        }
        if (Array.isArray(data.events)) setEvents(data.events);
        if (Array.isArray(data.plans)) setPlans(data.plans);
        updateCache(data.couple, data.events, data.plans);
      }
    } catch (err) {
      console.warn('Network offline or error fetching calendar data:', err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [updateCache]);

  // Initial load and periodic polling
  useEffect(() => {
    fetchData(false);

    const interval = setInterval(() => {
      fetchData(true);
    }, 10000); // 10s background sync

    const onFocus = () => fetchData(true);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchData]);

  // Change current active user persona
  const switchPartner = (id: 'partner1' | 'partner2') => {
    setCurrentPartnerId(id);
    try {
      localStorage.setItem(CURRENT_PARTNER_KEY, id);
    } catch (e) {
      // ignore
    }
  };

  // Add or edit event
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
    };

    setEvents((prev) => {
      const exists = prev.some((e) => e.id === id);
      const next = exists ? prev.map((e) => (e.id === id ? updatedEvent : e)) : [...prev, updatedEvent];
      updateCache(couple, next, plans);
      return next;
    });

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.event) {
          setEvents((prev) => prev.map((e) => (e.id === id ? result.event : e)));
        }
      }
    } catch (err) {
      console.warn('Saved offline, will sync when reconnected:', err);
    }

    return updatedEvent;
  };

  // Send support message to an event
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

    setEvents((prev) => {
      const next = prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            supportMessages: [...(e.supportMessages || []), newMsg],
          };
        }
        return e;
      });
      updateCache(couple, next, plans);
      return next;
    });

    try {
      await fetch(`/api/events/${eventId}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentPartnerId,
          senderName: sender.name,
          text,
          emoji,
        }),
      });
    } catch (err) {
      console.warn('Support message saved locally:', err);
    }
  };

  // Attach photo to event scrapbook
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

    setEvents((prev) => {
      const next = prev.map((e) => {
        if (e.id === eventId) {
          const existingPhotos = e.photos || [];
          return {
            ...e,
            photoUrl: photoUrl,
            photoCaption: caption || e.photoCaption,
            photos: [...existingPhotos, newPhoto],
            isMemory: true,
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      });
      updateCache(couple, next, plans);
      return next;
    });

    try {
      await fetch(`/api/events/${eventId}/photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: newPhoto }),
      });
    } catch (err) {
      console.warn('Photo saved locally, server sync failed:', err);
    }
  };

  // Remove photo from event
  const removePhotoFromEvent = async (eventId: string, photoId?: string) => {
    setEvents((prev) => {
      const next = prev.map((e) => {
        if (e.id === eventId) {
          const filtered = photoId ? (e.photos || []).filter((p) => p.id !== photoId) : [];
          return {
            ...e,
            photos: filtered,
            photoUrl: filtered.length > 0 ? filtered[filtered.length - 1].url : undefined,
            photoCaption: filtered.length > 0 ? filtered[filtered.length - 1].caption : undefined,
            isMemory: filtered.length > 0,
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      });
      updateCache(couple, next, plans);
      return next;
    });

    try {
      await fetch(`/api/events/${eventId}/photo/${photoId || 'all'}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Photo removed locally:', err);
    }
  };

  // Delete event
  const deleteEvent = async (id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      updateCache(couple, next, plans);
      return next;
    });

    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Deleted locally, server sync failed:', err);
    }
  };

  // Save couple profile config (including theme switch)
  const saveCoupleConfig = async (newConfig: Partial<CoupleConfig>) => {
    const updated: CoupleConfig = {
      ...couple,
      ...newConfig,
    };
    setCouple(updated);
    updateCache(updated, events, plans);

    try {
      await fetch('/api/couple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
    } catch (err) {
      console.warn('Couple config saved locally:', err);
    }
  };

  // Change theme quickly
  const setTheme = (theme: AppTheme) => {
    saveCoupleConfig({ theme });
  };

  // Add / edit wishlist plan
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
      await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan),
      });
    } catch (err) {
      console.warn('Plan saved locally:', err);
    }
  };

  // Delete plan
  const deletePlan = async (id: string) => {
    setPlans((prev) => {
      const next = prev.filter((p) => p.id !== id);
      updateCache(couple, events, next);
      return next;
    });

    try {
      await fetch(`/api/plans/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Plan deleted locally:', err);
    }
  };

  // Reset to demo
  const resetDemo = async () => {
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setCouple(data.data.couple);
          setEvents(data.data.events);
          setPlans(data.data.plans);
          updateCache(data.data.couple, data.data.events, data.data.plans);
        }
      }
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
    refreshData: () => fetchData(true),
  };
}

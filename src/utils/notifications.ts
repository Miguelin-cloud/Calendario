/**
 * Web Push and Browser Notification utility for DuoCalendar
 * Handles notification permissions, browser notifications, sound chimes,
 * and in-app alert toasts when a partner adds or modifies an event.
 */

// Soft audio chime using Web Audio API (zero external assets needed)
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    // Pleasant two-tone chime (E5 -> G#5)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(830.61, now + 0.15); // G#5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(830.61, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.35); // C6

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.12);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.8);
  } catch (err) {
    // Audio not allowed or unsupported - ignore silently
  }
}

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        localStorage.setItem('duocalendar_notifications_enabled', 'true');
      } catch {}
      return true;
    }
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
  }
  return false;
}

export function areNotificationsEnabled(): boolean {
  if (getNotificationPermission() !== 'granted') return false;
  try {
    const saved = localStorage.getItem('duocalendar_notifications_enabled');
    return saved !== 'false';
  } catch {}
  return true;
}

export function setNotificationsEnabled(enabled: boolean) {
  try {
    localStorage.setItem('duocalendar_notifications_enabled', enabled ? 'true' : 'false');
  } catch {}
}

export interface NotificationPayload {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  icon?: string;
}

export function triggerEventNotification(payload: NotificationPayload) {
  // Always play soft chime if notifications are enabled
  playNotificationChime();

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted' && areNotificationsEnabled()) {
    try {
      // If service worker is active, use showNotification for better mobile background alerts
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/icon.svg',
            badge: '/icon.svg',
            tag: payload.tag || 'calendar-event-sync',
            renotify: true,
          } as NotificationOptions);
        }).catch(() => {
          new Notification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/icon.svg',
            tag: payload.tag || 'calendar-event-sync',
          });
        });
      } else {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/icon.svg',
          tag: payload.tag || 'calendar-event-sync',
        });
      }
    } catch (e) {
      console.warn('Could not show system notification:', e);
    }
  }
}

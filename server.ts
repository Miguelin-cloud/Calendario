import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const app = express();
function getPort(): number {
  const portIndex = process.argv.indexOf('--port');
  if (portIndex !== -1 && process.argv[portIndex + 1]) {
    const parsed = parseInt(process.argv[portIndex + 1], 10);
    if (!isNaN(parsed)) return parsed;
  }
  // In development, the dev server must always run on port 3000
  if (process.env.NODE_ENV !== 'production') {
    return 3000;
  }
  return Number(process.env.PORT) || 3000;
}

const PORT = getPort();
const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'calendar-data.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface CoupleConfig {
  partner1: {
    id: string;
    name: string;
    color: string;
    avatarBg: string;
  };
  partner2: {
    id: string;
    name: string;
    color: string;
    avatarBg: string;
  };
  sharedColor: string;
  anniversaryDate?: string; // YYYY-MM-DD
  theme: 'classic' | 'bears' | 'dragons';
}

interface SupportMessage {
  id: string;
  senderId: 'partner1' | 'partner2';
  senderName: string;
  text: string;
  emoji: string;
  createdAt: string;
}

interface EventPhoto {
  id: string;
  url: string;
  caption?: string;
  addedBy: 'partner1' | 'partner2';
  addedAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  allDay: boolean;
  ownerId: 'partner1' | 'partner2' | 'both';
  color: string;
  category: 'romantic' | 'work' | 'leisure' | 'health' | 'trip' | 'home' | 'other';
  mood?: string;
  partnerMoods?: {
    partner1?: string;
    partner2?: string;
  };
  supportMessages?: SupportMessage[];
  photos?: EventPhoto[];
  photoUrl?: string;
  photoCaption?: string;
  location?: string;
  reminder?: string;
  isMemory?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WishlistPlan {
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

interface CalendarDatabase {
  couple: CoupleConfig;
  events: CalendarEvent[];
  plans: WishlistPlan[];
}

function getInitialDatabase(): CalendarDatabase {
  // Use dates around current September 2026
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = today.getDate();

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const d1 = new Date(today);
  const d2 = new Date(today);
  d2.setDate(today.getDate() + 1);
  const d3 = new Date(today);
  d3.setDate(today.getDate() + 3);
  const d4 = new Date(today);
  d4.setDate(today.getDate() + 5);
  const d5 = new Date(today);
  d5.setDate(today.getDate() - 2);

  return {
    couple: {
      partner1: {
        id: 'partner1',
        name: 'Miguel',
        color: '#4F46E5', // Indigo
        avatarBg: '#E0E7FF',
      },
      partner2: {
        id: 'partner2',
        name: 'Giulia',
        color: '#F43F5E', // Rose
        avatarBg: '#FFE4E6',
      },
      sharedColor: '#8B5CF6', // Purple/Violet for both
      anniversaryDate: '2025-02-14',
      theme: 'classic',
    },
    events: [
      {
        id: 'evt-valentin-2025',
        title: 'San Valentín 2025 ❤️ Cita de los Enamorados',
        description: 'Día de San Valentín inolvidable para Miguel & Giulia. ¡Nuestra fecha más especial! ❤️🌹',
        startDate: '2025-02-14',
        endDate: '2025-02-14',
        startTime: '20:30',
        endTime: '23:59',
        allDay: false,
        ownerId: 'both',
        color: '#EF4444',
        category: 'romantic',
        mood: 'love',
        supportMessages: [
          {
            id: 'sup-val-1',
            senderId: 'partner1',
            senderName: 'Miguel',
            text: '¡Buon San Valentino, amore mio! Te amo con locura ❤️✨',
            emoji: '❤️',
            createdAt: '2025-02-14T08:00:00.000Z',
          },
          {
            id: 'sup-val-2',
            senderId: 'partner2',
            senderName: 'Giulia',
            text: 'Amore mio grande, per sempre noi due! ❤️🥂',
            emoji: '🌹',
            createdAt: '2025-02-14T08:30:00.000Z',
          },
        ],
        location: 'Restaurante Romántico con vistas & Paseo de la mano',
        createdAt: '2025-02-14T00:00:00.000Z',
        updatedAt: '2025-02-14T00:00:00.000Z',
      },
      {
        id: 'evt-1',
        title: 'Cena a lume di candela',
        description: 'Probar la nueva trattoria italiana en el centro. ¡Tavolo riservato a nome di Miguel & Giulia!',
        startDate: formatDate(d3),
        endDate: formatDate(d3),
        startTime: '21:00',
        endTime: '23:30',
        allDay: false,
        ownerId: 'both',
        color: '#8B5CF6',
        category: 'romantic',
        mood: 'love',
        supportMessages: [
          {
            id: 'sup-1',
            senderId: 'partner1',
            senderName: 'Miguel',
            text: '¡Con muchísimas ganas de nuestra cena amor mío! ❤️',
            emoji: '🥰',
            createdAt: new Date().toISOString(),
          },
        ],
        location: 'Trattoria Bella Vista',
        reminder: '1h',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'evt-2',
        title: 'Entrevista de trabajo importante',
        description: 'Presentación final y entrevista técnica para el nuevo proyecto.',
        startDate: formatDate(d1),
        endDate: formatDate(d1),
        startTime: '10:00',
        endTime: '11:30',
        allDay: false,
        ownerId: 'partner1',
        color: '#4F46E5',
        category: 'work',
        mood: 'nervous',
        supportMessages: [
          {
            id: 'sup-2',
            senderId: 'partner2',
            senderName: 'Giulia',
            text: 'In bocca al lupo amore mio! Sei il migliore, spacca tutto! 💪🍀❤️',
            emoji: '🍀',
            createdAt: new Date().toISOString(),
          },
        ],
        location: 'Oficina / Sala Virtual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'evt-3',
        title: 'Clase de Yoga & Pilates',
        description: 'Sesión de relajación y estiramientos.',
        startDate: formatDate(d2),
        endDate: formatDate(d2),
        startTime: '18:30',
        endTime: '19:45',
        allDay: false,
        ownerId: 'partner2',
        color: '#F43F5E',
        category: 'health',
        mood: 'relaxed',
        location: 'Centro Zen Studio',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'evt-4',
        title: 'Escapada de fin de semana',
        description: 'Desconexión total en la naturaleza, chimenea y vistas a la montaña.',
        startDate: formatDate(d4),
        endDate: formatDate(new Date(d4.getTime() + 86400000 * 2)),
        startTime: '09:00',
        endTime: '18:00',
        allDay: true,
        ownerId: 'both',
        color: '#10B981',
        category: 'trip',
        mood: 'excited',
        location: 'Sierra de Guadarrama',
        reminder: '1d',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'evt-5',
        title: 'Dentista - Revisión anual',
        description: 'Revisión y limpieza dental anual.',
        startDate: formatDate(d1),
        endDate: formatDate(d1),
        startTime: '17:00',
        endTime: '17:45',
        allDay: false,
        ownerId: 'partner2',
        color: '#F43F5E',
        category: 'health',
        mood: 'nervous',
        supportMessages: [
          {
            id: 'sup-3',
            senderId: 'partner1',
            senderName: 'Miguel',
            text: '¡Tranquila vida mía, no va a ser nada! Luego vamos por un helado 🍦❤️',
            emoji: '🤗',
            createdAt: new Date().toISOString(),
          },
        ],
        location: 'Clínica Dental Alameda',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'evt-6',
        title: 'Partido de pádel con amigos',
        description: 'Partidillo de 4 jugadores en el polideportivo.',
        startDate: formatDate(d5),
        endDate: formatDate(d5),
        startTime: '19:00',
        endTime: '20:30',
        allDay: false,
        ownerId: 'partner1',
        color: '#4F46E5',
        category: 'leisure',
        mood: 'fire',
        location: 'Club de Pádel Las Rozas',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    plans: [
      {
        id: 'plan-1',
        title: 'Preparar pizza napoletana casera juntos',
        notes: 'Hacer la masa reposar 24h, comprar mozzarella di bufala y albahaca fresca',
        suggestedBy: 'partner2',
        category: 'dinner',
        estimatedCost: '€',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'plan-2',
        title: 'Tarde de cine al aire libre con mantita',
        notes: 'Llevar palomitas, bebidas y mantita suave',
        suggestedBy: 'partner1',
        category: 'activity',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'plan-3',
        title: 'Viaje a Roma para nuestro aniversario',
        notes: 'Paseo por Trastevere, Fontana di Trevi y comer el mejor gelato',
        suggestedBy: 'partner1',
        category: 'trip',
        estimatedCost: '€€€',
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function loadDatabase(): CalendarDatabase {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed: CalendarDatabase = JSON.parse(data);
      // Migration: Guarantee Giulia as partner2 name and ensure theme exists
      if (parsed.couple) {
        if (parsed.couple.partner2.name === 'Ella' || !parsed.couple.partner2.name) {
          parsed.couple.partner2.name = 'Giulia';
        }
        if (!parsed.couple.theme) {
          parsed.couple.theme = 'classic';
        }
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading database file, resetting to default:', err);
  }
  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: CalendarDatabase) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

app.use(express.json({ limit: '15mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Endpoints
app.get('/api/data', (req, res) => {
  const db = loadDatabase();
  res.json(db);
});

app.post('/api/events', (req, res) => {
  const db = loadDatabase();
  const eventData = req.body;

  if (!eventData.title || !eventData.startDate) {
    return res.status(400).json({ error: 'Title and startDate are required' });
  }

  const existingIdx = db.events.findIndex((e) => e.id === eventData.id);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    db.events[existingIdx] = {
      ...db.events[existingIdx],
      ...eventData,
      updatedAt: now,
    };
  } else {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: eventData.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now,
    };
    db.events.push(newEvent);
  }

  saveDatabase(db);
  res.json({ success: true, event: existingIdx >= 0 ? db.events[existingIdx] : db.events[db.events.length - 1] });
});

app.post('/api/events/:id/photo', (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  const { photo } = req.body;

  const event = db.events.find((e) => e.id === id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (!event.photos) {
    event.photos = [];
  }

  if (photo && photo.url) {
    const newPhoto: EventPhoto = {
      id: photo.id || `photo-${Date.now()}`,
      url: photo.url,
      caption: photo.caption || '',
      addedBy: photo.addedBy || 'partner1',
      addedAt: photo.addedAt || new Date().toISOString(),
    };
    event.photos.push(newPhoto);
    event.photoUrl = photo.url;
    event.photoCaption = photo.caption || event.photoCaption;
    event.isMemory = true;
    event.updatedAt = new Date().toISOString();
  }

  saveDatabase(db);
  res.json({ success: true, event });
});

app.delete('/api/events/:id/photo/:photoId', (req, res) => {
  const db = loadDatabase();
  const { id, photoId } = req.params;

  const event = db.events.find((e) => e.id === id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (photoId === 'all') {
    event.photos = [];
    event.photoUrl = undefined;
    event.photoCaption = undefined;
    event.isMemory = false;
  } else if (event.photos) {
    event.photos = event.photos.filter((p) => p.id !== photoId);
    event.photoUrl = event.photos.length > 0 ? event.photos[event.photos.length - 1].url : undefined;
    event.photoCaption = event.photos.length > 0 ? event.photos[event.photos.length - 1].caption : undefined;
    event.isMemory = event.photos.length > 0;
  }

  event.updatedAt = new Date().toISOString();
  saveDatabase(db);
  res.json({ success: true, event });
});

app.post('/api/events/:id/support', (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  const { senderId, senderName, text, emoji } = req.body;

  const event = db.events.find((e) => e.id === id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (!event.supportMessages) {
    event.supportMessages = [];
  }

  const newMsg: SupportMessage = {
    id: `sup-${Date.now()}`,
    senderId: senderId || 'partner1',
    senderName: senderName || (senderId === 'partner2' ? db.couple.partner2.name : db.couple.partner1.name),
    text: text || '¡Te mando mucho amor y ánimos! ❤️',
    emoji: emoji || '❤️',
    createdAt: new Date().toISOString(),
  };

  event.supportMessages.push(newMsg);
  event.updatedAt = new Date().toISOString();

  saveDatabase(db);
  res.json({ success: true, message: newMsg, event });
});

app.delete('/api/events/:id', (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  const initialLen = db.events.length;
  db.events = db.events.filter((e) => e.id !== id);

  if (db.events.length === initialLen) {
    return res.status(404).json({ error: 'Event not found' });
  }

  saveDatabase(db);
  res.json({ success: true });
});

app.post('/api/couple', (req, res) => {
  const db = loadDatabase();
  const newConfig = req.body;
  db.couple = {
    ...db.couple,
    ...newConfig,
  };
  saveDatabase(db);
  res.json({ success: true, couple: db.couple });
});

app.post('/api/plans', (req, res) => {
  const db = loadDatabase();
  const planData = req.body;

  if (!planData.title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const existingIdx = db.plans.findIndex((p) => p.id === planData.id);
  if (existingIdx >= 0) {
    db.plans[existingIdx] = {
      ...db.plans[existingIdx],
      ...planData,
    };
  } else {
    const newPlan: WishlistPlan = {
      ...planData,
      id: planData.id || `plan-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    db.plans.push(newPlan);
  }

  saveDatabase(db);
  res.json({ success: true, plan: existingIdx >= 0 ? db.plans[existingIdx] : db.plans[db.plans.length - 1] });
});

app.delete('/api/plans/:id', (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  db.plans = db.plans.filter((p) => p.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

app.post('/api/reset-demo', (req, res) => {
  const initial = getInitialDatabase();
  saveDatabase(initial);
  res.json({ success: true, data: initial });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  VITE v8.3.0  ready in 150 ms\n\n  ➜  Local:   http://localhost:${PORT}/\n  ➜  Network: http://0.0.0.0:${PORT}/\n`);
  });
}

startServer().catch(console.error);

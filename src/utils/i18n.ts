export type Language = 'es' | 'it';

export interface Translations {
  // Brand & Header
  appTitle: string;
  appSubtitle: string;
  today: string;
  previous: string;
  next: string;
  views: {
    month: string;
    week: string;
    day: string;
    agenda: string;
  };
  filter: string;
  filterAll: string;
  filterTogether: string;
  searchPlaceholder: string;
  installApp: string;
  whatPlanToday: string;
  plans: string;
  fullscreen: string;
  exitFullscreen: string;
  settings: string;
  newEvent: string;
  activeUser: string;
  changeTheme: string;
  offlineNotice: string;
  connected: string;
  syncing: string;

  // Banner & Milestones
  nextPlan: string;
  noSharedPlans: string;
  daysRemaining: string;
  dayRemaining: string;
  forOurAnniversary: string;
  anniversaryToday: string;
  anniversaryTomorrow: string;
  happyAnniversary: string;
  monthlyAnniversary: string; // Cumplemés / Meseversario
  grandAnniversary: string;
  valentineDay: string;

  // Days & Months
  months: string[];
  daysOfWeek: string[];
  daysOfWeekShort: string[];

  // Views Specific
  hourly: string;
  allDay: string;
  noEventsScheduled: string;
  noEventsScheduledDesc: string;
  addFirstEvent: string;
  addEventToDay: string;
  dayView: string;
  moreEvents: string;

  // Categories
  categories: {
    romantic: string;
    leisure: string;
    work: string;
    trip: string;
    health: string;
    home: string;
    other: string;
  };

  // Moods & Energy
  moods: {
    excited: { label: string; desc: string };
    nervous: { label: string; desc: string };
    tired: { label: string; desc: string };
    fire: { label: string; desc: string };
    love: { label: string; desc: string };
    zen: { label: string; desc: string };
    lazy: { label: string; desc: string };
    party: { label: string; desc: string };
    focus: { label: string; desc: string };
  };

  // Event Modal (Create / Edit)
  modal: {
    createTitle: string;
    editTitle: string;
    titlePlaceholder: string;
    whoseEvent: string;
    startDate: string;
    endDate: string;
    allDayToggle: string;
    categoryLabel: string;
    moodSectionTitle: string;
    moodSectionDesc: string;
    howFeelsTitle: string;
    locationPlaceholder: string;
    notesPlaceholder: string;
    reminderLabel: string;
    noReminder: string;
    reminder15m: string;
    reminder1h: string;
    reminder1d: string;
    cancel: string;
    saveChanges: string;
    createButton: string;
    colorLabel: string;
  };

  // Event Detail Modal
  detail: {
    finished: string;
    memoriesCount: string;
    singleMemory: string;
    googleMaps: string;
    scrapbookTitle: string;
    scrapbookSubtitlePassed: string;
    scrapbookSubtitleFuture: string;
    addPhoto: string;
    uploadPhoto: string;
    loadUrl: string;
    urlPlaceholder: string;
    newScrapbookPhoto: string;
    photoTakenBy: string;
    photoCaptionLabel: string;
    photoCaptionPlaceholder: string;
    quickEmojis: string;
    discard: string;
    saveMemory: string;
    emptyMemoryPassedTitle: string;
    emptyMemoryFutureTitle: string;
    emptyMemoryPassedDesc: string;
    emptyMemoryFutureDesc: string;
    supportTitle: string;
    messagesCount: string;
    noMessagesYet: string;
    sendQuickSupport: string;
    customMessagePlaceholder: string;
    send: string;
    quickEncouragement1: string;
    quickEncouragement2: string;
    quickEncouragement3: string;
    writeCustom: string;
    googleCalendar: string;
    icsExport: string;
    delete: string;
    edit: string;
    close: string;
    confirmDeleteEvent: string;
    yesDelete: string;
    deletePhotoConfirm: string;
  };

  // Couple Settings Modal
  settingsModal: {
    title: string;
    subtitle: string;
    partner1Title: string;
    partner2Title: string;
    nameLabel: string;
    colorLabel: string;
    sharedColorLabel: string;
    anniversaryDateLabel: string;
    anniversaryDateHelp: string;
    themeLabel: string;
    restoreDefaults: string;
    cancel: string;
    save: string;
  };

  // Dice Modal
  dice: {
    title: string;
    subtitle: string;
    rollButton: string;
    rolling: string;
    scheduleButton: string;
    againButton: string;
    ideas: { title: string; notes?: string }[];
  };

  // Wishlist Drawer
  wishlist: {
    title: string;
    subtitle: string;
    addNewIdea: string;
    ideaPlaceholder: string;
    notesPlaceholder: string;
    categorySelect: string;
    cancel: string;
    saveIdea: string;
    pendingSection: string;
    completedSection: string;
    scheduleInCalendar: string;
  };

  // Language Dropdown
  language: {
    selectLanguage: string;
    es: string;
    it: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  es: {
    appTitle: 'DuoCalendar',
    appSubtitle: 'Calendario para Parejas',
    today: 'Hoy',
    previous: 'Anterior',
    next: 'Siguiente',
    views: {
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      agenda: 'Agenda',
    },
    filter: 'Filtrar:',
    filterAll: 'Todos',
    filterTogether: 'Juntos',
    searchPlaceholder: 'Buscar evento...',
    installApp: 'Instalar App',
    whatPlanToday: '¿Plan hoy?',
    plans: 'Planes',
    fullscreen: 'Pantalla completa',
    exitFullscreen: 'Salir de pantalla completa',
    settings: 'Ajustes',
    newEvent: 'Nuevo Evento',
    activeUser: 'Usuario activo',
    changeTheme: 'Cambiar tema',
    offlineNotice: 'Modo sin conexión — Los cambios se guardan localmente y se sincronizarán al reconectar.',
    connected: 'Conectado',
    syncing: 'Sincronizando...',

    nextPlan: 'Próximo plan:',
    noSharedPlans: '¿Tenéis alguna cita o plan pendiente para los dos?',
    daysRemaining: 'DÍAS',
    dayRemaining: 'DÍA',
    forOurAnniversary: 'para nuestro',
    anniversaryToday: '🎉 ¡HOY ES NUESTRO ANIVERSARIO! ❤️🥂',
    anniversaryTomorrow: '¡MAÑANA! nuestro Aniversario 🥂',
    happyAnniversary: '¡Feliz día especial',
    monthlyAnniversary: 'Cumplemés ❤️',
    grandAnniversary: 'Gran Aniversario ❤️🌹',
    valentineDay: 'San Valentín ❤️',

    months: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    daysOfWeek: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    daysOfWeekShort: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],

    hourly: 'HORA',
    allDay: 'Todo el día',
    noEventsScheduled: 'No hay eventos programados',
    noEventsScheduledDesc: 'Añade eventos para coordinar los horarios y actividades de la pareja.',
    addFirstEvent: '+ Añadir primer evento',
    addEventToDay: 'Añadir a este día',
    dayView: 'Vista Diaria',
    moreEvents: 'más',

    categories: {
      romantic: 'Cita / Romántico',
      leisure: 'Ocio & Amigos',
      work: 'Trabajo / Estudio',
      trip: 'Viaje / Escapada',
      health: 'Salud / Médico',
      home: 'Hogar & Recados',
      other: 'Otro evento',
    },

    moods: {
      excited: { label: '😊 Ilusionado/a', desc: '¡Con muchísimas ganas de que llegue este momento!' },
      nervous: { label: '😰 Nervioso/a', desc: 'Examen, entrevista o reto importante: ¡necesita apoyo y mimos!' },
      tired: { label: '😴 Cansado/a', desc: 'Con poca energía o sueño, plan tranquilo.' },
      fire: { label: '🔥 Enérgico/a', desc: '¡A tope de motivación y ganas!' },
      love: { label: '🥰 Muy Enamorado/a', desc: 'Día romántico, mimos y conexión especial.' },
      zen: { label: '🧘 Zen & Relax', desc: 'Desconexión, paz mental y tranquilidad.' },
      lazy: { label: '🛋️ Perezoso/a', desc: 'Modo manta, sofá y descanso total.' },
      party: { label: '🥳 Modo Fiesta', desc: 'Celebración, risas y diversión.' },
      focus: { label: '🎯 Muy Concentrado/a', desc: 'Foco en objetivos y tareas importantes.' },
    },

    modal: {
      createTitle: 'Añadir Nuevo Evento',
      editTitle: 'Editar Evento',
      titlePlaceholder: 'Añadir título (ej: Cena romántica, Entrevista...)',
      whoseEvent: '¿De quién es este evento?',
      startDate: 'Fecha inicio',
      endDate: 'Fecha fin',
      allDayToggle: 'Todo el día',
      categoryLabel: 'Categoría',
      moodSectionTitle: 'Estado de Ánimo & Motivación (Mood & Energy)',
      moodSectionDesc: 'Indica cómo afronta cada uno esta actividad',
      howFeelsTitle: '¿Cómo os sentís con este plan?',
      locationPlaceholder: 'Ubicación o lugar (ej: Trattoria Bella Vista)',
      notesPlaceholder: 'Detalles sobre el evento, reservas, qué llevar...',
      reminderLabel: 'Recordatorio',
      noReminder: 'Sin recordatorio',
      reminder15m: '15 minutos antes',
      reminder1h: '1 hora antes',
      reminder1d: '1 día antes',
      cancel: 'Cancelar',
      saveChanges: 'Guardar Cambios',
      createButton: 'Crear Evento',
      colorLabel: 'Color identificativo',
    },

    detail: {
      finished: '✓ Finalizado',
      memoriesCount: 'recuerdos',
      singleMemory: 'recuerdo',
      googleMaps: 'Ver en Google Maps',
      scrapbookTitle: 'Álbum de Recuerdos & Scrapbook',
      scrapbookSubtitlePassed: '✨ Evento finalizado: inmortalizad vuestra experiencia con fotos y dedicatorias',
      scrapbookSubtitleFuture: 'Podéis adjuntar fotos y recuerdos en cuanto haya tenido lugar este plan',
      addPhoto: 'Añadir foto',
      uploadPhoto: 'Subir foto',
      loadUrl: 'Cargar',
      urlPlaceholder: 'Pega la URL de una foto (https://...)',
      newScrapbookPhoto: 'Nuevo Recuerdo para el Scrapbook',
      photoTakenBy: 'Foto tomada o subida por:',
      photoCaptionLabel: 'Pie de foto / dedicatoria del recuerdo:',
      photoCaptionPlaceholder: 'Ej: ¡Qué tarde más bonita juntos! ❤️',
      quickEmojis: 'Añadir:',
      discard: 'Descartar',
      saveMemory: 'Guardar en el Scrapbook',
      emptyMemoryPassedTitle: '¡Inmortalizad este recuerdo juntos!',
      emptyMemoryFutureTitle: 'Guarda fotos y tickets de este plan',
      emptyMemoryPassedDesc: 'Este plan ya ha tenido lugar. Pulsa aquí para subir vuestras fotos y crear vuestro álbum digital compartido.',
      emptyMemoryFutureDesc: 'Podéis adjuntar fotos ahora o en cuanto haya tenido lugar la cita o actividad.',
      supportTitle: 'Mensajitos de Amor & Apoyo de la Pareja',
      messagesCount: 'mensajes',
      noMessagesYet: 'Aún no hay mensajitos para este evento. ¡Mándale un detalle de cariño para que lo lea!',
      sendQuickSupport: 'Mandar ánimo rápido a',
      customMessagePlaceholder: 'Escribe algo bonito para',
      send: 'Enviar',
      quickEncouragement1: '¡Ánimo vida mía, te saldrá genial! ❤️💪',
      quickEncouragement2: 'In bocca al lupo amore mio! 🍀❤️',
      quickEncouragement3: '¡Te espero luego con mimos y pizza! 🍕🤗',
      writeCustom: '✍️ Escribir...',
      googleCalendar: 'Google Calendar',
      icsExport: '.ICS',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      confirmDeleteEvent: '¿Seguro que queréis borrar este evento?',
      yesDelete: 'Sí, borrar',
      deletePhotoConfirm: 'Borrar',
    },

    settingsModal: {
      title: 'Configuración de Pareja',
      subtitle: 'Personaliza los nombres, colores, fecha de aniversario y tema',
      partner1Title: 'Primer Miembro',
      partner2Title: 'Segundo Miembro',
      nameLabel: 'Nombre',
      colorLabel: 'Color',
      sharedColorLabel: 'Color de eventos compartidos',
      anniversaryDateLabel: 'Fecha de Aniversario / Inicio',
      anniversaryDateHelp: 'Se calcula automáticamente la cuenta atrás para el próximo aniversario.',
      themeLabel: 'Tema visual de la aplicación',
      restoreDefaults: 'Restablecer',
      cancel: 'Cancelar',
      save: 'Guardar Cambios',
    },

    dice: {
      title: 'Dados de la Suerte "¿Qué hacemos hoy?" 🎲',
      subtitle: 'Sortea un plan espontáneo para disfrutar juntos',
      rollButton: '🎲 Tirar los Dados',
      rolling: 'Sorteando plan...',
      scheduleButton: '📅 Agendar este plan en el Calendario',
      againButton: 'Tirar otra vez 🎲',
      ideas: [
        { title: 'Cena italiana casera con vino y velas 🍷🍝', notes: 'Preparar pasta fresca o pizza con música de fondo.' },
        { title: 'Maratón de peli o serie con palomitas 🎬🍿', notes: 'Manta, sofá, helado y apagar los móviles.' },
        { title: 'Paseo al atardecer y helado artesanal 🌅🍦', notes: 'Buscar un sitio con vistas bonitas y desconectar.' },
        { title: 'Cita sorpresa preparada por uno de los dos 🎁✨', notes: '¡Uno elige el plan completo y el otro se deja llevar!' },
        { title: 'Juegos de mesa o cartas con picoteo 🎲🧀', notes: 'Risas, apuestas cariñosas y cero pantallas.' },
        { title: 'Picnic improvisado en el parque o terraza 🧺🍓', notes: 'Comprar frutas, queso y algo rico para comer al aire libre.' },
      ],
    },

    wishlist: {
      title: 'Planes Pendientes',
      subtitle: 'Ideas, citas y escapadas que queremos hacer juntos',
      addNewIdea: 'Añadir nueva idea o cita para los dos',
      ideaPlaceholder: 'Título de la idea (ej: Viaje a Roma, Cena en la trattoria...)',
      notesPlaceholder: 'Notas, enlaces, detalles...',
      categorySelect: 'Tipo de plan',
      cancel: 'Cancelar',
      saveIdea: 'Guardar Idea',
      pendingSection: 'Ideas por realizar',
      completedSection: 'Planes completados',
      scheduleInCalendar: 'Agendar en Calendario',
    },

    language: {
      selectLanguage: 'Idioma / Lingua',
      es: 'Español 🇪🇸',
      it: 'Italiano 🇮🇹',
    },
  },

  it: {
    appTitle: 'DuoCalendar',
    appSubtitle: 'Calendario per Coppie',
    today: 'Oggi',
    previous: 'Precedente',
    next: 'Successivo',
    views: {
      month: 'Mese',
      week: 'Settimana',
      day: 'Giorno',
      agenda: 'Agenda',
    },
    filter: 'Filtra:',
    filterAll: 'Tutti',
    filterTogether: 'Insieme',
    searchPlaceholder: 'Cerca evento...',
    installApp: 'Installa App',
    whatPlanToday: 'Cosa facciamo?',
    plans: 'Desideri',
    fullscreen: 'Schermo intero',
    exitFullscreen: 'Esci da schermo intero',
    settings: 'Impostazioni',
    newEvent: 'Nuovo Evento',
    activeUser: 'Utente attivo',
    changeTheme: 'Cambia tema',
    offlineNotice: 'Modalità offline — Le modifiche sono salvate localmente e verranno sincronizzate alla riconnessione.',
    connected: 'Connesso',
    syncing: 'Sincronizzazione...',

    nextPlan: 'Prossimo programma:',
    noSharedPlans: 'Avete qualche appuntamento o piano speciale per voi due?',
    daysRemaining: 'GIORNI',
    dayRemaining: 'GIORNO',
    forOurAnniversary: 'al nostro',
    anniversaryToday: '🎉 OGGI È IL NOSTRO ANNIVERSARIO! ❤️🥂',
    anniversaryTomorrow: 'DOMANI! il nostro Anniversario 🥂',
    happyAnniversary: 'Buon giorno speciale',
    monthlyAnniversary: 'Meseversario ❤️',
    grandAnniversary: 'Grande Anniversario ❤️🌹',
    valentineDay: 'San Valentino ❤️',

    months: [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ],
    daysOfWeek: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'],
    daysOfWeekShort: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],

    hourly: 'ORA',
    allDay: 'Tutto il giorno',
    noEventsScheduled: 'Nessun evento in programma',
    noEventsScheduledDesc: 'Aggiungete eventi per coordinare gli orari e le attività della coppia.',
    addFirstEvent: '+ Aggiungi primo evento',
    addEventToDay: 'Aggiungi a questo giorno',
    dayView: 'Vista Giornaliera',
    moreEvents: 'altri',

    categories: {
      romantic: 'Appuntamento / Romantico',
      leisure: 'Tempo Libero & Amici',
      work: 'Lavoro / Studio',
      trip: 'Viaggio / Weekend',
      health: 'Salute / Medico',
      home: 'Casa & Commissioni',
      other: 'Altro evento',
    },

    moods: {
      excited: { label: '😊 Entusiasta', desc: 'Non vede l\'ora che arrivi questo momento!' },
      nervous: { label: '😰 Nervoso/a', desc: 'Esami, colloqui o sfide importanti: servono coccole e supporto!' },
      tired: { label: '😴 Stanco/a', desc: 'Poca energia o sonno, serve un piano tranquillo.' },
      fire: { label: '🔥 Pieno/a di Energia', desc: 'Super motivazione e carica al massimo!' },
      love: { label: '🥰 Innamorato/a Perso/a', desc: 'Giorno romantico, coccole e sintonia speciale.' },
      zen: { label: '🧘 Zen & Relax', desc: 'Disconnessione, pace mentale e serenità.' },
      lazy: { label: '🛋️ Pigro/a & Divano', desc: 'Modalità copertina, divano e relax totale.' },
      party: { label: '🥳 Modalità Festa', desc: 'Festa, risate e tanto divertimento.' },
      focus: { label: '🎯 Super Concentrato/a', desc: 'Massima concentrazione su obiettivi e lavoro.' },
    },

    modal: {
      createTitle: 'Aggiungi Nuovo Evento',
      editTitle: 'Modifica Evento',
      titlePlaceholder: 'Aggiungi titolo (es: Cena romantica, Colloquio...)',
      whoseEvent: 'Di chi è questo evento?',
      startDate: 'Data inizio',
      endDate: 'Data fine',
      allDayToggle: 'Tutto il giorno',
      categoryLabel: 'Categoria',
      moodSectionTitle: 'Stato d\'Animo & Motivazione (Mood & Energy)',
      moodSectionDesc: 'Indica come affronta ognuno questa attività',
      howFeelsTitle: 'Come vi sentite per questo piano?',
      locationPlaceholder: 'Luogo o indirizzo (es: Trattoria Bella Vista)',
      notesPlaceholder: 'Dettagli sull\'evento, prenotazioni, cosa portare...',
      reminderLabel: 'Promemoria',
      noReminder: 'Nessun promemoria',
      reminder15m: '15 minuti prima',
      reminder1h: '1 ora prima',
      reminder1d: '1 giorno prima',
      cancel: 'Annulla',
      saveChanges: 'Salva Modifiche',
      createButton: 'Crea Evento',
      colorLabel: 'Colore identificativo',
    },

    detail: {
      finished: '✓ Concluso',
      memoriesCount: 'ricordi',
      singleMemory: 'ricordo',
      googleMaps: 'Vedi su Google Maps',
      scrapbookTitle: 'Album dei Ricordi & Scrapbook',
      scrapbookSubtitlePassed: '✨ Evento concluso: immortalate la vostra esperienza con foto e dediche',
      scrapbookSubtitleFuture: 'Potete allegare foto e ricordi non appena questo evento avrà avuto luogo',
      addPhoto: 'Aggiungi foto',
      uploadPhoto: 'Carica foto',
      loadUrl: 'Carica',
      urlPlaceholder: 'Incolla URL dell\'immagine (https://...)',
      newScrapbookPhoto: 'Nuovo Ricordo per lo Scrapbook',
      photoTakenBy: 'Foto scattata o caricata da:',
      photoCaptionLabel: 'Didascalia / dedica del ricordo:',
      photoCaptionPlaceholder: 'Es: Che bella serata insieme! ❤️',
      quickEmojis: 'Aggiungi:',
      discard: 'Scarta',
      saveMemory: 'Salva nello Scrapbook',
      emptyMemoryPassedTitle: 'Immortalate questo ricordo insieme!',
      emptyMemoryFutureTitle: 'Salva foto e biglietti di questo evento',
      emptyMemoryPassedDesc: 'Questo evento è già avvenuto. Clicca qui per caricare le vostre foto e creare l\'album digitale condiviso.',
      emptyMemoryFutureDesc: 'Potete allegare foto ora o non appena si terrà l\'attività.',
      supportTitle: 'Messaggini d\'Amore & Supporto di Coppia',
      messagesCount: 'messaggi',
      noMessagesYet: 'Nessun messaggio per questo evento. Manda una dolcezza per farlo/a sorridere!',
      sendQuickSupport: 'Invia incoraggiamento rapido a',
      customMessagePlaceholder: 'Scrivi qualcosa di dolce per',
      send: 'Invia',
      quickEncouragement1: 'Forza amore mio, andrà benissimo! ❤️💪',
      quickEncouragement2: 'In bocca al lupo amore mio grande! 🍀❤️',
      quickEncouragement3: 'Ti aspetto dopo con coccole e pizza! 🍕🤗',
      writeCustom: '✍️ Scrivi...',
      googleCalendar: 'Google Calendar',
      icsExport: '.ICS',
      delete: 'Elimina',
      edit: 'Modifica',
      close: 'Chiudi',
      confirmDeleteEvent: 'Siete sicuri di voler eliminare questo evento?',
      yesDelete: 'Sì, elimina',
      deletePhotoConfirm: 'Elimina',
    },

    settingsModal: {
      title: 'Impostazioni di Coppia',
      subtitle: 'Personalizza nomi, colori, data di anniversario e tema visivo',
      partner1Title: 'Primo Partner',
      partner2Title: 'Secondo Partner',
      nameLabel: 'Nome',
      colorLabel: 'Colore',
      sharedColorLabel: 'Colore eventi condivisi',
      anniversaryDateLabel: 'Data di Anniversario / Inizio',
      anniversaryDateHelp: 'Il conto alla rovescia per il prossimo anniversario viene calcolato automaticamente.',
      themeLabel: 'Tema visivo dell\'applicazione',
      restoreDefaults: 'Ripristina',
      cancel: 'Annulla',
      save: 'Salva Modifiche',
    },

    dice: {
      title: 'Dadi della Fortuna "Cosa Facciamo Oggi?" 🎲',
      subtitle: 'Estrai un\'idea spontanea da vivere insieme',
      rollButton: '🎲 Lancia i Dadi',
      rolling: 'Estrazione in corso...',
      scheduleButton: '📅 Inserisci questo piano nel Calendario',
      againButton: 'Lancia di nuovo 🎲',
      ideas: [
        { title: 'Cena italiana fatta in casa con vino e candele 🍷🍝', notes: 'Preparare pasta fresca o pizza con musica di sottofondo.' },
        { title: 'Maratona di film o serie con popcorn 🎬🍿', notes: 'Copertina, divano, gelato e telefoni spenti.' },
        { title: 'Passeggiata al tramonto e gelato artigianale 🌅🍦', notes: 'Cercare un posto panoramico e staccare la spina.' },
        { title: 'Appuntamento a sorpresa organizzato da uno dei due 🎁✨', notes: 'Uno sceglie tutto il programma e l\'altro si lascia guidare!' },
        { title: 'Giochi da tavolo o carte con stuzzichini 🎲🧀', notes: 'Risate, scommesse affettuose e niente schermi.' },
        { title: 'Picnic improvvisato al parco o sul terrazzo 🧺🍓', notes: 'Comprare frutta fresca, formaggi e qualcosa di buono all\'aperto.' },
      ],
    },

    wishlist: {
      title: 'Lista dei Desideri & Piani',
      subtitle: 'Idee, appuntamenti e viaggi che vogliamo fare insieme',
      addNewIdea: 'Aggiungi nuova idea o appuntamento per entrambi',
      ideaPlaceholder: 'Titolo dell\'idea (es: Viaggio a Roma, Cena speciale...)',
      notesPlaceholder: 'Note, link, dettagli...',
      categorySelect: 'Tipo di piano',
      cancel: 'Annulla',
      saveIdea: 'Salva Idea',
      pendingSection: 'Idee da realizzare',
      completedSection: 'Piani completati',
      scheduleInCalendar: 'Inserisci nel Calendario',
    },

    language: {
      selectLanguage: 'Lingua / Idioma',
      es: 'Español 🇪🇸',
      it: 'Italiano 🇮🇹',
    },
  },
};

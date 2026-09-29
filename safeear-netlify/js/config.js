// Site data. Edit prices, sessions and hours here.
const SafeEar = {
  operatorEmail: 'safeear97@gmail.com',
  operatorTimeZone: 'Africa/Dar_es_Salaam',
  operatorLabel: 'Tanzania',

  // Bookable hours, in the visitor's own time. lastHour is exclusive (last slot 8:30 PM).
  firstHour: 7,
  lastHour: 21,
  daysAhead: 60,

  sessions: [
    { id: 'intro', name: 'Free Intro', duration: '10 min', price: 'Free', note: 'Say hello, no commitment' },
    { id: 'quick', name: 'Quick Vent', duration: '25 min', price: '$25', note: 'Let it out and feel lighter' },
    { id: 'deep', name: 'Deep Conversation', duration: '55 min', price: '$45', note: 'Room to go deeper', popular: true },
    { id: 'weekly', name: 'Weekly Check-in', duration: '4 × 25 min', price: '$90/mo', note: 'Steady support each week' },
  ],

  methods: [
    { id: 'video', label: 'Video', icon: '🎥', desc: 'I will send you a private video link' },
    { id: 'call', label: 'Voice call', icon: '📞', desc: 'I will call you or send call details' },
    { id: 'text', label: 'Text chat', icon: '💬', desc: 'I will send you text session details' },
  ],
};


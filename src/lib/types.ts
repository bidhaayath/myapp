
export type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

export type Routine = {
  id: string;
  label: string;
};

export type Sticker = {
  id: string;
  type: string;
  x: number;
  y: number;
  scale: number;
};

export type DailyRewardsClaimed = {
  habitReward?: boolean;   // > 50% habits
  journalReward?: boolean; // > 2 sections
  streakReward?: boolean;  // 3-day milestone
};

export type JournalEntry = {
  date: string; // YYYY-MM-DD
  checklist: ChecklistItem[];
  customChecklist: ChecklistItem[];
  reflectionPositive: {
    grateful: string;
    learned: string;
  };
  reflectionGrowth: {
    drained: string;
    improve: string;
  };
  mood: string;
  freeWriting: string;
  drawingData?: string; // Data URL for the canvas
  stickers?: Sticker[];
  rewardsClaimed?: DailyRewardsClaimed;
};

export type Goal = {
  id: string;
  text: string;
  completed: boolean;
};

export type UserStats = {
  userId: string;
  hearts: number; // From habits
  stars: number;  // From journaling
  petals: number; // From streaks
  badges: string[];
};

export const BADGES = [
  { id: 'perfect-day', title: 'Perfect Day', description: 'Complete 100% of habits and all journal sections in one day.', icon: '🌈' },
  { id: 'streak-3', title: 'Seedling', description: 'Maintain a 3-day consistency streak.', icon: '🌱' },
  { id: 'streak-7', title: '7-Day Bloom', description: 'Maintain a 7-day consistency streak.', icon: '🌸' },
  { id: 'streak-30', title: 'Radiant Life', description: 'Maintain a 30-day consistency streak.', icon: '☀️' },
  { id: 'monthly-achiever', title: 'Monthly Visionary', description: 'Complete all goals for a specific month.', icon: '🏆' },
  { id: 'yearly-dreamer', title: 'Yearly Dreamer', description: 'Complete your first yearly vision goal.', icon: '✨' },
];

export const DEFAULT_HABIT_GROUPS = [
  {
    category: "Spiritual",
    items: ["Dua", "Surat Baqara", "Surat Mulk", "Dhamu Namaadh", "Fathis sunnath"]
  },
  {
    category: "Health & Fitness",
    items: ["Chia seed", "Breathing exercise", "Facial exercise", "Squat", "Plank", "Jogging"]
  },
  {
    category: "Personal Care",
    items: ["Reendho facial", "Comb hair", "Spray rosemary water on hair", "Moringa tablet", "Vitamin D tablet", "❤️"]
  },
  {
    category: "Home Care",
    items: ["Vacuum room", "Wash bathroom"]
  }
];

export const ALL_DEFAULT_HABIT_LABELS = DEFAULT_HABIT_GROUPS.flatMap(g => g.items);

export const MOODS = [
  { label: 'Happy', emoji: '😊', color: '#E6B800', textColor: '#FFFFFF' },
  { label: 'Calm', emoji: '😌', color: '#10569B', textColor: '#FFFFFF' },
  { label: 'Motivated', emoji: '✨', color: '#266529', textColor: '#FFFFFF' },
  { label: 'Tired', emoji: '🥱', color: '#424242', textColor: '#FFFFFF' },
  { label: 'Sad', emoji: '😔', color: '#5B1778', textColor: '#FFFFFF' },
  { label: 'Anxious', emoji: '😟', color: '#B75D00', textColor: '#FFFFFF' },
  { label: 'Stressed', emoji: '😫', color: '#991B1B', textColor: '#FFFFFF' },
  { label: 'Angry', emoji: '😠', color: '#DC2626', textColor: '#FFFFFF' },
  { label: 'Peaceful', emoji: '🕊️', color: '#005D52', textColor: '#FFFFFF' },
];

export const STICKER_CATEGORIES = [
  {
    label: 'Cute',
    items: ['🧸', '🎀', '🍭', '🧁', '🐱', '🐰', '🐾', '🎈']
  },
  {
    label: 'Nature',
    items: ['🌸', '🌷', '🌿', '🌱', '🍃', '🌻', '🦋', '🍄']
  },
  {
    label: 'Celestial',
    items: ['✨', '⭐', '🌙', '☁️', '☀️', '🌈', '💫', '🪐']
  },
  {
    label: 'Vintage',
    items: ['📜', '✉️', '🕰️', '🕯️', '📻', '🎞️', '🎻', '🖋️']
  },
  {
    label: 'Aesthetic',
    items: ['📚', '☕', '🍵', '🎨', '🖌️', '🪴', '👒', '📷']
  },
  {
    label: 'Scrapbook',
    items: ['🔖', '📍', '🖇️', '📏', '✂️', '🏷️', '📒', '🖍️']
  }
];

export const ALL_STICKERS = STICKER_CATEGORIES.flatMap(c => c.items);

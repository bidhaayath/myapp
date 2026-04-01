
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
};

export type Goal = {
  id: string;
  text: string;
  completed: boolean;
};

export const DEFAULT_CHECKLIST_ITEMS = [
  "Dua",
  "Plank",
  "Facial exercise",
  "Breathing exercise",
  "Surat Mulk",
  "Dhamu namaadh",
  "Comb hair",
  "Vacuum room",
  "Wash bathroom",
  "Fathis sunnat",
  "Moringa tablet",
  "Fish oil tablet",
  "Rosemary spray"
];

export const MOODS = [
  { label: 'Happy', emoji: '😊', color: '#FBC02D', textColor: '#5D4037' },
  { label: 'Calm', emoji: '😌', color: '#1976D2', textColor: '#FFFFFF' },
  { label: 'Motivated', emoji: '✨', color: '#388E3C', textColor: '#FFFFFF' },
  { label: 'Tired', emoji: '🥱', color: '#616161', textColor: '#FFFFFF' },
  { label: 'Sad', emoji: '😔', color: '#7B1FA2', textColor: '#FFFFFF' },
  { label: 'Anxious', emoji: '😟', color: '#F57C00', textColor: '#FFFFFF' },
  { label: 'Stressed', emoji: '😫', color: '#D32F2F', textColor: '#FFFFFF' },
  { label: 'Peaceful', emoji: '🕊️', color: '#00796B', textColor: '#FFFFFF' },
];

export const STICKER_OPTIONS = ['🌸', '✨', '⭐', '🌙', '☁️', '🌿', '💡', '❤️', '🔥', '🌈', '🦋', '🍀'];

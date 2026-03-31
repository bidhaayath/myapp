export type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
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
  { label: 'Happy', emoji: '😊', color: '#FFF9C4', textColor: '#827717' },
  { label: 'Calm', emoji: '😌', color: '#E3F2FD', textColor: '#0D47A1' },
  { label: 'Motivated', emoji: '✨', color: '#E8F5E9', textColor: '#1B5E20' },
  { label: 'Tired', emoji: '🥱', color: '#F5F5F5', textColor: '#424242' },
  { label: 'Sad', emoji: '😔', color: '#F3E5F5', textColor: '#4A148C' },
  { label: 'Anxious', emoji: '😟', color: '#FFF3E0', textColor: '#E65100' },
  { label: 'Stressed', emoji: '😫', color: '#FFEBEE', textColor: '#B71C1C' },
  { label: 'Peaceful', emoji: '🕊️', color: '#E0F2F1', textColor: '#004D40' },
];

export const STICKER_OPTIONS = ['🌸', '✨', '⭐', '🌙', '☁️', '🌿', '💡', '❤️', '🔥', '🌈', '🦋', '🍀'];

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
  { label: 'Happy', emoji: '😊', color: '#FFD54F', textColor: '#5D4037' },
  { label: 'Calm', emoji: '😌', color: '#90CAF9', textColor: '#0D47A1' },
  { label: 'Motivated', emoji: '✨', color: '#A5D6A7', textColor: '#1B5E20' },
  { label: 'Tired', emoji: '🥱', color: '#BDBDBD', textColor: '#212121' },
  { label: 'Sad', emoji: '😔', color: '#CE93D8', textColor: '#4A148C' },
  { label: 'Anxious', emoji: '😟', color: '#FFB74D', textColor: '#E65100' },
  { label: 'Stressed', emoji: '😫', color: '#EF9A9A', textColor: '#B71C1C' },
  { label: 'Peaceful', emoji: '🕊️', color: '#80CBC4', textColor: '#004D40' },
];

export const STICKER_OPTIONS = ['🌸', '✨', '⭐', '🌙', '☁️', '🌿', '💡', '❤️', '🔥', '🌈', '🦋', '🍀'];

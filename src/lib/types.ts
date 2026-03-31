export type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
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
  { label: 'Happy', emoji: '😊', color: '#FFD6D6' },
  { label: 'Calm', emoji: '😌', color: '#E6D8CE' },
  { label: 'Motivated', emoji: '✨', color: '#FFF3E0' },
  { label: 'Tired', emoji: '🥱', color: '#E0E0E0' },
  { label: 'Sad', emoji: '😔', color: '#D1C4E9' },
  { label: 'Anxious', emoji: '😟', color: '#FFCCBC' },
  { label: 'Stressed', emoji: '😫', color: '#FFAB91' },
  { label: 'Peaceful', emoji: '🕊️', color: '#C8E6C9' },
];

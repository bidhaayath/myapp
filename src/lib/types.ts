export type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

export type JournalEntry = {
  date: string; // YYYY-MM-DD
  checklist: ChecklistItem[];
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
  { label: 'Happy', emoji: '😊' },
  { label: 'Calm', emoji: '😌' },
  { label: 'Tired', emoji: '🥱' },
  { label: 'Sad', emoji: '😔' },
  { label: 'Motivated', emoji: '✨' },
  { label: 'Anxious', emoji: '😟' },
];
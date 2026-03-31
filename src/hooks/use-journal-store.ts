"use client"

import { useState, useEffect } from 'react';
import { JournalEntry, ChecklistItem, DEFAULT_CHECKLIST_ITEMS } from '@/lib/types';

const STORAGE_KEY = 'daily_four_journal_entries';

export function useJournalStore() {
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse journal entries', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveEntries = (newEntries: Record<string, JournalEntry>) => {
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  };

  const getEntry = (date: string): JournalEntry => {
    if (entries[date]) return entries[date];

    // Create a new empty entry if it doesn't exist
    const newEntry: JournalEntry = {
      date,
      checklist: DEFAULT_CHECKLIST_ITEMS.map((label, index) => ({
        id: `item-${index}`,
        label,
        checked: false,
      })),
      reflectionPositive: { grateful: '', learned: '' },
      reflectionGrowth: { drained: '', improve: '' },
      mood: '',
      freeWriting: '',
    };
    return newEntry;
  };

  const updateEntry = (date: string, updates: Partial<JournalEntry>) => {
    const currentEntry = getEntry(date);
    const updatedEntry = { ...currentEntry, ...updates };
    const newEntries = { ...entries, [date]: updatedEntry };
    saveEntries(newEntries);
  };

  const getStreak = () => {
    const dates = Object.keys(entries).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // Simple streak calculation
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (entries[dateStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  return {
    entries,
    isLoaded,
    getEntry,
    updateEntry,
    getStreak,
  };
}
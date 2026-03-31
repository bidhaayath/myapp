"use client"

import { useState, useEffect } from 'react';
import { JournalEntry, ChecklistItem, DEFAULT_CHECKLIST_ITEMS, Goal } from '@/lib/types';
import { format, startOfMonth, parseISO, isSameDay, subDays } from 'date-fns';

const STORAGE_KEY = 'bt_journal_entries_v1';
const MONTHLY_GOALS_KEY = 'bt_journal_monthly_goals_v1';
const YEARLY_GOALS_KEY = 'bt_journal_yearly_goals_v1';

export function useJournalStore() {
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});
  const [monthlyGoals, setMonthlyGoals] = useState<Record<string, Goal[]>>({});
  const [yearlyGoals, setYearlyGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedEntries = localStorage.getItem(STORAGE_KEY);
    const savedMonthly = localStorage.getItem(MONTHLY_GOALS_KEY);
    const savedYearly = localStorage.getItem(YEARLY_GOALS_KEY);

    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedMonthly) setMonthlyGoals(JSON.parse(savedMonthly));
    if (savedYearly) setYearlyGoals(JSON.parse(savedYearly));
    
    setIsLoaded(true);
  }, []);

  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const getEntry = (date: string): JournalEntry => {
    if (entries[date]) return entries[date];

    return {
      date,
      checklist: DEFAULT_CHECKLIST_ITEMS.map((label, index) => ({
        id: `default-${index}`,
        label,
        checked: false,
      })),
      customChecklist: [],
      reflectionPositive: { grateful: '', learned: '' },
      reflectionGrowth: { drained: '', improve: '' },
      mood: '',
      freeWriting: '',
      stickers: [],
    };
  };

  const updateEntry = (date: string, updates: Partial<JournalEntry>) => {
    const currentEntry = getEntry(date);
    const updatedEntry = { ...currentEntry, ...updates };
    const newEntries = { ...entries, [date]: updatedEntry };
    setEntries(newEntries);
    saveToStorage(STORAGE_KEY, newEntries);
  };

  const getMonthlyGoals = (date: Date) => {
    const key = format(startOfMonth(date), 'yyyy-MM');
    return monthlyGoals[key] || [];
  };

  const updateMonthlyGoals = (date: Date, goals: Goal[]) => {
    const key = format(startOfMonth(date), 'yyyy-MM');
    const newMonthly = { ...monthlyGoals, [key]: goals };
    setMonthlyGoals(newMonthly);
    saveToStorage(MONTHLY_GOALS_KEY, newMonthly);
  };

  const updateYearlyGoals = (goals: Goal[]) => {
    setYearlyGoals(goals);
    saveToStorage(YEARLY_GOALS_KEY, goals);
  };

  const getStreak = () => {
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      if (entries[dateStr]) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  return {
    entries,
    monthlyGoals,
    yearlyGoals,
    isLoaded,
    getEntry,
    updateEntry,
    getMonthlyGoals,
    updateMonthlyGoals,
    updateYearlyGoals,
    getStreak,
  };
}

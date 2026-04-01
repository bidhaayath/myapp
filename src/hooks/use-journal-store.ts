
"use client"

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { JournalEntry, DEFAULT_CHECKLIST_ITEMS, Goal, Routine } from '@/lib/types';
import { format, startOfMonth, subDays } from 'date-fns';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function useJournalStore() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // 1. Fetch Global Routines
  const routinesRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'settings', 'routines');
  }, [user, firestore]);

  const { data: routinesData, isLoading: isRoutinesLoading } = useDoc<{ items: Routine[] }>(routinesRef);
  const globalRoutines = useMemo(() => routinesData?.items || [], [routinesData]);

  // 2. Fetch Daily Entries
  const entriesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'dailyEntries');
  }, [user, firestore]);

  const { data: entriesData, isLoading: isEntriesLoading } = useCollection<JournalEntry>(entriesQuery);

  const entries = useMemo(() => {
    const record: Record<string, JournalEntry> = {};
    entriesData?.forEach(entry => {
      record[entry.date] = entry;
    });
    return record;
  }, [entriesData]);

  // Helper to get doc references
  const getEntryRef = (date: string) => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'dailyEntries', date);
  };

  const getMonthlyRef = (month: string) => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'monthlyGoals', month);
  };

  const getYearlyRef = (year: string) => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'yearlyGoals', year);
  };

  // 3. Merged Entry Logic
  // This combines Firestore entry state with the current global routine definition
  const getEntry = (date: string): JournalEntry => {
    const existing = entries[date];
    
    // The "Full List" of routine labels active TODAY
    const routineLabels = [...DEFAULT_CHECKLIST_ITEMS, ...globalRoutines.map(r => r.label)];
    
    const baseChecklist = routineLabels.map((label, index) => {
      const existingItem = existing?.checklist?.find(i => i.label === label);
      return {
        id: existingItem?.id || `routine-${index}`,
        label,
        checked: existingItem?.checked || false,
      };
    });

    return {
      date,
      checklist: baseChecklist,
      customChecklist: existing?.customChecklist || [],
      reflectionPositive: existing?.reflectionPositive || { grateful: '', learned: '' },
      reflectionGrowth: existing?.reflectionGrowth || { drained: '', improve: '' },
      mood: existing?.mood || '',
      freeWriting: existing?.freeWriting || '',
      stickers: existing?.stickers || [],
      drawingData: existing?.drawingData || undefined,
    };
  };

  const updateEntry = (date: string, updates: Partial<JournalEntry>) => {
    if (!user) return;
    const ref = getEntryRef(date);
    if (!ref) return;
    const entry = getEntry(date);
    const finalData = { ...entry, ...updates, userId: user.uid, date };
    setDocumentNonBlocking(ref, finalData, { merge: true });
  };

  // 4. Global Routine Management
  const updateGlobalRoutines = (newRoutines: Routine[]) => {
    if (!user || !routinesRef) return;
    setDocumentNonBlocking(routinesRef, { userId: user.uid, items: newRoutines }, { merge: true });
  };

  const addGlobalRoutine = (label: string) => {
    const newRoutine: Routine = { id: Date.now().toString(), label };
    updateGlobalRoutines([...globalRoutines, newRoutine]);
  };

  const deleteGlobalRoutine = (id: string) => {
    updateGlobalRoutines(globalRoutines.filter(r => r.id !== id));
  };

  const editGlobalRoutine = (id: string, newLabel: string) => {
    updateGlobalRoutines(globalRoutines.map(r => r.id === id ? { ...r, label: newLabel } : r));
  };

  const updateMonthlyGoals = (date: Date, goals: Goal[]) => {
    if (!user) return;
    const monthId = format(startOfMonth(date), 'yyyy-MM');
    const ref = getMonthlyRef(monthId);
    if (!ref) return;
    setDocumentNonBlocking(ref, { userId: user.uid, goals }, { merge: true });
  };

  const updateYearlyGoals = (year: string, goals: Goal[]) => {
    if (!user) return;
    const ref = getYearlyRef(year);
    if (!ref) return;
    setDocumentNonBlocking(ref, { userId: user.uid, goals }, { merge: true });
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
    globalRoutines,
    isLoaded: !isUserLoading && !isEntriesLoading && !isRoutinesLoading,
    user,
    getEntry,
    updateEntry,
    addGlobalRoutine,
    deleteGlobalRoutine,
    editGlobalRoutine,
    updateMonthlyGoals,
    updateYearlyGoals,
    getStreak,
    firestore,
  };
}

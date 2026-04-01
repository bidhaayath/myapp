
"use client"

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, DocumentReference, CollectionReference } from 'firebase/firestore';
import { JournalEntry, ChecklistItem, DEFAULT_CHECKLIST_ITEMS, Goal, Sticker } from '@/lib/types';
import { format, startOfMonth, subDays } from 'date-fns';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function useJournalStore() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Helper to get doc references
  const getEntryRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return (date: string) => doc(firestore, 'users', user.uid, 'dailyEntries', date);
  }, [user, firestore]);

  const getMonthlyRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return (month: string) => doc(firestore, 'users', user.uid, 'monthlyGoals', month);
  }, [user, firestore]);

  const getYearlyRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return (year: string) => doc(firestore, 'users', user.uid, 'yearlyGoals', year);
  }, [user, firestore]);

  // Current Entries (for the calendar/stats)
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

  const getEntry = (date: string): JournalEntry => {
    const existing = entries[date];
    if (existing) return existing;

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
    if (!user || !getEntryRef) return;
    const ref = getEntryRef(date);
    const entry = getEntry(date);
    const finalData = { ...entry, ...updates, userId: user.uid, date };
    setDocumentNonBlocking(ref, finalData, { merge: true });
  };

  const updateMonthlyGoals = (date: Date, goals: Goal[]) => {
    if (!user || !getMonthlyRef) return;
    const monthId = format(startOfMonth(date), 'yyyy-MM');
    const ref = getMonthlyRef(monthId);
    setDocumentNonBlocking(ref, { userId: user.uid, goals }, { merge: true });
  };

  const updateYearlyGoals = (year: string, goals: Goal[]) => {
    if (!user || !getYearlyRef) return;
    const ref = getYearlyRef(year);
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
    isLoaded: !isUserLoading && !isEntriesLoading,
    user,
    getEntry,
    updateEntry,
    updateMonthlyGoals,
    updateYearlyGoals,
    getStreak,
    firestore,
  };
}

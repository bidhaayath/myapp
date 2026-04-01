
"use client"

import { useMemo, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { JournalEntry, ALL_DEFAULT_HABIT_LABELS, Goal, Routine, UserStats } from '@/lib/types';
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

  // 2. Fetch User Stats (Rewards)
  const statsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'settings', 'stats');
  }, [user, firestore]);

  const { data: statsData, isLoading: isStatsLoading } = useDoc<UserStats>(statsRef);
  const stats: UserStats = useMemo(() => statsData || { 
    userId: user?.uid || '', 
    hearts: 0, 
    stars: 0, 
    petals: 0, 
    badges: [] 
  }, [statsData, user]);

  // 3. Fetch Daily Entries
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

  const getEntry = (date: string): JournalEntry => {
    const existing = entries[date];
    const routineLabels = [...ALL_DEFAULT_HABIT_LABELS, ...globalRoutines.map(r => r.label)];
    
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
      drawingData: existing?.drawingData || '',
      rewardsClaimed: existing?.rewardsClaimed || {}
    };
  };

  const updateStats = useCallback((updates: Partial<UserStats>) => {
    if (!user || !statsRef) return;
    setDocumentNonBlocking(statsRef, { ...stats, ...updates, userId: user.uid }, { merge: true });
  }, [user, statsRef, stats]);

  const updateEntry = (date: string, updates: Partial<JournalEntry>) => {
    if (!user) return;
    const ref = getEntryRef(date);
    if (!ref) return;
    
    const currentEntry = getEntry(date);
    const newEntry = { ...currentEntry, ...updates };
    
    // Updated Reward Logic
    const rewards = { ...newEntry.rewardsClaimed };
    let heartsToAdd = 0;
    let starsToAdd = 0;
    const newBadges: string[] = [...stats.badges];

    // 1. Habit Reward: > 50% completed
    const totalHabits = newEntry.checklist.length + newEntry.customChecklist.length;
    const completedHabits = newEntry.checklist.filter(i => i.checked).length + newEntry.customChecklist.filter(i => i.checked).length;
    const habitPercent = totalHabits > 0 ? (completedHabits / totalHabits) : 0;

    if (habitPercent > 0.5 && !rewards.habitReward) {
      rewards.habitReward = true;
      heartsToAdd += 1;
    }

    // 2. Journaling Reward: > 2 sections filled
    const journalSections = [
      newEntry.reflectionPositive.grateful,
      newEntry.reflectionPositive.learned,
      newEntry.reflectionGrowth.drained,
      newEntry.reflectionGrowth.improve,
      newEntry.freeWriting
    ];
    const sectionsFilled = journalSections.filter(s => s.trim().length > 0).length;

    if (sectionsFilled > 2 && !rewards.journalReward) {
      rewards.journalReward = true;
      starsToAdd += 1;
    }

    // 3. Perfect Day Badge (Optional extra)
    const hasAllReflection = !!(newEntry.reflectionPositive.grateful && newEntry.reflectionPositive.learned && newEntry.reflectionGrowth.drained && newEntry.reflectionGrowth.improve);
    if (habitPercent >= 1.0 && hasAllReflection && !newBadges.includes('perfect-day')) {
      newBadges.push('perfect-day');
    }

    // Apply updates
    const finalData = { ...newEntry, rewardsClaimed: rewards, userId: user.uid, date };
    setDocumentNonBlocking(ref, finalData, { merge: true });

    if (heartsToAdd > 0 || starsToAdd > 0 || newBadges.length > stats.badges.length) {
      updateStats({
        hearts: stats.hearts + heartsToAdd,
        stars: stats.stars + starsToAdd,
        badges: newBadges
      });
    }
  };

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
    
    // Reward for completion
    const wasAllComplete = goals.length > 0 && goals.every(g => g.completed);
    if (wasAllComplete && !stats.badges.includes('monthly-achiever')) {
      updateStats({ 
        petals: stats.petals + 20, 
        badges: [...stats.badges, 'monthly-achiever'] 
      });
    }

    setDocumentNonBlocking(ref, { userId: user.uid, goals }, { merge: true });
  };

  const updateYearlyGoals = (year: string, goals: Goal[]) => {
    if (!user) return;
    const ref = getYearlyRef(year);
    if (!ref) return;

    const completedOne = goals.some(g => g.completed);
    if (completedOne && !stats.badges.includes('yearly-dreamer')) {
      updateStats({ 
        petals: stats.petals + 50, 
        badges: [...stats.badges, 'yearly-dreamer'] 
      });
    }

    setDocumentNonBlocking(ref, { userId: user.uid, goals }, { merge: true });
  };

  const getStreak = useCallback(() => {
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
  }, [entries]);

  // Check for streak milestones (Petals)
  useMemo(() => {
    if (!user || isStatsLoading) return;
    const streak = getStreak();
    const newBadges = [...stats.badges];
    let petalsToAdd = 0;

    // Milestone logic: Reward Petals every 3 days of a streak
    // Using a more dynamic approach or specific badges as requested
    if (streak > 0 && streak % 3 === 0) {
      // We need to track if streakReward was already granted for this specific milestone
      // For simplicity in this logic, we use badges to avoid multiple triggers
      const milestoneId = `streak-milestone-${streak}`;
      if (!newBadges.includes(milestoneId)) {
        newBadges.push(milestoneId);
        petalsToAdd += 5;
      }
    }

    if (streak >= 3 && !newBadges.includes('streak-3')) {
      newBadges.push('streak-3');
    }
    if (streak >= 7 && !newBadges.includes('streak-7')) {
      newBadges.push('streak-7');
    }
    if (streak >= 30 && !newBadges.includes('streak-30')) {
      newBadges.push('streak-30');
    }

    if (petalsToAdd > 0 || newBadges.length > stats.badges.length) {
      updateStats({ badges: newBadges, petals: stats.petals + petalsToAdd });
    }
  }, [getStreak, stats, isStatsLoading, user, updateStats]);

  return {
    entries,
    globalRoutines,
    stats,
    isLoaded: !isUserLoading && !isEntriesLoading && !isRoutinesLoading && !isStatsLoading,
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

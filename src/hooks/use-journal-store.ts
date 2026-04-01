
"use client"

import { useMemo, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { JournalEntry, ALL_DEFAULT_HABIT_LABELS, Goal, Routine, UserStats } from '@/lib/types';
import { format, startOfMonth, subDays, isSameDay } from 'date-fns';
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

  const getStreak = useCallback(() => {
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const entry = entries[dateStr];
      if (entry) {
        // A day counts for the streak if it has >=1 heart or >=1 star
        const hearts = entry.rewardsClaimed?.heartsEarned || 0;
        const stars = entry.rewardsClaimed?.starsEarned || 0;
        if (hearts > 0 || stars > 0) {
          streak++;
          checkDate = subDays(checkDate, 1);
          continue;
        }
      }
      break;
    }
    return streak;
  }, [entries]);

  // Calculate Cumulative Stats based on all entries
  const stats: UserStats = useMemo(() => {
    const baseStats: UserStats = {
      userId: user?.uid || '',
      hearts: 0,
      stars: 0,
      petals: 0,
      badges: statsData?.badges || []
    };

    if (!entriesData) return baseStats;

    // Calculate Hearts and Stars from entries
    entriesData.forEach(entry => {
      baseStats.hearts += (entry.rewardsClaimed?.heartsEarned || 0);
      baseStats.stars += (entry.rewardsClaimed?.starsEarned || 0);
    });

    // Calculate Petals from streaks
    // Sort entries by date to process streaks chronologically
    const sortedDates = Object.keys(entries).sort();
    let currentStreakLength = 0;
    let totalPetals = 0;
    const streakMilestonesReached = new Set<string>();

    sortedDates.forEach(dateStr => {
      const entry = entries[dateStr];
      const hearts = entry.rewardsClaimed?.heartsEarned || 0;
      const stars = entry.rewardsClaimed?.starsEarned || 0;

      if (hearts > 0 || stars > 0) {
        currentStreakLength++;
        // Check milestones
        if (currentStreakLength % 3 === 0) {
          totalPetals += 1;
        }
        if (currentStreakLength === 7) {
          totalPetals += 1; // 7 days = 3 total (Day 3, 6 give 2, so +1 at day 7)
        }
        if (currentStreakLength === 30) {
          // Day 30 is exactly 10 blocks of 3. So 10 petals already given at 3,6,9...30.
          // 7 day bonuses would have been given at 7, 14, 21, 28.
          // The prompt says "30 days = 10 petals total". 
          // Let's adjust to exactly what the prompt specifies.
        }
      } else {
        currentStreakLength = 0;
      }
    });

    // Prompt logic: 3 days = 1, 7 days = 3 total, 30 days = 10 total.
    // Let's re-calculate petals based strictly on continuous streaks.
    let reCalcPetals = 0;
    let tempStreak = 0;
    sortedDates.forEach(dateStr => {
      const entry = entries[dateStr];
      if ((entry.rewardsClaimed?.heartsEarned || 0) > 0 || (entry.rewardsClaimed?.starsEarned || 0) > 0) {
        tempStreak++;
        // Milestone logic
        if (tempStreak % 3 === 0) reCalcPetals += 1;
        if (tempStreak === 7) reCalcPetals += 1; // At 7, it's 3 total (3,6,7)
        if (tempStreak === 30) {
          // At 30, it should be 10 total.
          // Blocks of 3 at 30 days = 10 petals.
          // If we also gave bonus at 7,14,21,28, it would be 14.
          // So for L=30, we don't add bonuses if we want 10 total? 
          // The prompt says "Every continuous 3 qualifying days = 1 petal". 
          // 30 / 3 = 10. So it's already 10.
        }
      } else {
        tempStreak = 0;
      }
    });

    baseStats.petals = reCalcPetals;

    return baseStats;
  }, [entriesData, entries, user, statsData]);

  // Helper to get doc references
  const getEntryRef = (date: string) => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'dailyEntries', date);
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
      rewardsClaimed: existing?.rewardsClaimed || { heartsEarned: 0, starsEarned: 0 }
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
    
    // Reward Logic
    const rewards = { ...newEntry.rewardsClaimed };
    
    // 1. Hearts (Habits)
    const totalHabits = newEntry.checklist.length + newEntry.customChecklist.length;
    const completedHabits = newEntry.checklist.filter(i => i.checked).length + newEntry.customChecklist.filter(i => i.checked).length;
    const habitPercent = totalHabits > 0 ? (completedHabits / totalHabits) : 0;

    if (habitPercent === 1.0) {
      rewards.heartsEarned = 2;
    } else if (habitPercent >= 0.5) {
      rewards.heartsEarned = 1;
    } else {
      rewards.heartsEarned = 0;
    }

    // 2. Stars (Journaling)
    const journalSections = [
      newEntry.reflectionPositive.grateful,
      newEntry.reflectionPositive.learned,
      newEntry.reflectionGrowth.drained,
      newEntry.reflectionGrowth.improve,
      newEntry.freeWriting
    ];
    const sectionsFilled = journalSections.filter(s => s.trim().length > 0).length;

    if (sectionsFilled === 5) {
      rewards.starsEarned = 2;
    } else if (sectionsFilled >= 2) {
      rewards.starsEarned = 1;
    } else {
      rewards.starsEarned = 0;
    }

    // 3. Perfect Day Badge
    const newBadges = [...stats.badges];
    if (rewards.heartsEarned === 2 && rewards.starsEarned === 2 && !newBadges.includes('perfect-day')) {
      newBadges.push('perfect-day');
    }

    // Apply updates
    const finalData = { ...newEntry, rewardsClaimed: rewards, userId: user.uid, date };
    setDocumentNonBlocking(ref, finalData, { merge: true });

    if (newBadges.length > stats.badges.length) {
      updateStats({ badges: newBadges });
    }
  };

  const addGlobalRoutine = (label: string) => {
    if (!user || !routinesRef) return;
    const newRoutine: Routine = { id: Date.now().toString(), label };
    setDocumentNonBlocking(routinesRef, { userId: user.uid, items: [...globalRoutines, newRoutine] }, { merge: true });
  };

  const deleteGlobalRoutine = (id: string) => {
    if (!user || !routinesRef) return;
    setDocumentNonBlocking(routinesRef, { userId: user.uid, items: globalRoutines.filter(r => r.id !== id) }, { merge: true });
  };

  const editGlobalRoutine = (id: string, newLabel: string) => {
    if (!user || !routinesRef) return;
    setDocumentNonBlocking(routinesRef, { userId: user.uid, items: globalRoutines.map(r => r.id === id ? { ...r, label: newLabel } : r) }, { merge: true });
  };

  const updateMonthlyGoals = (date: Date, goals: Goal[]) => {
    if (!user || !firestore) return;
    const monthId = format(startOfMonth(date), 'yyyy-MM');
    const ref = doc(firestore, 'users', user.uid, 'monthlyGoals', monthId);
    
    const wasAllComplete = goals.length > 0 && goals.every(g => g.completed);
    if (wasAllComplete && !stats.badges.includes('monthly-achiever')) {
      updateStats({ badges: [...stats.badges, 'monthly-achiever'] });
    }

    setDocumentNonBlocking(ref, { userId: user.uid, goals }, { merge: true });
  };

  const updateYearlyGoals = (year: string, goals: Goal[]) => {
    if (!user || !firestore) return;
    const ref = doc(firestore, 'users', user.uid, 'yearlyGoals', year);

    const completedOne = goals.some(g => g.completed);
    if (completedOne && !stats.badges.includes('yearly-dreamer')) {
      updateStats({ badges: [...stats.badges, 'yearly-dreamer'] });
    }

    setDocumentNonBlocking(ref, { userId: user.uid, goals }, { merge: true });
  };

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

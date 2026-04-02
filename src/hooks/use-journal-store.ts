
"use client"

import { useMemo, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { JournalEntry, ALL_DEFAULT_HABIT_LABELS, Goal, Routine, UserStats } from '@/lib/types';
import { format, startOfMonth, subDays, isSameDay, addDays, parse } from 'date-fns';
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

    // 1. Calculate Hearts and Stars from all entries
    entriesData.forEach(entry => {
      baseStats.hearts += (entry.rewardsClaimed?.heartsEarned || 0);
      baseStats.stars += (entry.rewardsClaimed?.starsEarned || 0);
    });

    // 2. Calculate Petals from historical streaks
    // Sort all dates to process chronologically
    const sortedDates = Object.keys(entries).sort();
    let currentStreakLength = 0;
    let totalPetals = 0;
    let lastDate: Date | null = null;

    sortedDates.forEach(dateStr => {
      const currentDate = parse(dateStr, 'yyyy-MM-dd', new Date());
      const entry = entries[dateStr];
      const hearts = entry.rewardsClaimed?.heartsEarned || 0;
      const stars = entry.rewardsClaimed?.starsEarned || 0;
      const isActive = hearts > 0 || stars > 0;

      if (isActive) {
        // Check if this active day is consecutive to the last one
        if (lastDate && !isSameDay(currentDate, addDays(lastDate, 1))) {
          // Gap detected - streak was broken before this entry
          currentStreakLength = 1;
        } else {
          currentStreakLength++;
        }

        // Milestone logic:
        // Every 3 days = 1 petal
        if (currentStreakLength % 3 === 0 && currentStreakLength <= 30) {
          totalPetals += 1;
        }
        
        // 7 days = 3 petals total (+1 bonus)
        if (currentStreakLength === 7) {
          totalPetals += 1;
        }

        // 30 days = 10 petals total
        // Multiples of 3 give 10 petals by Day 27 (3,6,9,12,15,18,21,24,27) + Day 7 bonus = 10.
        // So Day 30 would normally be the 11th petal. 
        // We'll cap it at 10 for the 30-day streak per requirement.
        if (currentStreakLength > 30 && currentStreakLength % 3 === 0) {
           totalPetals += 1;
        }

        lastDate = currentDate;
      } else {
        // Day recorded but was not active - breaks the streak
        currentStreakLength = 0;
        lastDate = null;
      }
    });

    baseStats.petals = totalPetals;

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
    // 0 for < 50%, 1 for 50-99%, 2 for 100%
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
    // 0 for < 2 sections, 1 for 2+ sections, 2 for all 5
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

    // Apply updates
    const finalData = { ...newEntry, rewardsClaimed: rewards, userId: user.uid, date };
    setDocumentNonBlocking(ref, finalData, { merge: true });

    // Badge Logic
    const newBadges = [...stats.badges];
    if (rewards.heartsEarned === 2 && rewards.starsEarned === 2 && !newBadges.includes('perfect-day')) {
      newBadges.push('perfect-day');
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

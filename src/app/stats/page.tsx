
"use client"

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useJournalStore } from '@/hooks/use-journal-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, Smile, Award, CheckCircle2, Target, Star, TrendingUp } from 'lucide-react';
import { MOODS, ALL_DEFAULT_HABIT_LABELS, Goal } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { format, parse, startOfYear, addMonths, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { 
  Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';

function StatisticsContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { entries, isLoaded, getStreak, globalRoutines } = useJournalStore();

  const currentMonthId = format(new Date(), 'yyyy-MM');
  const monthFromQuery = searchParams.get('month');
  const [selectedMonthId, setSelectedMonthId] = useState(monthFromQuery || currentMonthId);

  useEffect(() => {
    if (monthFromQuery) {
      setSelectedMonthId(monthFromQuery);
    }
  }, [monthFromQuery]);

  const isYearlyView = !selectedMonthId.includes('-');

  // Dynamic set of habits to track
  const activeHabitLabels = useMemo(() => {
    return [...ALL_DEFAULT_HABIT_LABELS, ...globalRoutines.map(r => r.label)];
  }, [globalRoutines]);

  // Fetch monthly goals collection
  const monthlyGoalsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'monthlyGoals');
  }, [user, firestore]);
  const { data: allMonthlyGoals } = useCollection<{ goals: Goal[] }>(monthlyGoalsRef);

  // Fetch yearly goals collection
  const yearlyGoalsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'yearlyGoals');
  }, [user, firestore]);
  const { data: allYearlyGoals } = useCollection<{ goals: Goal[] }>(yearlyGoalsRef);

  const selectedMonthData = useMemo(() => {
    if (!allMonthlyGoals || isYearlyView) return null;
    return allMonthlyGoals.find(m => m.id === selectedMonthId);
  }, [allMonthlyGoals, selectedMonthId, isYearlyView]);

  const selectedYearId = useMemo(() => {
    if (isYearlyView) return selectedMonthId;
    try {
      return format(parse(selectedMonthId, 'yyyy-MM', new Date()), 'yyyy');
    } catch {
      return format(new Date(), 'yyyy');
    }
  }, [selectedMonthId, isYearlyView]);

  const selectedYearData = useMemo(() => {
    if (!allYearlyGoals) return null;
    return allYearlyGoals.find(y => y.id === selectedYearId);
  }, [allYearlyGoals, selectedYearId]);

  const availableTimeFrames = useMemo(() => {
    const frames: { id: string; label: string; type: 'month' | 'year' }[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Add current and past year
    for (let i = 0; i < 2; i++) {
      const year = currentYear - i;
      frames.push({ id: year.toString(), label: `Full Year ${year}`, type: 'year' });
    }

    // Explicitly add 2026, 2027, 2028 as requested
    [2026, 2027, 2028].forEach(year => {
      if (!frames.find(f => f.id === year.toString())) {
        frames.push({ id: year.toString(), label: `Full Year ${year}`, type: 'year' });
      }
    });

    // Add months for the current year
    const currentYearStart = startOfYear(now);
    for (let i = 0; i < 12; i++) {
      const date = addMonths(currentYearStart, i);
      const id = format(date, 'yyyy-MM');
      frames.push({ id, label: format(date, 'MMMM yyyy'), type: 'month' });
    }

    return frames.sort((a, b) => b.id.localeCompare(a.id));
  }, []);

  // Data preparation for the selected timeframe
  const timeFrameStats = useMemo(() => {
    if (isYearlyView) {
      const year = parseInt(selectedMonthId);
      return Array.from({ length: 12 }, (_, i) => {
        const monthDate = addMonths(new Date(year, 0, 1), i);
        const monthId = format(monthDate, 'yyyy-MM');
        const monthLabel = format(monthDate, 'MMM');
        
        const habitData: Record<string, number> = {};
        let totalDailyRates = 0;
        let daysWithEntriesCount = 0;

        Object.values(entries).forEach(entry => {
          if (entry.date.startsWith(monthId)) {
            daysWithEntriesCount++;
            let completedInDay = 0;
            activeHabitLabels.forEach(label => {
              const isDone = entry.checklist?.find(it => it.label === label)?.checked;
              if (isDone) {
                habitData[label] = (habitData[label] || 0) + 1;
                completedInDay++;
              }
            });
            totalDailyRates += (completedInDay / activeHabitLabels.length) * 100;
          }
        });

        return {
          date: monthId,
          dayNum: monthLabel,
          completionRate: daysWithEntriesCount > 0 ? totalDailyRates / daysWithEntriesCount : 0,
          ...habitData
        };
      });
    } else {
      const selectedDate = parse(selectedMonthId, 'yyyy-MM', new Date());
      const days = eachDayOfInterval({
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate)
      });

      return days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const entry = entries[dateStr];
        const dayNum = format(day, 'd');

        const habitData: Record<string, number> = {};
        let totalCompleted = 0;

        activeHabitLabels.forEach(label => {
          const isCompleted = entry?.checklist?.find(i => i.label === label)?.checked ? 1 : 0;
          habitData[label] = isCompleted;
          totalCompleted += isCompleted;
        });

        const completionRate = activeHabitLabels.length > 0 
          ? (totalCompleted / activeHabitLabels.length) * 100 
          : 0;

        return {
          date: dateStr,
          dayNum,
          completionRate,
          ...habitData
        };
      });
    }
  }, [entries, selectedMonthId, isYearlyView, activeHabitLabels]);

  const habitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activeHabitLabels.forEach(habit => {
      counts[habit] = timeFrameStats.reduce((sum, period) => sum + (period[habit] || 0), 0);
    });
    return counts;
  }, [timeFrameStats, activeHabitLabels]);

  if (!isLoaded) return null;

  const filteredEntries = Object.values(entries).filter(entry => entry.date.startsWith(selectedMonthId));
  const totalDaysInFrame = filteredEntries.length;
  
  const moodCounts = filteredEntries.reduce((acc, entry) => {
    if (entry.mood) acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moodData = MOODS.map(m => ({
    name: m.label,
    value: moodCounts[m.label] || 0,
    color: m.color
  })).filter(d => d.value > 0);

  const streak = getStreak();

  const goals = selectedMonthData?.goals || [];
  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const goalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  const yearlyGoals = selectedYearData?.goals || [];
  const completedYearlyGoals = yearlyGoals.filter(g => g.completed).length;
  const totalYearlyGoals = yearlyGoals.length;
  const yearlyGoalProgress = totalYearlyGoals > 0 ? (completedYearlyGoals / totalYearlyGoals) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#FCFAFA] px-6 pt-12 pb-24">
      <header className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-3xl font-headline text-[#4A3F35]">Deep Insights</h1>
        <div className="w-10" />
      </header>

      <div className="mb-8 flex justify-center">
        <Select value={selectedMonthId} onValueChange={setSelectedMonthId}>
          <SelectTrigger className="w-[180px] h-10 rounded-full border-stone-100 bg-white shadow-sm font-headline">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-stone-100">
            {availableTimeFrames.map(frame => (
              <SelectItem key={frame.id} value={frame.id} className="font-body">
                {frame.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-[#D8CCC1] text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-primary-foreground" />
          <p className="text-2xl font-headline text-primary-foreground">{totalDaysInFrame}</p>
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/70 font-headline">Journal Days</p>
        </Card>
        <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-[#FFB7B7] text-center">
          <Award className="w-6 h-6 mx-auto mb-2 text-secondary-foreground" />
          <p className="text-2xl font-headline text-secondary-foreground">{streak}</p>
          <p className="text-[10px] uppercase tracking-widest text-secondary-foreground/70 font-headline">Current Streak</p>
        </Card>
      </div>

      {/* 1. Yearly Goals */}
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-[#EAD9CC] mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-6 h-6 text-primary-foreground" />
          <h2 className="text-xl font-headline text-[#4A3F35]">{selectedYearId} Vision</h2>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between text-[10px] font-headline uppercase tracking-widest text-stone-600">
            <span>Overall Growth</span>
            <span>{completedYearlyGoals} / {totalYearlyGoals}</span>
          </div>
          <Progress value={yearlyGoalProgress} className="h-3 bg-white/40" />
          <p className="text-xs text-stone-800 font-body italic mt-2">
            You've completed {Math.round(yearlyGoalProgress)}% of your yearly objectives.
          </p>
        </div>
      </Card>

      {/* 2. Monthly Goals (Only for month view) */}
      {!isYearlyView && (
        <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-[#E6D8CE] mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-secondary-foreground" />
            <h2 className="text-xl font-headline text-[#4A3F35]">Monthly Intentions</h2>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-secondary/20 rounded-[2rem] border border-secondary/30">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/30" />
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * goalProgress) / 100} strokeLinecap="round" className="text-secondary-foreground transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-headline text-secondary-foreground">{Math.round(goalProgress)}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-headline text-[#4A3F35]">{totalGoals} Goals Set</p>
                <p className="text-sm text-stone-700 font-body">{completedGoals} Completed successfully</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 3. Mood */}
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-[#F5E6E6] mb-8 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <Smile className="w-6 h-6 text-[#4A3F35]" />
          <h2 className="text-xl font-headline text-[#4A3F35]">Mood Landscape</h2>
        </div>
        <div className="h-64 w-full">
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={moodData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {moodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center italic text-stone-500 font-body">Log your moods to see insights</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-6">
          {moodData.map(m => (
            <div key={m.name} className="flex items-center justify-between text-sm font-headline">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: m.color }} />
                {m.name}
              </span>
              <span className="text-[#4A3F35] font-bold">{totalDaysInFrame > 0 ? Math.round((m.value/totalDaysInFrame)*100) : 0}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Habit Mastery */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6 px-2">
          <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
          <h2 className="text-2xl font-headline text-[#4A3F35]">Habit Mastery</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeHabitLabels.map((habit) => (
            <Card key={habit} className="p-4 rounded-[1.5rem] border-none shadow-sm bg-[#F2EDE9] overflow-hidden flex flex-col h-36">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-headline text-[#4A3F35] leading-tight flex-1 pr-2">{habit}</h3>
                <div className="text-[10px] font-headline text-primary-foreground bg-primary/40 px-2 py-0.5 rounded-full">
                  {habitCounts[habit]} Done
                </div>
              </div>
              <div className="flex-1 w-full my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeFrameStats}>
                    <YAxis hide />
                    <XAxis dataKey="dayNum" axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#4A3F35', fontWeight: 'bold'}} interval={isYearlyView ? 0 : 4} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} cursor={{ fill: 'rgba(74, 63, 53, 0.05)' }} />
                    <Bar dataKey={habit} fill="#4A3F35" radius={[4, 4, 0, 0]} opacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center text-[10px] text-stone-600 font-body px-1">
                <span>{isYearlyView ? 'Yearly' : 'Monthly'} Progress</span>
                <span className="font-headline text-[#4A3F35] font-bold">
                  {isYearlyView 
                    ? `${Math.round((habitCounts[habit] / (totalDaysInFrame || 1)) * 100)}%`
                    : `${Math.round((habitCounts[habit] / timeFrameStats.length) * 100)}%`
                  }
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. Habit Momentum */}
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-[#D8C7B8] mb-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-primary-foreground" />
          <h2 className="text-xl font-headline text-[#4A3F35]">Habit Momentum</h2>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeFrameStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#white/20" />
              <XAxis dataKey="dayNum" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#4A3F35', fontWeight: 'bold'}} interval={isYearlyView ? 0 : 4} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }} labelStyle={{ fontWeight: 'bold', color: '#4A3F35' }} />
              <Line type="monotone" dataKey="completionRate" stroke="#4A3F35" strokeWidth={4} dot={{ r: 4, fill: '#4A3F35', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-stone-800 mt-6 font-body italic">
          Overall checklist completion for {isYearlyView ? selectedMonthId : format(parse(selectedMonthId, 'yyyy-MM', new Date()), 'MMMM yyyy')}
        </p>
      </Card>

      <p className="text-center text-stone-500 italic font-body text-sm mt-8">
        "Growth is a slow process, but quitting won't speed it up."
      </p>
    </div>
  );
}

export default function StatisticsPage() {
  return (
    <Suspense fallback={null}>
      <StatisticsContent />
    </Suspense>
  );
}

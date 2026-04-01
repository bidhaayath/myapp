"use client"

import React, { useState, useMemo } from 'react';
import { useJournalStore } from '@/hooks/use-journal-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, Smile, Award, CheckCircle2, Target, Star } from 'lucide-react';
import { MOODS, DEFAULT_CHECKLIST_ITEMS, Goal } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { format, parse, startOfYear, addMonths } from 'date-fns';
import { 
  Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell
} from 'recharts';

export default function StatisticsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { entries, isLoaded, getStreak } = useJournalStore();

  const currentMonthId = format(new Date(), 'yyyy-MM');
  const [selectedMonthId, setSelectedMonthId] = useState(currentMonthId);

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
    if (!allMonthlyGoals) return null;
    return allMonthlyGoals.find(m => m.id === selectedMonthId);
  }, [allMonthlyGoals, selectedMonthId]);

  const availableMonths = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    const currentYearStart = startOfYear(now);
    
    // Generate all 12 months for the current year
    for (let i = 0; i < 12; i++) {
      months.push(format(addMonths(currentYearStart, i), 'yyyy-MM'));
    }

    // Add any historical months that have data but aren't in the current year list
    if (allMonthlyGoals) {
      allMonthlyGoals.forEach(m => {
        if (!months.includes(m.id)) {
          months.push(m.id);
        }
      });
    }

    // Sort descending (most recent first)
    return months.sort((a, b) => b.localeCompare(a));
  }, [allMonthlyGoals]);

  if (!isLoaded) return null;

  const entryList = Object.values(entries);
  const totalDays = entryList.length;
  
  // Mood Statistics
  const moodCounts = entryList.reduce((acc, entry) => {
    if (entry.mood) acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moodData = MOODS.map(m => ({
    name: m.label,
    value: moodCounts[m.label] || 0,
    color: m.color
  })).filter(d => d.value > 0);

  // Individual Habit Statistics
  const habitStats = DEFAULT_CHECKLIST_ITEMS.map(label => {
    const completedCount = entryList.filter(e => e.checklist.find(i => i.label === label)?.checked).length;
    const rate = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
    return { label, count: completedCount, rate };
  }).sort((a, b) => b.rate - a.rate);

  const streak = getStreak();

  const goals = selectedMonthData?.goals || [];
  const completed = goals.filter(g => g.completed).length;
  const total = goals.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#FCFAFA] px-6 pt-12 pb-24">
      <header className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-3xl font-headline text-[#4A3F35]">Insights</h1>
        <div className="w-10" />
      </header>

      {/* Core Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-primary/20 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-primary-foreground" />
          <p className="text-2xl font-headline text-primary-foreground">{totalDays}</p>
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60 font-headline">Journal Days</p>
        </Card>
        <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-secondary/20 text-center">
          <Award className="w-6 h-6 mx-auto mb-2 text-secondary-foreground" />
          <p className="text-2xl font-headline text-secondary-foreground">{streak}</p>
          <p className="text-[10px] uppercase tracking-widest text-secondary-foreground/60 font-headline">Current Streak</p>
        </Card>
      </div>

      {/* Monthly Goals Insights */}
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-secondary-foreground" />
            <h2 className="text-xl font-headline text-[#4A3F35]">Monthly Momentum</h2>
          </div>
          <Select value={selectedMonthId} onValueChange={setSelectedMonthId}>
            <SelectTrigger className="w-[140px] h-8 rounded-full border-stone-100 bg-stone-50/50 text-xs font-headline">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-stone-100">
              {availableMonths.map(monthId => {
                const date = parse(monthId, 'yyyy-MM', new Date());
                return (
                  <SelectItem key={monthId} value={monthId} className="text-xs font-body">
                    {format(date, 'MMMM yyyy')}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center p-6 bg-secondary/15 rounded-[2rem] border border-secondary/20">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-stone-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * progress) / 100}
                  strokeLinecap="round"
                  className="text-secondary transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-headline text-secondary-foreground">{Math.round(progress)}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-headline text-[#4A3F35]">{total} Goals Set</p>
              <p className="text-sm text-muted-foreground font-body">{completed} Completed successfully</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-headline uppercase tracking-widest text-muted-foreground px-1">
              <span>Goal Progress</span>
              <span>{completed} / {total}</span>
            </div>
            <Progress value={progress} className="h-2 bg-stone-100" />
          </div>
        </div>
      </Card>

      {/* Yearly Vision Stats */}
      {allYearlyGoals && allYearlyGoals.length > 0 && (
        <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-primary-foreground" />
            <h2 className="text-xl font-headline text-[#4A3F35]">Yearly Vision</h2>
          </div>
          <div className="space-y-6">
            {allYearlyGoals.map((yearDoc) => {
              const goals = yearDoc.goals || [];
              const completed = goals.filter(g => g.completed).length;
              const total = goals.length;
              const progress = total > 0 ? (completed / total) * 100 : 0;
              return (
                <div key={yearDoc.id} className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-headline text-[#4A3F35]">{yearDoc.id} Growth</span>
                    <span className="text-xs text-muted-foreground">{completed}/{total} Achieved</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-stone-100" />
                  <p className="text-xs text-muted-foreground italic font-body">
                    {progress === 100 ? "Amazing! You've reached your vision." : `${Math.round(progress)}% of your yearly intentions completed.`}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Mood Distribution */}
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white mb-8 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <Smile className="w-6 h-6 text-primary-foreground" />
          <h2 className="text-xl font-headline text-[#4A3F35]">Mood Landscape</h2>
        </div>
        <div className="h-64 w-full">
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={moodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {moodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center italic text-muted-foreground font-body">Log your moods to see insights</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
          {moodData.map(m => (
            <div key={m.name} className="flex items-center justify-between text-sm font-body">
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: m.color }} />
                {m.name}
              </span>
              <span className="text-muted-foreground font-headline">{totalDays > 0 ? Math.round((m.value/totalDays)*100) : 0}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Habit Mastery */}
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white mb-8">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
          <h2 className="text-xl font-headline text-[#4A3F35]">Habit Progress</h2>
        </div>
        <div className="space-y-6">
          {habitStats.slice(0, 15).map((habit) => (
            <div key={habit.label} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-body text-stone-700">{habit.label}</span>
                <span className="text-xs font-headline text-stone-400">{habit.count} completions</span>
              </div>
              <div className="relative h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-primary-foreground/60 transition-all duration-1000" 
                  style={{ width: `${habit.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-center text-stone-400 italic font-body text-sm mt-8">
        "Growth is a slow process, but quitting won't speed it up."
      </p>
    </div>
  );
}

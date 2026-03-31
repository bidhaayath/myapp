"use client"

import React from 'react';
import { useJournalStore } from '@/hooks/use-journal-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BarChart2, Calendar, Smile, Award, PieChart, CheckCircle2, TrendingUp, Target, Star, History } from 'lucide-react';
import { MOODS, DEFAULT_CHECKLIST_ITEMS, Goal } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export default function StatisticsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { entries, isLoaded, getStreak } = useJournalStore();

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
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground italic font-body">
                    {progress === 100 ? "Amazing! You've reached your vision." : `${Math.round(progress)}% of your yearly intentions completed.`}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Monthly Goals Breakdown */}
      {allMonthlyGoals && allMonthlyGoals.length > 0 && (
        <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-secondary-foreground" />
            <h2 className="text-xl font-headline text-[#4A3F35]">Monthly Momentum</h2>
          </div>
          <div className="space-y-8">
            {[...allMonthlyGoals].reverse().map((monthDoc) => {
              const goals = monthDoc.goals || [];
              const completed = goals.filter(g => g.completed).length;
              const total = goals.length;
              const progress = total > 0 ? (completed / total) * 100 : 0;
              
              // Format monthId (YYYY-MM) to readable month
              const [year, month] = monthDoc.id.split('-');
              const date = new Date(parseInt(year), parseInt(month) - 1);
              const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

              return (
                <div key={monthDoc.id} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-headline text-stone-600">{monthName}</span>
                    <span className="text-xs font-body font-medium text-secondary-foreground bg-secondary/20 px-2 py-0.5 rounded-full">
                      {Math.round(progress)}% Done
                    </span>
                  </div>
                  <div className="relative h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-secondary transition-all duration-1000" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                     <span className="text-[10px] text-stone-400 font-body">{total} Goals set</span>
                     <span className="text-[10px] text-stone-400 font-body">{completed} Completed</span>
                  </div>
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
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center italic text-muted-foreground">Log your moods to see insights</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
          {moodData.map(m => (
            <div key={m.name} className="flex items-center justify-between text-xs font-body">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                {m.name}
              </span>
              <span className="text-muted-foreground">{Math.round((m.value/totalDays)*100)}%</span>
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
          {habitStats.slice(0, 8).map((habit) => (
            <div key={habit.label} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-body text-stone-700">{habit.label}</span>
                <span className="text-xs font-headline text-stone-400">{habit.count} completions</span>
              </div>
              <div className="relative h-2 w-full bg-stone-50 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-primary-foreground/30 transition-all duration-1000" 
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

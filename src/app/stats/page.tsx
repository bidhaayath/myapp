"use client"

import React, { useState, useMemo } from 'react';
import { useJournalStore } from '@/hooks/use-journal-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, Smile, Award, CheckCircle2, Target, Star, TrendingUp } from 'lucide-react';
import { MOODS, DEFAULT_CHECKLIST_ITEMS, Goal, JournalEntry } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { format, parse, startOfYear, addMonths, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, getDaysInMonth } from 'date-fns';
import { 
  Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid
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
    
    for (let i = 0; i < 12; i++) {
      months.push(format(addMonths(currentYearStart, i), 'yyyy-MM'));
    }

    if (allMonthlyGoals) {
      allMonthlyGoals.forEach(m => {
        if (!months.includes(m.id)) {
          months.push(m.id);
        }
      });
    }

    return months.sort((a, b) => b.localeCompare(a));
  }, [allMonthlyGoals]);

  // Data preparation for the selected month
  const monthStats = useMemo(() => {
    const selectedDate = parse(selectedMonthId, 'yyyy-MM', new Date());
    const days = eachDayOfInterval({
      start: startOfMonth(selectedDate),
      end: endOfMonth(selectedDate)
    });

    const dailyData = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const entry = entries[dateStr];
      const dayNum = format(day, 'd');

      const habitData: Record<string, number> = {};
      let totalCompleted = 0;

      DEFAULT_CHECKLIST_ITEMS.forEach(label => {
        const isCompleted = entry?.checklist?.find(i => i.label === label)?.checked ? 1 : 0;
        habitData[label] = isCompleted;
        totalCompleted += isCompleted;
      });

      const completionRate = DEFAULT_CHECKLIST_ITEMS.length > 0 
        ? (totalCompleted / DEFAULT_CHECKLIST_ITEMS.length) * 100 
        : 0;

      return {
        date: dateStr,
        dayNum,
        completionRate,
        ...habitData
      };
    });

    return dailyData;
  }, [entries, selectedMonthId]);

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

  const streak = getStreak();

  const goals = selectedMonthData?.goals || [];
  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;
  const goalProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

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

      {/* Global Month Selector */}
      <div className="mb-8 flex justify-center">
        <Select value={selectedMonthId} onValueChange={setSelectedMonthId}>
          <SelectTrigger className="w-[180px] h-10 rounded-full border-stone-100 bg-white shadow-sm font-headline">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-stone-100">
            {availableMonths.map(monthId => {
              const date = parse(monthId, 'yyyy-MM', new Date());
              return (
                <SelectItem key={monthId} value={monthId} className="font-body">
                  {format(date, 'MMMM yyyy')}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Core Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-primary/30 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-primary-foreground" />
          <p className="text-2xl font-headline text-primary-foreground">{totalDays}</p>
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/70 font-headline">Journal Days</p>
        </Card>
        <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-secondary/30 text-center">
          <Award className="w-6 h-6 mx-auto mb-2 text-secondary-foreground" />
          <p className="text-2xl font-headline text-secondary-foreground">{streak}</p>
          <p className="text-[10px] uppercase tracking-widest text-secondary-foreground/70 font-headline">Current Streak</p>
        </Card>
      </div>

      {/* Total Habit Progress Chart */}
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-[#F5EBE0] mb-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-primary-foreground" />
          <h2 className="text-xl font-headline text-[#4A3F35]">Habit Momentum</h2>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0d5c9" />
              <XAxis 
                dataKey="dayNum" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#8D7B6D'}} 
                interval={4}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}
                labelStyle={{ fontWeight: 'bold', color: '#4A3F35' }}
                formatter={(value: number) => [`${Math.round(value)}%`, 'Completion']}
              />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#4A3F35" 
                strokeWidth={3} 
                dot={{ r: 3, fill: '#4A3F35' }} 
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-center text-stone-500 mt-4 font-body">
          Daily overall checklist completion for {format(parse(selectedMonthId, 'yyyy-MM', new Date()), 'MMMM yyyy')}
        </p>
      </Card>

      {/* Monthly Goals Insights */}
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-[#F9F1E7] mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-secondary-foreground" />
          <h2 className="text-xl font-headline text-[#4A3F35]">Monthly Intentions</h2>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center p-6 bg-secondary/20 rounded-[2rem] border border-secondary/30">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-stone-300"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * goalProgress) / 100}
                  strokeLinecap="round"
                  className="text-secondary-foreground transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-headline text-secondary-foreground">{Math.round(goalProgress)}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-headline text-[#4A3F35]">{totalGoals} Goals Set</p>
              <p className="text-sm text-stone-600 font-body">{completedGoals} Completed successfully</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-headline uppercase tracking-widest text-stone-500 px-1">
              <span>Goal Progress</span>
              <span>{completedGoals} / {totalGoals}</span>
            </div>
            <Progress value={goalProgress} className="h-2 bg-stone-200" />
          </div>
        </div>
      </Card>

      {/* Individual Habit Progress Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6 px-2">
          <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
          <h2 className="text-2xl font-headline text-[#4A3F35]">Habit Mastery</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {DEFAULT_CHECKLIST_ITEMS.map((habit) => (
            <Card key={habit} className="p-6 rounded-[2rem] border-none shadow-sm bg-[#F5F5F5] overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-headline text-[#4A3F35]">{habit}</h3>
                <div className="text-[10px] uppercase tracking-widest text-primary-foreground font-headline bg-primary/30 px-3 py-1 rounded-full">
                  Monthly View
                </div>
              </div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthStats}>
                    <YAxis hide domain={[0, 1.2]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }}
                      formatter={(value: number) => [value === 1 ? 'Done' : 'Missed', 'Status']}
                    />
                    <Line 
                      type="stepAfter" 
                      dataKey={habit} 
                      stroke="#C8B8AC" 
                      strokeWidth={2} 
                      dot={false}
                      fill="#C8B8AC"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Yearly Vision Stats */}
      {allYearlyGoals && allYearlyGoals.length > 0 && (
        <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-[#ECE4DC] mb-8">
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
                    <span className="text-xs text-stone-600">{completed}/{total} Achieved</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-stone-300" />
                  <p className="text-xs text-stone-500 italic font-body">
                    {progress === 100 ? "Amazing! You've reached your vision." : `${Math.round(progress)}% of your yearly intentions completed.`}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Mood Distribution */}
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-[#F5EBE0] mb-8 overflow-hidden">
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
            <div className="h-full flex items-center justify-center italic text-stone-500 font-body">Log your moods to see insights</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
          {moodData.map(m => (
            <div key={m.name} className="flex items-center justify-between text-sm font-body">
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: m.color }} />
                {m.name}
              </span>
              <span className="text-stone-600 font-headline">{totalDays > 0 ? Math.round((m.value/totalDays)*100) : 0}%</span>
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

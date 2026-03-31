"use client"

import React from 'react';
import { useJournalStore } from '@/hooks/use-journal-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BarChart2, Calendar, Smile, Award, PieChart, CheckCircle2, TrendingUp, History } from 'lucide-react';
import { MOODS, DEFAULT_CHECKLIST_ITEMS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

export default function StatisticsPage() {
  const { entries, isLoaded, getStreak } = useJournalStore();

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

  // Overall Completion Rates
  const totalChecklistItems = entryList.reduce((acc, entry) => 
    acc + entry.checklist.length + entry.customChecklist.length, 0);
  const totalCompleted = entryList.reduce((acc, entry) => 
    acc + entry.checklist.filter(i => i.checked).length + entry.customChecklist.filter(i => i.checked).length, 0);
  const overallCompletionRate = totalChecklistItems > 0 ? Math.round((totalCompleted / totalChecklistItems) * 100) : 0;

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
          {habitStats.slice(0, 5).map((habit) => (
            <div key={habit.label} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-body text-stone-700">{habit.label}</span>
                <span className="text-xs font-headline text-stone-400">{habit.count} completions</span>
              </div>
              <div className="relative h-2 w-full bg-stone-50 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-secondary transition-all duration-1000" 
                  style={{ width: `${habit.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Overall Completion Timeline */}
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white mb-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-primary-foreground" />
          <h2 className="text-xl font-headline text-[#4A3F35]">Completion Rate</h2>
        </div>
        <div className="text-center py-4">
          <div className="text-5xl font-headline text-[#4A3F35] mb-2">{overallCompletionRate}%</div>
          <p className="text-sm text-muted-foreground font-body italic">Average daily completion</p>
          <div className="h-32 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={entryList.slice(-7).map(e => ({ 
                date: e.date, 
                val: Math.round((e.checklist.filter(i => i.checked).length / e.checklist.length) * 100) 
              }))}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E6D8CE" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#E6D8CE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#4A3F35" fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <p className="text-center text-stone-400 italic font-body text-sm mt-8">
        "Your consistency is your superpower."
      </p>
    </div>
  );
}

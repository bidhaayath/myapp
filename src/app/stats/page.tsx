"use client"

import React from 'react';
import { useJournalStore } from '@/hooks/use-journal-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BarChart2, Calendar, Smile, Award } from 'lucide-react';
import { MOODS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function StatisticsPage() {
  const { entries, isLoaded, getStreak } = useJournalStore();

  if (!isLoaded) return null;

  const totalDays = Object.keys(entries).length;
  const moodCounts = Object.values(entries).reduce((acc, entry) => {
    if (entry.mood) acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  const streak = getStreak();

  // Completion calculation
  const totalChecklistItems = Object.values(entries).reduce((acc, entry) => 
    acc + entry.checklist.length + entry.customChecklist.length, 0);
  const totalCompleted = Object.values(entries).reduce((acc, entry) => 
    acc + entry.checklist.filter(i => i.checked).length + entry.customChecklist.filter(i => i.checked).length, 0);
  const completionRate = totalChecklistItems > 0 ? Math.round((totalCompleted / totalChecklistItems) * 100) : 0;

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

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-primary/20 text-center">
          <Calendar className="w-6 h-6 mx-auto mb-2 text-primary-foreground" />
          <p className="text-2xl font-headline text-primary-foreground">{totalDays}</p>
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60 font-headline">Total Days</p>
        </Card>
        <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-secondary/20 text-center">
          <Award className="w-6 h-6 mx-auto mb-2 text-secondary-foreground" />
          <p className="text-2xl font-headline text-secondary-foreground">{streak}</p>
          <p className="text-[10px] uppercase tracking-widest text-secondary-foreground/60 font-headline">Best Streak</p>
        </Card>
      </div>

      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Smile className="w-6 h-6 text-primary-foreground" />
          <h2 className="text-xl font-headline text-[#4A3F35]">Mood Distribution</h2>
        </div>
        <div className="space-y-4">
          {sortedMoods.length === 0 ? (
            <p className="text-muted-foreground italic text-center py-4">No moods logged yet.</p>
          ) : (
            sortedMoods.slice(0, 5).map(([moodLabel, count]) => {
              const moodInfo = MOODS.find(m => m.label === moodLabel);
              const percentage = Math.round((count / totalDays) * 100);
              return (
                <div key={moodLabel} className="space-y-1">
                  <div className="flex justify-between text-sm mb-1 font-body">
                    <span className="flex items-center gap-2">
                      {moodInfo?.emoji} {moodLabel}
                    </span>
                    <span className="text-muted-foreground">{count} times</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary transition-all duration-1000" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white mb-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart2 className="w-6 h-6 text-primary-foreground" />
          <h2 className="text-xl font-headline text-[#4A3F35]">Activity Level</h2>
        </div>
        <div className="text-center py-4">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                className="text-stone-100"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="64"
                cy="64"
              />
              <circle
                className="text-secondary transition-all duration-1000"
                strokeWidth="8"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * completionRate) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="64"
                cy="64"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-headline text-[#4A3F35]">{completionRate}%</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Checklist</span>
            </div>
          </div>
          <p className="mt-6 text-muted-foreground font-body italic">
            "Your consistency is your superpower."
          </p>
        </div>
      </Card>
    </div>
  );
}

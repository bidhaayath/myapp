"use client"

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { useJournalStore } from '@/hooks/use-journal-store';
import { JournalContainer } from '@/components/journal/journal-container';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, Calendar as CalendarIcon, Target, TrendingUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOODS } from '@/lib/types';
import Link from 'next/link';

function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { entries, isLoaded, getStreak, getEntry, updateEntry } = useJournalStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dateFromUrl = searchParams.get('date');
  const activeDate = dateFromUrl || format(new Date(), 'yyyy-MM-dd');
  const isJournalOpen = !!dateFromUrl;

  if (!isLoaded) return null;

  const handleDateSelect = (date: Date) => {
    router.push(`/?date=${format(date, 'yyyy-MM-dd')}`);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const streak = getStreak();

  if (isJournalOpen) {
    return (
      <JournalContainer 
        entry={getEntry(activeDate)} 
        onUpdate={(updates) => updateEntry(activeDate, updates)}
        onGoBack={() => router.push('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAFA] flex flex-col pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-headline text-[#4A3F35]">Daily Four</h1>
          <p className="text-muted-foreground font-body italic">Mindful journey</p>
        </div>
        <div className="bg-white/80 p-3 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary-foreground" />
          <span className="font-headline text-lg">{streak} Day Streak</span>
        </div>
      </header>

      {/* Calendar Section */}
      <section className="px-4 mb-8">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-stone-100/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-headline text-[#4A3F35]">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-center text-[10px] font-headline text-muted-foreground/60 uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const entry = entries[dateStr];
              const mood = MOODS.find(m => m.label === entry?.mood);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all",
                    isToday ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-stone-50",
                    mood ? "bg-opacity-40" : ""
                  )}
                  style={mood ? { backgroundColor: `${mood.color}44` } : {}}
                >
                  <span className={cn(
                    "text-sm font-headline mb-0.5",
                    isToday ? "text-[#4A3F35]" : "text-stone-500"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {mood && <span className="text-xs">{mood.emoji}</span>}
                  {entry && !mood && <div className="w-1 h-1 bg-primary-foreground rounded-full" />}
                </button>
              );
            })}
          </div>
          
          <Button 
            className="w-full mt-6 rounded-2xl py-6 font-headline text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => handleDateSelect(new Date())}
          >
            Today's Entry
          </Button>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="px-4 grid grid-cols-2 gap-4">
        <Link href="/goals/monthly" className="bg-secondary/20 p-6 rounded-[2rem] border border-secondary/30 flex flex-col justify-between h-40 group">
          <Target className="w-8 h-8 text-secondary-foreground group-hover:scale-110 transition-transform" />
          <div>
            <h3 className="text-xl font-headline text-secondary-foreground">Monthly Goals</h3>
            <p className="text-xs text-secondary-foreground/70 font-body">Reset your focus</p>
          </div>
        </Link>
        <Link href="/goals/yearly" className="bg-primary/20 p-6 rounded-[2rem] border border-primary/30 flex flex-col justify-between h-40 group">
          <CalendarIcon className="w-8 h-8 text-primary-foreground group-hover:scale-110 transition-transform" />
          <div>
            <h3 className="text-xl font-headline text-primary-foreground">Yearly Vision</h3>
            <p className="text-xs text-primary-foreground/70 font-body">Long term growth</p>
          </div>
        </Link>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-[2.5rem] px-8 py-4 flex justify-between items-center z-50">
        <Link href="/" className="text-primary-foreground">
          <CalendarIcon className="w-6 h-6" />
        </Link>
        <Link href="/stats" className="text-muted-foreground hover:text-primary-foreground transition-colors">
          <TrendingUp className="w-6 h-6" />
        </Link>
        <Link href="/settings" className="text-muted-foreground hover:text-primary-foreground transition-colors">
          <Settings className="w-6 h-6" />
        </Link>
      </nav>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}

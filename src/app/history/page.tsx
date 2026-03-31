"use client"

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useJournalStore } from '@/hooks/use-journal-store';
import { format } from 'date-fns';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { entries, isLoaded, getStreak } = useJournalStore();
  const router = useRouter();

  if (!isLoaded) return null;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      router.push(`/?date=${dateStr}`);
    }
  };

  const streak = getStreak();

  return (
    <div className="min-h-screen bg-[#FCFAFA] px-4 pt-12 pb-24">
      <div className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-3xl font-headline text-[#4A3F35]">Past Entries</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-stone-100/50 mb-8">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          className="rounded-md"
          modifiers={{
            hasEntry: (date) => !!entries[format(date, 'yyyy-MM-dd')]
          }}
          modifiersStyles={{
            hasEntry: { fontWeight: 'bold', color: '#4A3F35', backgroundColor: '#E6D8CE44' }
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary/20 p-6 rounded-[2rem] border border-secondary/30 text-center">
          <p className="text-sm font-headline uppercase tracking-widest text-secondary-foreground mb-1">Current Streak</p>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary-foreground" />
            <span className="text-4xl font-headline text-secondary-foreground">{streak} Days</span>
          </div>
        </div>
        
        <div className="bg-primary/20 p-6 rounded-[2rem] border border-primary/30 text-center">
          <p className="text-sm font-headline uppercase tracking-widest text-primary-foreground mb-1">Total Entries</p>
          <span className="text-4xl font-headline text-primary-foreground">{Object.keys(entries).length}</span>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground italic font-body text-lg">
          "Every day is a new page in your story."
        </p>
      </div>
    </div>
  );
}
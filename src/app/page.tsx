"use client"

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useJournalStore } from '@/hooks/use-journal-store';
import { JournalContainer } from '@/components/journal/journal-container';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, Moon, Sparkles } from 'lucide-react';
import Link from 'next/link';

function JournalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getEntry, updateEntry, isLoaded, getStreak } = useJournalStore();
  const [viewingJournal, setViewingJournal] = useState(false);

  // Use the date from URL or today
  const dateFromUrl = searchParams.get('date');
  const today = format(new Date(), 'yyyy-MM-dd');
  const activeDate = dateFromUrl || today;

  useEffect(() => {
    if (dateFromUrl) {
      setViewingJournal(true);
    }
  }, [dateFromUrl]);

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFAFA]">
      <div className="animate-pulse text-primary font-headline text-2xl italic">Daily Four...</div>
    </div>
  );

  const entry = getEntry(activeDate);

  if (viewingJournal) {
    return (
      <JournalContainer 
        entry={entry} 
        onUpdate={(updates) => updateEntry(activeDate, updates)}
        onGoBack={() => {
          setViewingJournal(false);
          router.push('/');
        }}
      />
    );
  }

  const streak = getStreak();

  return (
    <div className="min-h-screen bg-[#FCFAFA] flex flex-col p-6 overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

      <header className="pt-12 mb-12 relative">
        <h1 className="text-5xl font-headline text-[#4A3F35] leading-tight">
          Daily Four
        </h1>
        <p className="text-xl text-muted-foreground font-body italic mt-2">
          Your moment of peace.
        </p>
      </header>

      <div className="flex-1 flex flex-col gap-6 relative">
        {/* Streak Tracker */}
        <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-headline mb-1">Your Journey</p>
            <p className="text-2xl font-headline text-[#4A3F35]">{streak} Day Streak</p>
          </div>
          <div className="bg-secondary/40 p-3 rounded-full">
            <Sparkles className="w-6 h-6 text-secondary-foreground" />
          </div>
        </div>

        {/* Main Action */}
        <button 
          onClick={() => setViewingJournal(true)}
          className="bg-primary/30 border border-primary/50 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all text-left group"
        >
          <div className="flex justify-between items-start mb-4">
             <div className="bg-white/80 p-3 rounded-2xl">
               <Moon className="w-8 h-8 text-primary-foreground" />
             </div>
             <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <h2 className="text-3xl font-headline text-[#4A3F35]">Write Today</h2>
          <p className="text-muted-foreground font-body text-lg mt-1">Four simple pages to end your day well.</p>
        </button>

        {/* History Quick Access */}
        <Link href="/history" className="flex-1">
          <div className="bg-white/60 h-full backdrop-blur-sm border border-stone-200/50 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="bg-stone-100 p-3 rounded-2xl">
                 <Calendar className="w-8 h-8 text-[#4A3F35]" />
               </div>
            </div>
            <div>
              <h2 className="text-3xl font-headline text-[#4A3F35]">View History</h2>
              <p className="text-muted-foreground font-body text-lg mt-1">Reflect on your past entries.</p>
            </div>
          </div>
        </Link>
      </div>

      <footer className="py-8 text-center text-muted-foreground/60 text-xs font-headline tracking-widest uppercase">
        Mindfully Crafted for You
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <JournalContent />
    </Suspense>
  );
}
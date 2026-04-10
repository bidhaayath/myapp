
"use client"

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { useJournalStore } from '@/hooks/use-journal-store';
import { JournalContainer } from '@/components/journal/journal-container';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, Calendar as CalendarIcon, Target, TrendingUp, Settings, LogOut, BarChart3, Heart, Star, Flower, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { MOODS } from '@/lib/types';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { entries, isLoaded, getStreak, getEntry, updateEntry, user, stats } = useJournalStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [todayDate, setTodayDate] = useState<string | null>(null);
  const auth = useAuth();

  const dateFromUrl = searchParams.get('date');
  const activeDate = dateFromUrl || (todayDate || format(new Date(), 'yyyy-MM-dd'));
  const isJournalOpen = !!dateFromUrl;

  useEffect(() => {
    // Set today's date on the client to avoid hydration mismatch
    setTodayDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/login');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded || !user) return null;

  const handleDateSelect = (date: Date) => {
    router.push(`/?date=${format(date, 'yyyy-MM-dd')}`);
  };

  const startMonth = startOfMonth(currentMonth);
  const endMonth = endOfMonth(currentMonth);
  const days = eachDayOfInterval({
    start: startMonth,
    end: endMonth,
  });

  // Calculate day of the week for the 1st of the month (0 = Sunday)
  const startDayOfWeek = getDay(startMonth);

  const streak = getStreak();
  const todayDateStr = todayDate || format(new Date(), 'yyyy-MM-dd');
  const todayEntry = entries[todayDateStr];
  const todayRewards = todayEntry?.rewardsClaimed || { heartsEarned: 0, starsEarned: 0 };

  if (isJournalOpen) {
    return (
      <JournalContainer 
        entry={getEntry(activeDate)} 
        onUpdate={(updates) => updateEntry(activeDate, updates)}
        onGoBack={() => router.push('/')}
      />
    );
  }

  const currentMonthId = format(currentMonth, 'yyyy-MM');

  return (
    <div className="min-h-screen bg-[#FCFAFA] flex flex-col pb-24">
      {/* Header */}
      <header className="px-6 pt-12 pb-8 flex flex-col gap-4 bg-[#F2E6DA] rounded-b-[2.5rem] shadow-sm mb-8 border-b border-stone-200/50">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-headline text-[#4A3F35]">BT Journal</h1>
            <p className="text-muted-foreground font-body italic">Creative mindful journey</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary-foreground" />
              <span className="font-headline text-lg">{streak} Day Streak</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut(auth)} className="text-muted-foreground hover:text-red-400 h-8">
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Lifetime Totals Row */}
        <div className="flex flex-col gap-3">
          <Link href="/rewards" className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-4 rounded-[2rem] border border-white/40 shadow-inner group">
            <div className="flex items-center gap-2">
              <div className="bg-red-50 p-2 rounded-full"><Heart className="w-4 h-4 text-red-400" /></div>
              <span className="font-headline text-[#4A3F35]">{stats.hearts}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-amber-50 p-2 rounded-full"><Star className="w-4 h-4 text-amber-500" /></div>
              <span className="font-headline text-[#4A3F35]">{stats.stars}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 p-2 rounded-full"><Flower className="w-4 h-4 text-emerald-500" /></div>
              <span className="font-headline text-[#4A3F35]">{stats.petals}</span>
            </div>
            <div className="ml-auto text-[10px] font-headline uppercase tracking-widest text-muted-foreground group-hover:text-primary-foreground transition-colors">
              Gallery →
            </div>
          </Link>

          {/* Today's Earned Status */}
          <div className="bg-white/30 backdrop-blur-sm p-4 rounded-[2rem] border border-white/20 flex flex-col gap-3">
             <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground">Today's Progress</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-muted-foreground hover:text-primary-foreground transition-colors">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4 rounded-2xl bg-white/95 backdrop-blur border-stone-100 shadow-xl z-[100]">
                    <h4 className="font-headline text-[#4A3F35] mb-2">Reward Rules</h4>
                    <div className="space-y-3 text-xs font-body text-stone-600">
                      <p><span className="font-headline text-red-400">Hearts</span>: 1 for ≥50% habits, 2 for 100% daily.</p>
                      <p><span className="font-headline text-amber-500">Stars</span>: 1 for ≥2 journal sections, 2 for all 5 daily.</p>
                      <p><span className="font-headline text-emerald-500">Petals</span>: 1 at 3 days, 3 total at 7 days, 10 total at 30 days of continuous activity.</p>
                    </div>
                  </PopoverContent>
                </Popover>
             </div>
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                   <div className={cn("p-1.5 rounded-full transition-all", todayRewards.heartsEarned && todayRewards.heartsEarned > 0 ? "bg-red-100" : "bg-stone-100 grayscale opacity-40")}>
                      <Heart className={cn("w-3.5 h-3.5", todayRewards.heartsEarned && todayRewards.heartsEarned > 0 ? "text-red-400 fill-current" : "text-stone-400")} />
                   </div>
                   <span className="text-xs font-headline text-[#4A3F35]">{todayRewards.heartsEarned || 0}</span>
                </div>

                <div className="flex items-center gap-1.5">
                   <div className={cn("p-1.5 rounded-full transition-all", todayRewards.starsEarned && todayRewards.starsEarned > 0 ? "bg-amber-100" : "bg-stone-100 grayscale opacity-40")}>
                      <Star className={cn("w-3.5 h-3.5", todayRewards.starsEarned && todayRewards.starsEarned > 0 ? "text-amber-500 fill-current" : "text-stone-400")} />
                   </div>
                   <span className="text-xs font-headline text-[#4A3F35]">{todayRewards.starsEarned || 0}</span>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Calendar Section */}
      <section className="px-4 mb-8">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-stone-100/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-headline text-[#4A3F35]">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Link href={`/stats?month=${currentMonthId}`} className="text-[10px] text-primary-foreground/70 font-headline uppercase tracking-widest hover:text-primary-foreground transition-colors flex items-center gap-1 mt-1">
                <BarChart3 className="w-3 h-3" />
                View Monthly Insights
              </Link>
            </div>
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
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={`${d}-${i}`} className="text-center text-[10px] font-headline text-muted-foreground/60 uppercase tracking-widest py-2">
                {d}
              </div>
            ))}
            
            {/* Calendar spacers for alignment */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`spacer-${i}`} className="aspect-square" />
            ))}

            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const entry = entries[dateStr];
              const moodInfo = MOODS.find(m => m.label === entry?.mood);
              const isToday = todayDate ? isSameDay(day, new Date(todayDate)) : false;
              const isEntryDone = entry && (entry.freeWriting || entry.drawingData || entry.checklist.some(item => item.checked));

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all border",
                    isToday ? "border-primary-foreground/30 shadow-inner bg-primary/10" : "border-transparent",
                    !moodInfo && "hover:bg-stone-50"
                  )}
                  style={moodInfo ? { backgroundColor: moodInfo.color } : {}}
                >
                  <span className={cn(
                    "text-xs font-headline mb-0.5",
                    isToday ? "font-bold text-[#4A3F35]" : "text-stone-500",
                    moodInfo && "text-opacity-80"
                  )} style={moodInfo ? { color: moodInfo.textColor } : {}}>
                    {format(day, 'd')}
                  </span>
                  {moodInfo && <span className="text-xs">{moodInfo.emoji}</span>}
                  {isEntryDone && !moodInfo && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary-foreground/20 rounded-full" />}
                </button>
              );
            })}
          </div>
          
          <Button 
            className="w-full mt-6 rounded-2xl py-6 font-headline text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            onClick={() => handleDateSelect(new Date())}
          >
            Today's Entry
          </Button>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="px-4 grid grid-cols-2 gap-4">
        <Link href="/goals/monthly" className="bg-secondary p-6 rounded-[2rem] border border-secondary/50 flex flex-col justify-between h-40 group shadow-sm transition-all active:scale-95">
          <Target className="w-8 h-8 text-secondary-foreground group-hover:scale-110 transition-transform" />
          <div>
            <h3 className="text-xl font-headline text-secondary-foreground">Monthly Goals</h3>
            <p className="text-xs text-secondary-foreground/80 font-body">Reset your focus</p>
          </div>
        </Link>
        <Link href="/goals/yearly" className="bg-primary p-6 rounded-[2rem] border border-primary/50 flex flex-col justify-between h-40 group shadow-sm transition-all active:scale-95">
          <CalendarIcon className="w-8 h-8 text-primary-foreground group-hover:scale-110 transition-transform" />
          <div>
            <h3 className="text-xl font-headline text-primary-foreground">Yearly Vision</h3>
            <p className="text-xs text-primary-foreground/80 font-body">Long term growth</p>
          </div>
        </Link>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-[2.5rem] px-8 py-4 flex justify-between items-center z-50">
        <Link href="/" className="text-primary-foreground">
          <CalendarIcon className="w-6 h-6" />
        </Link>
        <Link href="/stats" className="text-muted-foreground hover:text-primary-foreground transition-colors">
          <BarChart3 className="w-6 h-6" />
        </Link>
        <Link href="/rewards" className="text-muted-foreground hover:text-primary-foreground transition-colors">
          <Flower className="w-6 h-6" />
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

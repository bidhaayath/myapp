
"use client"

import React from 'react';
import { useJournalStore } from '@/hooks/use-journal-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Heart, Star, Award, Sparkles, Trophy, Flower, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BADGES } from '@/lib/types';
import Link from 'next/link';

export default function RewardsPage() {
  const { stats, isLoaded, getStreak } = useJournalStore();

  if (!isLoaded) return null;

  const streak = getStreak();
  const collectedBadges = BADGES.filter(b => stats.badges.includes(b.id));
  const lockedBadges = BADGES.filter(b => !stats.badges.includes(b.id));

  return (
    <div className="min-h-screen bg-[#FCFAFA] px-6 pt-12 pb-32">
      <header className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-3xl font-headline text-[#4A3F35]">Rewards Gallery</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Info className="w-5 h-5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-5 rounded-2xl bg-white/95 backdrop-blur border-stone-100 shadow-xl z-[100]">
            <h4 className="font-headline text-[#4A3F35] mb-3">Reward Rules</h4>
            <div className="space-y-4 text-xs font-body text-stone-600 leading-relaxed">
              <div className="space-y-1">
                <p className="font-headline text-red-400 uppercase tracking-wider">Hearts (Habits)</p>
                <p>1 for ≥50% completion, 2 for 100% per day. Cumulative across days.</p>
              </div>
              <div className="space-y-1">
                <p className="font-headline text-amber-500 uppercase tracking-wider">Stars (Journaling)</p>
                <p>1 for ≥2 sections, 2 for all 5 sections daily. Cumulative across days.</p>
              </div>
              <div className="space-y-1">
                <p className="font-headline text-emerald-500 uppercase tracking-wider">Petals (Streaks)</p>
                <p>Earn 1 petal at 3 days, 3 total at 7 days, and 10 total at 30 days of a continuous active streak.</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </header>

      {/* Collection Totals */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Card className="p-4 rounded-[2rem] border-none shadow-sm bg-red-50 text-center flex flex-col items-center group relative">
          <div className="bg-white p-2 rounded-full mb-2 shadow-sm animate-float">
            <Heart className="w-6 h-6 text-red-400 fill-current" />
          </div>
          <span className="text-2xl font-headline text-red-700">{stats.hearts}</span>
          <p className="text-[10px] uppercase tracking-widest text-red-400 font-headline">Hearts</p>
          <Popover>
            <PopoverTrigger asChild>
              <button className="absolute top-2 right-2 text-red-300 hover:text-red-500 transition-colors">
                <Info className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3 text-[10px] font-body text-stone-600 rounded-xl">
              Earn 1 heart for ≥50% habits, 2 hearts for 100% completion daily.
            </PopoverContent>
          </Popover>
        </Card>
        
        <Card className="p-4 rounded-[2rem] border-none shadow-sm bg-amber-50 text-center flex flex-col items-center group relative">
          <div className="bg-white p-2 rounded-full mb-2 shadow-sm animate-float [animation-delay:0.2s]">
            <Star className="w-6 h-6 text-amber-500 fill-current" />
          </div>
          <span className="text-2xl font-headline text-amber-700">{stats.stars}</span>
          <p className="text-[10px] uppercase tracking-widest text-amber-500 font-headline">Stars</p>
          <Popover>
            <PopoverTrigger asChild>
              <button className="absolute top-2 right-2 text-amber-300 hover:text-amber-500 transition-colors">
                <Info className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3 text-[10px] font-body text-stone-600 rounded-xl">
              Earn 1 star for ≥2 journal sections, 2 stars for filling all 5 daily.
            </PopoverContent>
          </Popover>
        </Card>

        <Card className="p-4 rounded-[2rem] border-none shadow-sm bg-emerald-50 text-center flex flex-col items-center group relative">
          <div className="bg-white p-2 rounded-full mb-2 shadow-sm animate-float [animation-delay:0.4s]">
            <Flower className="w-6 h-6 text-emerald-500 fill-current" />
          </div>
          <span className="text-2xl font-headline text-emerald-700">{stats.petals}</span>
          <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-headline">Petals</p>
          <Popover>
            <PopoverTrigger asChild>
              <button className="absolute top-2 right-2 text-emerald-300 hover:text-emerald-500 transition-colors">
                <Info className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3 text-[10px] font-body text-stone-600 rounded-xl">
              Earn 1 petal for 3-day streak, 3 total for 7 days, 10 total for 30 days.
            </PopoverContent>
          </Popover>
        </Card>
      </div>

      {/* Streak Info */}
      <div className="bg-[#F2E6DA] p-8 rounded-[2.5rem] mb-12 relative overflow-hidden shadow-sm">
        <Sparkles className="absolute top-4 right-4 w-12 h-12 text-white/50" />
        <p className="text-sm font-headline uppercase tracking-widest text-[#4A3F35]/60 mb-1">Current Streak</p>
        <h2 className="text-4xl font-headline text-[#4A3F35] mb-4">{streak} Days</h2>
        <p className="text-sm font-body text-[#4A3F35]/80 italic">"Like a garden, consistency helps you bloom."</p>
      </div>

      {/* Badges Collection */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2">
          <Trophy className="w-6 h-6 text-secondary-foreground" />
          <h2 className="text-2xl font-headline text-[#4A3F35]">Badge Gallery</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {collectedBadges.map(badge => (
            <Card key={badge.id} className="p-6 rounded-[2.5rem] border-none shadow-sm bg-white flex flex-col items-center text-center animate-fade-in">
              <div className="text-5xl mb-4 p-4 bg-stone-50 rounded-full shadow-inner animate-sparkle">
                {badge.icon}
              </div>
              <h3 className="text-lg font-headline text-[#4A3F35] mb-1">{badge.title}</h3>
              <p className="text-[10px] text-muted-foreground font-body leading-relaxed">{badge.description}</p>
            </Card>
          ))}

          {lockedBadges.map(badge => (
            <Card key={badge.id} className="p-6 rounded-[2.5rem] border border-stone-100 shadow-none bg-stone-100/50 flex flex-col items-center text-center opacity-40 grayscale">
              <div className="text-5xl mb-4 p-4 rounded-full">
                🔒
              </div>
              <h3 className="text-lg font-headline text-muted-foreground mb-1">{badge.title}</h3>
              <p className="text-[10px] text-muted-foreground font-body leading-relaxed">{badge.description}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-muted-foreground italic font-body">
          Every small action is a victory.
        </p>
      </div>
    </div>
  );
}


"use client"

import React from 'react';
import { useJournalStore } from '@/hooks/use-journal-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Heart, Star, Award, Sparkles, Trophy, Flower } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BADGES } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
        <h1 className="text-3xl font-headline text-[#4A3F35]">Rewards</h1>
        <div className="w-10" />
      </header>

      {/* Collection Totals */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Card className="p-4 rounded-[2rem] border-none shadow-sm bg-red-50 text-center flex flex-col items-center">
          <div className="bg-white p-2 rounded-full mb-2 shadow-sm animate-float">
            <Heart className="w-6 h-6 text-red-400 fill-current" />
          </div>
          <span className="text-2xl font-headline text-red-700">{stats.hearts}</span>
          <p className="text-[10px] uppercase tracking-widest text-red-400 font-headline">Hearts</p>
        </Card>
        
        <Card className="p-4 rounded-[2rem] border-none shadow-sm bg-amber-50 text-center flex flex-col items-center">
          <div className="bg-white p-2 rounded-full mb-2 shadow-sm animate-float [animation-delay:0.2s]">
            <Star className="w-6 h-6 text-amber-500 fill-current" />
          </div>
          <span className="text-2xl font-headline text-amber-700">{stats.stars}</span>
          <p className="text-[10px] uppercase tracking-widest text-amber-500 font-headline">Stars</p>
        </Card>

        <Card className="p-4 rounded-[2rem] border-none shadow-sm bg-emerald-50 text-center flex flex-col items-center">
          <div className="bg-white p-2 rounded-full mb-2 shadow-sm animate-float [animation-delay:0.4s]">
            <Flower className="w-6 h-6 text-emerald-500 fill-current" />
          </div>
          <span className="text-2xl font-headline text-emerald-700">{stats.petals}</span>
          <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-headline">Petals</p>
        </Card>
      </div>

      {/* Streak Info */}
      <div className="bg-[#F2E6DA] p-8 rounded-[2.5rem] mb-12 relative overflow-hidden shadow-sm">
        <Sparkles className="absolute top-4 right-4 w-12 h-12 text-white/50" />
        <p className="text-sm font-headline uppercase tracking-widest text-[#4A3F35]/60 mb-1">Consistency</p>
        <h2 className="text-4xl font-headline text-[#4A3F35] mb-4">{streak} Day Streak</h2>
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

"use client"

import React, { useState } from 'react';
import { useJournalStore } from '@/hooks/use-journal-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, Trash2, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export default function YearlyGoalsPage() {
  const { yearlyGoals, updateYearlyGoals, isLoaded } = useJournalStore();
  const [newGoal, setNewGoal] = useState('');
  
  if (!isLoaded) return null;

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const goal = { id: Date.now().toString(), text: newGoal, completed: false };
    updateYearlyGoals([...yearlyGoals, goal]);
    setNewGoal('');
  };

  const toggleGoal = (id: string) => {
    updateYearlyGoals(yearlyGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const removeGoal = (id: string) => {
    updateYearlyGoals(yearlyGoals.filter(g => g.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FCFAFA] px-6 pt-12 pb-24">
      <header className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-3xl font-headline text-[#4A3F35]">Yearly Vision</h1>
        <div className="w-10" />
      </header>

      <div className="bg-primary/20 rounded-[2.5rem] p-8 border border-primary/30 mb-8 relative overflow-hidden">
        <Star className="absolute top-4 right-4 w-12 h-12 text-primary/30" />
        <p className="text-sm font-headline uppercase tracking-widest text-primary-foreground mb-2">
          {new Date().getFullYear()} Vision
        </p>
        <h2 className="text-3xl font-headline text-primary-foreground mb-6">Long Term Growth</h2>
        
        <div className="space-y-6">
          {yearlyGoals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-4 group bg-white/40 p-4 rounded-2xl backdrop-blur-sm border border-white/40">
              <Checkbox 
                checked={goal.completed} 
                onCheckedChange={() => toggleGoal(goal.id)}
                className="w-6 h-6 rounded-lg border-primary-foreground"
              />
              <span className={cn(
                "flex-1 text-lg font-body text-[#4A3F35]",
                goal.completed && "line-through opacity-50"
              )}>
                {goal.text}
              </span>
              <Button variant="ghost" size="icon" onClick={() => removeGoal(goal.id)}>
                <Trash2 className="w-4 h-4 text-primary-foreground/60" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <Input 
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Dream big..."
              className="rounded-xl bg-white/60 border-none placeholder:text-primary-foreground/40"
              onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            />
            <Button onClick={addGoal} size="icon" className="bg-primary text-primary-foreground rounded-xl shrink-0">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

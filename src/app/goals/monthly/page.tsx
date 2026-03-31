"use client"

import React, { useState } from 'react';
import { useJournalStore } from '@/hooks/use-journal-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import Link from 'next/link';

export default function MonthlyGoalsPage() {
  const { getMonthlyGoals, updateMonthlyGoals, isLoaded } = useJournalStore();
  const [newGoal, setNewGoal] = useState('');
  const today = new Date();
  
  if (!isLoaded) return null;

  const goals = getMonthlyGoals(today);
  const completed = goals.filter(g => g.completed).length;
  const progress = goals.length > 0 ? (completed / goals.length) * 100 : 0;

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const goal = { id: Date.now().toString(), text: newGoal, completed: false };
    updateMonthlyGoals(today, [...goals, goal]);
    setNewGoal('');
  };

  const toggleGoal = (id: string) => {
    updateMonthlyGoals(today, goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const removeGoal = (id: string) => {
    updateMonthlyGoals(today, goals.filter(g => g.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FCFAFA] px-6 pt-12 pb-24">
      <header className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-3xl font-headline text-[#4A3F35]">Monthly Goals</h1>
        <div className="w-10" />
      </header>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100/50 mb-8">
        <p className="text-sm font-headline uppercase tracking-widest text-muted-foreground mb-2">
          {format(today, 'MMMM yyyy')}
        </p>
        <h2 className="text-2xl font-headline text-[#4A3F35] mb-6">Focus & Intentions</h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-sm font-headline mb-1">
            <span>Progress</span>
            <span>{completed}/{goals.length} Achieved</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-4 group">
              <Checkbox 
                checked={goal.completed} 
                onCheckedChange={() => toggleGoal(goal.id)}
                className="w-6 h-6 rounded-lg"
              />
              <span className={cn(
                "flex-1 text-lg font-body",
                goal.completed && "line-through text-muted-foreground"
              )}>
                {goal.text}
              </span>
              <Button variant="ghost" size="icon" onClick={() => removeGoal(goal.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <Input 
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Next goal..."
              className="rounded-xl"
              onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            />
            <Button onClick={addGoal} size="icon" className="bg-secondary text-secondary-foreground rounded-xl shrink-0">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-muted-foreground italic font-body">
        "Small steps lead to big changes."
      </p>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

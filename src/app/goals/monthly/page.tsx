
"use client"

import React, { useState } from 'react';
import { useJournalStore } from '@/hooks/use-journal-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, Trash2, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import Link from 'next/link';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Goal } from '@/lib/types';

export default function MonthlyGoalsPage() {
  const { user, firestore, isLoaded, updateMonthlyGoals } = useJournalStore();
  const [viewedDate, setViewedDate] = useState(new Date());
  const [newGoal, setNewGoal] = useState('');
  
  const monthId = format(startOfMonth(viewedDate), 'yyyy-MM');

  const monthlyRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'monthlyGoals', monthId);
  }, [user, firestore, monthId]);

  const { data: monthlyData, isLoading: isMonthlyLoading } = useDoc<{ goals: Goal[] }>(monthlyRef);

  if (!isLoaded || isMonthlyLoading) return null;

  const goals = monthlyData?.goals || [];
  const completed = goals.filter(g => g.completed).length;
  const progress = goals.length > 0 ? (completed / goals.length) * 100 : 0;

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const goal = { id: Date.now().toString(), text: newGoal, completed: false };
    updateMonthlyGoals(viewedDate, [...goals, goal]);
    setNewGoal('');
  };

  const toggleGoal = (id: string) => {
    updateMonthlyGoals(viewedDate, goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const removeGoal = (id: string) => {
    updateMonthlyGoals(viewedDate, goals.filter(g => g.id !== id));
  };

  const nextMonth = () => setViewedDate(prev => addMonths(prev, 1));
  const prevMonth = () => setViewedDate(prev => subMonths(prev, 1));

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

      <div className="flex items-center justify-between mb-6 px-2">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-headline text-[#4A3F35]">
          {format(viewedDate, 'MMMM yyyy')}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-full">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100/50 mb-8">
        <p className="text-sm font-headline uppercase tracking-widest text-muted-foreground mb-2">
          Focus & Intentions
        </p>
        
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

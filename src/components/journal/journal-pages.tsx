"use client"

import React from 'react';
import { PageHeader } from './page-header';
import { ReflectionInput } from './reflection-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { JournalEntry, MOODS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface PageProps {
  entry: JournalEntry;
  onUpdate: (updates: Partial<JournalEntry>) => void;
}

export function PageChecklist({ entry, onUpdate }: PageProps) {
  const completedCount = entry.checklist.filter(i => i.checked).length;
  const totalCount = entry.checklist.length;

  const toggleItem = (id: string) => {
    const newChecklist = entry.checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    onUpdate({ checklist: newChecklist });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-12 pt-8">
      <PageHeader 
        date={entry.date} 
        title="Daily Checklist" 
        progress={{ current: completedCount, total: totalCount }}
      />
      <div className="space-y-1">
        {entry.checklist.map((item) => (
          <div 
            key={item.id} 
            className={cn(
              "flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200",
              item.checked ? "bg-primary/10 opacity-60" : "bg-white border border-stone-100/50"
            )}
            onClick={() => toggleItem(item.id)}
          >
            <Checkbox 
              id={item.id} 
              checked={item.checked} 
              onCheckedChange={() => toggleItem(item.id)} 
              className="w-6 h-6 rounded-lg border-[#E6D8CE]"
            />
            <Label 
              htmlFor={item.id} 
              className={cn(
                "flex-1 text-lg font-body cursor-pointer select-none",
                item.checked && "line-through text-muted-foreground"
              )}
            >
              {item.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageReflectionPositive({ entry, onUpdate }: PageProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-12 pt-8">
      <PageHeader 
        date={entry.date} 
        title="Reflection" 
        subtitle="Finding light in the day"
      />
      <ReflectionInput
        title="What I am grateful for"
        sectionType="Positive"
        value={entry.reflectionPositive.grateful}
        onChange={(val) => onUpdate({ reflectionPositive: { ...entry.reflectionPositive, grateful: val } })}
      />
      <ReflectionInput
        title="What I learned today"
        sectionType="Positive"
        value={entry.reflectionPositive.learned}
        onChange={(val) => onUpdate({ reflectionPositive: { ...entry.reflectionPositive, learned: val } })}
      />
    </div>
  );
}

export function PageReflectionGrowth({ entry, onUpdate }: PageProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-12 pt-8">
      <PageHeader 
        date={entry.date} 
        title="Growth" 
        subtitle="Nurturing your journey"
      />
      <ReflectionInput
        title="What drained me of energy"
        sectionType="Growth"
        value={entry.reflectionGrowth.drained}
        onChange={(val) => onUpdate({ reflectionGrowth: { ...entry.reflectionGrowth, drained: val } })}
      />
      <ReflectionInput
        title="What to improve"
        sectionType="Growth"
        value={entry.reflectionGrowth.improve}
        onChange={(val) => onUpdate({ reflectionGrowth: { ...entry.reflectionGrowth, improve: val } })}
      />
    </div>
  );
}

export function PageFreeWriting({ entry, onUpdate }: PageProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-12 pt-8">
      <PageHeader 
        date={entry.date} 
        title="Unwind" 
        subtitle="The heart speaks freely"
      />
      
      <div className="mb-8">
        <h3 className="text-xl font-headline text-[#4A3F35] mb-4">Mood of the day</h3>
        <div className="grid grid-cols-3 gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood.label}
              onClick={() => onUpdate({ mood: mood.label })}
              className={cn(
                "flex flex-col items-center p-3 rounded-2xl transition-all border-2",
                entry.mood === mood.label 
                  ? "bg-secondary border-secondary shadow-md" 
                  : "bg-white border-transparent hover:bg-stone-50"
              )}
            >
              <span className="text-2xl mb-1">{mood.emoji}</span>
              <span className="text-xs font-medium text-secondary-foreground">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="text-xl font-headline text-[#4A3F35] mb-4">Free Writing</h3>
        <Textarea
          value={entry.freeWriting}
          onChange={(e) => onUpdate({ freeWriting: e.target.value })}
          placeholder="Let your thoughts flow like a gentle stream..."
          className="flex-1 min-h-[300px] resize-none bg-stone-50/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-2xl text-lg leading-relaxed shadow-inner"
        />
      </div>
    </div>
  );
}
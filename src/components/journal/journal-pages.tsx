"use client"

import React, { useState } from 'react';
import { PageHeader } from './page-header';
import { ReflectionInput } from './reflection-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { JournalEntry, MOODS, ChecklistItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface PageProps {
  entry: JournalEntry;
  onUpdate: (updates: Partial<JournalEntry>) => void;
}

export function PageChecklist({ entry, onUpdate }: PageProps) {
  const [newItemText, setNewItemText] = useState('');
  
  const allItems = [...entry.checklist, ...entry.customChecklist];
  const completedCount = allItems.filter(i => i.checked).length;
  const totalCount = allItems.length;

  const toggleItem = (id: string, isCustom: boolean) => {
    if (isCustom) {
      const newList = entry.customChecklist.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      onUpdate({ customChecklist: newList });
    } else {
      const newList = entry.checklist.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      onUpdate({ checklist: newList });
    }
  };

  const addCustomItem = () => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      label: newItemText,
      checked: false
    };
    onUpdate({ customChecklist: [...entry.customChecklist, newItem] });
    setNewItemText('');
  };

  const removeCustomItem = (id: string) => {
    onUpdate({ customChecklist: entry.customChecklist.filter(i => i.id !== id) });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-32 pt-8">
      <PageHeader 
        date={entry.date} 
        title="Daily Checklist" 
        progress={{ current: completedCount, total: totalCount }}
      />
      
      <div className="space-y-3 mb-8">
        <h3 className="text-sm font-headline uppercase tracking-widest text-muted-foreground ml-2">Routine</h3>
        {entry.checklist.map((item) => (
          <div 
            key={item.id} 
            className={cn(
              "flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200",
              item.checked ? "bg-primary/10 opacity-60" : "bg-white border border-stone-100/50"
            )}
            onClick={() => toggleItem(item.id, false)}
          >
            <Checkbox checked={item.checked} className="w-6 h-6 rounded-lg border-[#E6D8CE]" />
            <Label className={cn("flex-1 text-lg font-body", item.checked && "line-through")}>
              {item.label}
            </Label>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-8">
        <h3 className="text-sm font-headline uppercase tracking-widest text-muted-foreground ml-2">Extra Today</h3>
        {entry.customChecklist.map((item) => (
          <div 
            key={item.id} 
            className={cn(
              "flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200",
              item.checked ? "bg-primary/10 opacity-60" : "bg-white border border-stone-100/50"
            )}
          >
            <Checkbox 
              checked={item.checked} 
              onCheckedChange={() => toggleItem(item.id, true)}
              className="w-6 h-6 rounded-lg border-[#E6D8CE]" 
            />
            <Label 
              onClick={() => toggleItem(item.id, true)}
              className={cn("flex-1 text-lg font-body", item.checked && "line-through")}
            >
              {item.label}
            </Label>
            <Button variant="ghost" size="icon" onClick={() => removeCustomItem(item.id)}>
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
        
        <div className="flex gap-2 p-2">
          <Input 
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add something else..."
            className="rounded-xl bg-white border-stone-100"
            onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
          />
          <Button onClick={addCustomItem} size="icon" className="rounded-xl bg-secondary text-secondary-foreground shrink-0">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PageReflectionPositive({ entry, onUpdate }: PageProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-32 pt-8">
      <PageHeader date={entry.date} title="Reflection" subtitle="Finding light in the day" />
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
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-32 pt-8">
      <PageHeader date={entry.date} title="Growth" subtitle="Nurturing your journey" />
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
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-32 pt-8">
      <PageHeader date={entry.date} title="Unwind" subtitle="The heart speaks freely" />
      
      <div className="mb-8">
        <h3 className="text-xl font-headline text-[#4A3F35] mb-4">Mood of the day</h3>
        <div className="grid grid-cols-4 gap-2">
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
              <span className="text-xl mb-1">{mood.emoji}</span>
              <span className="text-[10px] font-medium leading-tight text-center">{mood.label}</span>
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
          className="flex-1 min-h-[300px] resize-none bg-stone-50/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-2xl text-lg leading-relaxed shadow-inner p-6"
        />
      </div>
    </div>
  );
}

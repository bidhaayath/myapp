"use client"

import React, { useState } from 'react';
import { PageHeader } from './page-header';
import { ReflectionInput } from './reflection-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { JournalEntry, MOODS, ChecklistItem, STICKER_OPTIONS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Pencil, Type, Sticker as StickerIcon } from 'lucide-react';
import { DrawingCanvas } from './drawing-canvas';
import { StickerLayer } from './sticker-layer';

interface PageProps {
  entry: JournalEntry;
  onUpdate: (updates: Partial<JournalEntry>) => void;
}

export function PageChecklist({ entry, onUpdate }: PageProps) {
  const [newItemText, setNewItemText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
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

  const updateCustomItem = (id: string, text: string) => {
    const newList = entry.customChecklist.map(item => 
      item.id === id ? { ...item, label: text } : item
    );
    onUpdate({ customChecklist: newList });
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
              "flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer",
              item.checked ? "bg-primary/10 opacity-60" : "bg-white border border-stone-100/50 shadow-sm"
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
              "flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 bg-white border border-stone-100/50 shadow-sm",
              item.checked && "opacity-60"
            )}
          >
            <Checkbox 
              checked={item.checked} 
              onCheckedChange={() => toggleItem(item.id, true)}
              className="w-6 h-6 rounded-lg border-[#E6D8CE]" 
            />
            {editingId === item.id ? (
              <Input 
                autoFocus
                defaultValue={item.label}
                onBlur={(e) => {
                  updateCustomItem(item.id, e.target.value);
                  setEditingId(null);
                }}
                className="flex-1 h-8 border-none p-0 focus-visible:ring-0"
              />
            ) : (
              <Label 
                onClick={() => toggleItem(item.id, true)}
                className={cn("flex-1 text-lg font-body", item.checked && "line-through")}
              >
                {item.label}
              </Label>
            )}
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setEditingId(item.id)} className="w-8 h-8 opacity-40 hover:opacity-100">
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => removeCustomItem(item.id)} className="w-8 h-8 opacity-40 hover:opacity-100">
                <Trash2 className="w-3 h-3 text-red-400" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="flex gap-2 p-2">
          <Input 
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add something else..."
            className="rounded-xl bg-white border-stone-100 shadow-sm"
            onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
          />
          <Button onClick={addCustomItem} size="icon" className="rounded-xl bg-secondary text-secondary-foreground shrink-0 shadow-sm">
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
  const [mode, setMode] = useState<'write' | 'draw' | 'sticker'>('write');

  const addSticker = (type: string) => {
    const newSticker = {
      id: `sticker-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      scale: 1,
    };
    onUpdate({ stickers: [...(entry.stickers || []), newSticker] });
  };

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
                  ? "border-secondary shadow-md" 
                  : "bg-white border-transparent hover:bg-stone-50"
              )}
              style={entry.mood === mood.label ? { backgroundColor: mood.color } : {}}
            >
              <span className="text-xl mb-1">{mood.emoji}</span>
              <span className="text-[10px] font-medium leading-tight text-center" style={entry.mood === mood.label ? { color: mood.textColor } : {}}>{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative min-h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-headline text-[#4A3F35]">Creative Journal</h3>
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <Button 
              variant={mode === 'write' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-lg h-8 w-10 p-0"
              onClick={() => setMode('write')}
            >
              <Type className="w-4 h-4" />
            </Button>
            <Button 
              variant={mode === 'draw' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-lg h-8 w-10 p-0"
              onClick={() => setMode('draw')}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button 
              variant={mode === 'sticker' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="rounded-lg h-8 w-10 p-0"
              onClick={() => setMode('sticker')}
            >
              <StickerIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 relative">
          <Textarea
            value={entry.freeWriting}
            onChange={(e) => onUpdate({ freeWriting: e.target.value })}
            placeholder="Let your thoughts flow like a gentle stream..."
            className={cn(
              "absolute inset-0 z-0 flex-1 min-h-[400px] resize-none bg-stone-50/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-2xl text-lg leading-relaxed shadow-inner p-6 transition-opacity",
              mode !== 'write' && "opacity-30 pointer-events-none"
            )}
          />
          
          <div className={cn("absolute inset-0 z-10", mode !== 'draw' && "pointer-events-none")}>
             <DrawingCanvas 
              initialData={entry.drawingData} 
              onSave={(data) => onUpdate({ drawingData: data })}
              isEnabled={mode === 'draw'}
             />
          </div>

          <StickerLayer 
            stickers={entry.stickers || []} 
            onUpdate={(stickers) => onUpdate({ stickers })}
            isEnabled={mode === 'sticker'}
          />
        </div>

        {mode === 'sticker' && (
          <div className="mt-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm flex flex-wrap gap-4 justify-center">
            {STICKER_OPTIONS.map(s => (
              <button 
                key={s} 
                onClick={() => addSticker(s)}
                className="text-3xl hover:scale-125 transition-transform"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

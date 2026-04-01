
"use client"

import React, { useState, useMemo } from 'react';
import { PageHeader } from './page-header';
import { ReflectionInput } from './reflection-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { JournalEntry, MOODS, ChecklistItem, STICKER_CATEGORIES, DEFAULT_HABIT_GROUPS, ALL_DEFAULT_HABIT_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Pencil, Type, Sticker as StickerIcon, Eraser, Settings2, Heart } from 'lucide-react';
import { DrawingCanvas } from './drawing-canvas';
import { StickerLayer } from './sticker-layer';
import { useJournalStore } from '@/hooks/use-journal-store';

interface PageProps {
  entry: JournalEntry;
  onUpdate: (updates: Partial<JournalEntry>) => void;
}

export function PageChecklist({ entry, onUpdate }: PageProps) {
  const { globalRoutines, addGlobalRoutine, deleteGlobalRoutine, editGlobalRoutine } = useJournalStore();
  const [newItemText, setNewItemText] = useState('');
  const [newRoutineText, setNewRoutineText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [showRoutineManager, setShowRoutineManager] = useState(false);
  
  const completedCount = entry.checklist.filter(i => i.checked).length + entry.customChecklist.filter(i => i.checked).length;
  const totalCount = entry.checklist.length + entry.customChecklist.length;

  const toggleRoutine = (label: string) => {
    const newList = entry.checklist.map(item => 
      item.label === label ? { ...item, checked: !item.checked } : item
    );
    onUpdate({ checklist: newList });
  };

  const toggleCustomItem = (id: string) => {
    const newList = entry.customChecklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    onUpdate({ customChecklist: newList });
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

  const handleAddRoutine = () => {
    if (!newRoutineText.trim()) return;
    addGlobalRoutine(newRoutineText);
    setNewRoutineText('');
  };

  const groupedHabits = useMemo(() => {
    return [
      ...DEFAULT_HABIT_GROUPS.map(group => ({
        category: group.category,
        items: entry.checklist.filter(item => group.items.includes(item.label))
      })),
      {
        category: "Personal Routines",
        items: entry.checklist.filter(item => !ALL_DEFAULT_HABIT_LABELS.includes(item.label))
      }
    ].filter(g => g.items.length > 0);
  }, [entry.checklist]);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 pb-32 pt-8 bg-stone-100/40">
      <PageHeader 
        date={entry.date} 
        title="Daily Checklist" 
        progress={{ current: completedCount, total: totalCount }}
      />
      
      {/* Settings Toggle */}
      <div className="flex items-center justify-between ml-2 mb-6">
        <h3 className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Routines</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowRoutineManager(!showRoutineManager)}
          className="h-7 text-[10px] font-headline uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          <Settings2 className="w-3 h-3 mr-1" />
          {showRoutineManager ? "Hide Settings" : "Manage"}
        </Button>
      </div>

      {showRoutineManager && (
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl mb-8 space-y-3 border border-stone-200/50 animate-in fade-in slide-in-from-top-2">
          <p className="text-[10px] text-muted-foreground font-body italic mb-2">Custom routines added here appear on all days.</p>
          {globalRoutines.map(r => (
            <div key={r.id} className="flex items-center gap-2">
              {editingRoutineId === r.id ? (
                <Input 
                  autoFocus
                  defaultValue={r.label}
                  onBlur={(e) => {
                    editGlobalRoutine(r.id, e.target.value);
                    setEditingRoutineId(null);
                  }}
                  className="flex-1 h-8 text-xs rounded-lg"
                />
              ) : (
                <span className="flex-1 text-sm font-body">{r.label}</span>
              )}
              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setEditingRoutineId(r.id)}>
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6 text-red-400" onClick={() => deleteGlobalRoutine(r.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2 pt-2 border-t border-stone-200">
             <Input 
              value={newRoutineText}
              onChange={(e) => setNewRoutineText(e.target.value)}
              placeholder="New habit name..."
              className="h-8 text-xs rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleAddRoutine()}
             />
             <Button onClick={handleAddRoutine} size="icon" className="h-8 w-8 rounded-lg">
               <Plus className="w-4 h-4" />
             </Button>
          </div>
        </div>
      )}

      {/* Grouped Routines */}
      <div className="space-y-8 mb-12">
        {groupedHabits.map((group) => (
          <div key={group.category} className="space-y-3">
            <h4 className="text-[10px] font-headline uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">
              {group.category}
            </h4>
            {group.items.map((item) => (
              <div 
                key={item.label} 
                className={cn(
                  "flex items-center space-x-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer",
                  item.checked ? "bg-primary/10 opacity-60" : "bg-white border border-stone-100/50 shadow-sm"
                )}
                onClick={() => toggleRoutine(item.label)}
              >
                <Checkbox checked={item.checked} className="w-6 h-6 rounded-lg border-[#E6D8CE]" />
                <Label className={cn("flex-1 text-lg font-body", item.checked && "line-through")}>
                  {item.label === '❤️' ? (
                    <Heart className={cn("w-6 h-6 text-secondary-foreground", item.checked && "fill-current opacity-50")} />
                  ) : item.label}
                </Label>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Extra Today (One-off) */}
      <div className="space-y-3 mb-12">
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
              onCheckedChange={() => toggleCustomItem(item.id)}
              className="w-6 h-6 rounded-lg border-[#E6D8CE]" 
            />
            {editingId === item.id ? (
              <Input 
                autoFocus
                defaultValue={item.label}
                onBlur={(e) => {
                  const newList = entry.customChecklist.map(i => i.id === item.id ? { ...i, label: e.target.value } : i);
                  onUpdate({ customChecklist: newList });
                  setEditingId(null);
                }}
                className="flex-1 h-8 border-none p-0 focus-visible:ring-0"
              />
            ) : (
              <Label 
                onClick={() => toggleCustomItem(item.id)}
                className={cn("flex-1 text-lg font-body", item.checked && "line-through")}
              >
                {item.label}
              </Label>
            )}
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setEditingId(item.id)} className="w-8 h-8 opacity-40 hover:opacity-100">
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => {
                onUpdate({ customChecklist: entry.customChecklist.filter(i => i.id !== item.id) });
              }} className="w-8 h-8 opacity-40 hover:opacity-100">
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
  const [drawingTool, setDrawingTool] = useState<'pen' | 'eraser'>('pen');
  const [stickerCategory, setStickerCategory] = useState(STICKER_CATEGORIES[0].label);

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

  const currentCategoryItems = STICKER_CATEGORIES.find(c => c.label === stickerCategory)?.items || [];

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
          <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
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

        {mode === 'draw' && (
          <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-1">
             <Button 
              variant={drawingTool === 'pen' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setDrawingTool('pen')}
              className="h-8 rounded-full text-xs font-headline"
             >
               <Pencil className="w-3 h-3 mr-1" />
               Pen
             </Button>
             <Button 
              variant={drawingTool === 'eraser' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setDrawingTool('eraser')}
              className="h-8 rounded-full text-xs font-headline"
             >
               <Eraser className="w-3 h-3 mr-1" />
               Eraser
             </Button>
          </div>
        )}

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
              tool={drawingTool}
             />
          </div>

          <StickerLayer 
            stickers={entry.stickers || []} 
            onUpdate={(stickers) => onUpdate({ stickers })}
            isEnabled={mode === 'sticker'}
          />
        </div>

        {mode === 'sticker' && (
          <div className="mt-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm animate-in slide-in-from-bottom-2">
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
              {STICKER_CATEGORIES.map(cat => (
                <Button
                  key={cat.label}
                  variant={stickerCategory === cat.label ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setStickerCategory(cat.label)}
                  className="rounded-full text-[10px] uppercase tracking-widest font-headline h-7"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {currentCategoryItems.map(s => (
                <button 
                  key={s} 
                  onClick={() => addSticker(s)}
                  className="text-3xl hover:scale-125 transition-transform"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

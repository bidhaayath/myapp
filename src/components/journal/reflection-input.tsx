"use client"

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { inspireReflectionPrompts } from '@/ai/flows/inspire-reflection-prompts';

interface ReflectionInputProps {
  title: string;
  value: string;
  onChange: (val: string) => void;
  sectionType: 'Positive' | 'Growth' | 'Free Writing';
  placeholder?: string;
}

export function ReflectionInput({ title, value, onChange, sectionType, placeholder }: ReflectionInputProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);

  const handleInspire = async () => {
    setIsGenerating(true);
    try {
      const result = await inspireReflectionPrompts({ sectionType });
      setPrompt(result.prompt);
    } catch (error) {
      console.error('Inspiration failed', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-headline text-[#4A3F35]">{title}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleInspire}
          disabled={isGenerating}
          className="text-muted-foreground hover:text-secondary-foreground h-8 px-2"
        >
          {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
          <span className="text-xs">Inspire</span>
        </Button>
      </div>
      
      {prompt && (
        <div className="bg-secondary/30 p-3 rounded-lg border border-secondary/50 text-sm italic text-secondary-foreground animate-in fade-in slide-in-from-top-2">
          "{prompt}"
        </div>
      )}

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Tap here to start writing..."}
        className="min-h-[160px] resize-none bg-stone-200/30 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-xl text-lg leading-relaxed shadow-inner"
      />
    </div>
  );
}

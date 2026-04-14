"use client"

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface ReflectionInputProps {
  title: string;
  value: string;
  onChange: (val: string) => void;
  sectionType: 'Positive' | 'Growth' | 'Free Writing';
  placeholder?: string;
}

const LOCAL_PROMPTS = {
  Positive: [
    "What small moment brought you joy today?",
    "What are you most grateful for right now?",
    "Describe a person who made your day better.",
    "What is a strength you used today?",
    "What was the highlight of your morning?",
    "What's a compliment you received or gave today?"
  ],
  Growth: [
    "What was your biggest challenge today?",
    "How did you manage your energy levels?",
    "What is one thing you'd like to improve tomorrow?",
    "What did a mistake today teach you?",
    "When did you feel out of your comfort zone today?",
    "What task took the most effort, and how did you handle it?"
  ],
  'Free Writing': [
    "What's on your mind right now?",
    "Describe your surroundings in detail.",
    "Write about a dream or goal you have.",
    "If today was a color, what would it be and why?",
    "What are the sounds you hear in this very moment?",
    "Write a letter to your future self about this week."
  ]
};

export function ReflectionInput({ title, value, onChange, sectionType, placeholder }: ReflectionInputProps) {
  const [prompt, setPrompt] = useState<string | null>(null);

  const handleInspire = () => {
    // Client-side local logic replacing the previous Server Action
    const categoryPrompts = LOCAL_PROMPTS[sectionType];
    const randomIndex = Math.floor(Math.random() * categoryPrompts.length);
    setPrompt(categoryPrompts[randomIndex]);
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-headline text-[#4A3F35]">{title}</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleInspire}
          className="text-muted-foreground hover:text-secondary-foreground h-8 px-2"
        >
          <Sparkles className="w-3 h-3 mr-1" />
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

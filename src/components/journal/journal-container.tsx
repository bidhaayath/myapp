"use client"

import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { JournalEntry } from '@/lib/types';
import { PageChecklist, PageReflectionPositive, PageReflectionGrowth, PageFreeWriting } from './journal-pages';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface JournalContainerProps {
  entry: JournalEntry;
  onUpdate: (updates: Partial<JournalEntry>) => void;
  onGoBack: () => void;
}

export function JournalContainer({ entry, onUpdate, onGoBack }: JournalContainerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    align: 'start',
    skipSnaps: false,
    dragFree: false
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <div className="fixed inset-0 flex flex-col bg-[#FCFAFA] safe-area-inset-bottom">
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-4 py-4 z-10">
        <Button variant="ghost" size="icon" onClick={onGoBack} className="rounded-full bg-white/50 backdrop-blur">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-headline text-[#4A3F35]">Page {selectedIndex + 1} of 4</span>
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2, 3].map((idx) => (
              <div 
                key={idx} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  selectedIndex === idx ? "w-8 bg-secondary" : "w-1.5 bg-primary/30"
                )} 
              />
            ))}
          </div>
        </div>
        <Link href="/history">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50 backdrop-blur">
            <CalendarIcon className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Pages Carousel */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          <div className="flex-[0_0_100%] min-w-0 h-full overflow-hidden">
            <PageChecklist entry={entry} onUpdate={onUpdate} />
          </div>
          <div className="flex-[0_0_100%] min-w-0 h-full overflow-hidden">
            <PageReflectionPositive entry={entry} onUpdate={onUpdate} />
          </div>
          <div className="flex-[0_0_100%] min-w-0 h-full overflow-hidden">
            <PageReflectionGrowth entry={entry} onUpdate={onUpdate} />
          </div>
          <div className="flex-[0_0_100%] min-w-0 h-full overflow-hidden">
            <PageFreeWriting entry={entry} onUpdate={onUpdate} />
          </div>
        </div>
      </div>

      {/* Swipe Hint */}
      <div className="px-6 py-6 flex justify-between items-center pointer-events-none">
        <div className={cn("transition-opacity duration-300", selectedIndex === 0 ? "opacity-0" : "opacity-100")}>
           <span className="text-xs uppercase tracking-widest text-muted-foreground">← Swipe</span>
        </div>
        <div className={cn("transition-opacity duration-300", selectedIndex === 3 ? "opacity-0" : "opacity-100")}>
           <span className="text-xs uppercase tracking-widest text-muted-foreground">Swipe →</span>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
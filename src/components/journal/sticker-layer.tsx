"use client"

import React from 'react';
import { Sticker } from '@/lib/types';

interface StickerLayerProps {
  stickers: Sticker[];
  onUpdate: (stickers: Sticker[]) => void;
  isEnabled: boolean;
}

export function StickerLayer({ stickers, onUpdate, isEnabled }: StickerLayerProps) {
  const handleDrag = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    if (!isEnabled) return;
    const container = (e.currentTarget as HTMLElement).parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    onUpdate(stickers.map(s => s.id === id ? { ...s, x, y } : s));
  };

  const removeSticker = (id: string) => {
    if (!isEnabled) return;
    onUpdate(stickers.filter(s => s.id !== id));
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className="absolute pointer-events-auto cursor-move select-none group"
          style={{ 
            left: `${sticker.x}%`, 
            top: `${sticker.y}%`, 
            transform: `translate(-50%, -50%) scale(${sticker.scale})` 
          }}
          onMouseDown={(e) => handleDrag(sticker.id, e)}
          onTouchMove={(e) => handleDrag(sticker.id, e)}
        >
          <span className="text-4xl drop-shadow-md">{sticker.type}</span>
          {isEnabled && (
            <button 
              onClick={() => removeSticker(sticker.id)}
              className="absolute -top-4 -right-4 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

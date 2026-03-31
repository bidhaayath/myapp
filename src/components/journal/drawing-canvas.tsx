"use client"

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, Pencil, Trash2 } from 'lucide-react';

interface DrawingCanvasProps {
  initialData?: string;
  onSave: (dataUrl: string) => void;
  isEnabled: boolean;
  tool: 'pen' | 'eraser';
}

export function DrawingCanvas({ initialData, onSave, isEnabled, tool }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialData;
    }
  }, [initialData]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Scale coordinates based on internal canvas size vs displayed size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEnabled) return;
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#4A3F35';
    }
    
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isEnabled) return;
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    onSave('');
  };

  return (
    <div className="relative w-full aspect-[3/4] bg-stone-50/30 rounded-2xl overflow-hidden border border-stone-100 shadow-inner group">
      <canvas
        ref={canvasRef}
        width={600}
        height={800}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        className="w-full h-full touch-none"
      />
      {isEnabled && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={clear}
            className="bg-white/90 backdrop-blur rounded-full text-xs font-headline shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

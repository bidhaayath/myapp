import React from 'react';
import { format } from 'date-fns';

interface PageHeaderProps {
  date: string;
  title: string;
  subtitle?: string;
  progress?: {
    current: number;
    total: number;
  };
}

export function PageHeader({ date, title, subtitle, progress }: PageHeaderProps) {
  const formattedDate = format(new Date(date), 'EEEE, MMMM do');

  return (
    <div className="mb-8 px-2">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 font-headline">
        {formattedDate}
      </p>
      <div className="flex justify-between items-baseline">
        <h2 className="text-3xl font-headline text-[#4A3F35]">{title}</h2>
        {progress && (
          <span className="text-sm font-medium text-secondary-foreground bg-secondary px-3 py-1 rounded-full">
            {progress.current}/{progress.total}
          </span>
        )}
      </div>
      {subtitle && <p className="text-muted-foreground mt-2 text-lg italic">{subtitle}</p>}
    </div>
  );
}
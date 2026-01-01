'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface ResizableSplitterProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number; // porcentagem (0-100)
  minLeftWidth?: number;
  maxLeftWidth?: number;
  storageKey?: string; // para salvar preferência
}

export function ResizableSplitter({
  left,
  right,
  defaultLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  storageKey,
}: ResizableSplitterProps) {
  const [leftWidth, setLeftWidth] = useState(() => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= minLeftWidth && parsed <= maxLeftWidth) {
          return parsed;
        }
      }
    }
    return defaultLeftWidth;
  });

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitterRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      const clampedWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
      setLeftWidth(clampedWidth);

      if (storageKey) {
        localStorage.setItem(storageKey, clampedWidth.toString());
      }
    },
    [isDragging, minLeftWidth, maxLeftWidth, storageKey]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex relative h-full">
      {/* Left Panel */}
      <div
        className="overflow-hidden flex-shrink-0"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      {/* Splitter */}
      <div
        ref={splitterRef}
        onMouseDown={handleMouseDown}
        className={cn(
          "bg-gray-200 dark:bg-gray-700 hover:bg-purple-500 dark:hover:bg-purple-600 cursor-col-resize transition-colors relative group flex items-center justify-center flex-shrink-0",
          isDragging && "bg-purple-500 dark:bg-purple-600"
        )}
        style={{ width: '4px', minWidth: '4px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <GripVertical className={cn(
            "w-4 h-8 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity",
            isDragging && "opacity-100 text-purple-600 dark:text-purple-400"
          )} />
        </div>
      </div>

      {/* Right Panel */}
      <div
        className="overflow-hidden flex-1"
        style={{ width: `${100 - leftWidth}%`, minWidth: 0 }}
      >
        {right}
      </div>
    </div>
  );
}


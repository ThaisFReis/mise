'use client';

import { HelpCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface HelpTooltipProps {
  content: string;
  title?: string;
}

export function HelpTooltip({ content, title }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isVisible]);

  const tooltip = isVisible && (
    <div
      className="fixed w-64 p-3 bg-popover border border-border rounded-lg shadow-lg z-[9999] pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {title && (
        <p className="font-semibold text-sm text-foreground mb-1">{title}</p>
      )}
      <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-border" />
    </div>
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsVisible(!isVisible);
    }
  };

  return (
    <>
      <span
        ref={buttonRef}
        role="button"
        tabIndex={0}
        aria-label="Ajuda"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        onKeyDown={handleKeyDown}
        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer inline-flex items-center"
      >
        <HelpCircle className="w-4 h-4" />
      </span>
      {typeof document !== 'undefined' && tooltip && createPortal(tooltip, document.body)}
    </>
  );
}

/* This component renders a Club Card using the compound Card component system. */
import React from 'react';
import { Card } from './Card';

interface ClubCardProps {
  name: string;
  memberCount: number;
  description: string;
  currentBook?: string;
  onJoin?: () => void;
}

export const ClubCard: React.FC<ClubCardProps> = ({
  name,
  memberCount,
  description,
  currentBook,
  onJoin,
}) => {
  return (
    <Card className="max-w-sm w-full">
      <Card.Header 
        title={name} 
        subtitle={`${memberCount} members active`} 
      />
      <Card.Body className="flex-1 flex flex-col justify-between py-3">
        <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>
        
        {currentBook && (
          <div className="bg-warm/50 border border-border/50 rounded-lg p-2.5 flex items-center gap-2">
            <span className="text-base" aria-hidden="true">📖</span>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Reading Now</span>
              <span className="text-xs font-bold text-ink-soft line-clamp-1">{currentBook}</span>
            </div>
          </div>
        )}
      </Card.Body>
      <Card.Footer className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">
          Public Club
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onJoin) onJoin();
          }}
          className="btn px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm"
          aria-label={`Join ${name}`}
        >
          Join Club
        </button>
      </Card.Footer>
    </Card>
  );
};

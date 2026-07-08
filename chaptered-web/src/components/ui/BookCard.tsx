/* This component renders a Book Card using the compound Card component system. */
import React from 'react';
import { Card } from './Card';

interface BookCardProps {
  title: string;
  author: string;
  genre: string;
  pages: number;
  progress?: number;
  coverImage?: string;
  color?: string;
  onView?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  title,
  author,
  genre,
  pages,
  progress = 0,
  coverImage,
  color = '#8B3A3A',
  onView,
}) => {
  return (
    <Card onClick={onView} className="max-w-[200px] w-full">
      <Card.Image 
        src={coverImage} 
        alt={title} 
        bgColor={color} 
        fallbackText={title} 
      />
      <Card.Header 
        title={title} 
        subtitle={author} 
      />
      <Card.Body className="py-2.5">
        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber/10 text-amber-deep">
          {genre}
        </span>
        <div className="mt-3">
          <div className="h-[3px] bg-border rounded-full overflow-hidden">
            <div className="h-full bg-amber transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[11px] font-semibold text-amber-deep block mt-1">
            {progress}% completed ({pages} pages)
          </span>
        </div>
      </Card.Body>
      <Card.Footer className="justify-center">
        <span className="text-xs font-bold text-amber hover:text-amber-deep">
          View Book →
        </span>
      </Card.Footer>
    </Card>
  );
};

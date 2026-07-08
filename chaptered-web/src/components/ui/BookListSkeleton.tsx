/* This component renders a list of pulsing book cards using the layout grid. */
import React from 'react';
import { BookCardSkeleton } from './BookCardSkeleton';

export const BookListSkeleton: React.FC = () => {
  return (
    <div className="books-grid">
      {Array.from({ length: 6 }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
};

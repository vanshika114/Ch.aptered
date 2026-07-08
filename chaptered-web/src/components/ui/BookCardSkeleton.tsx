/* This component renders a pulsing skeleton representation of a book card. */
import React from 'react';
import { Skeleton, SkeletonText } from './Skeleton';

export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="bcard !cursor-default !pointer-events-none">
      <div className="bcover !bg-none !bg-warm-deep/40 flex items-center justify-center">
        <Skeleton height="70%" width="60%" rounded="rounded-sm" className="opacity-45" />
      </div>
      <div className="bbody">
        <SkeletonText height="1.1rem" width="75%" className="mb-2" />
        <SkeletonText height="0.85rem" width="50%" className="mb-3" />
        <Skeleton height="1.25rem" width="4rem" rounded="rounded-full" className="mb-4" />
        <div className="bprog">
          <Skeleton height="6px" rounded="rounded-full" className="mb-2" />
          <SkeletonText height="0.75rem" width="60%" />
        </div>
      </div>
    </div>
  );
};

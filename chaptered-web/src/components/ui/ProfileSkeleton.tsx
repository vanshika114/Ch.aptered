/* This component renders a pulsing profile section skeleton. */
import React from 'react';
import { SkeletonText, SkeletonAvatar } from './Skeleton';

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-d-surface rounded-2xl border border-border/60 max-w-sm w-full mx-auto animate-pulse">
      <SkeletonAvatar height={80} width={80} className="mb-4" />
      <SkeletonText height="1.5rem" width="60%" className="mb-2" />
      <SkeletonText height="0.9rem" width="80%" className="mb-1.5" />
      <SkeletonText height="0.9rem" width="70%" className="mb-1.5" />
      <SkeletonText height="0.9rem" width="50%" />
    </div>
  );
};

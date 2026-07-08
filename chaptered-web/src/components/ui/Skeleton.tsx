/* This file defines loading skeleton components with pulsing animations for loading feedback. */
import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  rounded = 'rounded',
  className = '',
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`animate-pulse bg-warm-deep/60 dark:bg-d-surface ${rounded} ${className}`}
      style={style}
    />
  );
};

export const SkeletonText: React.FC<SkeletonProps> = (props) => {
  return <Skeleton rounded="rounded-sm" {...props} />;
};

export const SkeletonCard: React.FC<SkeletonProps> = (props) => {
  return <Skeleton height="200px" rounded="rounded-lg" {...props} />;
};

export const SkeletonAvatar: React.FC<SkeletonProps> = (props) => {
  return <Skeleton rounded="rounded-full" {...props} />;
};

export const SkeletonButton: React.FC<SkeletonProps> = (props) => {
  return <Skeleton height="2.5rem" rounded="rounded-md" {...props} />;
};

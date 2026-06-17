import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}

export function SkeletonLoader({
  className = '',
  count = 1,
  height = 'h-4',
  width = 'w-full'
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} ${width} ${className} animate-pulse bg-gray-700/50 rounded`}
        />
      ))}
    </>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-black/30 border border-gray-700 rounded-xl p-4 space-y-3">
      <SkeletonLoader height="h-6" width="w-3/4" />
      <SkeletonLoader height="h-4" width="w-full" />
      <SkeletonLoader height="h-4" width="w-2/3" />
      <SkeletonLoader height="h-8" width="w-full" />
    </div>
  );
}

export function SkeletonDropdown() {
  return (
    <div className="space-y-2">
      <SkeletonLoader height="h-10" width="w-full" />
      <div className="space-y-2">
        <SkeletonLoader height="h-8" width="w-full" />
        <SkeletonLoader height="h-8" width="w-full" />
        <SkeletonLoader height="h-8" width="w-full" />
      </div>
    </div>
  );
}

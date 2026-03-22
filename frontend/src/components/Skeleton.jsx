import React from 'react';

export function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'skeleton-text',
    textSm: 'skeleton-text-sm',
    avatar: 'skeleton-avatar',
    card: 'skeleton-card'
  };
  
  return <div className={`${variants[variant]} ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="skeleton h-6 w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-4/5" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="table-container animate-pulse">
      <table className="data-table">
        <thead>
          <tr>
            <th><div className="skeleton h-4 w-full" /></th>
            <th><div className="skeleton h-4 w-full" /></th>
            <th><div className="skeleton h-4 w-full" /></th>
            <th><div className="skeleton h-4 w-full" /></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i}>
              <td><div className="skeleton h-4 w-3/4" /></td>
              <td><div className="skeleton h-4 w-2/3" /></td>
              <td><div className="skeleton h-4 w-1/2" /></td>
              <td><div className="skeleton h-4 w-1/3" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

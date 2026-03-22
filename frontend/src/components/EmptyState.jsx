import React from 'react';

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action = null,
  className = '' 
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );
}

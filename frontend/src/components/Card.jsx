import React from 'react';

export function Card({ title, children, className = '', onClick, ...props }) {
  return (
    <div className={`card ${className}`} onClick={onClick} {...props}>
      {title ? <div className="mb-3 text-sm font-semibold text-slate-900">{title}</div> : null}
      {children}
    </div>
  );
}

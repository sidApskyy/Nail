import React from 'react';

export function Input({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label ? <div className="mb-1 text-xs font-medium text-slate-600">{label}</div> : null}
      <input className={`input-field ${className}`} {...props} />
    </label>
  );
}

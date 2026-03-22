import React from 'react';

export function Button({ className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    secondary: 'btn-secondary'
  };
  return <button className={`${variants[variant] || variants.primary} ${className}`} {...props} />;
}

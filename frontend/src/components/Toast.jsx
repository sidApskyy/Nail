import React, { useEffect, useState } from 'react';

export function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const types = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-rose-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-amber-500 text-white'
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-lg p-4 shadow-lg transition-all duration-300 animate-slide-up ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${types[type]}`}
    >
      <div className="flex items-start">
        <div className="flex-1 text-sm font-medium">{message}</div>
        <button
          type="button"
          className="ml-3 inline-flex flex-shrink-0 rounded-md p-1.5 hover:bg-white/20 transition-colors"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
        >
          <span className="sr-only">Dismiss</span>
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

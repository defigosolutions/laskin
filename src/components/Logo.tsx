import React from 'react';

export default function Logo({ variant = 'horizontal', className = '', height = 50 }) {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ height: `${height}px`, display: 'flex', alignItems: 'center' }}>
      <img 
        src="/logo.jpeg" 
        alt="LA Skin & Aesthetics Logo" 
        style={{ height: '100%', width: 'auto', objectFit: 'contain' }} 
      />
    </div>
  );
}


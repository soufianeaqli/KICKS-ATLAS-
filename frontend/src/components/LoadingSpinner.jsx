import React from 'react';

const LoadingSpinner = ({ text = 'Chargement...' }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="relative w-14 h-14 mb-5">
      <div className="absolute inset-0 border-4 border-gray-800 rounded-full" />
      <div className="absolute inset-0 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
    <p className="text-gray-300 text-sm font-bold uppercase tracking-widest">{text}</p>
  </div>
);

export default LoadingSpinner;

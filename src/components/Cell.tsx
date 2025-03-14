"use client";

import React from 'react';

interface CellProps {
  value: number;
  isSelected: boolean;
  isSwipedOver: boolean;
  isForbidden: boolean;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ value, isSelected, isSwipedOver, isForbidden, onClick }) => {
  return (
    <div
      className={`
        w-16 h-16 flex items-center justify-center text-2xl font-bold text-black
        rounded-lg shadow-md transition-all duration-200
        ${isSwipedOver 
          ? (isForbidden ? 'bg-red-100' : 'bg-amber-100') 
          : 'bg-blue-50'}
        ${isSelected ? 'scale-105 shadow-lg' : ''}
      `}
      onClick={onClick}
    >
      {value || ''}
    </div>
  );
};

export default Cell; 
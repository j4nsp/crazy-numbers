"use client";

import React from 'react';

interface CellProps {
  value: number;
  onClick: () => void;
  isSelected: boolean;
}

const getColorForNumber = (num: number) => {
  switch (num) {
    case 1: return 'bg-blue-500 text-white';
    case 2: return 'bg-green-500 text-white';
    case 3: return 'bg-purple-500 text-white';
    case 4: return 'bg-pink-500 text-white';
    case 5: return 'bg-yellow-500 text-black';
    default: return 'bg-gray-100';
  }
};

const Cell: React.FC<CellProps> = ({ value, onClick, isSelected }) => {
  return (
    <div
      className={`
        w-16 h-16 flex items-center justify-center text-2xl font-bold
        rounded-lg shadow-md transform transition-all duration-300 ease-in-out
        ${getColorForNumber(value)}
        ${isSelected ? 'scale-95 ring-4 ring-yellow-400' : 'hover:scale-105'}
      `}
    >
      {value > 0 ? value : ''}
    </div>
  );
};

export default Cell; 
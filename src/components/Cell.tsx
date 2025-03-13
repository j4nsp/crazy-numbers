"use client";

import React from 'react';

interface CellProps {
  value: number;
  isSelected: boolean;
  isSwipedOver: boolean;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ value, isSelected, isSwipedOver, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        w-16 h-16
        flex items-center justify-center
        text-3xl font-bold
        rounded-xl
        transition-all duration-200
        cursor-pointer
        ${isSwipedOver ? 'bg-amber-100' : 'bg-slate-100'}
        text-black
        shadow-sm
      `}
    >
      {value > 0 ? value : ''}
    </div>
  );
};

export default Cell; 
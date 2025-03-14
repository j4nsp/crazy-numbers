"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactConfetti from 'react-confetti';
import Cell from './Cell';
import { 
  generateInitialGrid, 
  checkWinCondition,
  pushIntoRow,
  pushIntoColumn,
  Direction,
  getRandomNumber
} from '../utils/gameLogic';
import { playBlopSound, playPushSound, playErrorSound } from '../utils/sound';

type GridSize = 3 | 4 | 5;

const Game: React.FC = () => {
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with empty grid to avoid hydration mismatch
  const [grid, setGrid] = useState<number[][]>(() => 
    Array(gridSize).fill(0).map(() => Array(gridSize).fill(0))
  );
  const [spareNumber, setSpareNumber] = useState<number | null>(null);
  const [hasWon, setHasWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [lastPushDirection, setLastPushDirection] = useState<Direction | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedRowCol, setDraggedRowCol] = useState<{ row: number | null; col: number | null }>({
    row: null,
    col: null
  });
  const [swipeProgress, setSwipeProgress] = useState<{ start: number; current: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Initialize empty grid based on size
  useEffect(() => {
    const emptyGrid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    setGrid(emptyGrid);
    setSpareNumber(null);
    setHasWon(false);
    setIsInitialized(false);
    setError(null);
  }, [gridSize]);

  // Initialize the grid on the client side only
  useEffect(() => {
    if (!isInitialized) {
      generateInitialGrid(gridSize)
        .then(newGrid => {
          setGrid(newGrid);
          setIsInitialized(true);
          setError(null);
        })
        .catch(err => {
          setError(err.message);
          setIsInitialized(true);
        });
    }
  }, [isInitialized, gridSize]);

  useEffect(() => {
    setHasWon(checkWinCondition(grid));
  }, [grid]);

  const handlePush = useCallback((index: number, direction: Direction) => {
    if (spareNumber === null) {
      return;
    }

    setLastPushDirection(direction);
    let result;
    if (direction === 'left' || direction === 'right') {
      result = pushIntoRow(grid, index, spareNumber, direction === 'left');
    } else {
      result = pushIntoColumn(grid, index, spareNumber, direction === 'top');
    }

    setGrid(result.newGrid);
    setSpareNumber(result.poppedNumber);
    setMoveCount(prev => prev + 1);

    // Reset animation direction after animation completes
    setTimeout(() => {
      setLastPushDirection(null);
    }, 300);
  }, [grid, spareNumber]);

  const resetGame = () => {
    setError(null);
    generateInitialGrid(gridSize)
      .then(newGrid => {
        setGrid(newGrid);
        setSpareNumber(null);
        setHasWon(false);
        setLastPushDirection(null);
        setMoveCount(0);
      })
      .catch(err => {
        setError(err.message);
      });
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setTouchEnd(null);
    setTouchStart({ x: clientX, y: clientY });
    setIsDragging(true);
    setSwipeProgress(null);

    // Store the initial target index
    const distanceX = 0;
    const distanceY = 0;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const initialTargetIndex = getTargetedIndex(clientX, clientY, isHorizontalSwipe);
    if (initialTargetIndex !== null) {
      setDraggedRowCol({
        row: isHorizontalSwipe ? initialTargetIndex : null,
        col: isHorizontalSwipe ? null : initialTargetIndex
      });
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!touchStart || !gridRef.current || !isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setTouchEnd({ x: clientX, y: clientY });

    // Calculate which row/column is being dragged
    const distanceX = clientX - touchStart.x;
    const distanceY = clientY - touchStart.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    const targetIndex = getTargetedIndex(touchStart.x, touchStart.y, isHorizontalSwipe);
    if (targetIndex !== null) {
      setDraggedRowCol({
        row: isHorizontalSwipe ? targetIndex : null,
        col: isHorizontalSwipe ? null : targetIndex
      });

      // Calculate swipe progress
      const gridRect = gridRef.current.getBoundingClientRect();
      if (isHorizontalSwipe) {
        const startCell = Math.floor((touchStart.x - gridRect.left) / (gridRect.width / gridSize));
        const currentCell = Math.floor((clientX - gridRect.left) / (gridRect.width / gridSize));
        // Clamp currentCell to grid boundaries
        const clampedCurrentCell = Math.max(0, Math.min(gridSize - 1, currentCell));
        
        // Play sound if we've moved to a new cell
        if (swipeProgress?.current !== clampedCurrentCell) {
          playBlopSound(clampedCurrentCell);
        }
        
        setSwipeProgress({ start: startCell, current: clampedCurrentCell });
      } else {
        const startCell = Math.floor((touchStart.y - gridRect.top) / (gridRect.height / gridSize));
        const currentCell = Math.floor((clientY - gridRect.top) / (gridRect.height / gridSize));
        // Clamp currentCell to grid boundaries
        const clampedCurrentCell = Math.max(0, Math.min(gridSize - 1, currentCell));
        
        // Play sound if we've moved to a new cell
        if (swipeProgress?.current !== clampedCurrentCell) {
          playBlopSound(clampedCurrentCell);
        }
        
        setSwipeProgress({ start: startCell, current: clampedCurrentCell });
      }
    }
  };

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !touchStart || !touchEnd || !swipeProgress || !spareNumber) {
      // Reset all drag states if we don't have complete swipe data
      setTouchStart(null);
      setTouchEnd(null);
      setIsDragging(false);
      setDraggedRowCol({ row: null, col: null });
      setSwipeProgress(null);
      return;
    }

    const distanceX = touchEnd.x - touchStart.x;
    const distanceY = touchEnd.y - touchStart.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    // Use the stored target index from draggedRowCol instead of calculating a new one
    const targetIndex = isHorizontalSwipe ? draggedRowCol.row : draggedRowCol.col;
    if (targetIndex === null) {
      // Reset all drag states if target index is invalid
      setTouchStart(null);
      setTouchEnd(null);
      setIsDragging(false);
      setDraggedRowCol({ row: null, col: null });
      setSwipeProgress(null);
      return;
    }

    // Check if all cells have been swiped
    const swipedCells = Math.abs(swipeProgress.current - swipeProgress.start) + 1;
    if (swipedCells >= gridSize) {
      // For vertical swipes, check if we're trying to push into the matching column
      if (!isHorizontalSwipe) {
        // If the spare number matches the column index (0-based), prevent the push
        if (spareNumber - 1 === targetIndex) {
          // Play error sound for forbidden move
          playErrorSound();
          // Reset all drag states without pushing
          setTouchStart(null);
          setTouchEnd(null);
          setIsDragging(false);
          setDraggedRowCol({ row: null, col: null });
          setSwipeProgress(null);
          return;
        }
      }

      if (isHorizontalSwipe) {
        handlePush(targetIndex, distanceX > 0 ? 'left' : 'right');
      } else {
        handlePush(targetIndex, distanceY > 0 ? 'top' : 'bottom');
      }
      // Play push sound when the push action occurs
      playPushSound();
    }

    // Reset all drag states
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    setDraggedRowCol({ row: null, col: null });
    setSwipeProgress(null);
  }, [isDragging, touchStart, touchEnd, swipeProgress, spareNumber, draggedRowCol, gridSize, handlePush]);

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setTouchEnd({ x: e.clientX, y: e.clientY });
        handleDragEnd();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, touchStart, swipeProgress, draggedRowCol.row, draggedRowCol.col, handleDragEnd]);

  const getTargetedIndex = (x: number, y: number, isHorizontal: boolean): number | null => {
    if (!gridRef.current) return null;

    const gridRect = gridRef.current.getBoundingClientRect();
    const cellSize = (gridRect.width - (gridSize - 1) * 12) / gridSize;
    
    const relativeX = x - gridRect.left;
    const relativeY = y - gridRect.top;
    
    const index = isHorizontal 
      ? Math.floor(relativeY / cellSize)
      : Math.floor(relativeX / cellSize);

    return (index >= 0 && index < gridSize) ? index : null;
  };

  const getSlideAnimation = () => {
    if (!lastPushDirection) return '';
    
    const slideClasses = {
      left: 'animate-slide-left',
      right: 'animate-slide-right',
      top: 'animate-slide-down',
      bottom: 'animate-slide-up'
    };
    
    return slideClasses[lastPushDirection];
  };

  const SizeSelector = () => (
    <div className="flex flex-col items-center gap-2 mb-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Grid Size</h2>
      <div className="flex gap-3">
        {[3, 4, 5].map((size) => (
          <button
            key={size}
            onClick={() => setGridSize(size as GridSize)}
            className={`
              w-20 h-20 flex items-center justify-center
              text-2xl font-bold rounded-xl
              transition-all duration-300 transform
              ${gridSize === size
                ? 'bg-blue-500 text-white scale-105 shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 shadow-md'}
            `}
          >
            {size}x{size}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Number Puzzle</h1>
        <p className="text-gray-600 text-center max-w-md">
          Push numbers into rows and columns to arrange each row in order: 1 to {gridSize}
        </p>
      </div>

      <SizeSelector />

      {error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 max-w-md">
          <h3 className="text-red-600 font-semibold mb-2">Error Loading Grid</h3>
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <div className="bg-white p-16 rounded-2xl shadow-xl">
          {/* Spare number display */}
          <div className="mb-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4 min-w-[300px] justify-center">
                <div className="text-gray-600 text-xl">Spare Number:</div>
                <div className={`w-16 h-16 flex items-center justify-center text-2xl font-bold text-black
                  rounded-lg shadow-lg transform transition-all duration-300
                  ${spareNumber ? 'bg-blue-50' : 'bg-gray-100'}`}>
                  {spareNumber ?? '?'}
                </div>
                {spareNumber === null && (
                  <button
                    onClick={() => setSpareNumber(getRandomNumber(1, gridSize))}
                    className="px-6 py-3 bg-green-500 text-white text-xl rounded-lg
                      hover:bg-green-600 transform hover:scale-105 transition-all duration-200"
                  >
                    Start Game
                  </button>
                )}
              </div>
              {spareNumber !== null && (
                <div className="text-gray-600 text-lg">
                  Moves: {moveCount}
                </div>
              )}
            </div>
          </div>

          <div className="relative w-fit mx-auto">
            {/* Grid container with padding for buttons */}
            <div 
              className="p-8 touch-none select-none"
              ref={gridRef}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
            >
              {/* Grid */}
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
                {grid.map((row, rowIndex) => (
                  row.map((value, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`transform transition-all duration-300 ${getSlideAnimation()}`}
                    >
                      <Cell
                        value={value}
                        isSelected={isDragging && (
                          (draggedRowCol.row === rowIndex) ||
                          (draggedRowCol.col === colIndex)
                        )}
                        isSwipedOver={Boolean(
                          swipeProgress && 
                          ((draggedRowCol.row === rowIndex && 
                            isBetween(colIndex, swipeProgress.start, swipeProgress.current)) ||
                           (draggedRowCol.col === colIndex && 
                            isBetween(rowIndex, swipeProgress.start, swipeProgress.current)))
                        )}
                        isForbidden={Boolean(
                          spareNumber && 
                          draggedRowCol.col === colIndex && 
                          spareNumber - 1 === colIndex
                        )}
                        onClick={() => {}}
                      />
                    </div>
                  ))
                ))}
              </div>
            </div>
          </div>

          {hasWon && (
            <div className="mt-8 text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Congratulations!
              </h2>
              <p className="text-gray-600 mb-4">
                You&apos;ve arranged all rows in perfect order!
              </p>
            </div>
          )}

          <div className="mt-12">
            <button
              onClick={resetGame}
              className="w-full py-3 px-6 bg-blue-500 text-white text-xl font-semibold 
                rounded-lg hover:bg-blue-600 transform hover:scale-105 
                transition-all duration-200"
            >
              Reset Game
            </button>
          </div>
        </div>
      )}

      {hasWon && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
        />
      )}
    </div>
  );
};

// Helper function to check if a number is between two other numbers (inclusive, order independent)
const isBetween = (num: number, a: number, b: number) => {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return num >= min && num <= max;
};

export default Game; 
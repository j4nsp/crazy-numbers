// Function to generate a random number between min and max (inclusive)
export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to generate initial grid
export const generateInitialGrid = (gridSize: number): number[][] => {
  const numbers = Array.from({ length: gridSize * gridSize }, (_, i) => (i % gridSize) + 1);
  
  // Shuffle the numbers
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  // Convert to 2D array
  const grid: number[][] = [];
  for (let i = 0; i < gridSize; i++) {
    grid.push(numbers.slice(i * gridSize, (i + 1) * gridSize));
  }
  
  return grid;
};

// Function to push a number into a row from left or right
export const pushIntoRow = (grid: number[][], rowIndex: number, newNumber: number, fromLeft: boolean) => {
  const newGrid = grid.map(r => [...r]);
  const poppedNumber = fromLeft ? newGrid[rowIndex].pop()! : newGrid[rowIndex].shift()!;
  
  if (fromLeft) {
    newGrid[rowIndex].unshift(newNumber);
  } else {
    newGrid[rowIndex].push(newNumber);
  }
  
  return { newGrid, poppedNumber };
};

// Function to push a number into a column from top or bottom
export const pushIntoColumn = (grid: number[][], colIndex: number, newNumber: number, fromTop: boolean) => {
  const newGrid = grid.map(r => [...r]);
  const column = newGrid.map(r => r[colIndex]);
  const poppedNumber = fromTop ? column.pop()! : column.shift()!;
  
  if (fromTop) {
    column.unshift(newNumber);
  } else {
    column.push(newNumber);
  }
  
  // Update the grid with the new column values
  column.forEach((value, rowIndex) => {
    newGrid[rowIndex][colIndex] = value;
  });
  
  return { newGrid, poppedNumber };
};

// Function to check if the game is won
export const checkWinCondition = (grid: number[][]): boolean => {
  return grid.every(row => {
    for (let i = 1; i < row.length; i++) {
      if (row[i] <= row[i - 1]) {
        return false;
      }
    }
    return true;
  });
};

export type Direction = 'left' | 'right' | 'top' | 'bottom'; 
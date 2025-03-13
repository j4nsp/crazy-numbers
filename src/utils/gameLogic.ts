// Function to generate a random number between min and max (inclusive)
export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to shuffle an array
const shuffleArray = (array: number[]): number[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Function to generate initial grid
export const generateInitialGrid = (size: number = 3): number[][] => {
  const grid: number[][] = [];
  
  // Generate rows with random numbers 1 to size
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    // Create an array of numbers from 1 to size
    const numbers = Array.from({ length: size }, (_, i) => i + 1);
    // Shuffle the array
    const shuffledNumbers = shuffleArray(numbers);
    grid.push(shuffledNumbers);
  }
  
  return grid;
};

// Function to push a number into a row from left or right
export const pushIntoRow = (
  grid: number[][], 
  rowIndex: number, 
  pushNumber: number,
  fromLeft: boolean
): { newGrid: number[][], poppedNumber: number } => {
  const newGrid = grid.map(row => [...row]);
  const row = newGrid[rowIndex];
  const poppedNumber = fromLeft ? row.pop()! : row.shift()!;
  
  if (fromLeft) {
    row.unshift(pushNumber);
  } else {
    row.push(pushNumber);
  }
  
  return { newGrid, poppedNumber };
};

// Function to push a number into a column from top or bottom
export const pushIntoColumn = (
  grid: number[][], 
  colIndex: number, 
  pushNumber: number,
  fromTop: boolean
): { newGrid: number[][], poppedNumber: number } => {
  const newGrid = grid.map(row => [...row]);
  const column = getColumn(grid, colIndex);
  const poppedNumber = fromTop ? column.pop()! : column.shift()!;
  
  if (fromTop) {
    column.unshift(pushNumber);
  } else {
    column.push(pushNumber);
  }
  
  // Update the grid with the new column
  for (let i = 0; i < grid.length; i++) {
    newGrid[i][colIndex] = column[i];
  }
  
  return { newGrid, poppedNumber };
};

// Function to check if a row is valid (contains 1 to size in order)
export const isRowValid = (row: number[]): boolean => {
  const size = row.length;
  return row.every((num, index) => num === index + 1);
};

// Function to check if the game is won
export const checkWinCondition = (grid: number[][]): boolean => {
  return grid.every(row => isRowValid(row));
};

// Function to get a column from the grid
export const getColumn = (grid: number[][], colIndex: number): number[] => {
  return grid.map(row => row[colIndex]);
};

// Function to set a column in the grid
export const setColumn = (
  grid: number[][], 
  colIndex: number, 
  newColumn: number[]
): number[][] => {
  return grid.map((row, i) => {
    const newRow = [...row];
    newRow[colIndex] = newColumn[i];
    return newRow;
  });
};

export type Position = {
  row: number;
  col: number;
};

export type Direction = 'left' | 'right' | 'top' | 'bottom'; 
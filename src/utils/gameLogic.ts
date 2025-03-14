// Function to generate a random number between min and max (inclusive)
export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to convert a flat array to a 2D grid
const convertToGrid = (flatArray: number[], size: number): number[][] => {
  const grid: number[][] = [];
  for (let i = 0; i < size; i++) {
    grid.push(flatArray.slice(i * size, (i + 1) * size));
  }
  return grid;
};

// Function to generate initial grid from predefined JSON files
export const generateInitialGrid = async (gridSize: number): Promise<number[][]> => {
  const fileName = gridSize === 3 ? 'three' : gridSize === 4 ? 'four' : 'five';
  const response = await fetch(`/data/${fileName}.json`);
  
  if (!response.ok) {
    throw new Error(`Failed to load predefined grid for size ${gridSize}. Please ensure /data/${fileName}.json exists.`);
  }
  
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Invalid or empty grid data in /data/${fileName}.json`);
  }
  
  // Select a random grid from the predefined options
  const randomIndex = Math.floor(Math.random() * data.length);
  const selectedGrid = data[randomIndex];
  
  if (!selectedGrid.grid || !Array.isArray(selectedGrid.grid) || selectedGrid.grid.length !== gridSize * gridSize) {
    throw new Error(`Invalid grid format in /data/${fileName}.json`);
  }
  
  return convertToGrid(selectedGrid.grid, gridSize);
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
import {
  GRID_COLS,
  GRID_ROWS,
  SYMBOLS,
  SYMBOL_LIST,
  SymbolId,
  MIN_CLUSTER,
  FREE_SPINS_TRIGGER,
  FREE_SPINS_COUNT,
  FREE_SPINS_EXTRA,
  SCATTER_MULTIPLIERS,
  MAX_MULTIPLIER,
} from '@/constants/gameConfig';

export interface Cell {
  id: SymbolId;
  key: string; // unique key for animation
  isWin: boolean;
  isScatter: boolean;
  multiplierValue?: number; // shown on scatter during free spins
}

export type Grid = Cell[][];

export interface SpinResult {
  grid: Grid;
  clusters: number[][];  // array of [col, row] positions per cluster
  winAmount: number;
  scatterCount: number;
  triggersFreeSpins: boolean;
  cascadeMultiplier: number;
  globalMultiplier: number;
}

export interface CascadeResult {
  grid: Grid;
  winAmount: number;
  clusters: number[][];
  scatterMultipliersDropped: number[];
  done: boolean;
}

let _keyCounter = 0;
const nextKey = () => `cell_${++_keyCounter}`;

// ─── Symbol picker ───────────────────────────────────────────────────────────

function pickSymbol(excludeScatter = false): SymbolId {
  const pool = SYMBOL_LIST.filter(id => excludeScatter ? id !== 'scatter' : true);
  const weights = pool.map(id => SYMBOLS[id].weight);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// ─── Grid generation ─────────────────────────────────────────────────────────

export function generateGrid(limitScatter = false): Grid {
  const grid: Grid = [];
  for (let col = 0; col < GRID_COLS; col++) {
    const column: Cell[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      const id = pickSymbol(limitScatter && col === 0 && row === 0); // basic scatter limit
      column.push({
        id,
        key: nextKey(),
        isWin: false,
        isScatter: id === 'scatter',
      });
    }
    grid.push(column);
  }
  return grid;
}

// ─── Cluster detection (connected, same symbol, 8+ cells) ────────────────────

function findClusters(grid: Grid): Map<string, number[][]> {
  const visited = Array.from({ length: GRID_COLS }, () => Array(GRID_ROWS).fill(false));
  const clusters = new Map<string, number[][]>();

  function bfs(startCol: number, startRow: number, symbolId: SymbolId): number[][] {
    const queue: [number, number][] = [[startCol, startRow]];
    const cells: number[][] = [];
    visited[startCol][startRow] = true;

    while (queue.length > 0) {
      const [c, r] = queue.shift()!;
      cells.push([c, r]);
      const neighbors: [number, number][] = [
        [c - 1, r], [c + 1, r],
        [c, r - 1], [c, r + 1],
      ];
      for (const [nc, nr] of neighbors) {
        if (
          nc >= 0 && nc < GRID_COLS &&
          nr >= 0 && nr < GRID_ROWS &&
          !visited[nc][nr] &&
          grid[nc][nr].id === symbolId
        ) {
          visited[nc][nr] = true;
          queue.push([nc, nr]);
        }
      }
    }
    return cells;
  }

  for (let c = 0; c < GRID_COLS; c++) {
    for (let r = 0; r < GRID_ROWS; r++) {
      if (!visited[c][r] && grid[c][r].id !== 'scatter') {
        const sym = grid[c][r].id;
        const cells = bfs(c, r, sym);
        if (cells.length >= MIN_CLUSTER) {
          const key = `${sym}_${c}_${r}`;
          clusters.set(key, cells);
        }
      }
    }
  }

  return clusters;
}

// ─── Payout calculation ───────────────────────────────────────────────────────

function calculateClusterPayout(symbolId: SymbolId, size: number, bet: number): number {
  const payouts = SYMBOLS[symbolId].payouts;
  const sizes = Object.keys(payouts).map(Number).sort((a, b) => b - a);
  for (const s of sizes) {
    if (size >= s) {
      return payouts[s] * bet;
    }
  }
  return 0;
}

// ─── Mark winning cells ───────────────────────────────────────────────────────

function markWinningCells(grid: Grid, clusters: Map<string, number[][]>): Grid {
  const newGrid = grid.map(col => col.map(cell => ({ ...cell, isWin: false })));
  for (const cells of clusters.values()) {
    for (const [c, r] of cells) {
      newGrid[c][r] = { ...newGrid[c][r], isWin: true };
    }
  }
  return newGrid;
}

// ─── Remove winning cells & cascade (gravity down) ───────────────────────────

export function cascadeGrid(grid: Grid): Grid {
  const newGrid: Grid = grid.map(col => {
    const surviving = col.filter(cell => !cell.isWin);
    const needed = GRID_ROWS - surviving.length;
    const newCells: Cell[] = [];
    for (let i = 0; i < needed; i++) {
      const id = pickSymbol();
      newCells.push({ id, key: nextKey(), isWin: false, isScatter: id === 'scatter' });
    }
    return [...newCells, ...surviving];
  });
  return newGrid;
}

// ─── Count scatters on grid ───────────────────────────────────────────────────

export function countScatters(grid: Grid): number {
  let count = 0;
  for (let c = 0; c < GRID_COLS; c++) {
    for (let r = 0; r < GRID_ROWS; r++) {
      if (grid[c][r].id === 'scatter') count++;
    }
  }
  return count;
}

// ─── Evaluate a spin (one pass) ──────────────────────────────────────────────

export function evaluateSpin(
  grid: Grid,
  bet: number,
  globalMultiplier: number,
  cascadeMultiplier: number,
  isFreeSpins: boolean
): {
  markedGrid: Grid;
  winAmount: number;
  clusters: number[][];
  newMultiplier: number;
  scatterCount: number;
} {
  const clusters = findClusters(grid);
  const allCells: number[][] = [];
  let rawWin = 0;

  for (const [key, cells] of clusters.entries()) {
    const symbolId = key.split('_')[0] as SymbolId;
    rawWin += calculateClusterPayout(symbolId, cells.length, bet);
    allCells.push(...cells);
  }

  const markedGrid = markWinningCells(grid, clusters);

  // Cascade multiplier increases by 1 on each cascade step
  let newCascadeMultiplier = clusters.size > 0 ? cascadeMultiplier + 1 : cascadeMultiplier;

  // During free spins, scatters can carry multiplier values
  const scatterCount = countScatters(grid);
  let scatterMultiplierBonus = 0;
  if (isFreeSpins && scatterCount > 0) {
    for (let c = 0; c < GRID_COLS; c++) {
      for (let r = 0; r < GRID_ROWS; r++) {
        if (markedGrid[c][r].isScatter && markedGrid[c][r].multiplierValue) {
          scatterMultiplierBonus += markedGrid[c][r].multiplierValue!;
        }
      }
    }
  }

  const effectiveMultiplier = Math.min(
    globalMultiplier + scatterMultiplierBonus + (clusters.size > 0 ? newCascadeMultiplier : 0),
    MAX_MULTIPLIER
  );

  const finalWin = rawWin * effectiveMultiplier;

  return {
    markedGrid,
    winAmount: finalWin,
    clusters: allCells,
    newMultiplier: effectiveMultiplier,
    scatterCount,
  };
}

// ─── Assign multiplier values to scatter symbols (free spins feature) ────────

export function assignScatterMultipliers(grid: Grid): Grid {
  const newGrid = grid.map(col =>
    col.map(cell => {
      if (cell.id === 'scatter') {
        const mv = SCATTER_MULTIPLIERS[Math.floor(Math.random() * SCATTER_MULTIPLIERS.length)];
        return { ...cell, multiplierValue: mv };
      }
      return { ...cell, multiplierValue: undefined };
    })
  );
  return newGrid;
}

// ─── Initial spin ─────────────────────────────────────────────────────────────

export function doSpin(bet: number, isFreeSpins: boolean): Grid {
  let grid = generateGrid();
  if (isFreeSpins) {
    grid = assignScatterMultipliers(grid);
  }
  return grid;
}

export { findClusters, calculateClusterPayout };

// Peaks of Power — Game Configuration

export const GRID_COLS = 6;
export const GRID_ROWS = 5;
export const MIN_CLUSTER = 8;

export type SymbolId = 'zeus' | 'chalice' | 'crown' | 'ring' | 'gem' | 'coin' | 'flower' | 'hourglass' | 'scatter';

export interface SlotSymbol {
  id: SymbolId;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  payouts: Record<number, number>; // cluster size -> multiplier
  weight: number; // spawn weight
}

export const SYMBOLS: Record<SymbolId, SlotSymbol> = {
  zeus: {
    id: 'zeus',
    emoji: '⚡',
    label: 'Zeus',
    color: '#FFD700',
    bgColor: '#4A2000',
    payouts: { 8: 2, 9: 3, 10: 4, 12: 6, 15: 10, 20: 20, 25: 50 },
    weight: 3,
  },
  chalice: {
    id: 'chalice',
    emoji: '🏺',
    label: 'Chalice',
    color: '#C8A020',
    bgColor: '#3D2800',
    payouts: { 8: 1.5, 9: 2, 10: 3, 12: 5, 15: 8, 20: 15, 25: 30 },
    weight: 5,
  },
  crown: {
    id: 'crown',
    emoji: '👑',
    label: 'Crown',
    color: '#E8C040',
    bgColor: '#351E00',
    payouts: { 8: 1, 9: 1.5, 10: 2, 12: 3.5, 15: 6, 20: 12, 25: 25 },
    weight: 7,
  },
  ring: {
    id: 'ring',
    emoji: '💍',
    label: 'Ring',
    color: '#B0D8FF',
    bgColor: '#001A35',
    payouts: { 8: 0.8, 9: 1.2, 10: 1.8, 12: 3, 15: 5, 20: 10, 25: 20 },
    weight: 9,
  },
  gem: {
    id: 'gem',
    emoji: '💎',
    label: 'Gem',
    color: '#80E8FF',
    bgColor: '#001A2A',
    payouts: { 8: 0.6, 9: 1, 10: 1.5, 12: 2.5, 15: 4, 20: 8, 25: 15 },
    weight: 11,
  },
  coin: {
    id: 'coin',
    emoji: '🪙',
    label: 'Coin',
    color: '#FFB830',
    bgColor: '#2A1A00',
    payouts: { 8: 0.5, 9: 0.8, 10: 1.2, 12: 2, 15: 3, 20: 6, 25: 12 },
    weight: 13,
  },
  flower: {
    id: 'flower',
    emoji: '🌸',
    label: 'Flower',
    color: '#FF80D0',
    bgColor: '#2A0020',
    payouts: { 8: 0.4, 9: 0.6, 10: 1, 12: 1.8, 15: 2.5, 20: 5, 25: 10 },
    weight: 15,
  },
  hourglass: {
    id: 'hourglass',
    emoji: '⌛',
    label: 'Hourglass',
    color: '#D0C0A0',
    bgColor: '#1A1A1A',
    payouts: { 8: 0.3, 9: 0.5, 10: 0.8, 12: 1.5, 15: 2, 20: 4, 25: 8 },
    weight: 17,
  },
  scatter: {
    id: 'scatter',
    emoji: '🔮',
    label: 'Orb',
    color: '#FF6B35',
    bgColor: '#2A0A00',
    payouts: { 4: 0, 5: 0, 6: 0 }, // triggers free spins
    weight: 2,
  },
};

export const SYMBOL_LIST: SymbolId[] = Object.keys(SYMBOLS) as SymbolId[];

export const FREE_SPINS_TRIGGER = 4; // 4+ scatters trigger free spins
export const FREE_SPINS_COUNT = 15;
export const FREE_SPINS_EXTRA = 10; // extra spins if scatter lands during free spins

export const BET_OPTIONS = [0.20, 0.40, 0.60, 1.00, 2.00, 4.00, 6.00, 10.00, 20.00, 40.00];
export const DEFAULT_BET_INDEX = 4; // $2.00

// Multiplier values dropped by scatters during free spins
export const SCATTER_MULTIPLIERS = [2, 3, 5, 8, 10, 15, 20, 25, 50, 100];

// Global multiplier caps
export const MAX_MULTIPLIER = 500;

// House edge (RTP ~96%)
export const RTP = 0.96;

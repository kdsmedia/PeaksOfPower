import { useState, useCallback, useRef } from 'react';
import {
  BET_OPTIONS,
  DEFAULT_BET_INDEX,
  FREE_SPINS_TRIGGER,
  FREE_SPINS_COUNT,
  FREE_SPINS_EXTRA,
  MAX_MULTIPLIER,
} from '@/constants/gameConfig';
import {
  Grid,
  doSpin,
  evaluateSpin,
  cascadeGrid,
  countScatters,
  assignScatterMultipliers,
  generateGrid,
} from '@/services/slotEngine';

export type GamePhase =
  | 'idle'
  | 'spinning'
  | 'evaluating'
  | 'cascading'
  | 'win_display'
  | 'free_spins_intro'
  | 'free_spins'
  | 'free_spins_end'
  | 'big_win';

export interface GameState {
  grid: Grid;
  phase: GamePhase;
  balance: number;
  betIndex: number;
  bet: number;
  totalWin: number;
  lastWin: number;
  globalMultiplier: number;
  cascadeMultiplier: number;
  freeSpinsLeft: number;
  freeSpinsTotalWin: number;
  isAutoSpin: boolean;
  winningCells: number[][];
  scatterCount: number;
  message: string;
}

const INITIAL_BALANCE = 1000;

function emptyGrid(): Grid {
  return generateGrid();
}

export function useSlotGame() {
  const [state, setState] = useState<GameState>({
    grid: emptyGrid(),
    phase: 'idle',
    balance: INITIAL_BALANCE,
    betIndex: DEFAULT_BET_INDEX,
    bet: BET_OPTIONS[DEFAULT_BET_INDEX],
    totalWin: 0,
    lastWin: 0,
    globalMultiplier: 1,
    cascadeMultiplier: 0,
    freeSpinsLeft: 0,
    freeSpinsTotalWin: 0,
    isAutoSpin: false,
    winningCells: [],
    scatterCount: 0,
    message: '',
  });

  const autoSpinRef = useRef(false);
  const phaseRef = useRef<GamePhase>('idle');

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const setBet = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      betIndex: index,
      bet: BET_OPTIONS[index],
    }));
  }, []);

  const toggleAutoSpin = useCallback(() => {
    setState(prev => {
      const next = !prev.isAutoSpin;
      autoSpinRef.current = next;
      return { ...prev, isAutoSpin: next };
    });
  }, []);

  // ─── Core cascade loop ────────────────────────────────────────────────────

  const runCascadeLoop = useCallback(async (
    initialGrid: Grid,
    bet: number,
    isFreeSpins: boolean,
    startGlobalMultiplier: number
  ): Promise<{ totalWin: number; grid: Grid; scatterTrigger: boolean; scatterCount: number }> => {

    let grid = initialGrid;
    let totalWin = 0;
    let globalMult = startGlobalMultiplier;
    let cascadeMult = 0;
    let scatterTrigger = false;
    let finalScatterCount = 0;

    while (true) {
      const { markedGrid, winAmount, clusters, newMultiplier, scatterCount } = evaluateSpin(
        grid, bet, globalMult, cascadeMult, isFreeSpins
      );

      finalScatterCount = scatterCount;

      // Check scatter trigger (base game only)
      if (!isFreeSpins && scatterCount >= FREE_SPINS_TRIGGER) {
        scatterTrigger = true;
      }

      if (clusters.length === 0 && winAmount === 0) {
        // No wins — stop cascade
        setState(prev => ({
          ...prev,
          grid,
          winningCells: [],
          phase: 'idle',
          message: '',
          globalMultiplier: isFreeSpins ? globalMult : 1,
          cascadeMultiplier: 0,
        }));
        break;
      }

      globalMult = newMultiplier;
      cascadeMult = cascadeMult + 1;
      totalWin += winAmount;

      // Show marked cells
      setState(prev => ({
        ...prev,
        grid: markedGrid,
        winningCells: clusters,
        phase: 'evaluating',
        globalMultiplier: globalMult,
        cascadeMultiplier: cascadeMult,
        lastWin: winAmount,
        totalWin: prev.totalWin + winAmount,
        balance: prev.balance + winAmount,
        message: winAmount >= bet * 20 ? '🔥 MEGA WIN!' : winAmount >= bet * 10 ? '✨ BIG WIN!' : '',
      }));

      await delay(700);

      // Cascade: remove winning cells, drop new ones
      const newGrid = cascadeGrid(markedGrid);
      const assignedGrid = isFreeSpins ? assignScatterMultipliers(newGrid) : newGrid;

      setState(prev => ({
        ...prev,
        grid: assignedGrid,
        phase: 'cascading',
        winningCells: [],
      }));

      await delay(500);
      grid = assignedGrid;
    }

    return { totalWin, grid, scatterTrigger, scatterCount: finalScatterCount };
  }, []);

  // ─── Start a spin ─────────────────────────────────────────────────────────

  const spin = useCallback(async () => {
    setState(prev => {
      if (
        prev.phase !== 'idle' ||
        prev.balance < prev.bet
      ) return prev;

      return {
        ...prev,
        phase: 'spinning',
        lastWin: 0,
        winningCells: [],
        message: '',
        balance: prev.balance - prev.bet,
        totalWin: 0,
      };
    });

    // Read current state snapshot
    setState(prev => {
      if (prev.phase !== 'spinning') return prev;

      const isFreeSpins = prev.freeSpinsLeft > 0;
      const bet = prev.bet;

      // Generate new grid
      const newGrid = doSpin(bet, isFreeSpins);

      // Start cascade evaluation asynchronously
      (async () => {
        await delay(400); // spin animation

        const freeSpinsActive = prev.freeSpinsLeft > 0;
        const { totalWin, grid, scatterTrigger, scatterCount } = await runCascadeLoop(
          newGrid,
          bet,
          freeSpinsActive,
          freeSpinsActive ? prev.globalMultiplier : 1
        );

        if (scatterTrigger && !freeSpinsActive) {
          // Trigger free spins
          setState(s => ({
            ...s,
            phase: 'free_spins_intro',
            freeSpinsLeft: FREE_SPINS_COUNT,
            freeSpinsTotalWin: totalWin,
            message: `🎰 ${FREE_SPINS_COUNT} FREE SPINS!`,
            globalMultiplier: 1,
          }));

          await delay(2000);
          setState(s => ({ ...s, phase: 'free_spins', message: '' }));

          // Run free spins
          let fsLeft = FREE_SPINS_COUNT;
          let fsTotalWin = totalWin;

          while (fsLeft > 0) {
            setState(s => ({
              ...s,
              freeSpinsLeft: fsLeft,
              phase: 'spinning',
              message: '',
            }));

            await delay(400);

            const fsGrid = doSpin(bet, true);
            const fsScatters = countScatters(fsGrid);

            const { totalWin: fsWin, grid: finalGrid } = await runCascadeLoop(
              fsGrid, bet, true, 1
            );

            fsTotalWin += fsWin;
            fsLeft--;

            // Extra spins from scatter landing
            if (fsScatters >= FREE_SPINS_TRIGGER) {
              fsLeft += FREE_SPINS_EXTRA;
              setState(s => ({
                ...s,
                freeSpinsLeft: fsLeft,
                message: `+${FREE_SPINS_EXTRA} MORE SPINS!`,
              }));
              await delay(1500);
            }

            setState(s => ({
              ...s,
              freeSpinsLeft: fsLeft,
              freeSpinsTotalWin: fsTotalWin,
              grid: finalGrid,
            }));

            await delay(300);
          }

          setState(s => ({
            ...s,
            phase: 'free_spins_end',
            message: `🏆 FREE SPINS WIN: $${fsTotalWin.toFixed(2)}`,
            freeSpinsLeft: 0,
            globalMultiplier: 1,
          }));

          await delay(3000);
          setState(s => ({ ...s, phase: 'idle', message: '' }));

        } else if (freeSpinsActive) {
          const newFsLeft = prev.freeSpinsLeft - 1;
          setState(s => ({
            ...s,
            freeSpinsLeft: newFsLeft,
            freeSpinsTotalWin: s.freeSpinsTotalWin + totalWin,
            phase: newFsLeft > 0 ? 'free_spins' : 'free_spins_end',
            message: newFsLeft === 0 ? `🏆 FREE SPINS WIN: $${(s.freeSpinsTotalWin + totalWin).toFixed(2)}` : '',
          }));

          if (newFsLeft === 0) {
            await delay(3000);
            setState(s => ({ ...s, phase: 'idle', message: '', globalMultiplier: 1 }));
          }
        } else {
          setState(s => ({
            ...s,
            phase: 'idle',
            message: totalWin >= bet * 50 ? '🏆 MEGA WIN!' : totalWin >= bet * 20 ? '🔥 BIG WIN!' : '',
          }));

          if (totalWin >= bet * 20) {
            await delay(2500);
            setState(s => ({ ...s, message: '' }));
          }
        }
      })();

      return {
        ...prev,
        grid: newGrid,
        phase: 'spinning',
      };
    });
  }, [runCascadeLoop]);

  const canSpin = state.phase === 'idle' && state.balance >= state.bet;

  return {
    state,
    spin,
    setBet,
    toggleAutoSpin,
    canSpin,
    betOptions: BET_OPTIONS,
  };
}

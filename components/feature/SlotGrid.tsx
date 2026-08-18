import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { Grid } from '@/services/slotEngine';
import { GRID_COLS, GRID_ROWS } from '@/constants/gameConfig';
import { Colors, Radius } from '@/constants/theme';
import { SlotSymbol } from './SlotSymbol';

interface Props {
  grid: Grid;
  isSpinning: boolean;
}

const PADDING = 8;

export function SlotGrid({ grid, isSpinning }: Props) {
  const { width } = Dimensions.get('window');
  const gridWidth = Math.min(width - 32, 420);
  const cellSize = Math.floor((gridWidth - PADDING * 2 - (GRID_COLS + 1) * 2) / GRID_COLS);

  const borderAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  // Column drop animations (staggered)
  const colAnims = useRef(
    Array.from({ length: GRID_COLS }, () => new Animated.Value(-60))
  ).current;

  useEffect(() => {
    if (isSpinning) {
      // Animate border glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
          Animated.timing(borderAnim, { toValue: 0.3, duration: 500, useNativeDriver: false }),
        ])
      ).start();

      // Pulse scale
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowScale, { toValue: 1.01, duration: 400, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();

      // Shake on spin start
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

    } else {
      borderAnim.stopAnimation();
      borderAnim.setValue(0);
      glowScale.stopAnimation();
      glowScale.setValue(1);

      // Staggered column drop reveal
      colAnims.forEach(a => a.setValue(-60));
      const staggered = colAnims.map((a, i) =>
        Animated.sequence([
          Animated.delay(i * 55),
          Animated.spring(a, {
            toValue: 0,
            friction: 6,
            tension: 90,
            useNativeDriver: true,
          }),
        ])
      );
      Animated.parallel(staggered).start();
    }
  }, [isSpinning]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.primaryLight],
  });

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 2.5],
  });

  // Build rows
  const rows: React.ReactNode[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const rowCells: React.ReactNode[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = grid[c][r];
      rowCells.push(
        <Animated.View
          key={`${c}_${r}_${cell.key}`}
          style={{ transform: [{ translateY: colAnims[c] }] }}
        >
          <SlotSymbol
            cell={cell}
            size={cellSize}
            isSpinning={isSpinning}
          />
        </Animated.View>
      );
    }
    rows.push(
      <View key={r} style={styles.row}>
        {rowCells}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: gridWidth,
          borderColor,
          borderWidth,
          padding: PADDING,
          transform: [{ translateX: shakeAnim }, { scale: glowScale }],
        },
      ]}
    >
      {/* Spinning overlay shimmer */}
      {isSpinning && <View style={styles.spinOverlay} />}

      {/* Inner glow corners */}
      <View style={[styles.cornerGlow, styles.cornerTL]} />
      <View style={[styles.cornerGlow, styles.cornerTR]} />
      <View style={[styles.cornerGlow, styles.cornerBL]} />
      <View style={[styles.cornerGlow, styles.cornerBR]} />

      <View style={styles.grid}>{rows}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  spinOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.primaryLight + '0A',
    zIndex: 0,
  },
  grid: {
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cornerGlow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.primary + '30',
    zIndex: 2,
  },
  cornerTL: { top: 4, left: 4 },
  cornerTR: { top: 4, right: 4 },
  cornerBL: { bottom: 4, left: 4 },
  cornerBR: { bottom: 4, right: 4 },
});

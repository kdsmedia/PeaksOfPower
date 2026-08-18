import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Cell } from '@/services/slotEngine';
import { SYMBOLS } from '@/constants/gameConfig';
import { Colors, Radius } from '@/constants/theme';

interface Props {
  cell: Cell;
  size: number;
  isSpinning?: boolean;
}

export const SlotSymbol = React.memo(({ cell, size, isSpinning }: Props) => {
  const symbol = SYMBOLS[cell.id];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const popAnim = useRef(new Animated.Value(1)).current;

  // Win pulse
  useEffect(() => {
    if (cell.isWin) {
      Animated.loop(
        Animated.sequence([
          Animated.spring(scaleAnim, { toValue: 1.18, friction: 3, tension: 120, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1.0, friction: 4, tension: 80, useNativeDriver: true }),
        ]),
        { iterations: 4 }
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.2, duration: 250, useNativeDriver: false }),
        ]),
        { iterations: 4 }
      ).start();

      // Quick pop on win appear
      popAnim.setValue(0.6);
      Animated.spring(popAnim, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }).start();
    } else {
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      glowAnim.setValue(0);
    }
  }, [cell.isWin]);

  // Spin blur effect
  useEffect(() => {
    if (isSpinning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0.35, duration: 65, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.9, duration: 65, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.5, duration: 65, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 65, useNativeDriver: true }),
        ])
      ).start();
    } else {
      opacityAnim.stopAnimation();
      Animated.timing(opacityAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();
    }
  }, [isSpinning]);

  // Scatter spin shimmer
  useEffect(() => {
    if (cell.isScatter) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    } else {
      rotateAnim.stopAnimation();
    }
  }, [cell.isScatter]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [symbol.color + '40', symbol.color],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const rotateDeg = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const emojiSize = size * 0.44;
  const isScatter = cell.id === 'scatter';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: isScatter ? '#1A0A00' : symbol.bgColor,
          borderColor: cell.isWin ? borderColor : (isScatter ? Colors.scatter + '80' : symbol.color + '30'),
          borderWidth: cell.isWin ? 2 : 1,
          borderRadius: Radius.sm,
          transform: [{ scale: Animated.multiply(scaleAnim, popAnim) }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Win glow bg */}
      {cell.isWin && (
        <Animated.View
          style={[
            styles.winBg,
            {
              backgroundColor: symbol.color + '25',
              opacity: glowAnim,
            },
          ]}
        />
      )}

      {/* Scatter glow ring */}
      {isScatter && (
        <View style={[styles.scatterGlow, { borderColor: Colors.scatter + '60' }]} />
      )}

      {/* Emoji */}
      <Animated.Text
        style={[
          styles.emoji,
          { fontSize: emojiSize },
          isScatter && { transform: [{ rotate: rotateDeg }] },
        ]}
      >
        {symbol.emoji}
      </Animated.Text>

      {/* Multiplier badge on scatter */}
      {isScatter && cell.multiplierValue ? (
        <View style={styles.multBadge}>
          <Text style={styles.multText}>×{cell.multiplierValue}</Text>
        </View>
      ) : null}

      {/* Win highlight bottom strip */}
      {cell.isWin && (
        <Animated.View style={[styles.winStrip, { backgroundColor: symbol.color, opacity: glowAnim }]} />
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    margin: 1,
  },
  winBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: Radius.sm,
  },
  scatterGlow: {
    position: 'absolute',
    top: 2, left: 2, right: 2, bottom: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    backgroundColor: Colors.scatter + '12',
  },
  emoji: {
    textAlign: 'center',
    zIndex: 1,
  },
  multBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.scatter,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
    zIndex: 2,
  },
  multText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  winStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});

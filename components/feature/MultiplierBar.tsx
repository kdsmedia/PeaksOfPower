import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

interface Props {
  multiplier: number;
  cascadeStep: number;
  isFreeSpins: boolean;
}

const STEPS = [1, 2, 3, 4, 5];

export function MultiplierBar({ multiplier, cascadeStep, isFreeSpins }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const stepAnims = useRef(STEPS.map(() => new Animated.Value(0))).current;
  const prevMult = useRef(multiplier);
  const prevCascade = useRef(cascadeStep);

  // Multiplier change burst
  useEffect(() => {
    if (multiplier !== prevMult.current) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, { toValue: 1.45, friction: 3, tension: 100, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 400, useNativeDriver: false }),
        ]),
      ]).start();
      prevMult.current = multiplier;
    }
  }, [multiplier]);

  // Step fill animation
  useEffect(() => {
    if (cascadeStep !== prevCascade.current) {
      const stepIndex = Math.min(cascadeStep - 1, STEPS.length - 1);
      if (stepIndex >= 0 && cascadeStep > prevCascade.current) {
        Animated.spring(stepAnims[stepIndex], {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }).start();
      } else if (cascadeStep === 0) {
        stepAnims.forEach(a =>
          Animated.timing(a, { toValue: 0, duration: 200, useNativeDriver: true }).start()
        );
      }
      prevCascade.current = cascadeStep;
    }
  }, [cascadeStep]);

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.multiplier + '00', Colors.multiplier + '50'],
  });

  const multColor = isFreeSpins ? Colors.freeSpins : Colors.multiplier;

  return (
    <View style={styles.container}>
      {/* Cascade step dots */}
      <View style={styles.stepsRow}>
        {STEPS.map((step, i) => {
          const isActive = cascadeStep >= step;
          return (
            <Animated.View
              key={step}
              style={[
                styles.step,
                isActive && styles.stepActive,
                isActive && { backgroundColor: multColor + 'CC' },
                { transform: [{ scale: stepAnims[i].interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }] },
              ]}
            >
              <Text style={[styles.stepText, isActive && styles.stepTextActive]}>
                {step}×
              </Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Multiplier badge */}
      <Animated.View
        style={[
          styles.multContainer,
          isFreeSpins && styles.multContainerFS,
          { transform: [{ scale: scaleAnim }], shadowColor: glowColor },
        ]}
      >
        <Animated.View style={[styles.multGlowBg, { backgroundColor: glowColor }]} />
        <Text style={styles.multLabel}>MULTIPLIER</Text>
        <Text style={[styles.multValue, { color: multColor }]}>
          ×{multiplier}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    borderColor: Colors.multiplier,
    shadowColor: Colors.multiplier,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  stepText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  stepTextActive: {
    color: Colors.background,
  },
  multContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderWidth: 1.5,
    borderColor: Colors.primary + '70',
    minWidth: 100,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  multContainerFS: {
    borderColor: Colors.freeSpins,
  },
  multGlowBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  multLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    zIndex: 1,
  },
  multValue: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    zIndex: 1,
    letterSpacing: 1,
  },
});

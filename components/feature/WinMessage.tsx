import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

interface Props {
  message: string;
  totalWin: number;
  bet: number;
}

export function WinMessage({ message, totalWin, bet }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message || totalWin > 0) {
      // Reset
      scaleAnim.setValue(0.4);
      opacityAnim.setValue(0);
      shineAnim.setValue(-1);
      bounceAnim.setValue(8);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Shine sweep
        Animated.loop(
          Animated.timing(shineAnim, {
            toValue: 2,
            duration: 1800,
            useNativeDriver: true,
          }),
          { iterations: 3 }
        ).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.4, duration: 180, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [message, totalWin]);

  const isMegaWin = message.includes('MEGA');
  const isBigWin = message.includes('BIG WIN') || message.includes('BIG');
  const isFS = message.includes('FREE SPINS') || message.includes('MORE SPINS') || message.includes('FREE SPIN');
  const isTrophy = message.includes('🏆');
  const winRatio = bet > 0 ? totalWin / bet : 0;

  const shineTranslate = shineAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-200, 400],
  });

  if (!message && totalWin === 0) return <View style={styles.placeholder} />;

  return (
    <Animated.View
      style={[
        styles.container,
        isMegaWin && styles.megaWinContainer,
        isBigWin && !isMegaWin && styles.bigWinContainer,
        isFS && styles.fsContainer,
        isTrophy && styles.trophyContainer,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: bounceAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Shine streak */}
      <Animated.View
        style={[
          styles.shine,
          { transform: [{ translateX: shineTranslate }, { rotate: '20deg' }] },
        ]}
      />

      {message ? (
        <Text
          style={[
            styles.messageText,
            isMegaWin && styles.megaWinText,
            isBigWin && !isMegaWin && styles.bigWinText,
            isFS && styles.fsText,
            isTrophy && styles.trophyText,
          ]}
        >
          {message}
        </Text>
      ) : null}

      {totalWin > 0 && (
        <View style={styles.winRow}>
          <Text style={[styles.winAmount, isMegaWin && styles.megaWinAmount]}>
            +${totalWin.toFixed(2)}
          </Text>
          {winRatio >= 10 && (
            <View style={styles.multPill}>
              <Text style={styles.multPillText}>{Math.floor(winRatio)}×</Text>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 56,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary + '60',
    minHeight: 56,
    overflow: 'hidden',
  },
  bigWinContainer: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  megaWinContainer: {
    backgroundColor: Colors.accent + '20',
    borderColor: Colors.accentLight,
    borderWidth: 2,
  },
  fsContainer: {
    backgroundColor: Colors.freeSpins + '20',
    borderColor: Colors.freeSpins,
  },
  trophyContainer: {
    backgroundColor: Colors.win + '15',
    borderColor: Colors.win,
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    zIndex: 0,
  },
  messageText: {
    color: Colors.textGold,
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    zIndex: 1,
  },
  bigWinText: {
    fontSize: FontSize.lg,
    color: Colors.primaryLight,
    letterSpacing: 2,
    textShadowColor: Colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  megaWinText: {
    fontSize: FontSize.xl,
    color: Colors.accentLight,
    letterSpacing: 3,
    fontWeight: '900',
    textShadowColor: Colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  fsText: {
    color: Colors.freeSpins,
    fontSize: FontSize.lg,
    letterSpacing: 1.5,
  },
  trophyText: {
    color: Colors.win,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  winRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    zIndex: 1,
  },
  winAmount: {
    color: Colors.win,
    fontSize: FontSize.xl,
    fontWeight: '900',
    letterSpacing: 1,
  },
  megaWinAmount: {
    fontSize: FontSize.xxl,
    color: Colors.accentLight,
  },
  multPill: {
    backgroundColor: Colors.multiplier + '30',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.multiplier + '80',
  },
  multPillText: {
    color: Colors.multiplier,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
});

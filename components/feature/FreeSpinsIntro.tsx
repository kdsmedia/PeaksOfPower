import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

interface Props {
  visible: boolean;
  spinsCount: number;
  onStart: () => void;
}

const { width: SW, height: SH } = Dimensions.get('window');

export function FreeSpinsIntro({ visible, spinsCount, onStart }: Props) {
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.3)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const countScale = useRef(new Animated.Value(0.5)).current;
  const countOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(0.8)).current;
  const lightning1 = useRef(new Animated.Value(0)).current;
  const lightning2 = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (visible) {
      // Reset
      bgOpacity.setValue(0);
      titleScale.setValue(0.3);
      titleOpacity.setValue(0);
      countScale.setValue(0.5);
      countOpacity.setValue(0);
      btnOpacity.setValue(0);
      btnScale.setValue(0.8);

      // Entrance sequence
      Animated.sequence([
        Animated.timing(bgOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.parallel([
          Animated.spring(titleScale, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
          Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(countScale, { toValue: 1.2, friction: 3, tension: 80, useNativeDriver: true }),
          Animated.timing(countOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
        Animated.spring(countScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(btnOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(btnScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        ]),
      ]).start();

      // Lightning flicker
      Animated.loop(
        Animated.sequence([
          Animated.timing(lightning1, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(lightning1, { toValue: 0.2, duration: 100, useNativeDriver: true }),
          Animated.timing(lightning1, { toValue: 0.8, duration: 120, useNativeDriver: true }),
          Animated.timing(lightning1, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.delay(800 + Math.random() * 600),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(lightning2, { toValue: 1, duration: 120, useNativeDriver: true }),
          Animated.timing(lightning2, { toValue: 0.3, duration: 80, useNativeDriver: true }),
          Animated.timing(lightning2, { toValue: 0.9, duration: 100, useNativeDriver: true }),
          Animated.timing(lightning2, { toValue: 0, duration: 350, useNativeDriver: true }),
          Animated.delay(1200),
        ])
      ).start();

      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, { toValue: 1, duration: 900, useNativeDriver: false }),
          Animated.timing(glowPulse, { toValue: 0.4, duration: 900, useNativeDriver: false }),
        ])
      ).start();
    } else {
      Animated.timing(bgOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const glowBg = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.freeSpins + '00', Colors.freeSpins + '30'],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: bgOpacity }]}>
      {/* Pulsing glow background */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: glowBg }]} />

      {/* Lightning bolts decorative */}
      <Animated.Text style={[styles.lightning, styles.lightningLeft, { opacity: lightning1 }]}>
        ⚡
      </Animated.Text>
      <Animated.Text style={[styles.lightning, styles.lightningRight, { opacity: lightning2 }]}>
        ⚡
      </Animated.Text>
      <Animated.Text style={[styles.lightning, styles.lightningTopLeft, { opacity: lightning2 }]}>
        ✨
      </Animated.Text>
      <Animated.Text style={[styles.lightning, styles.lightningTopRight, { opacity: lightning1 }]}>
        ✨
      </Animated.Text>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: titleScale }], opacity: titleOpacity }}>
          <Text style={styles.label}>YOU TRIGGERED</Text>
          <Text style={styles.title}>FREE SPINS!</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.countBadge,
            { transform: [{ scale: countScale }], opacity: countOpacity },
          ]}
        >
          <Text style={styles.countNumber}>{spinsCount}</Text>
          <Text style={styles.countLabel}>FREE SPINS</Text>
        </Animated.View>

        <View style={styles.perks}>
          <Text style={styles.perkItem}>⚡ Multiplier tidak reset</Text>
          <Text style={styles.perkItem}>🔮 Orb membawa multiplier</Text>
          <Text style={styles.perkItem}>+10 spin jika 4+ Orb muncul</Text>
        </View>

        <Animated.View style={{ transform: [{ scale: btnScale }], opacity: btnOpacity }}>
          <Pressable
            onPress={onStart}
            style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
          >
            <Text style={styles.startBtnText}>⚡ MULAI SEKARANG</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,5,32,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  label: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
  },
  title: {
    color: Colors.freeSpins,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: Colors.freeSpins,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  countBadge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.freeSpins + '20',
    borderWidth: 3,
    borderColor: Colors.freeSpins,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.freeSpins,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 16,
  },
  countNumber: {
    color: Colors.freeSpins,
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 70,
  },
  countLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 2,
  },
  perks: {
    gap: 8,
    alignItems: 'center',
  },
  perkItem: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  startBtn: {
    backgroundColor: Colors.freeSpins,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    shadowColor: Colors.freeSpins,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '900',
    letterSpacing: 2,
  },
  lightning: {
    position: 'absolute',
    fontSize: 80,
  },
  lightningLeft: {
    left: 10,
    top: '25%',
    transform: [{ rotate: '-15deg' }],
  },
  lightningRight: {
    right: 10,
    top: '30%',
    transform: [{ rotate: '15deg' }],
  },
  lightningTopLeft: {
    left: 30,
    top: '15%',
    fontSize: 50,
  },
  lightningTopRight: {
    right: 30,
    top: '12%',
    fontSize: 60,
  },
});

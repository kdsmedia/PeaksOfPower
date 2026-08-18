import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { BET_OPTIONS } from '@/constants/gameConfig';

interface Props {
  balance: number;
  bet: number;
  betIndex: number;
  lastWin: number;
  totalWin: number;
  canSpin: boolean;
  isAutoSpin: boolean;
  isFreeSpins: boolean;
  freeSpinsLeft: number;
  onSpin: () => void;
  onSetBet: (index: number) => void;
  onToggleAutoSpin: () => void;
  onFreeCoins: () => void;
}

export function GameControls({
  balance,
  bet,
  betIndex,
  lastWin,
  canSpin,
  isAutoSpin,
  isFreeSpins,
  freeSpinsLeft,
  onSpin,
  onSetBet,
  onToggleAutoSpin,
  onFreeCoins,
}: Props) {
  const spinScale = useRef(new Animated.Value(1)).current;
  const spinRotate = useRef(new Animated.Value(0)).current;
  const coinBtnScale = useRef(new Animated.Value(1)).current;

  const handleSpinPress = () => {
    if (!canSpin) return;
    Animated.sequence([
      Animated.parallel([
        Animated.timing(spinScale, { toValue: 0.90, duration: 70, useNativeDriver: true }),
        Animated.timing(spinRotate, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(spinScale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
        Animated.timing(spinRotate, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ]).start();
    onSpin();
  };

  const handleCoinPress = () => {
    Animated.sequence([
      Animated.timing(coinBtnScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(coinBtnScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
    ]).start();
    onFreeCoins();
  };

  const spinDeg = spinRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>BALANCE</Text>
          <Text style={styles.statValue}>${balance.toFixed(2)}</Text>
        </View>
        <View style={[styles.statBox, styles.winBox]}>
          <Text style={styles.statLabel}>WIN</Text>
          <Text style={[styles.statValue, styles.winValue]}>
            ${lastWin > 0 ? lastWin.toFixed(2) : '0.00'}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>BET</Text>
          <Text style={styles.statValue}>${bet.toFixed(2)}</Text>
        </View>
      </View>

      {/* Free spins banner */}
      {isFreeSpins && (
        <View style={styles.fsBanner}>
          <Text style={styles.fsBannerText}>
            🎰 FREE SPINS: {freeSpinsLeft} TERSISA
          </Text>
        </View>
      )}

      {/* Bet selector */}
      {!isFreeSpins && (
        <View style={styles.betRow}>
          <Text style={styles.betLabel}>BET PER SPIN</Text>
          <View style={styles.betScrollWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.betScroll}
            >
              {BET_OPTIONS.map((b, i) => (
                <Pressable
                  key={i}
                  onPress={() => onSetBet(i)}
                  style={({ pressed }) => [
                    styles.betChip,
                    i === betIndex && styles.betChipActive,
                    pressed && styles.betChipPressed,
                  ]}
                >
                  <Text style={[styles.betChipText, i === betIndex && styles.betChipTextActive]}>
                    ${b.toFixed(2)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Action buttons row */}
      <View style={styles.actionRow}>
        {/* Auto Spin */}
        <Pressable
          onPress={onToggleAutoSpin}
          style={({ pressed }) => [
            styles.secondaryBtn,
            isAutoSpin && styles.secondaryBtnActive,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: spinDeg }] }}>
            <MaterialIcons
              name={isAutoSpin ? 'stop' : 'autorenew'}
              size={20}
              color={isAutoSpin ? Colors.freeSpins : Colors.textSecondary}
            />
          </Animated.View>
          <Text style={[styles.secondaryBtnText, isAutoSpin && { color: Colors.freeSpins }]}>
            {isAutoSpin ? 'STOP' : 'AUTO'}
          </Text>
        </Pressable>

        {/* SPIN button */}
        <Animated.View style={[styles.spinBtnWrap, { transform: [{ scale: spinScale }] }]}>
          <Pressable
            onPress={handleSpinPress}
            disabled={!canSpin}
            style={[
              styles.spinBtn,
              !canSpin && styles.spinBtnDisabled,
              isFreeSpins && styles.spinBtnFS,
            ]}
          >
            <MaterialIcons
              name="casino"
              size={28}
              color={canSpin ? Colors.background : Colors.textMuted}
            />
            <Text style={[styles.spinBtnText, !canSpin && styles.spinBtnTextDisabled]}>
              {isFreeSpins ? 'FREE SPIN' : 'SPIN'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* FREE COINS button */}
        <Animated.View style={{ transform: [{ scale: coinBtnScale }] }}>
          <Pressable
            onPress={handleCoinPress}
            style={({ pressed }) => [styles.coinBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.coinBtnEmoji}>🪙</Text>
            <Text style={styles.coinBtnText}>GRATIS</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Bet up/down row */}
      {!isFreeSpins && (
        <View style={styles.betAdjRow}>
          <Pressable
            onPress={() => onSetBet(Math.max(betIndex - 1, 0))}
            style={({ pressed }) => [styles.betAdjBtn, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name="remove" size={16} color={Colors.textSecondary} />
            <Text style={styles.betAdjText}>BET -</Text>
          </Pressable>
          <View style={styles.betCurrent}>
            <Text style={styles.betCurrentText}>${bet.toFixed(2)} / spin</Text>
          </View>
          <Pressable
            onPress={() => onSetBet(Math.min(betIndex + 1, BET_OPTIONS.length - 1))}
            style={({ pressed }) => [styles.betAdjBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.betAdjText}>BET +</Text>
            <MaterialIcons name="add" size={16} color={Colors.textSecondary} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  winBox: {
    borderColor: Colors.primary + '60',
    backgroundColor: Colors.primary + '10',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginTop: 2,
  },
  winValue: {
    color: Colors.textGold,
    fontSize: FontSize.lg,
  },
  fsBanner: {
    backgroundColor: Colors.freeSpins + '20',
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.freeSpins,
  },
  fsBannerText: {
    color: Colors.freeSpins,
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: 1,
  },
  betRow: {
    gap: 6,
  },
  betLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 4,
  },
  betScrollWrap: {
    height: 40,
  },
  betScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  betChip: {
    height: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  betChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  betChipPressed: {
    opacity: 0.75,
  },
  betChipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  betChipTextActive: {
    color: Colors.background,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: 4,
  },
  secondaryBtn: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  secondaryBtnActive: {
    borderColor: Colors.freeSpins,
    backgroundColor: Colors.freeSpins + '20',
  },
  secondaryBtnText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  spinBtnWrap: {
    flex: 1,
  },
  spinBtn: {
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  spinBtnDisabled: {
    backgroundColor: Colors.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  spinBtnFS: {
    backgroundColor: Colors.freeSpins,
    shadowColor: Colors.freeSpins,
  },
  spinBtnText: {
    color: Colors.background,
    fontSize: FontSize.lg,
    fontWeight: '900',
    letterSpacing: 2,
  },
  spinBtnTextDisabled: {
    color: Colors.textMuted,
  },
  coinBtn: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary + '25',
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  coinBtnEmoji: {
    fontSize: 22,
  },
  coinBtnText: {
    color: Colors.textGold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  betAdjRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  betAdjBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  betAdjText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  betCurrent: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  betCurrentText: {
    color: Colors.textGold,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import { useSlotGame } from '@/hooks/useSlotGame';
import { SlotGrid } from '@/components/feature/SlotGrid';
import { GameControls } from '@/components/feature/GameControls';
import { MultiplierBar } from '@/components/feature/MultiplierBar';
import { WinMessage } from '@/components/feature/WinMessage';
import { PayTable } from '@/components/feature/PayTable';
import { CoinRain } from '@/components/feature/CoinRain';
import { FreeSpinsIntro } from '@/components/feature/FreeSpinsIntro';
import { AdRewardModal } from '@/components/feature/AdRewardModal';
import { useWallet } from '@/hooks/useWallet';
import { FREE_SPINS_COUNT } from '@/constants/gameConfig';

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { state, spin, setBet, toggleAutoSpin, canSpin, betOptions } = useSlotGame();
  const { koin, addKoin } = useWallet();
  const glowAnim = useRef(new Animated.Value(0)).current;
  const koinScaleAnim = useRef(new Animated.Value(1)).current;
  const prevKoin = useRef(koin);

  const [showCoinRain, setShowCoinRain] = useState(false);
  const [showFSIntro, setShowFSIntro] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const prevPhase = useRef(state.phase);
  const prevLastWin = useRef(state.lastWin);

  const isSpinning = state.phase === 'spinning' || state.phase === 'cascading' || state.phase === 'evaluating';
  const isFreeSpins = state.freeSpinsLeft > 0 || state.phase === 'free_spins' || state.phase === 'free_spins_intro';

  // Glow pulse for free spins mode
  useEffect(() => {
    if (isFreeSpins) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
        ])
      ).start();
    } else {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [isFreeSpins]);

  // Show free spins intro when phase changes
  useEffect(() => {
    if (state.phase === 'free_spins_intro' && prevPhase.current !== 'free_spins_intro') {
      setShowFSIntro(true);
    }
    prevPhase.current = state.phase;
  }, [state.phase]);

  // Coin rain + koin reward on big wins
  useEffect(() => {
    if (state.lastWin > 0 && state.lastWin !== prevLastWin.current) {
      const bet = state.bet;
      if (state.lastWin >= bet * 10) {
        setShowCoinRain(true);
        setTimeout(() => setShowCoinRain(false), 2500);
      }
      // Award koin from win
      const koinEarned = Math.floor(state.lastWin * 5);
      if (koinEarned > 0) addKoin(koinEarned);
    }
    prevLastWin.current = state.lastWin;
  }, [state.lastWin]);

  // Koin counter bounce
  useEffect(() => {
    if (koin !== prevKoin.current) {
      Animated.sequence([
        Animated.timing(koinScaleAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.spring(koinScaleAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      ]).start();
      prevKoin.current = koin;
    }
  }, [koin]);

  // Auto spin trigger
  useEffect(() => {
    if (state.isAutoSpin && canSpin) {
      const timer = setTimeout(() => spin(), 800);
      return () => clearTimeout(timer);
    }
  }, [state.isAutoSpin, canSpin, state.phase]);

  const bgColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.background, '#1A0520'],
  });

  return (
    <Animated.View style={[styles.root, { backgroundColor: bgColor, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Coin rain overlay */}
      <CoinRain active={showCoinRain} intensity={state.lastWin >= state.bet * 20 ? 'heavy' : 'light'} />

      {/* Free spins intro overlay */}
      <FreeSpinsIntro
        visible={showFSIntro}
        spinsCount={FREE_SPINS_COUNT}
        onStart={() => setShowFSIntro(false)}
      />

      {/* Ad reward modal */}
      <AdRewardModal visible={showAdModal} onClose={() => setShowAdModal(false)} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.surfaceElevated, Colors.background + '00']}
        style={styles.header}
      >
        <View style={styles.titleRow}>
          <Text style={styles.titleMain}>PEAKS</Text>
          <Text style={styles.titleSub}> OF </Text>
          <Text style={styles.titlePower}>POWER</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Koin counter */}
          <Animated.View style={[styles.koinBadge, { transform: [{ scale: koinScaleAnim }] }]}>
            <Text style={styles.koinEmoji}>🪙</Text>
            <Text style={styles.koinCount}>{koin.toLocaleString('id')}</Text>
          </Animated.View>

          {isFreeSpins && (
            <View style={styles.fsBadge}>
              <Text style={styles.fsBadgeText}>⚡ FREE</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Multiplier bar */}
        <MultiplierBar
          multiplier={state.globalMultiplier}
          cascadeStep={state.cascadeMultiplier}
          isFreeSpins={isFreeSpins}
        />

        {/* Grid */}
        <View style={styles.gridWrapper}>
          <View style={[styles.column, styles.columnLeft]} />
          <View style={[styles.column, styles.columnRight]} />
          <SlotGrid grid={state.grid} isSpinning={isSpinning} />
        </View>

        {/* Win message */}
        <WinMessage
          message={state.message}
          totalWin={state.lastWin}
          bet={state.bet}
        />

        {/* Controls */}
        <GameControls
          balance={state.balance}
          bet={state.bet}
          betIndex={state.betIndex}
          lastWin={state.lastWin}
          totalWin={state.totalWin}
          canSpin={canSpin}
          isAutoSpin={state.isAutoSpin}
          isFreeSpins={isFreeSpins}
          freeSpinsLeft={state.freeSpinsLeft}
          onSpin={spin}
          onSetBet={setBet}
          onToggleAutoSpin={toggleAutoSpin}
          onFreeCoins={() => setShowAdModal(true)}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <PayTable bet={state.bet} />
          {state.freeSpinsLeft > 0 && (
            <View style={styles.fsCounter}>
              <Text style={styles.fsCounterText}>{state.freeSpinsLeft} spin tersisa</Text>
            </View>
          )}
        </View>

        <View style={{ height: insets.bottom + 8 }} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  titleMain: {
    color: Colors.primaryLight,
    fontSize: FontSize.xl,
    fontWeight: '900',
    letterSpacing: 3,
  },
  titleSub: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontWeight: '400',
    letterSpacing: 1,
  },
  titlePower: {
    color: Colors.accent,
    fontSize: FontSize.xl,
    fontWeight: '900',
    letterSpacing: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  koinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '25',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '60',
    gap: 4,
  },
  koinEmoji: {
    fontSize: 14,
  },
  koinCount: {
    color: Colors.textGold,
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fsBadge: {
    backgroundColor: Colors.freeSpins + '30',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.freeSpins,
  },
  fsBadgeText: {
    color: Colors.freeSpins,
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.sm,
    paddingTop: 4,
  },
  gridWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: Spacing.md,
  },
  column: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary + '20',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  columnLeft: { left: 4 },
  columnRight: { right: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  fsCounter: {
    backgroundColor: Colors.freeSpins + '20',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.freeSpins + '60',
  },
  fsCounterText: {
    color: Colors.freeSpins,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});

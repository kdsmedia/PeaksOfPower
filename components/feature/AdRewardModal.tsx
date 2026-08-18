import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWallet } from '@/hooks/useWallet';

interface Props {
  visible: boolean;
  onClose: (rewarded: boolean) => void;
}

const AD_DURATION = 5; // seconds

const AD_MOCK_CONTENTS = [
  { title: 'TopUp Game Murah!', desc: 'Dapatkan diamond & koin game favoritmu', color: '#FF6B35', emoji: '💎' },
  { title: 'Slot Online Terpercaya', desc: 'Bonus new member 100% - Daftar sekarang!', color: '#C8A020', emoji: '🎰' },
  { title: 'Cashback 50% E-Wallet', desc: 'Transfer gratis sepuasnya via DANA & OVO', color: '#00C896', emoji: '💳' },
];

export function AdRewardModal({ visible, onClose }: Props) {
  const { watchAd } = useWallet();
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [phase, setPhase] = useState<'watching' | 'rewarded'>('watching');
  const [adContent] = useState(() => AD_MOCK_CONTENTS[Math.floor(Math.random() * AD_MOCK_CONTENTS.length)]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const rewardScale = useRef(new Animated.Value(0.3)).current;
  const rewardOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const bgOverlay = useRef(new Animated.Value(0)).current;
  const coinBounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      setCountdown(AD_DURATION);
      setPhase('watching');
      progressAnim.setValue(0);
      rewardScale.setValue(0.3);
      rewardOpacity.setValue(0);
      return;
    }

    setPhase('watching');
    setCountdown(AD_DURATION);
    progressAnim.setValue(0);

    // Progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: AD_DURATION * 1000,
      useNativeDriver: false,
    }).start();

    // Bg pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgOverlay, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(bgOverlay, { toValue: 0, duration: 1000, useNativeDriver: false }),
      ])
    ).start();

    // Countdown tick
    let tick = AD_DURATION;
    const interval = setInterval(() => {
      tick -= 1;
      setCountdown(tick);
      if (tick <= 0) {
        clearInterval(interval);
        showReward();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  const showReward = () => {
    setPhase('rewarded');
    watchAd();

    Animated.parallel([
      Animated.spring(rewardScale, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }),
      Animated.timing(rewardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(coinBounce, { toValue: 1.2, duration: 300, useNativeDriver: true }),
        Animated.timing(coinBounce, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    ).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.win + '20', Colors.win + '60'],
  });

  const bgPulse = bgOverlay.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(13,5,32,0.97)', 'rgba(20,5,40,0.98)'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { backgroundColor: bgPulse }]}>
        {phase === 'watching' ? (
          <View style={styles.adContainer}>
            {/* Skip label */}
            <View style={styles.adHeader}>
              <Text style={styles.adTag}>AD</Text>
              <Text style={styles.skipLabel}>Lewati dalam {countdown}s</Text>
            </View>

            {/* Fake ad card */}
            <View style={[styles.adCard, { borderColor: adContent.color + '60' }]}>
              <Text style={styles.adEmoji}>{adContent.emoji}</Text>
              <Text style={[styles.adTitle, { color: adContent.color }]}>{adContent.title}</Text>
              <Text style={styles.adDesc}>{adContent.desc}</Text>
              <View style={[styles.adCta, { backgroundColor: adContent.color }]}>
                <Text style={styles.adCtaText}>PELAJARI SELENGKAPNYA</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBg}>
              <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: adContent.color }]} />
            </View>

            <Text style={styles.watchingText}>🎬 Tonton iklan untuk mendapatkan 1.000 Koin</Text>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.rewardContainer,
              { backgroundColor: glowColor, opacity: rewardOpacity, transform: [{ scale: rewardScale }] },
            ]}
          >
            <Animated.Text style={[styles.rewardEmoji, { transform: [{ scale: coinBounce }] }]}>
              🪙
            </Animated.Text>
            <Text style={styles.rewardTitle}>KOIN DITERIMA!</Text>
            <Text style={styles.rewardAmount}>+1.000 Koin</Text>
            <Text style={styles.rewardSub}>Terima kasih sudah menonton!</Text>

            <Pressable
              onPress={() => onClose(true)}
              style={({ pressed }) => [styles.claimBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
            >
              <Text style={styles.claimBtnText}>KLAIM KOIN ✓</Text>
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  adContainer: {
    width: '100%',
    gap: Spacing.md,
    alignItems: 'center',
  },
  adHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  adTag: {
    backgroundColor: Colors.textMuted,
    color: Colors.background,
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    letterSpacing: 1,
  },
  skipLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  adCard: {
    width: '100%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
  },
  adEmoji: {
    fontSize: 56,
  },
  adTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
  adDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  adCta: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  adCtaText: {
    color: '#FFFFFF',
    fontSize: FontSize.sm,
    fontWeight: '900',
    letterSpacing: 1,
  },
  progressBg: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  watchingText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  rewardContainer: {
    width: 280,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.win,
    backgroundColor: Colors.surface,
  },
  rewardEmoji: {
    fontSize: 72,
  },
  rewardTitle: {
    color: Colors.win,
    fontSize: FontSize.xl,
    fontWeight: '900',
    letterSpacing: 2,
  },
  rewardAmount: {
    color: Colors.textGold,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rewardSub: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  claimBtn: {
    backgroundColor: Colors.win,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  claimBtnText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

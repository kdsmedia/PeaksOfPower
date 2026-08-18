import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

interface GameCard {
  id: string;
  title: string;
  subtitle: string;
  rtp: string;
  maxWin: string;
  volatility: string;
  badge?: string;
  emoji: string;
  isActive?: boolean;
}

const GAMES: GameCard[] = [
  {
    id: 'peaks',
    title: 'Peaks of Power',
    subtitle: 'Cascading reels · Cluster pays',
    rtp: '96.5%',
    maxWin: '5,000×',
    volatility: 'Very High',
    badge: 'PLAY NOW',
    emoji: '⚡',
    isActive: true,
  },
  {
    id: 'titans',
    title: 'Titan\'s Vault',
    subtitle: 'Megaways™ · Expanding wilds',
    rtp: '96.1%',
    maxWin: '8,000×',
    volatility: 'High',
    emoji: '🔱',
  },
  {
    id: 'oracle',
    title: 'Oracle of Fortune',
    subtitle: 'Free spins · Bonus buy',
    rtp: '95.8%',
    maxWin: '3,500×',
    volatility: 'Medium',
    badge: 'NEW',
    emoji: '🔮',
  },
  {
    id: 'hydra',
    title: 'Hydra Rising',
    subtitle: 'Sticky wilds · Respin',
    rtp: '96.3%',
    maxWin: '6,000×',
    volatility: 'High',
    emoji: '🐉',
  },
  {
    id: 'athens',
    title: 'Athens Gold',
    subtitle: 'Hold & Win · Jackpots',
    rtp: '95.5%',
    maxWin: '10,000×',
    volatility: 'High',
    badge: 'JACKPOT',
    emoji: '🏛️',
  },
  {
    id: 'nectar',
    title: 'Divine Nectar',
    subtitle: 'Ways to win · Multipliers',
    rtp: '96.0%',
    maxWin: '4,200×',
    volatility: 'Medium',
    emoji: '🍯',
  },
];

const VOLATILITY_COLOR: Record<string, string> = {
  Low: Colors.win,
  Medium: Colors.primary,
  High: Colors.accent,
  'Very High': Colors.scatter,
};

export default function LobbyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GAME LOBBY</Text>
        <Text style={styles.headerSub}>Select your adventure</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
      >
        {/* Featured banner */}
        <View style={styles.featured}>
          <View style={styles.featuredBg}>
            <Text style={styles.featuredBgEmoji}>⚡</Text>
          </View>
          <View style={styles.featuredOverlay}>
            <Text style={styles.featuredLabel}>FEATURED GAME</Text>
            <Text style={styles.featuredTitle}>⚡ Peaks of Power</Text>
            <Text style={styles.featuredSub}>96.5% RTP · 5,000× MAX WIN</Text>
            <Pressable
              onPress={() => router.push('/')}
              style={({ pressed }) => [styles.featuredBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.featuredBtnText}>PLAY NOW</Text>
            </Pressable>
          </View>
        </View>

        {/* Game grid */}
        <Text style={styles.sectionTitle}>ALL GAMES</Text>
        <View style={styles.grid}>
          {GAMES.map(game => (
            <Pressable
              key={game.id}
              onPress={() => game.isActive ? router.push('/') : null}
              style={({ pressed }) => [
                styles.card,
                !game.isActive && styles.cardLocked,
                pressed && game.isActive && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              {game.badge ? (
                <View style={[styles.cardBadge, game.badge === 'JACKPOT' && styles.jackpotBadge]}>
                  <Text style={styles.cardBadgeText}>{game.badge}</Text>
                </View>
              ) : null}

              <Text style={styles.cardEmoji}>{game.emoji}</Text>
              <Text style={styles.cardTitle}>{game.title}</Text>
              <Text style={styles.cardSub}>{game.subtitle}</Text>

              <View style={styles.cardStats}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>RTP</Text>
                  <Text style={styles.statVal}>{game.rtp}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>MAX</Text>
                  <Text style={[styles.statVal, { color: Colors.primary }]}>{game.maxWin}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>VOL</Text>
                  <Text style={[styles.statVal, { color: VOLATILITY_COLOR[game.volatility] }]}>
                    {game.volatility.split(' ')[0]}
                  </Text>
                </View>
              </View>

              {!game.isActive && (
                <View style={styles.comingSoon}>
                  <Text style={styles.comingSoonText}>COMING SOON</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.textGold,
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  featured: {
    height: 180,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'flex-end',
  },
  featuredBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  featuredBgEmoji: {
    fontSize: 80,
    opacity: 0.3,
  },
  featuredOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    padding: Spacing.md,
    justifyContent: 'flex-end',
    background: 'transparent',
  },
  featuredLabel: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  featuredTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '900',
    letterSpacing: 1,
  },
  featuredSub: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  featuredBtn: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  featuredBtnText: {
    color: Colors.background,
    fontSize: FontSize.sm,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  card: {
    width: '47.5%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  jackpotBadge: {
    backgroundColor: Colors.accent,
  },
  cardBadgeText: {
    color: Colors.background,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSub: {
    color: Colors.textMuted,
    fontSize: 11,
    marginBottom: Spacing.sm,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    padding: 6,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statVal: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  comingSoon: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(13,5,32,0.5)',
    borderRadius: Radius.lg,
  },
  comingSoonText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

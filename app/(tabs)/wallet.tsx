import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWallet } from '@/hooks/useWallet';
import { AdRewardModal } from '@/components/feature/AdRewardModal';
import { WithdrawalModal } from '@/components/feature/WithdrawalModal';

const MIN_WITHDRAW = 10000;
const REQUIRED_ADS = 300;
const KOIN_TO_RUPIAH = 10000;

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { koin, adRewardCount, withdrawalHistory } = useWallet();
  const [showAd, setShowAd] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const koinAnim = useRef(new Animated.Value(1)).current;
  const prevKoin = useRef(koin);

  useEffect(() => {
    if (koin !== prevKoin.current) {
      Animated.sequence([
        Animated.timing(koinAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.spring(koinAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      ]).start();
      prevKoin.current = koin;
    }
  }, [koin]);

  const adProgressPct = Math.min((adRewardCount / REQUIRED_ADS) * 100, 100);
  const canWithdraw = adRewardCount >= REQUIRED_ADS && koin >= MIN_WITHDRAW;
  const rupiahValue = Math.floor((koin / KOIN_TO_RUPIAH) * 100);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🪙 DOMPET KOIN</Text>
        <Text style={styles.headerSub}>Kumpulkan & cairkan</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
      >
        {/* Koin balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLbl}>Total Koin Kamu</Text>
          <Animated.Text style={[styles.balanceKoin, { transform: [{ scale: koinAnim }] }]}>
            🪙 {koin.toLocaleString('id')}
          </Animated.Text>
          <Text style={styles.balanceRp}>≈ Rp{rupiahValue.toLocaleString('id')}</Text>
          <Text style={styles.rateNote}>10.000 Koin = Rp100</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => setShowAd(true)}
            style={({ pressed }) => [styles.actionBtn, styles.adBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
          >
            <Text style={styles.actionBtnEmoji}>🎬</Text>
            <Text style={styles.actionBtnTitle}>KOIN GRATIS</Text>
            <Text style={styles.actionBtnSub}>+1.000 Koin/iklan</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowWithdraw(true)}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.withdrawBtn,
              !canWithdraw && styles.actionBtnDisabled,
              pressed && canWithdraw && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.actionBtnEmoji}>💸</Text>
            <Text style={[styles.actionBtnTitle, !canWithdraw && { color: Colors.textMuted }]}>TARIK KOIN</Text>
            <Text style={styles.actionBtnSub}>Min. 10.000 Koin</Text>
          </Pressable>
        </View>

        {/* Ad progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Progress Iklan</Text>
            <Text style={[styles.sectionBadge, adRewardCount >= REQUIRED_ADS ? styles.badgeOk : styles.badgePending]}>
              {adRewardCount >= REQUIRED_ADS ? '✓ SELESAI' : `${adRewardCount}/${REQUIRED_ADS}`}
            </Text>
          </View>
          <Text style={styles.sectionDesc}>
            Tonton {REQUIRED_ADS}× iklan untuk membuka fitur penarikan
          </Text>
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressFill, { width: `${adProgressPct}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLbl}>0</Text>
            <Text style={styles.progressLbl}>{adRewardCount >= REQUIRED_ADS ? '✓ Terpenuhi' : `${Math.round(adProgressPct)}%`}</Text>
            <Text style={styles.progressLbl}>{REQUIRED_ADS}</Text>
          </View>

          <Pressable
            onPress={() => setShowAd(true)}
            style={({ pressed }) => [styles.watchAdBtn, pressed && { opacity: 0.85 }]}
          >
            <MaterialIcons name="play-circle-filled" size={20} color={Colors.background} />
            <Text style={styles.watchAdBtnText}>TONTON IKLAN (+1.000 Koin)</Text>
          </Pressable>
        </View>

        {/* Info cards */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>👁️</Text>
            <Text style={styles.infoValue}>{adRewardCount.toLocaleString('id')}×</Text>
            <Text style={styles.infoLabel}>Iklan Ditonton</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🪙</Text>
            <Text style={styles.infoValue}>{(adRewardCount * 1000).toLocaleString('id')}</Text>
            <Text style={styles.infoLabel}>Total Koin Didapat</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💸</Text>
            <Text style={styles.infoValue}>{withdrawalHistory.length}×</Text>
            <Text style={styles.infoLabel}>Penarikan</Text>
          </View>
        </View>

        {/* Rules */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>📋 Syarat & Ketentuan</Text>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleDot}>•</Text>
            <Text style={styles.ruleText}>1 kali tonton iklan = 1.000 Koin</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleDot}>•</Text>
            <Text style={styles.ruleText}>10.000 Koin = Rp100</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleDot}>•</Text>
            <Text style={styles.ruleText}>Minimum penarikan: 10.000 Koin (Rp100)</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleDot}>•</Text>
            <Text style={styles.ruleText}>Wajib menonton 300× iklan untuk mencairkan</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleDot}>•</Text>
            <Text style={styles.ruleText}>Metode: DANA / OVO</Text>
          </View>
          <View style={styles.ruleItem}>
            <Text style={styles.ruleDot}>•</Text>
            <Text style={styles.ruleText}>Proses pencairan 1×24 jam</Text>
          </View>
        </View>

        {/* History */}
        {withdrawalHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riwayat Penarikan</Text>
            {withdrawalHistory.map(record => (
              <View key={record.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyMethod}>{record.method}</Text>
                  <Text style={styles.historyAcct}>{record.accountNumber}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(record.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyKoin}>-{record.koin.toLocaleString('id')} 🪙</Text>
                  <Text style={styles.historyRp}>Rp{record.rupiah.toLocaleString('id')}</Text>
                  <View style={[styles.statusBadge, record.status === 'processed' ? styles.statusDone : styles.statusPend]}>
                    <Text style={styles.statusText}>
                      {record.status === 'processed' ? '✓ Selesai' : '⏳ Proses'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <AdRewardModal visible={showAd} onClose={() => setShowAd(false)} />
      <WithdrawalModal visible={showWithdraw} onClose={() => setShowWithdraw(false)} />
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
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  balanceCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '60',
    gap: 4,
  },
  balanceLbl: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  balanceKoin: {
    color: Colors.textGold,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 1,
  },
  balanceRp: {
    color: Colors.win,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  rateNote: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  adBtn: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  withdrawBtn: {
    backgroundColor: Colors.win + '15',
    borderColor: Colors.win,
  },
  actionBtnDisabled: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  actionBtnEmoji: {
    fontSize: 32,
  },
  actionBtnTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '900',
    letterSpacing: 1,
  },
  actionBtnSub: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeOk: { color: Colors.win },
  badgePending: { color: Colors.accent },
  sectionDesc: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  progressBg: {
    height: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLbl: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  watchAdBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  watchAdBtnText: {
    color: Colors.background,
    fontSize: FontSize.sm,
    fontWeight: '900',
    letterSpacing: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  infoIcon: { fontSize: 24 },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  rulesCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  rulesTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  ruleDot: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 1,
  },
  ruleText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyLeft: { gap: 2 },
  historyMethod: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  historyAcct: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  historyDate: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyKoin: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  historyRp: {
    color: Colors.win,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusDone: { backgroundColor: Colors.win + '20' },
  statusPend: { backgroundColor: Colors.accent + '20' },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});

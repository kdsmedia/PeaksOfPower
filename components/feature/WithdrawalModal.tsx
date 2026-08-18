import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { useWallet } from '@/hooks/useWallet';
import { useAlert } from '@/template';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const MIN_WITHDRAW = 10000;
const REQUIRED_ADS = 300;
const KOIN_TO_RUPIAH = 10000; // 10000 koin = Rp100

export function WithdrawalModal({ visible, onClose }: Props) {
  const { koin, adRewardCount, withdraw } = useWallet();
  const { showAlert } = useAlert();
  const [method, setMethod] = useState<'DANA' | 'OVO'>('DANA');
  const [accountNumber, setAccountNumber] = useState('');
  const [koinAmount, setKoinAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setAccountNumber('');
      setKoinAmount('');
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const koinNum = parseInt(koinAmount.replace(/\D/g, ''), 10) || 0;
  const rupiahPreview = Math.floor((koinNum / KOIN_TO_RUPIAH) * 100);
  const canWithdraw = adRewardCount >= REQUIRED_ADS;
  const progressPct = Math.min((adRewardCount / REQUIRED_ADS) * 100, 100);

  const handleWithdraw = () => {
    if (!accountNumber.trim()) {
      showAlert('Lengkapi Data', 'Masukkan nomor akun ' + method);
      return;
    }
    if (koinNum < MIN_WITHDRAW) {
      showAlert('Jumlah Kurang', `Minimum penarikan adalah ${MIN_WITHDRAW.toLocaleString('id')} Koin`);
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const result = withdraw(method, accountNumber.trim(), koinNum);
      setIsSubmitting(false);
      if (result.success) {
        showAlert('Penarikan Berhasil! 🎉', result.message);
        onClose();
      } else {
        showAlert('Gagal', result.message);
      }
    }, 800);
  };

  const setMaxKoin = () => {
    const max = Math.floor(koin / MIN_WITHDRAW) * MIN_WITHDRAW;
    setKoinAmount(max > 0 ? max.toString() : '0');
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="none">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.overlay, { opacity: bgOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>💸 Tarik Koin</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <MaterialIcons name="close" size={24} color={Colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {/* Balance card */}
              <View style={styles.balanceCard}>
                <View style={styles.balanceRow}>
                  <View>
                    <Text style={styles.balanceLabel}>Saldo Koin</Text>
                    <Text style={styles.balanceValue}>🪙 {koin.toLocaleString('id')}</Text>
                  </View>
                  <View style={styles.separator} />
                  <View>
                    <Text style={styles.balanceLabel}>≈ Rupiah</Text>
                    <Text style={styles.balanceValueRp}>
                      Rp{Math.floor((koin / KOIN_TO_RUPIAH) * 100).toLocaleString('id')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.rateNote}>10.000 Koin = Rp100</Text>
              </View>

              {/* Ad progress requirement */}
              <View style={styles.requireCard}>
                <View style={styles.requireHeader}>
                  <Text style={styles.requireTitle}>Syarat Penarikan</Text>
                  <Text style={[styles.requireStatus, canWithdraw ? styles.statusOk : styles.statusPending]}>
                    {canWithdraw ? '✓ TERPENUHI' : `${adRewardCount}/${REQUIRED_ADS}`}
                  </Text>
                </View>
                <Text style={styles.requireDesc}>Tonton iklan minimal {REQUIRED_ADS}× untuk mengaktifkan penarikan</Text>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                </View>
                {!canWithdraw && (
                  <Text style={styles.requireRemain}>
                    Kurang {REQUIRED_ADS - adRewardCount}× iklan lagi
                  </Text>
                )}
              </View>

              {/* Method selector */}
              <Text style={styles.sectionLabel}>Metode Pembayaran</Text>
              <View style={styles.methodRow}>
                {(['DANA', 'OVO'] as const).map(m => (
                  <Pressable
                    key={m}
                    onPress={() => setMethod(m)}
                    style={[styles.methodBtn, method === m && styles.methodBtnActive]}
                  >
                    <Text style={styles.methodEmoji}>
                      {m === 'DANA' ? '🔵' : '🟣'}
                    </Text>
                    <Text style={[styles.methodLabel, method === m && styles.methodLabelActive]}>
                      {m}
                    </Text>
                    {method === m && (
                      <MaterialIcons name="check-circle" size={16} color={Colors.win} style={{ marginLeft: 4 }} />
                    )}
                  </Pressable>
                ))}
              </View>

              {/* Account number */}
              <Text style={styles.sectionLabel}>Nomor {method}</Text>
              <View style={styles.inputWrap}>
                <MaterialIcons name="phone" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder={`Masukkan nomor ${method}`}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={15}
                  selectionColor={Colors.primary}
                />
              </View>

              {/* Koin amount */}
              <View style={styles.amountHeader}>
                <Text style={styles.sectionLabel}>Jumlah Koin</Text>
                <Pressable onPress={setMaxKoin}>
                  <Text style={styles.maxBtn}>MAKS</Text>
                </Pressable>
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>🪙</Text>
                <TextInput
                  style={styles.input}
                  value={koinAmount}
                  onChangeText={v => setKoinAmount(v.replace(/\D/g, ''))}
                  placeholder="Min. 10.000"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  selectionColor={Colors.primary}
                />
              </View>
              {koinNum >= MIN_WITHDRAW && (
                <Text style={styles.convertNote}>
                  ≈ Rp{rupiahPreview.toLocaleString('id')} yang akan diterima
                </Text>
              )}

              {/* Minimum note */}
              <View style={styles.noteBox}>
                <MaterialIcons name="info-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.noteText}>
                  Minimum penarikan {MIN_WITHDRAW.toLocaleString('id')} Koin (Rp100). Proses 1×24 jam.
                </Text>
              </View>

              {/* Submit */}
              <Pressable
                onPress={handleWithdraw}
                disabled={!canWithdraw || isSubmitting || koinNum < MIN_WITHDRAW}
                style={({ pressed }) => [
                  styles.submitBtn,
                  (!canWithdraw || koinNum < MIN_WITHDRAW) && styles.submitBtnDisabled,
                  pressed && canWithdraw && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.submitBtnText, (!canWithdraw || koinNum < MIN_WITHDRAW) && styles.submitBtnTextDisabled]}>
                  {isSubmitting ? 'Memproses...' : '💸 TARIK SEKARANG'}
                </Text>
              </Pressable>

              <View style={{ height: Spacing.xl }} />
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: 1,
  },
  balanceCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  balanceLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  balanceValue: {
    color: Colors.textGold,
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  balanceValueRp: {
    color: Colors.win,
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  rateNote: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  requireCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  requireHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requireTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  requireStatus: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusOk: { color: Colors.win },
  statusPending: { color: Colors.accent },
  requireDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  requireRemain: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  methodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  methodBtnActive: {
    borderColor: Colors.win,
    backgroundColor: Colors.win + '15',
  },
  methodEmoji: {
    fontSize: 18,
  },
  methodLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 1,
  },
  methodLabelActive: {
    color: Colors.win,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  maxBtn: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  convertNote: {
    color: Colors.win,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  noteBox: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noteText: {
    color: Colors.textMuted,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    backgroundColor: Colors.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: Colors.background,
    fontSize: FontSize.md,
    fontWeight: '900',
    letterSpacing: 1,
  },
  submitBtnTextDisabled: {
    color: Colors.textMuted,
  },
});

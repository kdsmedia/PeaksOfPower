import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';
import { SYMBOLS, SymbolId } from '@/constants/gameConfig';

interface Props {
  bet: number;
}

const DISPLAY_SYMBOLS: SymbolId[] = ['zeus', 'chalice', 'crown', 'ring', 'gem', 'coin', 'flower', 'hourglass'];

export function PayTable({ bet }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.7 }]}
      >
        <MaterialIcons name="info-outline" size={18} color={Colors.textSecondary} />
        <Text style={styles.triggerText}>PAYTABLE</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>PAYTABLE</Text>
              <Pressable onPress={() => setVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.subtitle}>Cluster pays (8+ matching symbols)</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {DISPLAY_SYMBOLS.map(id => {
                const sym = SYMBOLS[id];
                const payoutEntries = Object.entries(sym.payouts)
                  .map(([size, mult]) => ({ size: Number(size), mult }))
                  .sort((a, b) => a.size - b.size);

                return (
                  <View key={id} style={styles.symRow}>
                    <Text style={styles.symEmoji}>{sym.emoji}</Text>
                    <View style={styles.symInfo}>
                      <Text style={[styles.symName, { color: sym.color }]}>{sym.label}</Text>
                      <View style={styles.payouts}>
                        {payoutEntries.map(({ size, mult }) => (
                          <View key={size} style={styles.payoutChip}>
                            <Text style={styles.payoutSize}>{size}+</Text>
                            <Text style={styles.payoutMult}>×{mult}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })}

              <View style={styles.scatterSection}>
                <Text style={styles.scatterTitle}>🔮 ORB (SCATTER)</Text>
                <Text style={styles.scatterDesc}>4+ Orbs anywhere = 15 FREE SPINS</Text>
                <Text style={styles.scatterDesc}>Orbs carry multipliers during Free Spins</Text>
                <Text style={styles.scatterDesc}>Landing 4+ Orbs in Free Spins = +10 Extra Spins</Text>
              </View>

              <View style={styles.rulesSection}>
                <Text style={styles.rulesTitle}>HOW TO PLAY</Text>
                <Text style={styles.rule}>• 6×5 grid, pay anywhere</Text>
                <Text style={styles.rule}>• Minimum 8 matching symbols to win</Text>
                <Text style={styles.rule}>• Winning symbols removed, new ones fall (cascade)</Text>
                <Text style={styles.rule}>• Multiplier increases by ×1 each cascade step</Text>
                <Text style={styles.rule}>• Free Spins: multipliers accumulate and don't reset</Text>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  triggerText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modal: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    color: Colors.textGold,
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  symRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  symEmoji: {
    fontSize: 32,
    marginRight: Spacing.sm,
  },
  symInfo: {
    flex: 1,
  },
  symName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  payouts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  payoutChip: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  payoutSize: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  payoutMult: {
    color: Colors.textGold,
    fontSize: 11,
    fontWeight: '800',
  },
  scatterSection: {
    backgroundColor: Colors.scatter + '20',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.scatter + '60',
  },
  scatterTitle: {
    color: Colors.scatter,
    fontSize: FontSize.md,
    fontWeight: '800',
    marginBottom: 6,
  },
  scatterDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
  rulesSection: {
    marginBottom: Spacing.md,
  },
  rulesTitle: {
    color: Colors.textGold,
    fontSize: FontSize.sm,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  rule: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Hint } from '../src/types';

interface HintPanelProps {
  hint: Hint | null;
  currentLevel: 1 | 2 | 3;
  onLevelChange: (level: 1 | 2 | 3) => void;
  onRequestHint: () => void;
  hintCount: number;
}

export default function HintPanel({
  hint,
  currentLevel,
  onLevelChange,
  onRequestHint,
  hintCount,
}: HintPanelProps) {

  const levelLabels: Record<1 | 2 | 3, string> = {
    1: 'Dove guardare',
    2: 'Quale tecnica',
    3: 'La risposta',
  };

  const levelColors: Record<1 | 2 | 3, string> = {
    1: '#1D9E75',
    2: '#BA7517',
    3: '#D85A30',
  };

  const levelBg: Record<1 | 2 | 3, string> = {
    1: '#E1F5EE',
    2: '#FAEEDA',
    3: '#FAECE7',
  };

  return (
    <View style={styles.container}>
      {/* Selettore livello */}
      <View style={styles.levelRow}>
        {([1, 2, 3] as const).map(lv => (
          <TouchableOpacity
            key={lv}
            style={[
              styles.levelBtn,
              currentLevel === lv && {
                backgroundColor: levelBg[lv],
                borderColor: levelColors[lv],
              },
            ]}
            onPress={() => onLevelChange(lv)}
          >
            <Text
              style={[
                styles.levelBtnText,
                currentLevel === lv && { color: levelColors[lv] },
              ]}
            >
              {levelLabels[lv]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Testo indizio */}
      {hint ? (
        <View style={[styles.hintBox, { backgroundColor: levelBg[hint.level] }]}>
          <View style={styles.hintHeader}>
            <Text style={[styles.techniqueName, { color: levelColors[hint.level] }]}>
              {hint.techniqueName}
            </Text>
            <Text style={[styles.levelBadge, { color: levelColors[hint.level], backgroundColor: '#FFFFFF' }]}>
              Livello {hint.level}
            </Text>
          </View>
          <Text style={styles.hintText}>{hint.description}</Text>
        </View>
      ) : (
        <View style={styles.emptyHint}>
          <Text style={styles.emptyHintText}>
            Premi "Chiedi indizio" per ricevere aiuto
          </Text>
        </View>
      )}

      {/* Pulsante principale */}
      <TouchableOpacity style={styles.hintButton} onPress={onRequestHint}>
        <Text style={styles.hintButtonText}>💡 Chiedi indizio</Text>
      </TouchableOpacity>

      {hintCount > 0 && (
        <Text style={styles.hintCount}>Indizi usati: {hintCount}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#B4B2A9',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  levelBtnText: {
    fontSize: 12,
    color: '#5F5E5A',
    fontWeight: '500',
  },
  hintBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  techniqueName: {
    fontSize: 14,
    fontWeight: '600',
  },
  levelBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  hintText: {
    fontSize: 13,
    color: '#444441',
    lineHeight: 19,
  },
  emptyHint: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#F1EFE8',
    marginBottom: 12,
    alignItems: 'center',
  },
  emptyHintText: {
    fontSize: 13,
    color: '#888780',
    textAlign: 'center',
  },
  hintButton: {
    backgroundColor: '#3C3489',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  hintButtonText: {
    color: '#CECBF6',
    fontSize: 15,
    fontWeight: '600',
  },
  hintCount: {
    fontSize: 12,
    color: '#888780',
    textAlign: 'center',
    marginTop: 8,
  },
});

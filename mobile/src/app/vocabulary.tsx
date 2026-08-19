import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, rtlText, shadows } from '@/theme';

type Level = 'A2' | 'B1' | 'B2' | 'C1';

type Flashcard = {
  level: Level;
  word: string;
  pronunciation: string;
  type: string;
  definition: string;
  arabic: string;
  example: string;
};

const levels: Level[] = ['A2', 'B1', 'B2', 'C1'];

const flashcards: Flashcard[] = [
  {
    level: 'A2',
    word: 'Travel',
    pronunciation: 'tra.v',
    type: 'V.',
    definition: 'To go from one place to another.',
    arabic: 'يسافر',
    example: 'Many students travel to practise English.',
  },
  {
    level: 'A2',
    word: 'Improve',
    pronunciation: 'im.p',
    type: 'V.',
    definition: 'To become better or make something better.',
    arabic: 'يحسن',
    example: 'Reading every day can improve your vocabulary.',
  },
  {
    level: 'B1',
    word: 'Evidence',
    pronunciation: 'evi.d',
    type: 'N.',
    definition: 'Facts or information that show something is true.',
    arabic: 'دليل',
    example: 'The writer gives evidence to support the opinion.',
  },
  {
    level: 'B1',
    word: 'Maintain',
    pronunciation: 'mai.n',
    type: 'V.',
    definition: 'To keep something at the same level or condition.',
    arabic: 'يحافظ على',
    example: 'It is important to maintain a healthy lifestyle.',
  },
  {
    level: 'B2',
    word: 'Significant',
    pronunciation: 'sig.n',
    type: 'Adj.',
    definition: 'Large or important enough to be noticed.',
    arabic: 'مهم / كبير',
    example: 'Technology has had a significant effect on education.',
  },
  {
    level: 'B2',
    word: 'Furthermore',
    pronunciation: 'fur.t',
    type: 'Adv.',
    definition: 'In addition to what has already been said.',
    arabic: 'علاوة على ذلك',
    example: 'Furthermore, online learning can reduce travel time.',
  },
  {
    level: 'C1',
    word: 'Consequently',
    pronunciation: 'con.s',
    type: 'Adv.',
    definition: 'As a result of something.',
    arabic: 'وبالتالي',
    example: 'The policy changed; consequently, costs decreased.',
  },
  {
    level: 'C1',
    word: 'Nonetheless',
    pronunciation: 'non.e',
    type: 'Adv.',
    definition: 'Despite what has just been said.',
    arabic: 'ومع ذلك',
    example: 'The task was difficult; nonetheless, she completed it.',
  },
];

export default function VocabularyScreen() {
  const [level, setLevel] = useState<Level>('A2');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const cards = useMemo(() => flashcards.filter((card) => card.level === level), [level]);
  const selected = cards[selectedIndex] ?? cards[0];

  function selectLevel(nextLevel: Level) {
    setLevel(nextLevel);
    setSelectedIndex(0);
    setFlipped(false);
  }

  function selectCard(index: number) {
    setSelectedIndex(index);
    setFlipped(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Vocabulary</Text>
        <Text style={styles.subtitle}>Flashcards Task</Text>
      </View>

      <View style={styles.levelRow}>
        {levels.map((candidate) => {
          const active = candidate === level;

          return (
            <Pressable
              key={candidate}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => selectLevel(candidate)}
              style={[styles.levelPill, active ? styles.levelPillActive : null]}
            >
              <Text style={active ? styles.levelTextActive : styles.levelText}>{candidate}</Text>
            </Pressable>
          );
        })}
      </View>

      {selected ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${selected.word} flashcard`}
          onPress={() => setFlipped((value) => !value)}
          style={StyleSheet.flatten([styles.focusCard, shadows.card])}
        >
          {!flipped ? (
            <View style={styles.frontFace}>
              <View style={styles.cardLevel}>
                <Text style={styles.cardLevelText}>{selected.level}</Text>
              </View>
              <Text style={styles.word}>{selected.word}</Text>
              <View style={styles.pronunciationRow}>
                <Ionicons name="volume-high-outline" size={20} color={colors.brandNavy} />
                <Text style={styles.pronunciation}>{selected.pronunciation}</Text>
                <Text style={styles.uk}>🇬🇧</Text>
              </View>
              <View style={styles.flipHint}>
                <Ionicons name="refresh" size={18} color="#fff" />
              </View>
            </View>
          ) : (
            <View style={styles.backFace}>
              <Text style={styles.definition}>
                <Text style={styles.type}>{selected.type} </Text>
                {selected.definition}
              </Text>
              <View style={styles.divider} />
              <Text style={[styles.arabic, rtlText]}>{selected.arabic}</Text>
              <View style={styles.divider} />
              <Text style={styles.example}>{selected.example}</Text>
              <View style={styles.flipHint}>
                <Ionicons name="refresh" size={18} color="#fff" />
              </View>
            </View>
          )}
        </Pressable>
      ) : null}

      <View style={styles.cardGrid}>
        {cards.map((card, index) => {
          const active = index === selectedIndex;

          return (
            <Pressable
              key={`${card.level}-${card.word}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => selectCard(index)}
              style={[styles.wordCard, active ? styles.wordCardActive : null]}
            >
              <Text style={active ? styles.wordCardTextActive : styles.wordCardText}>
                {card.word}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 16, paddingBottom: 36 },
  header: { alignItems: 'center', marginTop: 8, marginBottom: 18 },
  title: { color: colors.brandNavy, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 4 },
  levelRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  levelPill: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    paddingVertical: 10,
    alignItems: 'center',
  },
  levelPillActive: { backgroundColor: colors.brandNavy, borderColor: colors.brandNavy },
  levelText: { color: colors.brandNavy, fontWeight: '700' },
  levelTextActive: { color: '#fff', fontWeight: '800' },
  focusCard: {
    minHeight: 280,
    borderRadius: 24,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  frontFace: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backFace: {
    flex: 1,
    minHeight: 280,
    justifyContent: 'center',
    padding: 24,
  },
  cardLevel: {
    position: 'absolute',
    top: 18,
    left: 18,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cardLevelText: { color: colors.brandNavy, fontWeight: '800' },
  word: { color: colors.brandNavy, fontSize: 40, fontWeight: '800' },
  pronunciationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  pronunciation: { color: colors.muted, fontSize: 18, fontWeight: '600' },
  uk: { fontSize: 20 },
  flipHint: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brandNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  definition: { color: colors.ink, fontSize: 20, lineHeight: 28, textAlign: 'center' },
  type: { color: colors.brandNavy, fontWeight: '800' },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 18 },
  arabic: { color: colors.ink, fontSize: 22, fontWeight: '700' },
  example: { color: colors.muted, fontSize: 17, lineHeight: 24, textAlign: 'center' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  wordCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.card,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  wordCardActive: { borderColor: colors.brandNavy, backgroundColor: '#eff6ff' },
  wordCardText: { color: colors.ink, fontWeight: '700' },
  wordCardTextActive: { color: colors.brandNavy, fontWeight: '800' },
});

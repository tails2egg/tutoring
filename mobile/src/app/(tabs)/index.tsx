import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useContent } from '@/api';
import { SectionIcon } from '@/components/ui';
import { HOME, HomePayload } from '@/content';
import { colors, rtlText, sectionColor, shadows } from '@/theme';

export default function IeltsHomeScreen() {
  const { data } = useContent<HomePayload>('/api/home', HOME);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.titleRow}>
        <Text style={styles.ielts}>IELTS</Text>
        <Text style={styles.mockTest}>{data.mock_test.name}</Text>
      </View>

      <View style={styles.hintRow}>
        <View style={styles.hintBubble}>
          <Text style={[styles.hintText, rtlText]}>{data.mock_test.hint}</Text>
        </View>
        <View style={styles.avatarDot} />
      </View>

      <Link href="/vocabulary" asChild>
        <Pressable style={StyleSheet.flatten([styles.flashTaskButton, shadows.soft])}>
          <View style={styles.flashTaskIcon}>
            <Ionicons name="albums-outline" size={24} color="#fff" />
          </View>
          <Text style={styles.flashTaskText}>Flashcards Task</Text>
          <Ionicons name="arrow-back" size={22} color={colors.brandNavy} />
        </Pressable>
      </Link>

      <View style={styles.fullTestBlock}>
        <View style={styles.scoreTabRight}>
          <Text style={styles.scoreTabText}>{data.full_test.score}</Text>
        </View>

        <Link href="/ielts/exams" asChild>
          <Pressable style={StyleSheet.flatten([styles.fullTestCard, shadows.soft])}>
            <Ionicons name="grid-outline" size={22} color="#6b7280" />
            <View style={styles.flex}>
              <View style={styles.fullTestTitle}>
                <Text style={styles.fullTestWord}>Take</Text>
                <Text style={[styles.fullTestWord, styles.red]}> Full </Text>
                <Text style={styles.fullTestWord}>Test</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#8e81f2', '#35a5dd', '#79c698']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${data.full_test.progress}%` }]}
                >
                  <Text style={styles.progressText}>{data.full_test.progress}%</Text>
                </LinearGradient>
              </View>
            </View>
            <Ionicons name="arrow-back" size={22} color={colors.ieltsRed} />
          </Pressable>
        </Link>
      </View>

      <View style={styles.sectionGrid}>
        {data.sections.map((section) => (
          <View key={section.slug} style={styles.sectionColumn}>
            <View
              style={[
                styles.scoreTab,
                { backgroundColor: section.score === '0.0/9' ? '#9ca3af' : colors.ieltsRed },
              ]}
            >
              <Text style={styles.scoreTabText}>{section.score}</Text>
            </View>

            <Link href={{ pathname: '/ielts/[section]', params: { section: section.slug } }} asChild>
              <Pressable style={StyleSheet.flatten([styles.sectionCard, shadows.soft])}>
                <View style={[styles.sectionTile, { backgroundColor: sectionColor[section.slug] }]}>
                  <SectionIcon section={section.slug} />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={sectionColor[section.slug]}
                  style={styles.sectionArrow}
                />
              </Pressable>
            </Link>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 12, paddingBottom: 32 },
  flex: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 },
  ielts: { color: colors.ieltsRed, fontWeight: '800', fontSize: 28 },
  mockTest: { fontWeight: '700', fontSize: 20, color: colors.ink },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8 },
  hintBubble: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 12,
  },
  hintText: { fontWeight: '500', color: colors.ink },
  avatarDot: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1e3a8a' },
  flashTaskButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 360,
    minHeight: 76,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  flashTaskIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.brandNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashTaskText: { flex: 1, color: colors.ink, fontSize: 18, fontWeight: '700' },
  fullTestBlock: { marginTop: 20 },
  scoreTabRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#9ca3af',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  scoreTab: {
    alignSelf: 'center',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingHorizontal: 10,
  },
  scoreTabText: { color: '#fff', fontWeight: '500' },
  fullTestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
  },
  fullTestTitle: { flexDirection: 'row', alignItems: 'center' },
  fullTestWord: { fontWeight: '700', fontSize: 20, color: colors.ink },
  red: { color: colors.ieltsRed },
  progressTrack: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: { height: 20, borderRadius: 999, alignItems: 'flex-end', justifyContent: 'center' },
  progressText: { color: '#fff', fontSize: 12, marginRight: 8 },
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
    marginTop: 24,
  },
  sectionColumn: { width: '48%' },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    padding: 6,
    alignItems: 'center',
  },
  sectionTile: {
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  sectionTitle: { color: '#fff', fontWeight: '500' },
  sectionArrow: { marginTop: 10 },
});

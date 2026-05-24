import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { TranscriptEntry } from '../store/useAppStore';
import { LANGUAGES } from '../constants/languages';

interface Props {
  entry: TranscriptEntry;
}

export function TranscriptCard({ entry }: Props) {
  const srcLang = LANGUAGES.find((l) => l.code === entry.sourceLang);
  const tgtLang = LANGUAGES.find((l) => l.code === entry.targetLang);

  const playAudio = async () => {
    if (!entry.audioBase64) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${entry.audioBase64}` },
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch {}
  };

  return (
    <View style={styles.card}>
      <View style={styles.original}>
        <Text style={styles.langLabel}>{srcLang?.name}</Text>
        <Text style={styles.originalText}>{entry.originalText}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.translated}>
        <View style={styles.translatedHeader}>
          <Text style={styles.langLabel}>{tgtLang?.name}</Text>
          {entry.audioBase64 && (
            <TouchableOpacity onPress={playAudio} style={styles.playBtn}>
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.translatedText}>{entry.translatedText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,255,180,0.12)',
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
  },
  original: { padding: 14 },
  translated: { padding: 14 },
  divider: { height: 1, backgroundColor: 'rgba(0,255,180,0.1)' },
  langLabel: { color: 'rgba(0,255,180,0.7)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
  originalText: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },
  translatedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  translatedText: { color: '#fff', fontSize: 16, fontWeight: '500', marginTop: 4 },
  playBtn: { backgroundColor: 'rgba(0,255,180,0.15)', borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  playIcon: { color: '#00ffb4', fontSize: 11 },
});

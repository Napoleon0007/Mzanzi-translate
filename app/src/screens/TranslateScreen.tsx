import React, { useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useAppStore } from '../store/useAppStore';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useWebSocket } from '../hooks/useWebSocket';
import { LanguageCard } from '../components/LanguageCard';
import { MicButton } from '../components/MicButton';
import { TranscriptCard } from '../components/TranscriptCard';
import { LangCode } from '../constants/languages';

export function TranslateScreen() {
  const {
    sourceLang, targetLang, isProcessing, transcript,
    setSourceLang, setTargetLang, swapLanguages,
    setIsProcessing, addTranscriptEntry, clearTranscript, setError,
  } = useAppStore();

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const wsReady = useRef(false);

  const handleMessage = useCallback((msg: any) => {
    setIsProcessing(false);
    if (msg.status === 'success') {
      addTranscriptEntry({
        id: String(Date.now()),
        originalText: msg.original_text,
        translatedText: msg.translated_text,
        sourceLang,
        targetLang,
        audioBase64: msg.audio_base64,
        timestamp: Date.now(),
      });
      // Auto-play translation audio
      if (msg.audio_base64) {
        Audio.Sound.createAsync(
          { uri: `data:audio/mp3;base64,${msg.audio_base64}` },
          { shouldPlay: true }
        ).then(({ sound }) => {
          sound.setOnPlaybackStatusUpdate((s) => {
            if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
          });
        }).catch(() => {});
      }
    } else if (msg.status === 'no_speech') {
      setError('No speech detected — try again');
      setTimeout(() => setError(null), 2000);
    } else if (msg.error) {
      Alert.alert('Error', msg.error);
    }
  }, [sourceLang, targetLang]);

  const { connect, sendAudio, disconnect } = useWebSocket({
    onMessage: handleMessage,
    onError: (e) => { setIsProcessing(false); Alert.alert('Connection error', e); },
  });

  const handlePressIn = async () => {
    try {
      connect(sourceLang, targetLang);
      await startRecording();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handlePressOut = async () => {
    const audioBytes = await stopRecording();
    if (audioBytes) {
      setIsProcessing(true);
      sendAudio(audioBytes);
    }
  };

  return (
    <LinearGradient colors={['#04040d', '#070714', '#0a0a1a']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mzansi</Text>
          <Text style={styles.subtitle}>Voice Translate</Text>
        </View>

        {/* Language selectors */}
        <View style={styles.langRow}>
          <LanguageCard label="From" selected={sourceLang} onSelect={(c) => setSourceLang(c as LangCode)} />
          <TouchableOpacity style={styles.swapBtn} onPress={swapLanguages}>
            <Text style={styles.swapIcon}>⇄</Text>
          </TouchableOpacity>
          <LanguageCard label="To" selected={targetLang} onSelect={(c) => setTargetLang(c as LangCode)} />
        </View>

        {/* Mic */}
        <View style={styles.micArea}>
          <MicButton
            isRecording={isRecording}
            isProcessing={isProcessing}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
          <Text style={styles.micHint}>
            {isRecording ? 'Listening…' : isProcessing ? 'Translating…' : 'Hold to speak'}
          </Text>
        </View>

        {/* Transcript */}
        {transcript.length > 0 && (
          <View style={styles.transcriptHeader}>
            <Text style={styles.transcriptTitle}>Translations</Text>
            <TouchableOpacity onPress={clearTranscript}>
              <Text style={styles.clearBtn}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={transcript}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <TranscriptCard entry={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },

  header: { alignItems: 'center', paddingTop: 16, paddingBottom: 8 },
  title: { color: '#00ffb4', fontSize: 28, fontWeight: '800', letterSpacing: 2 },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' },

  langRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 20, gap: 10, alignItems: 'center' },
  swapBtn: {
    backgroundColor: 'rgba(0,255,180,0.1)',
    borderRadius: 20, width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(0,255,180,0.25)',
  },
  swapIcon: { color: '#00ffb4', fontSize: 18 },

  micArea: { alignItems: 'center', paddingVertical: 36, gap: 14 },
  micHint: { color: 'rgba(255,255,255,0.35)', fontSize: 13, letterSpacing: 0.5 },

  transcriptHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 4,
  },
  transcriptTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  clearBtn: { color: 'rgba(0,255,180,0.6)', fontSize: 13 },

  list: { paddingBottom: 24 },
});

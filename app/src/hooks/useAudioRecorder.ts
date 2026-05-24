import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

export function useAudioRecorder() {
  const recording = useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) throw new Error('Microphone permission denied');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recording.current = rec;
      setIsRecording(true);
    } catch (e: any) {
      throw new Error(e.message ?? 'Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<ArrayBuffer | null> => {
    if (!recording.current) return null;

    try {
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;
      setIsRecording(false);

      if (!uri) return null;

      const response = await fetch(uri);
      const blob = await response.blob();
      return await blob.arrayBuffer();
    } catch {
      setIsRecording(false);
      return null;
    }
  }, []);

  return { isRecording, startRecording, stopRecording };
}

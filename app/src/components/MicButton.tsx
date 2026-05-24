import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, View } from 'react-native';

interface Props {
  isRecording: boolean;
  isProcessing: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}

export function MicButton({ isRecording, isProcessing, onPressIn, onPressOut }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.18, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(glow, { toValue: 1, duration: 300, useNativeDriver: false }).start();
    } else {
      pulse.stopAnimation();
      Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      Animated.timing(glow, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
  }, [isRecording]);

  const glowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,255,180,0.15)', 'rgba(0,255,180,0.45)'],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.glowRing, { backgroundColor: glowColor, transform: [{ scale: pulse }] }]} />
      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonActive]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.85}
        disabled={isProcessing}
      >
        <Animated.Text style={[styles.icon, { transform: [{ scale: pulse }] }]}>
          {isProcessing ? '⏳' : isRecording ? '⏹' : '🎙'}
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', width: 140, height: 140 },
  glowRing: {
    position: 'absolute',
    width: 140, height: 140,
    borderRadius: 70,
  },
  button: {
    width: 100, height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,255,180,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(0,255,180,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: 'rgba(0,255,180,0.25)',
    borderColor: '#00ffb4',
  },
  icon: { fontSize: 38 },
});

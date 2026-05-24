import { create } from 'zustand';
import { LangCode } from '../constants/languages';

export interface TranscriptEntry {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLang: LangCode;
  targetLang: LangCode;
  audioBase64?: string;
  timestamp: number;
}

interface AppStore {
  sourceLang: LangCode;
  targetLang: LangCode;
  isRecording: boolean;
  isProcessing: boolean;
  transcript: TranscriptEntry[];
  error: string | null;

  setSourceLang: (lang: LangCode) => void;
  setTargetLang: (lang: LangCode) => void;
  swapLanguages: () => void;
  setIsRecording: (v: boolean) => void;
  setIsProcessing: (v: boolean) => void;
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  clearTranscript: () => void;
  setError: (msg: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  sourceLang: 'en',
  targetLang: 'zu',
  isRecording: false,
  isProcessing: false,
  transcript: [],
  error: null,

  setSourceLang: (lang) => set({ sourceLang: lang }),
  setTargetLang: (lang) => set({ targetLang: lang }),
  swapLanguages: () =>
    set((s) => ({ sourceLang: s.targetLang, targetLang: s.sourceLang })),
  setIsRecording: (v) => set({ isRecording: v }),
  setIsProcessing: (v) => set({ isProcessing: v }),
  addTranscriptEntry: (entry) =>
    set((s) => ({ transcript: [entry, ...s.transcript] })),
  clearTranscript: () => set({ transcript: [] }),
  setError: (msg) => set({ error: msg }),
}));

import { useRef, useCallback } from 'react';
import { BACKEND_WS_URL } from '../constants/languages';
import { LangCode } from '../constants/languages';

interface WSMessage {
  status: 'ready' | 'success' | 'no_speech' | 'error';
  original_text?: string;
  translated_text?: string;
  audio_base64?: string;
  error?: string;
}

interface UseWebSocketOptions {
  onMessage: (msg: WSMessage) => void;
  onError: (err: string) => void;
}

export function useWebSocket({ onMessage, onError }: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback((sourceLang: LangCode, targetLang: LangCode) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.close();
    }

    ws.current = new WebSocket(BACKEND_WS_URL);

    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ source_lang: sourceLang, target_lang: targetLang }));
    };

    ws.current.onmessage = (e) => {
      try {
        const msg: WSMessage = JSON.parse(e.data);
        onMessage(msg);
      } catch {
        onError('Invalid response from server');
      }
    };

    ws.current.onerror = () => onError('Connection error');
    ws.current.onclose = () => {};
  }, [onMessage, onError]);

  const sendAudio = useCallback((audioBytes: ArrayBuffer) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(audioBytes);
    }
  }, []);

  const disconnect = useCallback(() => {
    ws.current?.close();
    ws.current = null;
  }, []);

  return { connect, sendAudio, disconnect };
}

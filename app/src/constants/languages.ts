export type LangCode = 'en' | 'af' | 'zu' | 'xh' | 'st' | 've';

export interface Language {
  code: LangCode;
  name: string;
  flag: string;
  ttsSupported: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English',    flag: '🇿🇦', ttsSupported: true },
  { code: 'af', name: 'Afrikaans',  flag: '🇿🇦', ttsSupported: true },
  { code: 'zu', name: 'isiZulu',    flag: '🇿🇦', ttsSupported: true },
  { code: 'xh', name: 'isiXhosa',   flag: '🇿🇦', ttsSupported: true },
  { code: 'st', name: 'Sesotho',    flag: '🇿🇦', ttsSupported: true },
  { code: 've', name: 'Tshivenda',  flag: '🇿🇦', ttsSupported: false },
];

export const BACKEND_WS_URL = 'wss://mzansi-api-production.up.railway.app/ws/translate';
export const BACKEND_REST_URL = 'https://mzansi-api-production.up.railway.app';

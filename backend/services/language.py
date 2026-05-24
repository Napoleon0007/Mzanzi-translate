SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "stt": "google", "tts": True},
    "af": {"name": "Afrikaans", "stt": "google", "tts": True},
    "zu": {"name": "isiZulu", "stt": "google", "tts": True},
    "xh": {"name": "isiXhosa", "stt": "google", "tts": True},
    "st": {"name": "Sesotho", "stt": "whisper", "tts": True},
    "ve": {"name": "Tshivenda", "stt": "whisper", "tts": False},
}

# BCP-47 codes for Google STT
GOOGLE_STT_CODES = {
    "en": "en-ZA",
    "af": "af-ZA",
    "zu": "zu-ZA",
    "xh": "xh-ZA",
}

# Google TTS language codes
GOOGLE_TTS_CODES = {
    "en": "en-ZA",
    "af": "af-ZA",
    "zu": "zu-ZA",
    "xh": "xh-ZA",
    "st": "st-ZA",
}

# Whisper language names (uses full names, not codes)
WHISPER_LANG_NAMES = {
    "st": "Sotho",
    "ve": "Venda",
}


def get_stt_engine(lang_code: str) -> str:
    lang = SUPPORTED_LANGUAGES.get(lang_code)
    if not lang:
        raise ValueError(f"Unsupported language: {lang_code}")
    return lang["stt"]


def is_valid_language(lang_code: str) -> bool:
    return lang_code in SUPPORTED_LANGUAGES


def get_language_name(lang_code: str) -> str:
    return SUPPORTED_LANGUAGES.get(lang_code, {}).get("name", lang_code)

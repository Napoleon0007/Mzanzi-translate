import os
import tempfile
from google.cloud import speech
from openai import AsyncOpenAI
from services.language import GOOGLE_STT_CODES, WHISPER_LANG_NAMES, get_stt_engine

# Lazy-initialised so a missing key doesn't crash the app at import time
_openai_client = None


def _get_openai_client() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY environment variable is not set")
        _openai_client = AsyncOpenAI(api_key=api_key)
    return _openai_client


async def transcribe_audio(audio_bytes: bytes, lang_code: str) -> str:
    engine = get_stt_engine(lang_code)

    if engine == "google":
        return await _google_stt(audio_bytes, lang_code)
    else:
        return await _whisper_stt(audio_bytes, lang_code)


async def _google_stt(audio_bytes: bytes, lang_code: str) -> str:
    client = speech.SpeechClient()

    bcp47_code = GOOGLE_STT_CODES.get(lang_code, "en-ZA")

    audio = speech.RecognitionAudio(content=audio_bytes)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz=48000,
        language_code=bcp47_code,
        enable_automatic_punctuation=True,
    )

    response = client.recognize(config=config, audio=audio)

    if not response.results:
        return ""

    return response.results[0].alternatives[0].transcript


async def _whisper_stt(audio_bytes: bytes, lang_code: str) -> str:
    whisper_lang = WHISPER_LANG_NAMES.get(lang_code)

    # Write bytes to a temp file — Whisper API requires a file object
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    with open(tmp_path, "rb") as audio_file:
        kwargs = {"model": "whisper-1", "file": audio_file}
        if whisper_lang:
            kwargs["language"] = whisper_lang

        response = await _get_openai_client().audio.transcriptions.create(**kwargs)

    os.unlink(tmp_path)
    return response.text

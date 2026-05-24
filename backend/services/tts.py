import base64
from google.cloud import texttospeech
from services.language import GOOGLE_TTS_CODES

client = texttospeech.TextToSpeechClient()


async def synthesize_speech(text: str, lang_code: str) -> str | None:
    """Returns base64-encoded MP3 audio, or None if language not supported."""
    tts_code = GOOGLE_TTS_CODES.get(lang_code)
    if not tts_code:
        return None

    synthesis_input = texttospeech.SynthesisInput(text=text)

    voice = texttospeech.VoiceSelectionParams(
        language_code=tts_code,
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config,
    )

    return base64.b64encode(response.audio_content).decode("utf-8")

from pydantic import BaseModel
from typing import Optional


class TranslateRequest(BaseModel):
    text: str
    source_lang: str  # e.g. "zu", "xh", "af", "en", "st", "ve"
    target_lang: str


class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    source_lang: str
    target_lang: str
    audio_base64: Optional[str] = None  # TTS output, base64 encoded


class DetectLanguageRequest(BaseModel):
    text: str


class DetectLanguageResponse(BaseModel):
    detected_lang: str
    confidence: float


class HealthResponse(BaseModel):
    status: str
    version: str

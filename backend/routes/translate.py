import base64
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from models.schemas import TranslateRequest, TranslateResponse
from services.stt import transcribe_audio
from services.translation import translate_text
from services.tts import synthesize_speech
from services.language import is_valid_language

router = APIRouter()


@router.post("/translate", response_model=TranslateResponse)
async def translate_text_endpoint(request: TranslateRequest):
    """REST endpoint: translate text (no audio). Useful for testing."""
    if not is_valid_language(request.source_lang):
        raise HTTPException(400, f"Unsupported source language: {request.source_lang}")
    if not is_valid_language(request.target_lang):
        raise HTTPException(400, f"Unsupported target language: {request.target_lang}")

    translated = await translate_text(request.text, request.source_lang, request.target_lang)
    audio_b64 = await synthesize_speech(translated, request.target_lang)

    return TranslateResponse(
        original_text=request.text,
        translated_text=translated,
        source_lang=request.source_lang,
        target_lang=request.target_lang,
        audio_base64=audio_b64,
    )


@router.websocket("/ws/translate")
async def translate_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time voice translation.

    Client sends JSON first: {"source_lang": "zu", "target_lang": "en"}
    Then sends binary audio frames.
    Server responds with JSON: {translated_text, original_text, audio_base64}
    """
    await websocket.accept()

    source_lang = "en"
    target_lang = "zu"

    try:
        # First message must be config JSON
        config = await websocket.receive_json()
        source_lang = config.get("source_lang", "en")
        target_lang = config.get("target_lang", "zu")

        if not is_valid_language(source_lang) or not is_valid_language(target_lang):
            await websocket.send_json({"error": "Unsupported language pair"})
            await websocket.close()
            return

        await websocket.send_json({"status": "ready", "source_lang": source_lang, "target_lang": target_lang})

        while True:
            # Receive audio bytes from client
            audio_bytes = await websocket.receive_bytes()

            if not audio_bytes:
                continue

            # Run the full pipeline
            transcript = await transcribe_audio(audio_bytes, source_lang)

            if not transcript.strip():
                await websocket.send_json({"status": "no_speech"})
                continue

            translated = await translate_text(transcript, source_lang, target_lang)
            audio_b64 = await synthesize_speech(translated, target_lang)

            await websocket.send_json({
                "status": "success",
                "original_text": transcript,
                "translated_text": translated,
                "audio_base64": audio_b64,
            })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"error": str(e)})
        await websocket.close()

from google.cloud import translate_v2 as translate

client = translate.Client()


async def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    if not text.strip():
        return ""

    result = client.translate(
        text,
        source_language=source_lang,
        target_language=target_lang,
    )

    return result["translatedText"]

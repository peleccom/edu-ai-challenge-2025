from .config import client, MODEL_WHISPER_1

def get_audio_transcription(buffer):
    transcription = client.audio.transcriptions.create(
        model=MODEL_WHISPER_1,
        file=buffer,
        response_format="srt"
    )
    return transcription

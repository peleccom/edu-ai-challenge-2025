import io
import math
import os
from mutagen import File
from pydub import AudioSegment
from config import client, MODEL_WHISPER_1, MAX_CHUNK_SIZE

def get_file_size_bytes(file_path):
    """Returns the file size in bytes."""
    return os.path.getsize(file_path)

def get_chunk_duration_ms(audio: AudioSegment, max_chunk_size_bytes: int = MAX_CHUNK_SIZE) -> int:
    """Returns maximum chunk duration in ms that fits in max_chunk_size_bytes."""
    bytes_per_ms = len(audio.raw_data) / len(audio)  # bytes / ms
    return int(max_chunk_size_bytes / bytes_per_ms)

def translate_large_audio(file_path):
    """Translate file with size more than 25 MB"""
    print(f'Translating audio: {file_path}')

    # Load audio
    audio = AudioSegment.from_file(file_path)
    chunk_duration_ms = get_chunk_duration_ms(audio, MAX_CHUNK_SIZE)

    total_chunks = math.ceil(len(audio) / chunk_duration_ms)
    print(f'Total chunks: {total_chunks}')

    full_transcription = ''

    for i in range(total_chunks):
        start_ms = i * chunk_duration_ms
        end_ms = min((i + 1) * chunk_duration_ms, len(audio))
        chunk = audio[start_ms:end_ms]

        # Convert to in-memory buffer
        buffer = io.BytesIO()
        chunk.export(buffer, format='mp3')
        buffer.name = 'audio.mp3'
        buffer.seek(0)

        try:
            transcription = client.audio.translations.create(
                model=MODEL_WHISPER_1,
                file=buffer,
                response_format="srt"
            )
            print(f'Chunk {i + 1}/{total_chunks} translated.')
            full_transcription += transcription + '\n'
        except Exception as e:
            print(f'Error in chunk {i + 1}: {e}')
            raise

    return full_transcription.strip()

def transcribe_audio(file_path):
    """Transcribes the given audio file using OpenAI's Whisper model."""
    audio_file_size = get_file_size_bytes(file_path)
    if audio_file_size >= MAX_CHUNK_SIZE:
        return translate_large_audio(file_path)
    print(f"Transcribing {file_path}...")
    try:
        with open(file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model=MODEL_WHISPER_1,
                file=audio_file,
                response_format="srt"
            )
        print('Transcription completed.')
        return transcription
    except Exception as e:
        print(f"Error during transcription: {e}")
        return None

def get_audio_duration__ffmpeg(file_path):
    """Gets the duration of an audio file in minutes."""
    try:
        audio = AudioSegment.from_file(file_path)
        return len(audio) / (1000 * 60) # Duration in minutes
    except Exception as e:
        print(f"Error getting audio duration: {e}")
        return None

def get_audio_duration(file_path):
    """Gets the duration of an audio file in minutes."""
    try:
        audio = File(file_path)
        return audio.info.length / 60  # Duration in minutes
    except Exception as e:
        print('Failed to get audio duration using mutagen. Trying pydub...')
        try:
            return get_audio_duration__ffmpeg(file_path)
        except Exception as e1:
            print(f"Error getting audio duration: {e}")
            return None 
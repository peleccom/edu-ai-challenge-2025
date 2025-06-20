import os
import json
import argparse
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from mutagen import File
from openai import OpenAI
from pydub import AudioSegment

MODEL_GPT_4_1_MINI = 'gpt-4.1-mini'
MODEL_WHISPER_1 = 'whisper-1'

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def minutes_to_readable(minutes_float):
    minutes = int(minutes_float)
    seconds = round((minutes_float - minutes) * 60)
    return f'{minutes} min {seconds} sec'

def transcribe_audio(file_path):
    """Transcribes the given audio file using OpenAI's Whisper model."""
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

def get_audio_duration__ffmpeg(file_path):
    """Gets the duration of an audio file in minutes."""
    try:
        audio = AudioSegment.from_file(file_path)
        return len(audio) / (1000 * 60) # Duration in minutes
    except Exception as e:
        print(f"Error getting audio duration: {e}")
        return None

def summarize_text(text):
    """Summarizes the given text using a GPT model."""
    print("Summarizing text...")
    try:
        response = client.chat.completions.create(
            model=MODEL_GPT_4_1_MINI,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes text. " +
                "Focus on preserving core intent and main takeaways." +
                "Use markdown format for the summary." +
                "Use the language of the text for the summary." ,
                },
                {"role": "user", "content": f"Please summarize the following text, use the language of the text:\n\n```{text}```"}
            ]
        )
        print('Summarization completed.')
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error during summarization: {e}")
        return None

def analyze_text(text, duration_minutes):
    """Analyzes the text to extract word count, speaking speed, and topics."""
    print("Analyzing text for key insights...")
    word_count = len(text.split())

    if duration_minutes > 0:
        wpm = round(word_count / duration_minutes)
    else:
        wpm = 0

    prompt = f"""
    Based on the following transcript, provide a JSON object with:
    1. The total word count.
    2. The speaking speed in words per minute (WPM).
    3. A list of the top 3-5 frequently mentioned topics, with a mention count for each.

    The speaking duration was {duration_minutes:.2f} minutes.

    Transcript:
    ```{text}```

    Provide the output in a single valid JSON object. Do not include any text outside of the JSON object.
    The JSON object should have the following structure:
    {{
      "word_count": <integer>,
      "speaking_speed_wpm": <integer>,
      "frequently_mentioned_topics": [
        {{ "topic": "<topic_name>", "mentions": <integer> }},
        ...
      ]
    }}
    """
    try:
        response = client.chat.completions.create(
            model=MODEL_GPT_4_1_MINI,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes transcripts and returns data in JSON format."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        analysis_json = json.loads(response.choices[0].message.content)
        # Ensure calculated values are in the final JSON, as GPT might recalculate differently
        analysis_json['word_count'] = word_count
        analysis_json['speaking_speed_wpm'] = wpm
        return analysis_json
    except Exception as e:
        print(f"Error during analysis: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Transcribe and analyze an audio file.")
    parser.add_argument("audio_file", help="Path to the audio file to analyze.")
    args = parser.parse_args()

    audio_file_path = Path(args.audio_file)
    if not audio_file_path.exists():
        print(f"Error: File not found at {audio_file_path}")
        return

    duration_minutes = get_audio_duration(audio_file_path)
    if duration_minutes is None:
        return
    print(f'Audio duration: {minutes_to_readable(duration_minutes)}')
    transcript = transcribe_audio(audio_file_path)
    if transcript is None:
        return

    # Create results directory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_dir = Path("results") / timestamp
    results_dir.mkdir(parents=True, exist_ok=True)

    # Save transcription to a file
    transcription_filename = results_dir / "transcription.md"
    with open(transcription_filename, "w") as f:
        f.write(transcript)
    print(f"Transcription saved to {transcription_filename}")

    summary = summarize_text(transcript)
    if summary:
        print("\n--- Summary ---")
        print(summary)
        summary_filename = results_dir / "summary.md"
        with open(summary_filename, "w") as f:
            f.write(summary)
        print(f"Summary saved to {summary_filename}")

    analysis = analyze_text(transcript, duration_minutes)
    if analysis:
        print("\n--- Analysis ---")
        print(json.dumps(analysis, indent=2, ensure_ascii=False))
        analysis_filename = results_dir / "analysis.json"
        with open(analysis_filename, "w", encoding="utf-8") as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
        print(f"Analysis saved to {analysis_filename}")

if __name__ == "__main__":
    main()

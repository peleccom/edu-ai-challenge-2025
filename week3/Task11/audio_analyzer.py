import openai
import os
import json
import argparse
from datetime import datetime
from dotenv import load_dotenv
from mutagen import File
from openai import OpenAI

MODEL_GPT_4_1_MINI = 'gpt-4.1-mini'
MODEL_WHISPER_1 = 'whisper-1'

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def transcribe_audio(file_path):
    """Transcribes the given audio file using OpenAI's Whisper model."""
    print(f"Transcribing {file_path}...")
    try:
        with open(file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model=MODEL_WHISPER_1,
                file=audio_file
            )
        return transcription.text
    except Exception as e:
        print(f"Error during transcription: {e}")
        return None

def get_audio_duration(file_path):
    """Gets the duration of an audio file in minutes."""
    try:
        audio = File(file_path)
        return audio.info.length / 60  # Duration in minutes
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
                {"role": "system", "content": "You are a helpful assistant that summarizes text. Focus on preserving core intent and main takeaways."},
                {"role": "user", "content": f"Please summarize the following text:\n\n```{text}```"}
            ]
        )
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

    if not os.path.exists(args.audio_file):
        print(f"Error: File not found at {args.audio_file}")
        return

    duration_minutes = get_audio_duration(args.audio_file)
    if duration_minutes is None:
        return

    transcript = transcribe_audio(args.audio_file)
    if transcript is None:
        return

    # Save transcription to a file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    transcription_filename = f"transcription_{timestamp}.md"
    with open(transcription_filename, "w") as f:
        f.write(transcript)
    print(f"Transcription saved to {transcription_filename}")

    summary = summarize_text(transcript)
    if summary:
        print("\n--- Summary ---")
        print(summary)

    analysis = analyze_text(transcript, duration_minutes)
    if analysis:
        print("\n--- Analysis ---")
        print(json.dumps(analysis, indent=2))

if __name__ == "__main__":
    load_dotenv()
    main()

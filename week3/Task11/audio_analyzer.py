import json
import argparse
from datetime import datetime
from pathlib import Path

from core.audio_processing import get_audio_duration, transcribe_audio
from core.text_analysis import summarize_text, analyze_text
from core.utils import minutes_to_readable, srt_to_text


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

    srt_transcript = transcribe_audio(audio_file_path)
    if srt_transcript is None:
        return

    transcript = srt_to_text(srt_transcript)

    # Create results directory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_dir = Path("results") / timestamp
    results_dir.mkdir(parents=True, exist_ok=True)

    # Save transcription to a file
    transcription_filename = results_dir / "transcription.md"
    with open(transcription_filename, "w", encoding="utf-8") as f:
        f.write(srt_transcript)
    print(f"Transcription saved to {transcription_filename}")

    summary = summarize_text(transcript)
    if summary:
        print("\n--- Summary ---")
        print(summary)
        summary_filename = results_dir / "summary.md"
        with open(summary_filename, "w", encoding="utf-8") as f:
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

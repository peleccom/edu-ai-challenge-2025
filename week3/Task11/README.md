# AI Audio Transcriber and Analyzer

This console application transcribes a given audio file, provides a summary of the content, and extracts key analytics using OpenAI's Whisper and GPT models.

## Features

- **Audio Transcription**: Transcribes audio files into text using the `whisper-1` model.
- **Content Summarization**: Generates a concise summary of the transcribed text.
- **In-depth Analysis**: Extracts useful metrics from the transcript, including:
  - Total word count
  - Speaking speed (words per minute)
  - Frequently mentioned topics

## Prerequisites

- Python 3.11+
- An OpenAI API key

## Installation

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:peleccom/edu-ai-challenge-2025.git
    cd edu-ai-challenge-2025
    cd week3/Task11
    ```

2.  **Install dependencies:**
    It's recommended to use a virtual environment.
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```
    Then, install the required packages:
    ```bash
    pip install -r requirements.txt
    ```

    For some file formats you'll need ffmpeg or libav.

    # ffmpeg

    Mac:
    brew install ffmpeg

    Linux:
    apt-get install ffmpeg libavcodec-extra

## Configuration

1.  This project uses a `.env` file to manage the OpenAI API key securely. Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```

2.  Open the `.env` file and add your OpenAI API key:
    ```
    OPENAI_API_KEY="sk-..."
    ```

## Usage

Run the application from your terminal, providing the path to an audio file as an argument.

```bash
python audio_analyzer.py /path/to/your/audio.mp3
```

### Output

-   The **summary and analysis** will be printed to the console.
-   A new  `analysis.json`, `summary.md`, `transcription.md` files will be created in the project `results/{timestamp}` directory for each run.

---
*This project is for educational purposes as part of the EDU AI Challenge.*

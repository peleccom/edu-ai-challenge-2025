import json
from .config import client, MODEL_GPT_4_1_MINI

def summarize_text(text):
    """Summarizes the given text using a GPT model."""
    print("Summarizing text...")
    try:
        response = client.chat.completions.create(
            model=MODEL_GPT_4_1_MINI,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes text. " +
                 "Focus on preserving core intent and main takeaways." +
                 "Use markdown format for the summary formatting.." +
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

    prompt = f"""
    Based on the following transcript in triple quotes, provide a JSON object with:
    1. The total word count in transcript text.
    2. The speaking speed in words per minute (WPM).
    3. A list of the top 3-5 frequently mentioned topics, with a mention count for each.

    The speaking duration was {duration_minutes:.2f} minutes.
    Word count in text is {word_count}.

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
        return analysis_json
    except Exception as e:
        print(f"Error during analysis: {e}")
        return None

import re

def minutes_to_readable(minutes_float):
    """Converts a float number of minutes to a human-readable string 'X min Y sec'."""
    minutes = int(minutes_float)
    seconds = round((minutes_float - minutes) * 60)
    return f'{minutes} min {seconds} sec'

def srt_to_text(srt_string):
    """Extracts the text from an SRT formatted string."""
    # Remove SRT timing and sequence numbers
    text_only = re.sub(r'\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n', '', srt_string)
    # Remove any extra newlines and surrounding whitespace, then replace with single spaces
    return re.sub(r'\s+', ' ', text_only.replace('\n', ' ')).strip() 
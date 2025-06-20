import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

MODEL_GPT_4_1_MINI = 'gpt-4.1-mini'
MODEL_WHISPER_1 = 'whisper-1'
MAX_CHUNK_SIZE = 25 * 1024 * 1024  # 25MB

OPENAI_SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

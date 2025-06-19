# Product Filter via OpenAI Function Calling

## Requirements

- Python 3.11+
- OpenAI API Key

## Setup
1. Create and activate a virtual environment (optional but recommended):

```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your OpenAI key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

⚠️ **Never commit your `.env` or API key to GitHub!**

## Usage

Run the app using either name or description:

```bash
python main.py
```

Write your product query in natural language

## Output

List of products or error message in nothing can be found

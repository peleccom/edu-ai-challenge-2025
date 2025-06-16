Here’s the full, ready-to-commit version of your Python app with:

* **Input validation**
* **OpenAI API usage**
* **Requirements file**
* **README**
* **Sample outputs**

---

### ✅ `reportgen.py` (main script)

```python
import os
import argparse
from dotenv import load_dotenv
from openai import OpenAI

APP_NAME = 'Service Analyzer CLI'

load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError('OPENAI_API_KEY not found in environment variables.')

client = OpenAI(api_key=api_key)

MODEL = 'gpt-4.1-mini'

SYSTEM_PROMPT = '''
You are a helpful business analyst assistant.
You will get service name or service description.
Based on the information provided, create a structured report with the following sections:

{prompt}

Return markdown-formatted multi-section analysis report.

Your report must include:
- Brief History: Founding year, milestones, etc.
- Target Audience: Primary user segments
- Core Features: Top 2–4 key functionalities
- Unique Selling Points: Key differentiators
- Business Model: How the service makes money
- Tech Stack Insights: Any hints about technologies used
- Perceived Strengths: Mentioned positives or standout features
- Perceived Weaknesses: Cited drawbacks or limitations
'''


def get_report(name: str | None, description: str | None) -> str:
    prompt = ''
    if name:
        prompt += f'Service Name: {name}\n'
    if description:
        prompt += f'Service Description: {description}\n'

    if not prompt:
        raise ValueError('At least --service-name or --service-description must be provided.')

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT.format(prompt=prompt)},
            {'role': 'user', 'content': prompt}
        ]
    )

    return response.choices[0].message.content.strip()


def main():
    parser = argparse.ArgumentParser(
        description=f'{APP_NAME} — Generate market analysis report for a product or service.')

    parser.add_argument('-n', '--service-name', help='Name of the service or product')
    parser.add_argument('-d', '--service-description', help='Description of the app/service')

    args = parser.parse_args()

    try:
        report = get_report(args.service_name, args.service_description)
        print('\n=== Generated Report ===\n')
        print(report)
    except Exception as e:
        print(f'Error: {e}')


if __name__ == '__main__':
    main()
```

---

### ✅ `requirements.txt`

```text
openai==1.86.0
python-dotenv==1.1.0
argparse==1.4.0
```

---

### ✅ `README.md`

````markdown
# Service Analyzer CLI

A command-line application that generates a business analysis report for a product or service using OpenAI.

## Features

- Accepts input via command-line arguments
- Generates structured markdown report with:
  - Brief History
  - Target Audience
  - Core Features
  - Unique Selling Points
  - Business Model
  - Tech Stack Insights
  - Perceived Strengths
  - Perceived Weaknesses

## Requirements

- Python 3.8+
- OpenAI API Key

## Setup

1. Clone this repository:

```bash
git clone https://github.com/yourname/service-analyzer-cli.git
cd service-analyzer-cli
````

2. Create and activate a virtual environment (optional but recommended):

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
python main.py -n "Notion"
```

```bash
python main.py -d "All-in-one productivity workspace combining notes, docs, tasks, and databases"
```


Output to file

```bash
python main.py -d "Google" > sample_outputs.md
```

## Output

* Markdown-formatted analysis will be printed to your console

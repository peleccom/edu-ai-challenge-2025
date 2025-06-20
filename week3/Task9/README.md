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

- Python 3.11+
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

4. Copy `.env.example` to `.env` file with and fill your OpenAI key:

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

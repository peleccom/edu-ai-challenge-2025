import os
import argparse
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

MODEL_GPT_4_1_MINI = 'gpt-4.1-mini'
SYSTEM_PROMPT = '''
You are a helpful business analyst assistant.
You will get service name or service description.
Based on the information provided, create a structured report with the following sections:

{prompt}
Return markdown-formatted multi-section analysis repor
Your report must include:
Brief History: Founding year, milestones, etc.
Target Audience: Primary user segments
Core Features: Top 2–4 key functionalities
Unique Selling Points: Key differentiators
Business Model: How the service makes money
Tech Stack Insights: Any hints about technologies used
Perceived Strengths: Mentioned positives or standout features
Perceived Weaknesses: Cited drawbacks or limitations
'''



def get_report(name: str|None, description: str|None) -> str:
    prompt = ''
    if name:
        prompt += f"Service Name: {name}\n"
    if description:
        prompt += f"Service Description: {description}\n"



    response = client.chat.completions.create(
        model=MODEL_GPT_4_1_MINI,
        messages=[
            {'role': 'system', 'content': SYSTEM_PROMPT.format(prompt=prompt)},
            {'role': 'user', 'content': prompt}
        ]
    )

    return response.choices[0].message.content.strip()

def main():
    parser = argparse.ArgumentParser(
        prog='Service Analyzer',
        description='Generate a market analysis report for a service or product.')

    group = parser.add_mutually_exclusive_group(required=True)

    group.add_argument('-n', '--service-name', help='Name of the service or product')
    group.add_argument('-d', '--service-description', help='Description of the app/service')

    args = parser.parse_args()

    report = get_report(args.service_name, args.service_description)
    print(report)

if __name__ == '__main__':
    main()

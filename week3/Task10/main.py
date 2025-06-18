import json
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

MODEL_GPT_4_1_MINI = 'gpt-4.1-mini'


FUNCTION_SCHEMA1 = {
    "type": "function",
    "name": "filter_products",
    "description": "Filter products based on user preferences.",
    "parameters": {
        "type": "object",
        "properties": {
            'category': {'type': 'string'},
            'min_price': {'type': 'number'},
            'max_price': {'type': 'number'},
            'min_rating': {'type': 'number'},
            'max_rating': {'type': 'number'},
            'in_stock': {'type': 'boolean'}
        },
        "required": ["category", "min_price", "max_price", "min_rating", "max_rating", "in_stock"],
        "additionalProperties": False
    },
    "strict": True
}


def load_products():
    with open('products.json', 'r') as f:
        return json.load(f)

def request_filtered_products(products, user_request):

    input_messages = [
            {
                'role': 'system',
                'content': '''
                    You are a product filtering assistant. You should find information about products that match the user request.
                    Filtering criteria can be:
                    `
                    Maximum price.
                    Minimum rating.
                    Specific product categories. Each request should contain at least one category from list (Electronics, Fitness, Kitchen, Books, Clothing)
                    Stock availability.
                    `
                    The response should contain the filtered products in a structured format or message that we can't find products that match the request.                    Example Response:
                    Filtered Products:
                    1. Wireless Headphones - $99.99, Rating: 4.5, In Stock
                    2. Smart Watch - $199.99, Rating: 4.6, In Stock
                '''.strip()
            },
            {
                'role': 'user',
                'content': f'Find products based on this request: `{user_request}`'
            }
        ]

    tools = [
        FUNCTION_SCHEMA1
    ]
    response = client.responses.create(
        model=MODEL_GPT_4_1_MINI,
        input=input_messages,
        tools=tools,
    )


    tool_call = response.output[0]
    kwargs = json.loads(tool_call.arguments)
    result = filter_products(products, **kwargs)

    input_messages.append(tool_call)  # append model's function call message
    input_messages.append({                               # append result message
        "type": "function_call_output",
        "call_id": tool_call.call_id,
        "output": str(result)
    })

    response_2 = client.responses.create(
        model=MODEL_GPT_4_1_MINI,
        input=input_messages,
        tools=tools,
    )
    return response_2.output_text


def filter_products(products, category, min_price, max_price, min_rating, max_rating, in_stock):
    ans = []
    for product in products:
        if category and product['category'] != category:
            continue
        if min_price and product['price'] < min_price:
            continue
        if max_price and product['price'] > max_price:
            continue
        if min_rating and product['rating'] < min_rating:
            continue
        if max_rating and product['rating'] > max_rating:
            continue
        if in_stock != product['in_stock']:
            continue
        ans.append(product)
    return ans




def print_products(products):
    print(products)

def main():
    print('AI Product finder. Please type your query in natural language or "exit" to quit.')
    products = load_products()
    user_input = input('Enter your product preferences: ')
    if user_input.strip().lower() == 'exit':
        return

    products = load_products()

    try:
        filtered_products = request_filtered_products(products, user_input)
        print_products(filtered_products)
    except Exception as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    main()

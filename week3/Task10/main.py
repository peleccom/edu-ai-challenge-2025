import json
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))


MODEL_GPT_4_1_MINI = 'gpt-4.1-mini'
FUNCTION_SCHEMA = [
    {
        'name': 'filter_products',
        'description': 'Return a list of products that match the user request from the given product list.',
        'parameters': {
            'type': 'object',
            'properties': {
                'products': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'name': {'type': 'string'},
                            'category': {'type': 'string'},
                            'price': {'type': 'number'},
                            'rating': {'type': 'number'},
                            'in_stock': {'type': 'boolean'}
                        },
                        'required': ['name', 'category', 'price', 'rating', 'in_stock']
                    }
                },
                'user_request': {
                    'type': 'string',
                    'description': 'The user\'s product search preferences'
                }
            },
            'required': ['products', 'user_request']
        }
    }
]

def load_products():
    with open('products.json', 'r') as f:
        return json.load(f)

def request_filtered_products(products, user_request):
    response = client.chat.completions.create(
        model=MODEL_GPT_4_1_MINI,
        messages=[
            {
                'role': 'system',
                'content': 'You are a product filtering assistant. You receive a list of products and a user request. Return only matching products.'
            },
            {
                'role': 'user',
                'content': 'Find products based on this request: ' + user_request
            }
        ],
        tools=[
            {
                'type': 'function',
                'function': {
                    'name': 'filter_products',
                    'description': 'Filter the product list by user preferences.',
                    'parameters': {
                        'type': 'object',
                        'properties': {
                            'products': {
                                'type': 'array',
                                'items': {
                                    'type': 'object',
                                    'properties': {
                                        'name': {'type': 'string'},
                                        'category': {'type': 'string'},
                                        'price': {'type': 'number'},
                                        'rating': {'type': 'number'},
                                        'in_stock': {'type': 'boolean'}
                                    },
                                    'required': ['name', 'category', 'price', 'rating', 'in_stock']
                                }
                            },
                            'user_request': {'type': 'string'}
                        },
                        'required': ['products', 'user_request']
                    }
                }
            }
        ],
        tool_choice={'type': 'function', 'function': {'name': 'filter_products'}},
        tool_inputs={
            'filter_products': {
                'products': products,
                'user_request': user_request
            }
        }
    )

    tool_result = response.choices[0].message.tool_calls[0].function.arguments
    parsed = json.loads(tool_result)
    return parsed.get('filtered', [])

def print_products(products):
    if not products:
        print('No products found.')
        return

    print('\nFiltered Products:')
    for i, p in enumerate(products, 1):
        status = 'In Stock' if p['in_stock'] else 'Out of Stock'
        print(f"{i}. {p['name']} - ${p['price']}, Rating: {p['rating']}, {status}")

def main():
    print('AI Product finder. Please type your query in natural language or "exit" to quit.')
    products = load_products()
    while True:
        user_input = input('Enter your product preferences: ')
        if user_input.strip().lower() == 'exit':
            break

        products = load_products()

        try:
            filtered_products = request_filtered_products(products, user_input)
            print_products(filtered_products)
        except Exception as e:
            print(f'Error: {e}')

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Simple script to test AI model connections
"""
import requests
import json
from datetime import datetime

def test_models():
    """Test all available models and show connection status"""
    try:
        # Get models from API
        response = requests.get('http://localhost:3000/api/models', timeout=10)
        if response.status_code == 200:
            data = response.json()
            models = data.get('models', [])
            
            print("🔍 AI MODEL CONNECTION STATUS")
            print("=" * 50)
            print(f"📊 Total Models: {data.get('totalModels', 0)}")
            print(f"✅ Connected Models: {data.get('connectedModels', 0)}")
            print(f"🕒 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print()
            
            # Group models by provider
            providers = {}
            for model in models:
                provider = model.get('provider', 'unknown')
                if provider not in providers:
                    providers[provider] = []
                providers[provider].append(model)
            
            # Display by provider
            for provider, provider_models in providers.items():
                provider_emoji = {
                    'google': '🔵',
                    'anthropic': '🟠', 
                    'mistral': '🔴',
                    'deepseek': '🟣',
                    'ollama': '⚫'
                }.get(provider, '⚪')
                
                print(f"{provider_emoji} {provider.upper()} MODELS:")
                print("-" * 30)
                
                for model in provider_models:
                    status_emoji = "✅" if model.get('connected') else "❌"
                    name = model.get('name', model.get('id'))
                    status = model.get('available', 'Unknown')
                    
                    print(f"  {status_emoji} {name}")
                    print(f"     ID: {model.get('id')}")
                    print(f"     Status: {status}")
                    print(f"     Context: {model.get('contextLength', 0):,} tokens")
                    print()
                
                print()
            
            # Test a working model
            working_models = [m for m in models if m.get('connected')]
            if working_models:
                print("🧪 TESTING FIRST WORKING MODEL:")
                print("-" * 30)
                test_model = working_models[0]
                print(f"Testing: {test_model.get('name')} ({test_model.get('id')})")
                
                test_response = requests.post(
                    'http://localhost:3000/api/ask-ai',
                    json={
                        'prompt': 'Say "Hello from AI model test!"',
                        'model': test_model.get('id')
                    },
                    timeout=30
                )
                
                if test_response.status_code == 200:
                    result = test_response.text[:100] + "..." if len(test_response.text) > 100 else test_response.text
                    print(f"✅ Test successful!")
                    print(f"Response preview: {result}")
                else:
                    print(f"❌ Test failed: {test_response.status_code}")
            
        else:
            print(f"❌ Failed to get models: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure the backend is running on localhost:3000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_models() 
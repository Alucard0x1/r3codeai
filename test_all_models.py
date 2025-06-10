#!/usr/bin/env python3
"""
Comprehensive AI Models API Test Script
Tests all 25 AI models configured in server.js
"""

import requests
import json
import os
import time
from datetime import datetime
from typing import Dict, List, Optional
import sys

# Configuration
SERVER_URL = "http://localhost:3001"
TEST_PROMPT = "Hello! Please respond with a simple greeting and confirm you're working."

# All 25 models from server.js configuration
ALL_MODELS = [
    # Google Gemini Models (10 models)
    "gemini-2.5-pro",
    "gemini-2.5-flash", 
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-2.5-flash-native-audio",
    "gemini-2.0-flash-image-gen",
    "imagen-3",
    "veo-2",
    
    # Anthropic Claude Models (6 models)
    "claude-4-opus",
    "claude-4-sonnet",
    "claude-3.7-sonnet",
    "claude-3.5-sonnet",
    "claude-3.5-haiku",
    "claude-3-opus",
    
    # DeepSeek Models (2 models)
    "deepseek-r1",
    "deepseek-v3",
    
    # Mistral AI Models (6 models)
    "magistral-medium",
    "mistral-medium",
    "mistral-large",
    "pixtral-large",
    "codestral",
    "mistral-ocr",
    
    # Meta Llama Models (1 model)
    "llama-3.3",
    
    # Local Ollama (1 model)
    "ollama"
]

class ModelTester:
    def __init__(self, server_url: str = SERVER_URL):
        self.server_url = server_url
        self.results = {}
        self.session = requests.Session()
        
    def test_server_connection(self) -> bool:
        """Test if the server is running"""
        try:
            response = self.session.get(f"{self.server_url}/api/models", timeout=5)
            if response.status_code == 200:
                print("✅ Server is running and accessible")
                return True
            else:
                print(f"❌ Server responded with status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Cannot connect to server: {e}")
            return False
    
    def get_model_status(self) -> Dict:
        """Get model connection status from server"""
        try:
            response = self.session.get(f"{self.server_url}/api/models", timeout=10)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"⚠️ Failed to get model status: {response.status_code}")
                return {}
        except Exception as e:
            print(f"⚠️ Error getting model status: {e}")
            return {}
    
    def test_model(self, model_name: str, prompt: str = TEST_PROMPT) -> Dict:
        """Test a specific model"""
        print(f"\n🧪 Testing {model_name}...")
        
        start_time = time.time()
        result = {
            "model": model_name,
            "status": "unknown",
            "response": None,
            "error": None,
            "response_time": 0,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            # Test the model via ask-ai endpoint
            payload = {
                "prompt": prompt,
                "model": model_name
            }
            
            response = self.session.post(
                f"{self.server_url}/api/ask-ai",
                json=payload,
                timeout=60  # 60 second timeout for AI responses
            )
            
            response_time = time.time() - start_time
            result["response_time"] = round(response_time, 2)
            
            if response.status_code == 200:
                response_data = response.json()
                if "response" in response_data:
                    result["status"] = "success"
                    result["response"] = response_data["response"][:200] + "..." if len(response_data["response"]) > 200 else response_data["response"]
                    print(f"✅ {model_name}: SUCCESS ({response_time:.2f}s)")
                    print(f"   Response: {result['response']}")
                else:
                    result["status"] = "error"
                    result["error"] = "No response field in API response"
                    print(f"❌ {model_name}: No response field")
            else:
                result["status"] = "error"
                result["error"] = f"HTTP {response.status_code}: {response.text}"
                print(f"❌ {model_name}: HTTP {response.status_code}")
                print(f"   Error: {response.text[:100]}...")
                
        except requests.exceptions.Timeout:
            result["status"] = "timeout"
            result["error"] = "Request timed out after 60 seconds"
            print(f"⏰ {model_name}: TIMEOUT")
            
        except requests.exceptions.RequestException as e:
            result["status"] = "connection_error"
            result["error"] = str(e)
            print(f"🔌 {model_name}: CONNECTION ERROR - {e}")
            
        except Exception as e:
            result["status"] = "error"
            result["error"] = str(e)
            print(f"💥 {model_name}: UNEXPECTED ERROR - {e}")
        
        return result
    
    def test_all_models(self, models: List[str] = None) -> Dict:
        """Test all models or a specific list"""
        if models is None:
            models = ALL_MODELS
            
        print(f"\n🚀 Starting comprehensive test of {len(models)} AI models")
        print(f"📅 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Get model status first
        model_status = self.get_model_status()
        if model_status:
            print("\n📊 Model Connection Status:")
            for provider, connected in model_status.get("connected", {}).items():
                status = "✅ Connected" if connected else "❌ Not Connected"
                print(f"   {provider.title()}: {status}")
        
        results = []
        successful = 0
        failed = 0
        
        for i, model in enumerate(models, 1):
            print(f"\n[{i}/{len(models)}] Testing {model}")
            result = self.test_model(model)
            results.append(result)
            
            if result["status"] == "success":
                successful += 1
            else:
                failed += 1
            
            # Small delay between requests to be respectful
            time.sleep(1)
        
        # Summary
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Success Rate: {(successful/len(models)*100):.1f}%")
        
        # Group results by status
        by_status = {}
        for result in results:
            status = result["status"]
            if status not in by_status:
                by_status[status] = []
            by_status[status].append(result["model"])
        
        for status, models_list in by_status.items():
            print(f"\n{status.upper()} ({len(models_list)}):")
            for model in models_list:
                print(f"  • {model}")
        
        return {
            "summary": {
                "total": len(models),
                "successful": successful,
                "failed": failed,
                "success_rate": round(successful/len(models)*100, 1)
            },
            "results": results,
            "by_status": by_status,
            "timestamp": datetime.now().isoformat()
        }
    
    def save_results(self, results: Dict, filename: str = None):
        """Save test results to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"model_test_results_{timestamp}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Results saved to: {filename}")
        except Exception as e:
            print(f"❌ Failed to save results: {e}")

def main():
    """Main function"""
    print("🤖 AI Models Comprehensive Test Suite")
    print("=" * 50)
    
    tester = ModelTester()
    
    # Check server connection
    if not tester.test_server_connection():
        print("\n❌ Cannot proceed without server connection")
        sys.exit(1)
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "--help":
            print("\nUsage:")
            print("  python test_all_models.py                    # Test all models")
            print("  python test_all_models.py model1 model2      # Test specific models")
            print("  python test_all_models.py --google           # Test only Google models")
            print("  python test_all_models.py --anthropic        # Test only Anthropic models")
            print("  python test_all_models.py --list             # List all available models")
            return
        elif sys.argv[1] == "--list":
            print(f"\n📋 Available Models ({len(ALL_MODELS)}):")
            for i, model in enumerate(ALL_MODELS, 1):
                print(f"  {i:2d}. {model}")
            return
        elif sys.argv[1] == "--google":
            models_to_test = [m for m in ALL_MODELS if m.startswith(('gemini', 'imagen', 'veo'))]
        elif sys.argv[1] == "--anthropic":
            models_to_test = [m for m in ALL_MODELS if m.startswith('claude')]
        elif sys.argv[1] == "--mistral":
            models_to_test = [m for m in ALL_MODELS if m.startswith(('mistral', 'magistral', 'pixtral', 'codestral'))]
        elif sys.argv[1] == "--deepseek":
            models_to_test = [m for m in ALL_MODELS if m.startswith('deepseek')]
        else:
            # Test specific models provided as arguments
            models_to_test = sys.argv[1:]
    else:
        models_to_test = ALL_MODELS
    
    # Run tests
    results = tester.test_all_models(models_to_test)
    
    # Save results
    tester.save_results(results)
    
    print(f"\n🎉 Testing completed!")
    print(f"📊 Final Results: {results['summary']['successful']}/{results['summary']['total']} models working")

if __name__ == "__main__":
    main() 
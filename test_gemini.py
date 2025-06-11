import sys
import json
import requests

# Replace this with your actual Gemini API key
API_KEY = "AIzaSyBVJ-f2maE0roBX77Ao9jGsFEgDaXNCARY"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={API_KEY}"

def send_prompt(prompt):
    headers = {
        "Content-Type": "application/json"
    }

    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    response = requests.post(API_URL, headers=headers, data=json.dumps(data))
    
    if response.status_code == 200:
        result = response.json()
        try:
            reply = result["candidates"][0]["content"]["parts"][0]["text"]
            print("Gemini:", reply)
        except (KeyError, IndexError):
            print("Unexpected response format:", json.dumps(result, indent=2))
    else:
        print(f"Error {response.status_code}:", response.text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_gemini.py <your prompt>")
    else:
        prompt = " ".join(sys.argv[1:])
        send_prompt(prompt)
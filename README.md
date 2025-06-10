# R3Code AI - Create Best UI/UX in Single HTML File

🎨 Generate stunning UI/UX in complete single HTML files! ✨

**R3Code AI** helps you create the best possible UI/UX in a single HTML file. Transform your ideas into beautiful, functional websites with complete HTML, CSS, and JavaScript in one file.

## Features

- **Single HTML File Output**: Complete websites with HTML, CSS, and JavaScript in one file
- **Best UI/UX Focus**: Optimized for creating beautiful, functional user interfaces
- **AI-Powered Generation**: Uses Google Gemini 2.0 Flash for intelligent web development
- **Real-time Preview**: See your UI being generated in real-time with streaming responses
- **Instant Deployment**: Ready-to-deploy single HTML files

- **No Authentication Required**: Works out of the box with rate limiting

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key (optional, for higher rate limits)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Alucard0x1/r3codeai.git
cd r3codeai
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```bash
cp .env.example .env
# Add your Gemini API key to .env
GOOGLE_API_KEY=your_google_gemini_api_key_here
```

4. Start the development servers:
```bash
# Start backend server (port 3000)
node server.js

# In another terminal, start frontend dev server (port 5173/5174)
npm run dev
```

5. Open http://localhost:5173 (or the port shown in terminal) in your browser

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file or authenticate through the UI

## Usage

1. **Describe UI/UX**: Type your request in the input field (e.g., "Create a modern landing page for a coffee shop")
2. **Watch Creation**: See the AI generate complete HTML, CSS, and JavaScript in real-time
3. **Single File Output**: Get a complete website in one HTML file ready for deployment

5. **Iterate**: Continue asking the AI to improve the UI/UX and functionality

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **AI**: Google Gemini 2.0 Flash (REST API)
- **Editor**: Monaco Editor with live preview
- **Build Tool**: Vite

## API Implementation

The application uses Google Gemini's REST API directly:

```javascript
// Example API call structure
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${API_KEY}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: "Your prompt here"
          }
        ]
      }
    ]
  })
});
```

## License

MIT License - see LICENSE file for details

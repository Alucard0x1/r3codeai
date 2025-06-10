export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Forward the request to the main server's models endpoint
      const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
      
      const response = await fetch(`${serverUrl}/api/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error in models API:", error);
      
      // Return default models with connection status if server is not available
      const defaultModels = [
        {
          id: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          provider: 'google',
          description: 'Google\'s most advanced reasoning model with Deep Think capabilities',
          features: ['text', 'multimodal', 'reasoning', 'thinking', 'code', 'large-context'],
          contextLength: 1048576,
          cost: { input: 1.25, output: 10.00, free: false },
          available: 'API key required',
          connected: false
        },
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          provider: 'google',
          description: 'Google\'s first hybrid reasoning model with adjustable thinking budgets',
          features: ['text', 'multimodal', 'reasoning', 'thinking', 'code', 'fast'],
          contextLength: 1048576,
          cost: { input: 0.15, output: 0.60, free: false },
          available: 'API key required',
          connected: false
        },
        {
          id: 'gemini-2.0-flash',
          name: 'Gemini 2.0 Flash',
          provider: 'google',
          description: 'Google\'s fast multimodal model with native tool use',
          features: ['text', 'multimodal', 'code', 'fast', 'tool-use'],
          contextLength: 1000000,
          cost: { input: 0.075, output: 0.30, free: false },
          available: 'API key required',
          connected: false
        },
        {
          id: 'claude-4-opus',
          name: 'Claude 4 Opus',
          provider: 'anthropic',
          description: 'Anthropic\'s most powerful and capable model with superior reasoning',
          features: ['text', 'reasoning', 'code', 'analysis', 'vision', 'advanced-reasoning'],
          contextLength: 200000,
          cost: { input: 15.00, output: 75.00, free: false },
          available: 'API key required',
          connected: false
        },
        {
          id: 'claude-4-sonnet',
          name: 'Claude 4 Sonnet',
          provider: 'anthropic',
          description: 'Anthropic\'s high-performance model with exceptional reasoning',
          features: ['text', 'reasoning', 'code', 'analysis', 'vision', 'high-performance'],
          contextLength: 200000,
          cost: { input: 3.00, output: 15.00, free: false },
          available: 'API key required',
          connected: false
        },
        {
          id: 'deepseek-r1',
          name: 'DeepSeek R1',
          provider: 'deepseek',
          description: 'DeepSeek\'s latest reasoning model with enhanced capabilities',
          features: ['text', 'reasoning', 'code', 'thinking', 'step-by-step'],
          contextLength: 128000,
          cost: { input: 0.55, output: 2.19, free: false },
          available: 'API key required',
          connected: false
        },
        {
          id: 'ollama',
          name: 'Ollama',
          provider: 'ollama',
          description: 'Local AI model running on your machine',
          features: ['text', 'local', 'private', 'free'],
          contextLength: 128000,
          cost: { input: 0, output: 0, free: true },
          available: 'Local installation required',
          connected: false
        }
      ];

      res.status(200).json({ 
        models: defaultModels,
        error: "Could not connect to server for real-time status"
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 
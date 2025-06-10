export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Forward the request to the main server's ask-ai endpoint
      const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
      
      const response = await fetch(`${serverUrl}/api/ask-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with ${response.status}`);
      }

      // Stream the response back to the client
      if (response.body) {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk);
          }
        } finally {
          reader.releaseLock();
        }
      }

      res.end();
    } catch (error) {
      console.error("Error in ask-ai API:", error);
      res.status(500).json({ 
        error: "Failed to process AI request",
        message: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

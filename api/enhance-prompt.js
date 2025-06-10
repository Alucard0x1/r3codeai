export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Forward the request to the main server's enhance-prompt endpoint
      const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
      
      const response = await fetch(`${serverUrl}/api/enhance-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error in enhance-prompt API:", error);
      res.status(500).json({ 
        error: "Failed to enhance prompt",
        message: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 
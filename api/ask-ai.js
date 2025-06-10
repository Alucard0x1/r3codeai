export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { prompt, html, previousPrompt, selectedModel } = req.body;

      console.log("Received AI model:", selectedModel);
      console.log("Received prompt:", prompt);
      // TODO: Implement actual AI call here

      res.status(200).json({ message: "AI request received", model: selectedModel });
    } catch (error) {
      console.error("Error in ask-ai API:", error);
      res.status(500).json({ message: "Error processing AI request" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

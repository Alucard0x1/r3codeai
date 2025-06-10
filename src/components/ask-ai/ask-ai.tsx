/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { MdPreview } from "react-icons/md";
import AiRulesModal from './AiRulesModal';
import ContextEngineModal from './ContextEngineModal';
import {
  HiSparkles,
  HiCog,
  HiDocumentText,
  HiPlay,
  HiChip
} from "react-icons/hi";

import { defaultHTML } from "./../../../utils/consts";

function AskAI({
  html,
  setHtml,
  onScrollToBottom,
  isAiWorking,
  setisAiWorking,
  setView,
}: {
  html: string;
  setHtml: (html: string) => void;
  onScrollToBottom: () => void;
  isAiWorking: boolean;
  setView: React.Dispatch<React.SetStateAction<"editor" | "preview">>;
  setisAiWorking: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [prompt, setPrompt] = useState("");
  const [previousPrompt, setPreviousPrompt] = useState("");
  const [typingProgress, setTypingProgress] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
  const [isAiRulesModalOpen, setIsAiRulesModalOpen] = useState(false);
  const [isContextEngineModalOpen, setIsContextEngineModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleAiRulesModal = () => {
    setIsAiRulesModalOpen(!isAiRulesModalOpen);
  };

  const toggleContextEngineModal = () => {
    setIsContextEngineModalOpen(!isContextEngineModalOpen);
  };

  // Smart auto-resize function that considers container size and expands upward
  const handleSmartResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Get container dimensions
    const container = textarea.closest('.ai-prompt-container') as HTMLElement;
    const actionBar = container?.querySelector('.ai-action-bar') as HTMLElement;
    const progressBar = container?.querySelector('.ai-progress-bar') as HTMLElement;

    if (!container || !actionBar) return;

    // Calculate available space
    const containerHeight = container.clientHeight;
    const containerPadding = 40; // 20px top + 20px bottom
    const actionBarHeight = actionBar.offsetHeight;
    const progressBarHeight = progressBar?.offsetHeight || 0;
    const gaps = 32; // gaps between elements
    const inputContainerPadding = 32; // padding inside input container
    const borderAndMargins = 20; // additional spacing

    // Calculate maximum available height for textarea
    const maxAvailableHeight = containerHeight - containerPadding - actionBarHeight - progressBarHeight - gaps - inputContainerPadding - borderAndMargins;

    // Reset height to get accurate scrollHeight
    textarea.style.height = '60px';

    // Get content height
    const contentHeight = textarea.scrollHeight;

    // Calculate optimal height
    const minHeight = 60;
    const maxHeight = Math.max(minHeight, maxAvailableHeight - 20); // Leave some breathing room
    const optimalHeight = Math.max(minHeight, Math.min(maxHeight, contentHeight));

    // Apply the height
    textarea.style.height = optimalHeight + 'px';

    // If content exceeds available space, enable scrolling
    if (contentHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }

    console.log('📏 Smart resize:', {
      containerHeight,
      maxAvailableHeight,
      contentHeight,
      optimalHeight,
      willScroll: contentHeight > maxHeight
    });
  }, []);

  // Auto-resize on prompt change and initial load
  useEffect(() => {
    handleSmartResize();
  }, [prompt, handleSmartResize]);

  // Setup event listeners for real-time resizing
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const handleInput = () => handleSmartResize();
      textarea.addEventListener('input', handleInput);
      textarea.addEventListener('paste', handleInput);

      return () => {
        textarea.removeEventListener('input', handleInput);
        textarea.removeEventListener('paste', handleInput);
      };
    }
  }, [handleSmartResize]);

  // Listen for container resize (when user drags vertical resizer)
  useEffect(() => {
    const container = document.querySelector('.ai-prompt-container') as HTMLElement;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce the resize to avoid too many calls
      setTimeout(handleSmartResize, 100);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleSmartResize]);



  const enhancePrompt = async () => {
    if (isEnhancing || isAiWorking || !prompt.trim()) return;

    console.log("🌟 Starting fast prompt enhancement with:", prompt);
    setIsEnhancing(true);

    try {
      console.log("📡 Making fast fetch request to enhance prompt");
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.enhancedPrompt && data.enhancedPrompt.trim()) {
        setPrompt(data.enhancedPrompt.trim());
        toast.success("✨ Prompt enhanced successfully!");
      } else {
        toast.error("Failed to enhance prompt. Please try again.");
      }

    } catch (error) {
      console.error("Enhancement Error:", error);
      toast.error("Failed to enhance prompt. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const callAi = async () => {
    if (isAiWorking || !prompt.trim()) return;
    console.log("🎯 Starting AI request with prompt:", prompt);
    setisAiWorking(true);
    setTypingProgress(0);

    let contentResponse = "";
    let lastRenderTime = 0;
    let estimatedTotalLength = 3000; // Estimate for progress calculation
    try {
      console.log("📡 Making fetch request to /api/ask-ai");
      const request = await fetch("/api/ask-ai", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          ...(html === defaultHTML ? {} : { html }),
          ...(previousPrompt ? { previousPrompt } : {}),
          selectedModel,
        }),
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });
      console.log("📡 Fetch response received:", request.status, request.statusText);
      if (request && request.body) {
        console.log("✅ Request has body, checking status...");
        if (!request.ok) {
          console.error("❌ Request failed:", request.status, request.statusText);
          const res = await request.json();
          toast.error(res.message);
          setisAiWorking(false);
          return;
        }
        console.log("✅ Request OK, starting to read stream...");
        const reader = request.body.getReader();
        const decoder = new TextDecoder("utf-8");
        console.log("🚀 Starting to read streaming response...");

        const read = async () => {
          const { done, value } = await reader.read();
          if (done) {
            console.log("✅ Streaming complete! Total response length:", contentResponse.length);
            toast.success("AI responded successfully");
            setPrompt("");
            setPreviousPrompt(prompt);
            setisAiWorking(false);
            setTypingProgress(100);
            setView("preview");

            // Final cleanup - ensure we have complete HTML
            const finalDoc = contentResponse.match(
              /<!DOCTYPE html>[\s\S]*<\/html>/
            )?.[0];
            if (finalDoc) {
              setHtml(finalDoc);
            }

            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          console.log("📝 Received chunk:", chunk.length, "chars:", chunk.substring(0, 50) + "...");
          contentResponse += chunk;
          console.log("📝 Total content so far:", contentResponse.length, "chars");

          // Extract HTML content from the response (remove markdown code blocks if present)
          let htmlContent = contentResponse;

          // Remove markdown code block markers if present
          if (htmlContent.includes('```html')) {
            htmlContent = htmlContent.replace(/```html\s*/, '').replace(/```\s*$/, '');
          } else if (htmlContent.includes('```')) {
            htmlContent = htmlContent.replace(/```\s*/, '').replace(/```\s*$/, '');
          }

          console.log("📝 HTML content after markdown cleanup:", htmlContent.substring(0, 200) + "...");

          // Look for HTML document - be more flexible with detection
          let newHtml = htmlContent.match(/<!DOCTYPE html>[\s\S]*/)?.[0];

          // If no DOCTYPE found, look for <html> tag
          if (!newHtml) {
            newHtml = htmlContent.match(/<html[\s\S]*/)?.[0];
          }

          // If still no HTML found, but we have content that looks like HTML, wrap it
          if (!newHtml && (htmlContent.includes('<') || htmlContent.includes('body') || htmlContent.includes('head'))) {
            // Create a basic HTML structure and put the content inside
            newHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Generated Content</title>
</head>
<body>
${htmlContent}
</body>
</html>`;
          }

          if (newHtml) {
            // Create a more complete HTML document for better iframe rendering
            let partialDoc = newHtml;

            // Ensure we have proper HTML structure for iframe rendering
            if (!partialDoc.includes("</html>")) {
              // Close any open tags properly for valid HTML
              if (partialDoc.includes("<body") && !partialDoc.includes("</body>")) {
                partialDoc += "\n</body>";
              }
              if (partialDoc.includes("<head") && !partialDoc.includes("</head>")) {
                partialDoc += "\n</head>";
              }
              partialDoc += "\n</html>";
            }

            // Update more frequently for real-time effect (every 100ms for better real-time experience)
            const now = Date.now();
            if (now - lastRenderTime > 100) {
              console.log("📝 AskAI - Setting HTML content for real-time preview:", partialDoc.length, "chars");
              console.log("📝 AskAI - HTML starts with:", partialDoc.substring(0, 150) + "...");
              console.log("📝 AskAI - Calling setHtml function...");
              setHtml(partialDoc);
              console.log("📝 AskAI - setHtml called successfully");
              lastRenderTime = now;

              // Update typing progress
              const progress = Math.min((partialDoc.length / estimatedTotalLength) * 100, 95);
              setTypingProgress(progress);

              // Auto-scroll to bottom of editor
              if (partialDoc.length > 200) {
                onScrollToBottom();
              }
            }
          }

          read();
        };

        read();
      } else {
        console.error("❌ No request body available");
        setisAiWorking(false);
        toast.error("No response body available for streaming");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Error in callAi:", error);
      setisAiWorking(false);
      toast.error(error.message);
    }
  };

  return (
    <div className="ai-prompt-container">
      {/* Progress Bar */}
      {isAiWorking && (
        <div className="ai-progress-bar">
          <div
            className="ai-progress-fill"
            style={{ width: `${typingProgress}%` }}
          />
        </div>
      )}

      {/* Mobile Preview Button */}
      {defaultHTML !== html && (
        <div className="d-lg-none mb-3">
          <button
            className="mobile-preview-btn-black d-flex align-items-center"
            onClick={() => setView("preview")}
          >
            <MdPreview className="me-1" />
            View Preview
          </button>
        </div>
      )}

      {/* Textarea */}
      <div className="ai-textarea-wrapper">
        <textarea
          ref={textareaRef}
          disabled={isAiWorking}
          className="ai-textarea"
          placeholder="Describe the website you want to create..."
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
        />
      </div>

      {/* Action Bar - Always at bottom */}
      <div className="ai-action-bar">
        <div className="ai-tools">
          <button
            type="button"
            className="ai-tool-btn-black"
            title="Enhance Prompt with AI"
            disabled={isEnhancing || isAiWorking || !prompt.trim()}
            onClick={enhancePrompt}
          >
            <HiSparkles size={16} />
            {isEnhancing && <div className="ai-spinner-small"></div>}
          </button>

          <div className="ai-model-select-wrapper">
            <select
              className="ai-model-select-black"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isAiWorking}
              title="Select AI Model"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="claude-sonnet">Claude Sonnet</option>
              <option value="mistral-ai">Mistral AI</option>
              <option value="llama">Llama</option>
              <option value="ollama">Ollama</option>
            </select>
            <div className="ai-model-select-icon">
              <HiChip size={16} />
            </div>
          </div>

          <button
            type="button"
            className="ai-tool-btn-text-black"
            title="Configure AI Rules and Guidelines"
            disabled={isAiWorking}
            onClick={toggleAiRulesModal}
          >
            <HiDocumentText size={14} />
            <span>AI Rules</span>
          </button>

          <button
            type="button"
            className="ai-tool-btn-text-black"
            title="Configure Context Engine Settings"
            disabled={isAiWorking}
            onClick={toggleContextEngineModal}
          >
            <HiCog size={14} />
            <span>Context Engine</span>
          </button>
        </div>

        <button
          disabled={isAiWorking || isEnhancing || !prompt.trim()}
          className="ai-generate-btn-black"
          onClick={callAi}
          title="Generate Website"
        >
          {isAiWorking ? (
            <div className="ai-spinner"></div>
          ) : (
            <>
              <HiPlay size={16} />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {isAiWorking && (
        <div className="ai-status">
          <div className="ai-status-indicator">
            <div className="ai-pulse"></div>
            <span>AI is crafting your website... {Math.round(typingProgress)}%</span>
          </div>
        </div>
      )}

      {isEnhancing && (
        <div className="ai-status">
          <div className="ai-status-indicator">
            <div className="ai-pulse enhance"></div>
            <span>Enhancing your prompt...</span>
          </div>
        </div>
      )}

      {isAiRulesModalOpen && <AiRulesModal onClose={toggleAiRulesModal} />}
      {isContextEngineModalOpen && <ContextEngineModal onClose={toggleContextEngineModal} />}
    </div>
  );
}

export default AskAI;

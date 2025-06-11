/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { MdPreview } from "react-icons/md";
import ModelSelector from './ModelSelector';
import {
  HiSparkles,
  HiPlay
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
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      console.log("📡 Making fast fetch request to enhance prompt with model:", selectedModel);
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: selectedModel,
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

        // Log info about image functionality
        console.log("💡 Image Tip: The AI will now use high-quality Unsplash images automatically!");
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
    
    try {
      const requestBody = {
        prompt,
        model: selectedModel,
        ...(html === defaultHTML ? {} : { html }),
        ...(previousPrompt ? { previousPrompt } : {}),
      };
      
      console.log("📡 Making fetch request to /api/ask-ai with model:", selectedModel);
      
      const request = await fetch("/api/ask-ai", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (request && request.body) {
        if (!request.ok) {
          const res = await request.json();
          toast.error(res.message);
          setisAiWorking(false);
          return;
        }

        const reader = request.body.getReader();
        const decoder = new TextDecoder("utf-8");
        
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

            // Set final complete HTML
            const finalDoc = contentResponse.match(
              /<!DOCTYPE html>[\s\S]*<\/html>/
            )?.[0];
            if (finalDoc) {
              setHtml(finalDoc);
            }
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          contentResponse += chunk;

          const newHtml = contentResponse.match(
            /<!DOCTYPE html>[\s\S]*/
          )?.[0];
          
          if (newHtml) {
            let partialDoc = newHtml;
            
            // Smart HTML completion for partial documents
            if (partialDoc.includes("<head>") && !partialDoc.includes("</head>")) {
              partialDoc += "\n</head>";
            }
            if (partialDoc.includes("<body") && !partialDoc.includes("</body>")) {
              partialDoc += "\n</body>";
            }
            if (!partialDoc.includes("</html>")) {
              partialDoc += "\n</html>";
            }

            // Throttle renders to prevent flashing/flickering (DeepSite optimization)
            const now = Date.now();
            if (now - lastRenderTime > 300) {
              console.log("📝 AskAI - Setting HTML content for optimized preview:", partialDoc.length, "chars");
              setHtml(partialDoc);
              lastRenderTime = now;

              // Update typing progress
              const progress = Math.min((partialDoc.length / 3000) * 100, 95);
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

          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isAiWorking}
          />
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
    </div>
  );
}

export default AskAI;

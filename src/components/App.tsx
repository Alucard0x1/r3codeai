import { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import classNames from "classnames";
import { editor } from "monaco-editor";
import {
  useMount,
  useUnmount,
  useEvent,
  useLocalStorage,
} from "react-use";
import { toast } from "react-toastify";

import Header from "./header/header";
import DeployButton from "./deploy-button/deploy-button";

import { defaultHTML } from "./../../utils/consts";
import AskAI from "./ask-ai/ask-ai";
import Preview from "./preview/preview";
import handleError from "../utils/errorHandler.ts";

function App() {
  const [htmlStorage, , removeHtmlStorage] = useLocalStorage("html_content");

  const preview = useRef<HTMLDivElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  const resizer = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const aiPromptContainer = useRef<HTMLDivElement>(null);
  const verticalResizer = useRef<HTMLDivElement>(null);

  const [isResizing, setIsResizing] = useState(false);
  const [isVerticalResizing, setIsVerticalResizing] = useState(false);
  const [aiPromptHeight, setAiPromptHeight] = useState(250);
  const [error, setError] = useState(false);
  const [html, setHtml] = useState((htmlStorage as string) ?? defaultHTML);


  const [isAiWorking, setisAiWorking] = useState(false);
  const [currentView, setCurrentView] = useState<"editor" | "preview">(
    "editor"
  );





  /**
   * Resets the layout based on screen size
   * - For desktop: Sets editor to 40% width and preview to 60%
   * - For mobile: Removes inline styles to let Bootstrap handle it
   */
  const resetLayout = () => {
    if (!editor.current || !preview.current) return;

    // Bootstrap lg breakpoint is 992px
    if (window.innerWidth >= 992) {
      // Set initial 40% - 60% sizes for large screens, accounting for resizer width
      const resizerWidth = resizer.current?.offsetWidth ?? 4;
      const availableWidth = window.innerWidth - resizerWidth;
      const initialEditorWidth = availableWidth * 0.4; // Editor takes 40% of space
      const initialPreviewWidth = availableWidth * 0.6; // Preview takes 60%

      // Apply flex-basis instead of width for better Bootstrap compatibility
      editor.current.style.flexBasis = `${initialEditorWidth}px`;
      editor.current.style.width = `${initialEditorWidth}px`;
      editor.current.style.maxWidth = `${initialEditorWidth}px`;

      preview.current.style.flexBasis = `${initialPreviewWidth}px`;
      preview.current.style.width = `${initialPreviewWidth}px`;
      preview.current.style.maxWidth = `${initialPreviewWidth}px`;
    } else {
      // Remove inline styles for smaller screens, let Bootstrap handle it
      editor.current.style.flexBasis = "";
      editor.current.style.width = "";
      editor.current.style.maxWidth = "";
      preview.current.style.flexBasis = "";
      preview.current.style.width = "";
      preview.current.style.maxWidth = "";
    }
  };

  /**
   * Handles resizing when the user drags the resizer
   * Ensures minimum widths are maintained for both panels
   */
  const handleResize = (e: MouseEvent) => {
    if (!editor.current || !preview.current || !resizer.current) return;

    const resizerWidth = resizer.current.offsetWidth;
    const minWidth = 250; // Minimum width for editor/preview
    const maxWidth = window.innerWidth - resizerWidth - minWidth;

    const editorWidth = e.clientX;
    const clampedEditorWidth = Math.max(
      minWidth,
      Math.min(editorWidth, maxWidth)
    );
    const calculatedPreviewWidth =
      window.innerWidth - clampedEditorWidth - resizerWidth;

    // Update both width and flex-basis for Bootstrap compatibility
    editor.current.style.flexBasis = `${clampedEditorWidth}px`;
    editor.current.style.width = `${clampedEditorWidth}px`;
    editor.current.style.maxWidth = `${clampedEditorWidth}px`;

    preview.current.style.flexBasis = `${calculatedPreviewWidth}px`;
    preview.current.style.width = `${calculatedPreviewWidth}px`;
    preview.current.style.maxWidth = `${calculatedPreviewWidth}px`;
  };

  const handleMouseDown = () => {
    setIsResizing(true);
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  /**
   * Handles vertical resizing of the AI prompt container
   */
  const handleVerticalResize = (e: MouseEvent) => {
    if (!aiPromptContainer.current || !editor.current) return;

    const editorRect = editor.current.getBoundingClientRect();
    const minHeight = 120;
    const maxHeight = 600;

    // Calculate new height based on mouse position from bottom of editor
    const newHeight = editorRect.bottom - e.clientY;
    const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));

    setAiPromptHeight(clampedHeight);
  };

  const handleVerticalMouseDown = () => {
    setIsVerticalResizing(true);
    document.addEventListener("mousemove", handleVerticalResize);
    document.addEventListener("mouseup", handleVerticalMouseUp);
  };

  const handleVerticalMouseUp = () => {
    setIsVerticalResizing(false);
    document.removeEventListener("mousemove", handleVerticalResize);
    document.removeEventListener("mouseup", handleVerticalMouseUp);
  };



  // Prevent accidental navigation away when AI is working or content has changed
  useEvent("beforeunload", (e) => {
    if (isAiWorking || html !== defaultHTML) {
      e.preventDefault();
      return "";
    }
  });

  // Initialize component on mount
  useMount(() => {
    // Restore content from storage if available
    if (htmlStorage) {
      removeHtmlStorage();
      toast.warn("Previous HTML content restored from local storage.");
    }

    // Set initial layout based on window size
    resetLayout();

    // Attach event listeners
    if (resizer.current) {
      resizer.current.addEventListener("mousedown", handleMouseDown);
    }
    if (verticalResizer.current) {
      verticalResizer.current.addEventListener("mousedown", handleVerticalMouseDown);
    }
    window.addEventListener("resize", resetLayout);
  });

  // Clean up event listeners on unmount
  useUnmount(() => {
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("mousemove", handleVerticalResize);
    document.removeEventListener("mouseup", handleVerticalMouseUp);
    if (resizer.current) {
      resizer.current.removeEventListener("mousedown", handleMouseDown);
    }
    if (verticalResizer.current) {
      verticalResizer.current.removeEventListener("mousedown", handleVerticalMouseDown);
    }
    window.removeEventListener("resize", resetLayout);
  });

  return (
    <div className="vh-100 d-flex flex-column" style={{ background: 'var(--ids-gray-900)' }}>
      <Header
        onReset={() => {
          if (isAiWorking) {
            toast.warn("Please wait for the AI to finish working.");
            return;
          }
          if (
            window.confirm("You're about to reset the editor. Are you sure?")
          ) {
            setHtml(defaultHTML);
            setError(false);
            removeHtmlStorage();
            editorRef.current?.revealLine(
              editorRef.current?.getModel()?.getLineCount() ?? 0
            );
          }
        }}

        html={html}
        defaultHTML={defaultHTML}
      >
        <DeployButton html={html} error={error} />
      </Header>



      <main
        className="main-layout position-relative"
        style={{
          background: 'linear-gradient(135deg, var(--ids-gray-900) 0%, var(--ids-gray-800) 100%)'
        }}
      >
        <div
          ref={editor}
          className={classNames(
            "editor-panel position-relative overflow-hidden user-select-none",
            {
              "d-none d-lg-flex": currentView === "preview",
              "d-flex": currentView === "editor",
            }
          )}
        >
          <div
            className="d-flex flex-column h-100"
          >
            <div
              className="flex-grow-1"
              style={{
                height: `calc(100% - ${aiPromptHeight}px - 4px)`,
                minHeight: '200px'
              }}
              onClick={(e) => {
                if (isAiWorking) {
                  e.preventDefault();
                  e.stopPropagation();
                  toast.warn("Please wait for the AI to finish working.");
                }
              }}
            >
              <Editor
              language="html"
              theme="vs-dark"
              className={classNames(
                "w-100 h-100",
                {
                  "pe-none": isAiWorking,
                }
              )}
              value={html}
              options={{
                minimap: { enabled: false },
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                overviewRulerBorder: false,
                fontSize: 14,
                lineHeight: 20,
                padding: { top: 16, bottom: 16 },
                wordWrap: 'on',
                automaticLayout: true,
              }}
              onValidate={(markers) => {
                if (markers?.length > 0) {
                  setError(true);
                }
              }}
              onChange={(value) => {
                const newValue = value ?? "";
                setHtml(newValue);
                setError(false);
              }}
              onMount={(editor) => {
                editorRef.current = editor;

                // Configure editor for better AI typing experience and clean interface
                editor.updateOptions({
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  automaticLayout: true,
                  minimap: { enabled: false }, // Disable the useless minimap
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                  overviewRulerLanes: 0, // Remove overview ruler
                  hideCursorInOverviewRuler: true,
                  overviewRulerBorder: false,
                });
              }}
              />
            </div>
            <div
              ref={verticalResizer}
              className="vertical-resizer"
              style={{
                height: '4px',
                background: isVerticalResizing ? 'rgba(14, 165, 233, 0.5)' : 'transparent',
                cursor: 'ns-resize',
                transition: 'background-color 0.2s ease',
                flexShrink: 0,
                position: 'relative'
              }}
            />
            <div
              ref={aiPromptContainer}
              style={{
                height: `${aiPromptHeight}px`, // Restore height control for vertical resizing
                minHeight: '120px',
                maxHeight: '600px',
                flexShrink: 0,
                overflow: 'visible', // Allow content to overflow if needed
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <AskAI
                html={html}
                setHtml={setHtml}
                isAiWorking={isAiWorking}
                setisAiWorking={setisAiWorking}
                setView={setCurrentView}
                onScrollToBottom={() => {
                  editorRef.current?.revealLine(
                    editorRef.current?.getModel()?.getLineCount() ?? 0
                  );
                }}
              />
            </div>
          </div>
        </div>
        <div
          ref={resizer}
          className="resizer d-none d-lg-block"
        />
        <Preview
          html={html}
          isResizing={isResizing}
          isAiWorking={isAiWorking}
          ref={preview}
          setView={setCurrentView}
        />
      </main>
    </div>
  );
}

export default App;

import classNames from "classnames";
import { useRef, useEffect } from "react";
import { TbReload } from "react-icons/tb";
import { toast } from "react-toastify";
import { FaLaptopCode } from "react-icons/fa6";

function Preview({
  html,
  isResizing,
  isAiWorking,
  setView,
  ref,
}: {
  html: string;
  isResizing: boolean;
  isAiWorking: boolean;
  setView: React.Dispatch<React.SetStateAction<"editor" | "preview">>;
  ref: React.RefObject<HTMLDivElement | null>;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);



  // Real-time preview update during AI streaming
  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;

    // Use srcdoc for real-time updates - it's the most reliable method
    iframe.srcdoc = html;

  }, [html]);

  const handleRefreshIframe = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const content = iframe.srcdoc;
      iframe.srcdoc = "";
      setTimeout(() => {
        iframe.srcdoc = content;
      }, 10);
    }
  };

  return (
    <div
      ref={ref}
      className="preview-panel bg-black position-relative"
      style={{
        background: '#000000',
        border: 'none'
      }}
      onClick={(e) => {
        if (isAiWorking) {
          e.preventDefault();
          e.stopPropagation();
          toast.warn("Please wait for the AI to finish working.");
        }
      }}
    >
      <iframe
        ref={iframeRef}
        title="output"
        className={classNames("w-100 h-100 user-select-none border-0", {
          "pe-none": isResizing || isAiWorking,
        })}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation"
      />

      {/* AI Working Indicator */}
      {isAiWorking && (
        <div className="position-absolute top-0 start-0 end-0 p-3" style={{ zIndex: 10, pointerEvents: 'none' }}>
          <div className="alert alert-primary d-flex align-items-center shadow-sm" style={{ maxWidth: '300px' }}>
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div>
              <div className="fw-semibold small">AI is generating...</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Watch the preview update live ✨
              </div>
            </div>
          </div>
        </div>
      )}

      {!isAiWorking && (
        <div className="position-absolute bottom-0 start-0 end-0 p-3 d-flex justify-content-between align-items-end">
          <button
            className="preview-btn-black d-lg-none d-flex align-items-center"
            onClick={() => setView("editor")}
          >
            <FaLaptopCode className="me-1" />
            Back to Editor
          </button>
          <button
            className="preview-btn-black-outline d-flex align-items-center ms-auto"
            onClick={handleRefreshIframe}
          >
            <TbReload className="me-1" />
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

export default Preview;

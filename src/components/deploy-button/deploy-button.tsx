/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { toast } from "react-toastify";
import { TbRocket } from "react-icons/tb";

import SpaceIcon from "@/assets/space.svg";

const MsgToast = ({ url }: { url: string }) => (
  <div className="w-full flex items-center justify-center gap-3">
    Your project is deployed!
    <button
      className="bg-black text-sm block text-white rounded-md px-3 py-1.5 hover:bg-gray-900 cursor-pointer"
      onClick={() => {
        window.open(url, "_blank");
      }}
    >
      View Project
    </button>
  </div>
);

function DeployButton({
  html,
  error = false,
}: {
  html: string;
  error: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState({
    title: "",
  });

  // Handle click outside and escape key to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [open]);

  const deployProject = async () => {
    setLoading(true);

    try {
      const request = await fetch("/api/deploy", {
        method: "POST",
        body: JSON.stringify({
          title: config.title,
          html,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await request.json();
      if (response.ok) {
        toast.success(
          <MsgToast
            url={response.url}
          />,
          {
            autoClose: 10000,
          }
        );

      } else {
        toast.error(response.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="dropdown position-relative" ref={dropdownRef}>
      <button
        className={`nav-btn-black-primary d-flex align-items-center ${open ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        title="Deploy your project"
      >
        <TbRocket className="me-2" size={16} />
        Deploy
      </button>

      {/* Custom Dropdown Menu */}
      <div
        className={`deploy-dropdown position-absolute ${open ? 'd-block' : 'd-none'}`}
        style={{
          top: '100%',
          right: 0,
          marginTop: '8px',
          zIndex: 1050
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="deploy-content">
          <div className="deploy-title">Deploy Project</div>

          <input
            type="text"
            value={config.title}
            className="deploy-input"
            placeholder="Enter project name"
            onChange={(e) =>
              setConfig({ ...config, title: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
          />

          {error && (
            <div className="deploy-error">
              Fix code errors before deploying
            </div>
          )}

          <button
            disabled={error || loading || !config.title}
            className="deploy-btn-black"
            onClick={(e) => {
              e.stopPropagation();
              deployProject();
            }}
          >
            {loading ? (
              <>
                <div className="deploy-spinner"></div>
                Deploying...
              </>
            ) : (
              <>
                <TbRocket size={16} />
                Deploy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeployButton;

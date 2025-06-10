import { ReactNode, useState } from "react";
import { TbReload, TbCode, TbPlug } from "react-icons/tb";
import { FaGithub } from "react-icons/fa";
import McpModal from './McpModal';
import { HiLightningBolt } from "react-icons/hi";

function Header({
  onReset,
  html,
  defaultHTML,
  children,
}: {
  onReset: () => void;
  html: string;
  defaultHTML: string;
  children?: ReactNode;
}) {
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);

  const toggleMcpModal = () => {
    setIsMcpModalOpen(!isMcpModalOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg ids-navbar-modern sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        {/* Modern Brand */}
        <div className="navbar-brand d-flex align-items-center">
          <div className="d-flex align-items-center">
            <div
              className="brand-icon d-flex align-items-center justify-content-center me-3 position-relative"
            >
              <TbCode className="text-white" size={20} />
              <div className="brand-glow"></div>
            </div>
            <div>
              <div className="d-flex align-items-center">
                <span className="brand-text me-2">R3Code AI</span>
                <HiLightningBolt className="brand-flash-icon" size={14} />
              </div>
              <div className="brand-subtitle d-none d-lg-block">
                Create Best UI/UX in Single HTML File
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="d-flex align-items-center gap-2">

          {/* Reset Button */}
          <button
            className="nav-btn-black d-none d-md-flex align-items-center"
            onClick={onReset}
            title="Reset Editor"
          >
            <TbReload className="me-2" size={16} />
            <span>Reset</span>
          </button>

          {/* Connect MCP Button */}
          <button
            className="nav-btn-black d-none d-md-flex align-items-center"
            onClick={toggleMcpModal}
            title="Connect to MCP Server"
          >
            <TbPlug className="me-2" size={16} />
            <span>Connect MCP</span>
          </button>



          {/* Children (Deploy Button) */}
          {children}

          {/* GitHub Link */}
          <a
            href="https://github.com/r3code-ai/r3code-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn-black-outline d-flex align-items-center"
            title="View on GitHub"
          >
            <FaGithub className="me-2" size={16} />
            <span className="d-none d-lg-inline">GitHub</span>
          </a>

          {/* Status Indicator */}
          <div className="status-indicator d-none d-xl-flex align-items-center ms-2">
            <div className="status-pill">
              <div className="status-dot"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>
      {isMcpModalOpen && <McpModal onClose={toggleMcpModal} />}
    </nav>
  );
}

export default Header;

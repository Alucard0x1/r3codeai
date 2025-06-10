import React from 'react';

interface McpModalProps {
  onClose: () => void;
}

const McpModal: React.FC<McpModalProps> = ({ onClose }) => {
  return (
    <div className="mcp-modal-overlay">
      <div className="mcp-modal-content">
        <h2>Connect to MCP</h2>
        <p>This is a placeholder for the MCP connection modal.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default McpModal;

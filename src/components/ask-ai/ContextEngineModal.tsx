import React from 'react';

interface ContextEngineModalProps {
  onClose: () => void;
}

const ContextEngineModal: React.FC<ContextEngineModalProps> = ({ onClose }) => {
  return (
    <div className="context-engine-modal-overlay">
      <div className="context-engine-modal-content">
        <h2>Context Engine Settings</h2>
        <p>This is a placeholder for the Context Engine settings modal.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ContextEngineModal;

import React from 'react';

interface AiRulesModalProps {
  onClose: () => void;
}

const AiRulesModal: React.FC<AiRulesModalProps> = ({ onClose }) => {
  return (
    <div className="ai-rules-modal-overlay">
      <div className="ai-rules-modal-content">
        <h2>AI Rules</h2>
        <p>This is a placeholder for the AI Rules modal.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AiRulesModal;

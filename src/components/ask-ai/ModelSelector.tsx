import React, { useState, useEffect } from 'react';
import { 
  HiChip, 
  HiInformationCircle, 
  HiCurrencyDollar,
  HiClock,
  HiGlobeAlt,
  HiDesktopComputer,
  HiServer,
  HiSparkles
} from 'react-icons/hi';

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  features: string[];
  contextLength: number;
  cost: {
    input: number;
    output: number;
    free: boolean;
  };
  available: string;
  connected?: boolean;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

const MODEL_ICONS = {
  google: '🧠',
  anthropic: '🤖',
  mistral: '🌟',
  meta: '🦙',
  deepseek: '🔥',
  ollama: '💻'
};

const MODEL_COLORS = {
  // Google Gemini Models
  'gemini-2.5-pro': '#4285f4',
  'gemini-2.5-flash': '#0f9d58',
  'gemini-2.0-flash': '#34a853',
  'gemini-1.5-pro': '#ea4335',
  'gemini-1.5-flash': '#fbbc04',
  'gemini-2.5-flash-native-audio': '#9aa0a6',
  'gemini-2.0-flash-image-gen': '#34a853',
  'imagen-3': '#4285f4',
  'veo-2': '#ea4335',
  
  // Anthropic Claude Models
  'claude-4-opus': '#ff6b35',
  'claude-4-sonnet': '#ff8c42',
  'claude-3.7-sonnet': '#ffa366',
  'claude-3.5-sonnet': '#ffb399',
  'claude-3.5-haiku': '#ffcc99',
  'claude-3-opus': '#ff5722',
  
  // Mistral AI Models
  'magistral-medium': '#ff4081',
  'mistral-medium': '#ff6b9d',
  'mistral-large': '#ff8bb3',
  'pixtral-large': '#ffadd6',
  'codestral': '#e91e63',
  'mistral-ocr': '#f06292',
  
  // DeepSeek Models
  'deepseek-r1': '#ff4444',
  'deepseek-v3': '#ff6666',
  
  // Meta Llama Models
  'llama-3.3': '#1877f2',
  
  // Local Models
  'ollama': '#2d3748'
};

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onModelChange, 
  disabled = false 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default models configuration (fallback) - Updated with latest 2025 API names
  const defaultModels: ModelConfig[] = [
    // Google Gemini Models (Latest 2025)
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro Preview',
      provider: 'google',
      description: 'Google\'s most advanced reasoning model with Deep Think capabilities',
      features: ['text', 'multimodal', 'reasoning', 'thinking', 'code', 'large-context'],
      contextLength: 1048576,
      cost: { input: 1.25, output: 10.00, free: false },
      available: 'API key required'
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash Preview',
      provider: 'google',
      description: 'Google\'s first hybrid reasoning model with adjustable thinking budgets',
      features: ['text', 'multimodal', 'reasoning', 'thinking', 'code', 'fast'],
      contextLength: 1048576,
      cost: { input: 0.15, output: 0.60, free: false },
      available: 'API key required'
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      provider: 'google',
      description: 'Google\'s fast multimodal model with native tool use',
      features: ['text', 'multimodal', 'code', 'fast', 'tool-use'],
      contextLength: 1000000,
      cost: { input: 0.075, output: 0.30, free: false },
      available: 'API key required'
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      description: 'Complex reasoning tasks requiring more intelligence',
      features: ['text', 'multimodal', 'reasoning', 'large-context'],
      contextLength: 2000000,
      cost: { input: 1.25, output: 5.00, free: false },
      available: 'API key required'
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'google',
      description: 'Fast and versatile performance across a diverse variety of tasks',
      features: ['text', 'multimodal', 'code', 'fast'],
      contextLength: 1000000,
      cost: { input: 0.075, output: 0.30, free: false },
      available: 'API key required'
    },
    
    // Anthropic Claude Models (Latest 2025)
    {
      id: 'claude-4-opus',
      name: 'Claude 4 Opus',
      provider: 'anthropic',
      description: 'Anthropic\'s most powerful and capable model with superior reasoning',
      features: ['text', 'reasoning', 'code', 'analysis', 'vision', 'advanced-reasoning'],
      contextLength: 200000,
      cost: { input: 15.00, output: 75.00, free: false },
      available: 'API key required'
    },
    {
      id: 'claude-4-sonnet',
      name: 'Claude 4 Sonnet',
      provider: 'anthropic',
      description: 'Anthropic\'s high-performance model with exceptional reasoning',
      features: ['text', 'reasoning', 'code', 'analysis', 'vision', 'high-performance'],
      contextLength: 200000,
      cost: { input: 3.00, output: 15.00, free: false },
      available: 'API key required'
    },
    {
      id: 'claude-3.7-sonnet',
      name: 'Claude 3.7 Sonnet',
      provider: 'anthropic',
      description: 'High intelligence with toggleable extended thinking',
      features: ['text', 'reasoning', 'code', 'analysis', 'vision', 'extended-thinking'],
      contextLength: 200000,
      cost: { input: 3.00, output: 15.00, free: false },
      available: 'API key required'
    },
    {
      id: 'claude-3.5-haiku',
      name: 'Claude 3.5 Haiku',
      provider: 'anthropic',
      description: 'Fastest model, intelligence at blazing speeds',
      features: ['text', 'reasoning', 'code', 'analysis', 'vision', 'fast'],
      contextLength: 200000,
      cost: { input: 0.25, output: 1.25, free: false },
      available: 'API key required'
    },
    
    // Mistral AI Models (Latest 2025)
    {
      id: 'magistral-medium',
      name: 'Magistral Medium',
      provider: 'mistral',
      description: 'Frontier-class reasoning model',
      features: ['text', 'reasoning', 'frontier-class'],
      contextLength: 40000,
      cost: { input: 2.50, output: 7.50, free: false },
      available: 'API key required'
    },
    {
      id: 'mistral-medium',
      name: 'Mistral Medium',
      provider: 'mistral',
      description: 'Frontier-class multimodal model',
      features: ['text', 'multimodal', 'frontier-class'],
      contextLength: 128000,
      cost: { input: 2.00, output: 6.00, free: false },
      available: 'API key required'
    },
    {
      id: 'mistral-large',
      name: 'Mistral Large',
      provider: 'mistral',
      description: 'Top-tier reasoning model for high-complexity tasks',
      features: ['text', 'multilingual', 'reasoning', 'code'],
      contextLength: 128000,
      cost: { input: 2.00, output: 6.00, free: false },
      available: 'API key required'
    },
    {
      id: 'pixtral-large',
      name: 'Pixtral Large',
      provider: 'mistral',
      description: 'Frontier-class multimodal model',
      features: ['text', 'multimodal', 'frontier-class'],
      contextLength: 128000,
      cost: { input: 2.00, output: 6.00, free: false },
      available: 'API key required'
    },
    {
      id: 'codestral',
      name: 'Codestral',
      provider: 'mistral',
      description: 'Cutting-edge language model for coding',
      features: ['text', 'code', 'programming'],
      contextLength: 256000,
      cost: { input: 1.00, output: 3.00, free: false },
      available: 'API key required'
    },
    
    // DeepSeek Models
    {
      id: 'deepseek-r1',
      name: 'DeepSeek R1',
      provider: 'deepseek',
      description: 'DeepSeek\'s latest reasoning model with enhanced capabilities',
      features: ['text', 'reasoning', 'code', 'thinking', 'step-by-step'],
      contextLength: 128000,
      cost: { input: 0.55, output: 2.19, free: false },
      available: 'API key required'
    },
    {
      id: 'deepseek-v3',
      name: 'DeepSeek V3',
      provider: 'deepseek',
      description: 'DeepSeek\'s general-purpose model with excellent performance',
      features: ['text', 'reasoning', 'code', 'efficient', 'open-source'],
      contextLength: 128000,
      cost: { input: 0.27, output: 1.10, free: false },
      available: 'API key required'
    },
    
    // Meta Llama Models
    {
      id: 'llama-3.3',
      name: 'Llama 3.3',
      provider: 'meta',
      description: 'Meta\'s latest open-source model with high performance',
      features: ['text', 'open-source', 'reasoning', 'efficient'],
      contextLength: 128000,
      cost: { input: 0.59, output: 0.79, free: false },
      available: 'API key required'
    },
    
    // Local Ollama
    {
      id: 'ollama',
      name: 'Ollama',
      provider: 'ollama',
      description: 'Local AI model running on your machine',
      features: ['text', 'local', 'private', 'free'],
      contextLength: 128000,
      cost: { input: 0, output: 0, free: true },
      available: 'Local installation required',
      connected: false
    }
  ];

  // Load models from API
  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/models');
        if (response.ok) {
          const data = await response.json();
          setModels(data.models || defaultModels);
        } else {
          setModels(defaultModels);
        }
      } catch (err) {
        console.error('Failed to load models:', err);
        setModels(defaultModels);
        setError('Using default models');
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDetails) {
        setShowDetails(false);
      }
    };

    if (showDetails) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showDetails]);

  const selectedModelConfig = models.find(m => m.id === selectedModel) || models[0];

  const formatCost = (cost: number) => {
    if (cost === 0) return 'Free';
    if (cost < 1) return `$${cost.toFixed(3)}/1M`;
    return `$${cost.toFixed(2)}/1M`;
  };

  const formatContext = (length: number) => {
    if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M`;
    if (length >= 1000) return `${(length / 1000).toFixed(0)}K`;
    return length.toString();
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'fast': return <HiClock className="feature-icon" />;
      case 'multimodal': return <HiSparkles className="feature-icon" />;
      case 'local': return <HiDesktopComputer className="feature-icon" />;
      case 'free': return <HiCurrencyDollar className="feature-icon" />;
      case 'reasoning': return <HiChip className="feature-icon" />;
      case 'multilingual': return <HiGlobeAlt className="feature-icon" />;
      case 'private': return <HiServer className="feature-icon" />;
      default: return null;
    }
  };

  return (
    <div className="model-selector">
      {/* Main Model Button */}
      <button
        type="button"
        className={`ai-tool-btn-text-black model-selector-btn ${showDetails ? 'active' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
        disabled={disabled || loading}
        title={selectedModelConfig?.description || "Select AI Model"}
        style={{
          borderColor: MODEL_COLORS[selectedModel as keyof typeof MODEL_COLORS] || 'rgba(255, 255, 255, 0.2)',
          borderWidth: '1px'
        }}
      >
        <div className="model-selector-content">
          <span className="model-provider-icon">
            {MODEL_ICONS[selectedModelConfig?.provider as keyof typeof MODEL_ICONS]}
          </span>
          <div className="model-selector-text">
            <span className="model-name">{selectedModelConfig?.name}</span>
            <span className="model-cost">
              ({selectedModelConfig?.cost.free ? 'Free' : formatCost(selectedModelConfig?.cost.input || 0)})
            </span>
          </div>
          <HiChip
            size={14}
            style={{
              color: MODEL_COLORS[selectedModel as keyof typeof MODEL_COLORS] || '#9ca3af',
              marginLeft: 'auto',
              transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        </div>
      </button>

      {/* Model Selection Dropdown - Upward Expanding */}
      {showDetails && (
        <>
          {/* Backdrop to close dropdown */}
          <div className="model-dropdown-backdrop" onClick={() => setShowDetails(false)} />

          {/* Dropdown Content */}
          <div className="model-dropdown-upward">
            <div className="model-dropdown-header">
              <h3>Select AI Model</h3>
              <span className="model-count">{models.length} models</span>
            </div>

            <div className="model-dropdown-list">
              {models.map((model) => (
                <button
                  key={model.id}
                  className={`model-dropdown-item-simple ${selectedModel === model.id ? 'active' : ''}`}
                  onClick={() => {
                    onModelChange(model.id);
                    setShowDetails(false);
                  }}
                >
                  <div className="model-item-left">
                    <span className="model-provider-icon">
                      {MODEL_ICONS[model.provider as keyof typeof MODEL_ICONS]}
                    </span>
                    <span className="model-simple-name">{model.name}</span>
                  </div>
                  <div className="model-item-right">
                    <span className="model-simple-cost">/{formatContext(model.contextLength)}</span>
                    <div 
                      className={`connection-indicator ${model.connected ? 'connected' : 'disconnected'}`}
                      title={model.connected ? 'API Connected' : 'API Key Required'}
                    >
                      <div className="connection-dot"></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="model-dropdown-error">
                <HiInformationCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Loading State */}
      {loading && (
        <div className="model-loading-indicator">
          <div className="ai-spinner-small"></div>
          <span>Loading models...</span>
        </div>
      )}
    </div>
  );
};

export default ModelSelector; 
export const UI_PATTERNS = {
  HERO_SECTIONS: {
    minimal: `
      <!-- Minimal Hero -->
      <section class="relative h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div class="text-center max-w-4xl mx-auto px-6">
          <h1 class="text-6xl font-bold text-white mb-6">Headline That Converts</h1>
          <p class="text-xl text-slate-300 mb-8">Clear value proposition in one compelling sentence</p>
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105">
            Get Started
          </button>
        </div>
      </section>`,
    
    withVideo: `
      <!-- Video Hero -->
      <section class="relative h-screen overflow-hidden">
        <video autoplay muted loop class="absolute inset-0 w-full h-full object-cover">
          <source src="https://source.unsplash.com/1920x1080" type="video/mp4">
        </video>
        <div class="absolute inset-0 bg-black bg-opacity-40"></div>
        <div class="relative z-10 h-full flex items-center justify-center text-center">
          <div class="max-w-4xl mx-auto px-6 text-white">
            <h1 class="text-7xl font-bold mb-6">Bold Statement</h1>
            <p class="text-2xl mb-8 opacity-90">Supporting message that builds trust</p>
            <div class="space-x-4">
              <button class="bg-white text-black px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                Primary CTA
              </button>
              <button class="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-black transition-all">
                Secondary CTA
              </button>
            </div>
          </div>
        </div>
      </section>`
  },

  NAVIGATION: {
    modern: `
      <!-- Modern Navigation -->
      <nav class="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-8">
              <div class="text-2xl font-bold text-gray-900">Brand</div>
              <div class="hidden md:flex space-x-6">
                <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">Product</a>
                <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">Features</a>
                <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">Pricing</a>
                <a href="#" class="text-gray-700 hover:text-gray-900 transition-colors">About</a>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <button class="text-gray-700 hover:text-gray-900">Login</button>
              <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>`,

    sidebar: `
      <!-- Sidebar Navigation -->
      <aside class="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300">
        <div class="p-6">
          <div class="text-2xl font-bold mb-8">Dashboard</div>
          <nav class="space-y-2">
            <a href="#" class="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white">
              <span>🏠</span>
              <span>Home</span>
            </a>
            <a href="#" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <span>📊</span>
              <span>Analytics</span>
            </a>
            <a href="#" class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <span>⚙️</span>
              <span>Settings</span>
            </a>
          </nav>
        </div>
      </aside>`
  },

  CARDS: {
    pricing: `
      <!-- Pricing Cards -->
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Starter</h3>
          <div class="text-4xl font-bold text-gray-900 mb-6">$9<span class="text-lg text-gray-500">/mo</span></div>
          <ul class="space-y-3 mb-8">
            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span>Feature one</li>
            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span>Feature two</li>
            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span>Feature three</li>
          </ul>
          <button class="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Get Started
          </button>
        </div>
        
        <div class="bg-blue-600 rounded-2xl shadow-xl p-8 border-2 border-blue-500 transform scale-105">
          <div class="text-center mb-4">
            <span class="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">Most Popular</span>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">Professional</h3>
          <div class="text-4xl font-bold text-white mb-6">$29<span class="text-lg text-blue-200">/mo</span></div>
          <ul class="space-y-3 mb-8 text-white">
            <li class="flex items-center"><span class="text-green-400 mr-2">✓</span>Everything in Starter</li>
            <li class="flex items-center"><span class="text-green-400 mr-2">✓</span>Advanced features</li>
            <li class="flex items-center"><span class="text-green-400 mr-2">✓</span>Priority support</li>
          </ul>
          <button class="w-full bg-white text-blue-600 py-3 rounded-lg hover:bg-gray-100 transition-colors font-bold">
            Get Started
          </button>
        </div>
        
        <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
          <div class="text-4xl font-bold text-gray-900 mb-6">$99<span class="text-lg text-gray-500">/mo</span></div>
          <ul class="space-y-3 mb-8">
            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span>Everything in Pro</li>
            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span>Custom integrations</li>
            <li class="flex items-center"><span class="text-green-500 mr-2">✓</span>Dedicated support</li>
          </ul>
          <button class="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>`,

    feature: `
      <!-- Feature Cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
            <span class="text-2xl">⚡</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
          <p class="text-gray-600 leading-relaxed">
            Experience blazing fast performance with our optimized infrastructure and cutting-edge technology.
          </p>
        </div>
        
        <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
            <span class="text-2xl">🔒</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">Secure & Private</h3>
          <p class="text-gray-600 leading-relaxed">
            Your data is protected with enterprise-grade security and privacy measures you can trust.
          </p>
        </div>
        
        <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
            <span class="text-2xl">📈</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">Scalable</h3>
          <p class="text-gray-600 leading-relaxed">
            Grow without limits. Our platform scales seamlessly with your business needs.
          </p>
        </div>
      </div>`
  },

  FORMS: {
    contact: `
      <!-- Modern Contact Form -->
      <form class="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Get in Touch</h2>
        
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="John">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Doe">
          </div>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="john@example.com">
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" placeholder="Tell us how we can help..."></textarea>
        </div>
        
        <button type="submit" class="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors transform hover:scale-[1.02]">
          Send Message
        </button>
      </form>`,

    newsletter: `
      <!-- Newsletter Signup -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div class="max-w-2xl mx-auto text-center">
          <h3 class="text-3xl font-bold mb-4">Stay Updated</h3>
          <p class="text-blue-100 mb-8">Get the latest news and updates delivered to your inbox.</p>
          
          <form class="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              class="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            >
            <button 
              type="submit" 
              class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          
          <p class="text-blue-200 text-sm mt-4">No spam. Unsubscribe at any time.</p>
        </div>
      </div>`
  },

  BUTTONS: {
    primary: `<button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">Primary Action</button>`,
    secondary: `<button class="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all">Secondary Action</button>`,
    ghost: `<button class="text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-all">Ghost Button</button>`,
    destructive: `<button class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">Delete</button>`,
    loading: `<button class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold opacity-75 cursor-not-allowed flex items-center">
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading...
    </button>`
  },

  ANIMATIONS: {
    fadeIn: `
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.6s ease-out forwards; }
      </style>`,
      
    slideIn: `
      <style>
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .slide-in-left { animation: slideInLeft 0.8s ease-out forwards; }
      </style>`,
      
    bounce: `
      <style>
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0, -8px, 0); }
          70% { transform: translate3d(0, -4px, 0); }
          90% { transform: translate3d(0, -2px, 0); }
        }
        .bounce { animation: bounce 1s ease-in-out; }
      </style>`
  },

  MICRO_INTERACTIONS: {
    buttonPress: `
      <style>
        .btn-press {
          transition: all 0.1s ease;
        }
        .btn-press:active {
          transform: scale(0.98);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      </style>`,
      
    hoverGlow: `
      <style>
        .hover-glow {
          transition: all 0.3s ease;
        }
        .hover-glow:hover {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }
      </style>`,
      
    ripple: `
      <style>
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .ripple {
          position: relative;
          overflow: hidden;
        }
        .ripple::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          transform: scale(0);
          pointer-events: none;
        }
        .ripple:active::before {
          animation: ripple 0.6s ease-out;
        }
      </style>`
  }
};

export const DESIGN_PRINCIPLES = {
  COGNITIVE_LOAD: [
    "Use familiar patterns and conventions",
    "Implement progressive disclosure for complex interfaces",
    "Limit choices to prevent decision paralysis (7±2 rule)",
    "Group related information using proximity and similarity",
    "Use clear, scannable typography hierarchy"
  ],
  
  VISUAL_HIERARCHY: [
    "Size: Larger elements draw more attention",
    "Color: High contrast elements stand out",
    "Position: Top and left areas are viewed first",
    "Whitespace: Isolated elements appear more important",
    "Typography: Bold and italic text creates emphasis"
  ],
  
  ACCESSIBILITY: [
    "Minimum 4.5:1 contrast ratio for normal text",
    "Minimum 44x44px touch targets for interactive elements",
    "Provide alternative text for images",
    "Ensure keyboard navigation support",
    "Use semantic HTML elements",
    "Include focus indicators for keyboard users"
  ],
  
  EMOTIONAL_DESIGN: [
    "Loading states should feel fast and informative",
    "Success states should feel rewarding with positive feedback",
    "Error states should be helpful, not punishing",
    "Empty states should guide users toward meaningful action",
    "Micro-interactions should delight without being distracting"
  ]
};

export const COLOR_PSYCHOLOGY = {
  BLUE: "Trust, reliability, professionalism - ideal for business and finance",
  GREEN: "Growth, success, nature - perfect for health and environmental",
  RED: "Urgency, passion, energy - great for calls-to-action and alerts",
  ORANGE: "Enthusiasm, creativity, warmth - excellent for creative and food",
  PURPLE: "Luxury, creativity, spirituality - suits premium and artistic brands",
  YELLOW: "Optimism, clarity, attention - effective for highlighting and warnings",
  BLACK: "Elegance, sophistication, power - classic for luxury and minimalism",
  WHITE: "Purity, simplicity, cleanliness - essential for modern and medical"
}; 
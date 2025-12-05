/* yume-hub.js — Central navigation hub for all Yume Tools
 *
 * Single-page app shell that dynamically loads widgets on demand.
 * Handles routing via URL hash (#mention, #parser, #admin)
 *
 * Exposes: `YumeHub.mount(selectorOrEl, { apiBase: 'https://api.itai.gg' })`
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.YumeHub = factory();
  }
})(this, function () {
  const CSS_ID = 'yume-hub-styles';

  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

    #yume-hub {
      font-family: 'Outfit', 'Segoe UI', sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
      color: #eee;
    }
    #yume-hub * { box-sizing: border-box; }

    /* Header */
    .yh-header {
      background: rgba(15, 15, 26, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(128, 181, 235, 0.2);
      padding: 0 20px;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .yh-header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
    }
    .yh-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 600;
      color: #80b5eb;
      text-decoration: none;
    }
    .yh-logo-icon {
      font-size: 28px;
    }

    /* Navigation */
    .yh-nav {
      display: flex;
      gap: 5px;
    }
    .yh-nav-item {
      padding: 10px 18px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: #888;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .yh-nav-item:hover {
      background: rgba(128, 181, 235, 0.1);
      color: #aaa;
    }
    .yh-nav-item.active {
      background: rgba(128, 181, 235, 0.2);
      color: #80b5eb;
    }
    .yh-nav-icon {
      font-size: 16px;
    }

    /* User section */
    .yh-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .yh-user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid rgba(128, 181, 235, 0.3);
    }
    .yh-user-name {
      font-size: 14px;
      color: #aaa;
    }
    .yh-login-btn {
      padding: 8px 16px;
      background: #5865F2;
      color: white;
      border: none;
      border-radius: 6px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .yh-login-btn:hover {
      background: #4752C4;
    }
    .yh-logout-btn {
      padding: 6px 12px;
      background: rgba(255,255,255,0.1);
      color: #888;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .yh-logout-btn:hover {
      background: rgba(255,255,255,0.15);
      color: #aaa;
    }

    /* Main content */
    .yh-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px 20px;
      min-height: calc(100vh - 60px);
    }

    /* Loading state */
    .yh-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #666;
    }
    .yh-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(128, 181, 235, 0.2);
      border-top-color: #80b5eb;
      border-radius: 50%;
      animation: yh-spin 0.8s linear infinite;
      margin-bottom: 15px;
    }
    @keyframes yh-spin {
      to { transform: rotate(360deg); }
    }

    /* Welcome screen */
    .yh-welcome {
      text-align: center;
      padding: 60px 20px;
    }
    .yh-welcome-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    .yh-welcome h2 {
      font-size: 28px;
      font-weight: 600;
      color: #80b5eb;
      margin: 0 0 10px 0;
    }
    .yh-welcome p {
      color: #888;
      font-size: 16px;
      margin: 0 0 30px 0;
    }
    .yh-tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      max-width: 900px;
      margin: 0 auto;
    }
    .yh-tool-card {
      background: rgba(42, 42, 74, 0.5);
      border: 1px solid rgba(128, 181, 235, 0.1);
      border-radius: 12px;
      padding: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
    }
    .yh-tool-card:hover {
      background: rgba(42, 42, 74, 0.8);
      border-color: rgba(128, 181, 235, 0.3);
      transform: translateY(-2px);
    }
    .yh-tool-card-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }
    .yh-tool-card h3 {
      font-size: 18px;
      font-weight: 600;
      color: #eee;
      margin: 0 0 8px 0;
    }
    .yh-tool-card p {
      font-size: 14px;
      color: #888;
      margin: 0;
      line-height: 1.5;
    }
    .yh-tool-card.locked {
      opacity: 0.6;
    }
    .yh-tool-card.locked:hover {
      transform: none;
    }
    .yh-lock-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #e74c3c;
      margin-top: 10px;
    }

    /* Widget container */
    .yh-widget-container {
      /* Widgets inject their own styles */
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .yh-header-inner {
        flex-wrap: wrap;
        height: auto;
        padding: 10px 0;
        gap: 10px;
      }
      .yh-nav {
        order: 3;
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }
      .yh-nav-item {
        padding: 8px 12px;
        font-size: 13px;
      }
      .yh-nav-item span:not(.yh-nav-icon) {
        display: none;
      }
    }
  `;

  // Tool definitions
  const TOOLS = {
    home: {
      id: 'home',
      name: 'Home',
      icon: '🏠',
      description: 'Welcome to Yume Tools',
      public: true
    },
    mention: {
      id: 'mention',
      name: 'Mention Maker',
      icon: '💬',
      description: 'Create time-based regional mentions for Discord events',
      script: 'mention-widget.js',
      mount: 'MentionWidget',
      public: true
    },
    parser: {
      id: 'parser',
      name: 'Event Parser',
      icon: '📋',
      description: 'Parse event logs and submit attendance to the database',
      script: 'event-parser-widget.js',
      mount: 'EventParserWidget',
      public: true
    },
    admin: {
      id: 'admin',
      name: 'Admin Panel',
      icon: '⚙️',
      description: 'Manage attendance records, view leaderboards, find duplicates',
      script: 'cruddy-panel.js',
      mount: 'CruddyPanel',
      public: false,  // Requires auth
      requiresAuth: true
    }
  };

  let apiBase = '';
  let currentTool = null;
  let loadedWidgets = {};
  let authState = { authenticated: false, authorized: false, user: null };

  function injectStyles(doc) {
    if (doc.getElementById(CSS_ID)) return;
    const style = doc.createElement('style');
    style.id = CSS_ID;
    style.textContent = STYLE;
    doc.head.appendChild(style);
  }

  async function checkAuth() {
    try {
      const resp = await fetch(`${apiBase}/auth/me`, { credentials: 'include' });
      if (!resp.ok) return { authenticated: false, authorized: false, user: null };
      const data = await resp.json();
      return {
        authenticated: data.authenticated || false,
        authorized: data.authorized || false,
        user: data.user || null
      };
    } catch {
      return { authenticated: false, authorized: false, user: null };
    }
  }

  function getHash() {
    const hash = window.location.hash.slice(1) || 'home';
    return TOOLS[hash] ? hash : 'home';
  }

  function setHash(toolId) {
    window.location.hash = toolId === 'home' ? '' : toolId;
  }

  function renderHeader(rootEl) {
    const headerHtml = `
      <header class="yh-header">
        <div class="yh-header-inner">
          <a href="#" class="yh-logo" onclick="return false;">
            <span class="yh-logo-icon">🌙</span>
            <span>Yume Tools</span>
          </a>
          <nav class="yh-nav">
            ${Object.values(TOOLS).map(tool => `
              <button class="yh-nav-item ${currentTool === tool.id ? 'active' : ''}" data-tool="${tool.id}">
                <span class="yh-nav-icon">${tool.icon}</span>
                <span>${tool.name}</span>
              </button>
            `).join('')}
          </nav>
          <div class="yh-user" id="yh-user-section">
            <!-- Populated by updateUserSection -->
          </div>
        </div>
      </header>
    `;
    
    // Update or create header
    let header = rootEl.querySelector('.yh-header');
    if (header) {
      header.outerHTML = headerHtml;
    } else {
      rootEl.insertAdjacentHTML('afterbegin', headerHtml);
    }

    // Wire up nav clicks
    rootEl.querySelectorAll('.yh-nav-item').forEach(btn => {
      btn.onclick = () => {
        const toolId = btn.dataset.tool;
        setHash(toolId);
      };
    });

    // Wire up logo click
    rootEl.querySelector('.yh-logo').onclick = (e) => {
      e.preventDefault();
      setHash('home');
    };

    updateUserSection(rootEl);
  }

  function updateUserSection(rootEl) {
    const section = rootEl.querySelector('#yh-user-section');
    if (!section) return;

    if (authState.authenticated && authState.user) {
      section.innerHTML = `
        ${authState.user.avatar ? `<img class="yh-user-avatar" src="https://cdn.discordapp.com/avatars/${authState.user.id}/${authState.user.avatar}.png" alt="">` : ''}
        <span class="yh-user-name">${authState.user.username}</span>
        <button class="yh-logout-btn" id="yh-logout">Logout</button>
      `;
      section.querySelector('#yh-logout').onclick = () => {
        window.location.href = `${apiBase}/auth/logout`;
      };
    } else {
      section.innerHTML = `
        <button class="yh-login-btn" id="yh-login">
          <svg width="16" height="16" viewBox="0 0 71 55" fill="currentColor">
            <path d="M60.1 4.9A58.5 58.5 0 0045.4.4a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.5a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.5.2.2 0 00-.1.1A60 60 0 00.4 44.4a.2.2 0 000 .2 58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.3 36.3 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.2.1 58.5 58.5 0 0017.8-9 .2.2 0 000-.2c1.5-15.3-2.4-28.6-10.3-40.4a.2.2 0 00-.1-.1zM23.7 36.4c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.1-6.4 7.1zm23.6 0c-3.5 0-6.4-3.2-6.4-7.1s2.9-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.1-6.4 7.1z"/>
          </svg>
          Login
        </button>
      `;
      section.querySelector('#yh-login').onclick = () => {
        window.location.href = `${apiBase}/auth/login`;
      };
    }
  }

  function renderWelcome(container) {
    container.innerHTML = `
      <div class="yh-welcome">
        <div class="yh-welcome-icon">🌙</div>
        <h2>Welcome to Yume Tools</h2>
        <p>Select a tool from the navigation above, or click one below to get started.</p>
        <div class="yh-tools-grid">
          ${Object.values(TOOLS).filter(t => t.id !== 'home').map(tool => {
            const locked = tool.requiresAuth && !authState.authorized;
            return `
              <div class="yh-tool-card ${locked ? 'locked' : ''}" data-tool="${tool.id}">
                <div class="yh-tool-card-icon">${tool.icon}</div>
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
                ${locked ? '<div class="yh-lock-badge">🔒 Login required</div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.yh-tool-card').forEach(card => {
      card.onclick = () => {
        const toolId = card.dataset.tool;
        const tool = TOOLS[toolId];
        if (tool.requiresAuth && !authState.authorized) {
          window.location.href = `${apiBase}/auth/login`;
          return;
        }
        setHash(toolId);
      };
    });
  }

  function renderLoading(container, message = 'Loading...') {
    container.innerHTML = `
      <div class="yh-loading">
        <div class="yh-spinner"></div>
        <span>${message}</span>
      </div>
    `;
  }

  async function loadWidget(toolId) {
    const tool = TOOLS[toolId];
    if (!tool || !tool.script) return null;

    // Check if already loaded
    if (loadedWidgets[toolId]) {
      return window[tool.mount];
    }

    // Load the script
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${apiBase}/cdn/${tool.script}`;
      script.onload = () => {
        loadedWidgets[toolId] = true;
        resolve(window[tool.mount]);
      };
      script.onerror = () => reject(new Error(`Failed to load ${tool.name}`));
      document.head.appendChild(script);
    });
  }

  async function navigateTo(rootEl, toolId) {
    const tool = TOOLS[toolId];
    if (!tool) {
      toolId = 'home';
    }

    currentTool = toolId;
    renderHeader(rootEl);

    const main = rootEl.querySelector('.yh-main');
    if (!main) return;

    // Home screen
    if (toolId === 'home') {
      renderWelcome(main);
      return;
    }

    // Check auth for protected tools
    if (tool.requiresAuth && !authState.authorized) {
      main.innerHTML = `
        <div class="yh-welcome">
          <div class="yh-welcome-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>You need to sign in with Discord to access ${tool.name}.</p>
          <button class="yh-login-btn" style="margin: 0 auto; font-size: 16px; padding: 12px 24px;" id="yh-auth-login">
            <svg width="20" height="20" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1 4.9A58.5 58.5 0 0045.4.4a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.5a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.5.2.2 0 00-.1.1A60 60 0 00.4 44.4a.2.2 0 000 .2 58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.3 36.3 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.2.1 58.5 58.5 0 0017.8-9 .2.2 0 000-.2c1.5-15.3-2.4-28.6-10.3-40.4a.2.2 0 00-.1-.1zM23.7 36.4c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.1-6.4 7.1zm23.6 0c-3.5 0-6.4-3.2-6.4-7.1s2.9-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.1-6.4 7.1z"/>
            </svg>
            Sign in with Discord
          </button>
        </div>
      `;
      main.querySelector('#yh-auth-login').onclick = () => {
        window.location.href = `${apiBase}/auth/login`;
      };
      return;
    }

    // Load and mount widget
    renderLoading(main, `Loading ${tool.name}...`);

    try {
      const Widget = await loadWidget(toolId);
      if (!Widget) {
        main.innerHTML = `<div class="yh-welcome"><p>Widget not found</p></div>`;
        return;
      }

      // Clear and create container for widget
      main.innerHTML = '<div class="yh-widget-container" id="yh-widget-mount"></div>';
      const mountPoint = main.querySelector('#yh-widget-mount');

      // Mount the widget
      // For CruddyPanel, it handles its own auth, but we're already authenticated
      // So we pass skipAuth or let it know we're in hub mode
      Widget.mount(mountPoint, { 
        apiBase,
        hubMode: true  // Let widgets know they're in the hub
      });

    } catch (err) {
      console.error('Failed to load widget:', err);
      main.innerHTML = `
        <div class="yh-welcome">
          <div class="yh-welcome-icon">⚠️</div>
          <h2>Failed to Load</h2>
          <p>Could not load ${tool.name}. Please try again.</p>
          <button class="yh-login-btn" style="margin: 0 auto; background: #555;" onclick="location.reload()">
            Retry
          </button>
        </div>
      `;
    }
  }

  async function mount(selectorOrEl, config = {}) {
    const host = (typeof selectorOrEl === 'string') ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (!host) return;

    apiBase = config.apiBase || '';
    injectStyles(document);

    // Initial structure
    host.innerHTML = `
      <div id="yume-hub">
        <main class="yh-main">
          <div class="yh-loading">
            <div class="yh-spinner"></div>
            <span>Initializing...</span>
          </div>
        </main>
      </div>
    `;

    const rootEl = host.querySelector('#yume-hub');

    // Check auth first
    authState = await checkAuth();

    // Render header
    renderHeader(rootEl);

    // Handle hash changes
    const handleNavigation = () => {
      const toolId = getHash();
      navigateTo(rootEl, toolId);
    };

    window.addEventListener('hashchange', handleNavigation);
    
    // Initial navigation
    handleNavigation();
  }

  return { mount };
});


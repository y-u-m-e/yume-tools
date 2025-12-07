/* nav-bar.js — Simple navigation bar for Yume Tools
 *
 * A lightweight navigation widget that links to different sections via hash URLs.
 *
 * Exposes: `NavBar.mount(selectorOrEl, { baseUrl: 'https://yumes-tools.itai.gg' })`
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NavBar = factory();
  }
})(this, function () {
  const CSS_ID = 'nav-bar-styles';

  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

    .yume-nav {
      font-family: 'Space Mono', monospace;
      display: flex;
      gap: 32px;
      justify-content: center;
      align-items: center;
      padding: 16px 0;
    }

    .yume-nav-item {
      position: relative;
      padding: 8px 0;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      font-family: inherit;
      font-size: 13px;
      font-weight: 400;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 2px;
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .yume-nav-item::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 1px;
      background: #5eead4;
      transition: width 0.3s ease;
    }

    .yume-nav-item:hover {
      color: rgba(255, 255, 255, 0.9);
    }

    .yume-nav-item:hover::after {
      width: 100%;
    }

    .yume-nav-item.active {
      color: #5eead4;
    }

    .yume-nav-item.active::after {
      width: 100%;
      background: #5eead4;
      box-shadow: 0 0 8px rgba(94, 234, 212, 0.5);
    }

    /* Hide icons in minimal style */
    .yume-nav-icon {
      display: none;
    }

    .yume-nav-label {
      position: relative;
    }

    /* Sticky variant */
    .yume-nav.sticky {
      position: sticky;
      top: 20px;
      z-index: 1000;
    }

    /* Mobile */
    @media (max-width: 600px) {
      .yume-nav {
        gap: 20px;
        flex-wrap: wrap;
      }
      .yume-nav-item {
        font-size: 11px;
        letter-spacing: 1.5px;
      }
    }
  `;

  const NAV_ITEMS = [
    { id: 'home', hash: '#home', icon: '🏠', label: 'Home' },
    { id: 'msg-maker', hash: '#msg-maker', icon: '💬', label: 'Mentions' },
    { id: 'log-maker', hash: '#log-maker', icon: '📋', label: 'Event Logs' },
    { id: 'infographic-maker', hash: '#infographic-maker', icon: '🎨', label: 'Infographic Maker' },
    { id: 'docs', url: 'https://api.itai.gg/docs/', icon: '📚', label: 'Docs', external: true }
    // Cruddy Panel moved to emuy.gg
  ];

  function injectStyles(doc) {
    if (doc.getElementById(CSS_ID)) return;
    const style = doc.createElement('style');
    style.id = CSS_ID;
    style.textContent = STYLE;
    doc.head.appendChild(style);
  }

  function getActiveItem() {
    const hash = window.location.hash || '';
    const item = NAV_ITEMS.find(i => i.hash === hash);
    return item ? item.id : 'home';
  }

  function render(container, config) {
    const baseUrl = config.baseUrl || '';
    const sticky = config.sticky !== false;
    const activeId = getActiveItem();

    container.innerHTML = `
      <nav class="yume-nav ${sticky ? 'sticky' : ''}">
        ${NAV_ITEMS.map(item => `
          <a 
            href="${item.external ? item.url : baseUrl + item.hash}" 
            class="yume-nav-item ${activeId === item.id ? 'active' : ''}"
            data-id="${item.id}"
            ${item.external ? 'target="_blank" rel="noopener noreferrer"' : ''}
          >
            <span class="yume-nav-icon">${item.icon}</span>
            <span class="yume-nav-label">${item.label}</span>
          </a>
        `).join('')}
      </nav>
    `;

    // Update active state on hash change
    const updateActive = () => {
      const newActiveId = getActiveItem();
      container.querySelectorAll('.yume-nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === newActiveId);
      });
    };

    window.addEventListener('hashchange', updateActive);
  }

  function mount(selectorOrEl, config = {}) {
    const tryMount = () => {
      const host = (typeof selectorOrEl === 'string') ? document.querySelector(selectorOrEl) : selectorOrEl;
      if (!host) {
        console.warn('[NavBar] Mount point not found:', selectorOrEl);
        return false;
      }
      console.log('[NavBar] Mounting to:', selectorOrEl);
      injectStyles(document);
      render(host, config);
      return true;
    };

    // Try immediately
    if (tryMount()) return;

    // If DOM not ready, wait for it
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryMount);
    } else {
      // DOM is ready but element not found - try again after a short delay (Carrd timing issue)
      setTimeout(tryMount, 100);
      setTimeout(tryMount, 500);
      setTimeout(tryMount, 1000);
    }
  }

  return { mount };
});


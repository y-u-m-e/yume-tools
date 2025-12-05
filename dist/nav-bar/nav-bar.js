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
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

    .yume-nav {
      font-family: 'Outfit', 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, rgba(15, 15, 26, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 8px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(128, 181, 235, 0.15);
    }

    .yume-nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: transparent;
      border: none;
      border-radius: 8px;
      color: #888;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }

    .yume-nav-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(128, 181, 235, 0.15) 0%, rgba(128, 181, 235, 0.05) 100%);
      opacity: 0;
      transition: opacity 0.25s ease;
      border-radius: 8px;
    }

    .yume-nav-item:hover {
      color: #ccc;
    }

    .yume-nav-item:hover::before {
      opacity: 1;
    }

    .yume-nav-item.active {
      color: #80b5eb;
      background: rgba(128, 181, 235, 0.2);
    }

    .yume-nav-item.active::before {
      opacity: 0;
    }

    .yume-nav-icon {
      font-size: 18px;
      line-height: 1;
    }

    .yume-nav-label {
      position: relative;
      z-index: 1;
    }

    /* Sticky variant */
    .yume-nav.sticky {
      position: sticky;
      top: 10px;
      z-index: 1000;
      margin: 10px auto;
      max-width: fit-content;
    }

    /* Compact variant for mobile */
    @media (max-width: 600px) {
      .yume-nav {
        padding: 6px;
        gap: 4px;
      }
      .yume-nav-item {
        padding: 10px 14px;
        font-size: 13px;
      }
      .yume-nav-label {
        display: none;
      }
      .yume-nav-icon {
        font-size: 20px;
      }
    }

    /* Dark glow effect on active */
    .yume-nav-item.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 40%;
      height: 3px;
      background: #80b5eb;
      border-radius: 3px;
      box-shadow: 0 0 10px rgba(128, 181, 235, 0.5);
    }
  `;

  const NAV_ITEMS = [
    { id: 'home', hash: '', icon: '🏠', label: 'Home' },
    { id: 'msg-maker', hash: '#msg-maker', icon: '💬', label: 'Mentions' },
    { id: 'log-maker', hash: '#log-maker', icon: '📋', label: 'Event Logs' },
    { id: 'cruddy-panel', hash: '#cruddy-panel', icon: '⚙️', label: 'Admin' }
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
            href="${baseUrl}${item.hash}" 
            class="yume-nav-item ${activeId === item.id ? 'active' : ''}"
            data-id="${item.id}"
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
    const host = (typeof selectorOrEl === 'string') ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (!host) return;

    injectStyles(document);
    render(host, config);
  }

  return { mount };
});


/* how-to.js — Simple how-to guide widget for Yume Tools
 *
 * Displays usage guides for the 3 main widgets:
 * - Mention Maker
 * - Event Log Parser
 * - Infographic Maker
 *
 * Exposes: `HowTo.mount(selectorOrEl)`
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HowTo = factory();
  }
})(this, function () {
  const CSS_ID = 'how-to-styles';

  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

    #how-to-widget {
      font-family: 'Outfit', 'Segoe UI', sans-serif;
      max-width: 900px;
      margin: 20px auto;
      padding: 30px;
      background: linear-gradient(135deg, rgba(20, 60, 60, 0.7) 0%, rgba(25, 50, 80, 0.7) 100%);
      backdrop-filter: blur(12px);
      border-radius: 20px;
      border: 1px solid rgba(94, 234, 212, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      color: #eee;
    }

    #how-to-widget * { box-sizing: border-box; }

    #how-to-widget h2 {
      margin: 0 0 30px 0;
      color: #5eead4;
      text-align: center;
      font-weight: 600;
      font-size: 28px;
    }

    .ht-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 25px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .ht-tab {
      padding: 12px 24px;
      background: rgba(15, 40, 50, 0.5);
      border: 1px solid rgba(94, 234, 212, 0.2);
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
      font-family: inherit;
    }

    .ht-tab:hover {
      background: rgba(94, 234, 212, 0.1);
      color: #fff;
    }

    .ht-tab.active {
      background: linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%);
      color: #0f2935;
      border-color: transparent;
    }

    .ht-panel {
      display: none;
    }

    .ht-panel.active {
      display: block;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .ht-section {
      background: rgba(15, 40, 50, 0.4);
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 20px;
      border: 1px solid rgba(94, 234, 212, 0.1);
    }

    .ht-section h3 {
      color: #5eead4;
      font-size: 20px;
      margin: 0 0 15px 0;
      font-weight: 600;
    }

    .ht-section h4 {
      color: #fff;
      font-size: 16px;
      margin: 20px 0 10px 0;
      font-weight: 500;
    }

    .ht-section p {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.7;
      margin: 0 0 15px 0;
    }

    .ht-section ul {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.8;
      margin: 0 0 15px 0;
      padding-left: 20px;
    }

    .ht-section li {
      margin-bottom: 8px;
    }

    .ht-section li strong {
      color: #5eead4;
    }

    .ht-tip {
      background: rgba(94, 234, 212, 0.1);
      border-left: 3px solid #5eead4;
      padding: 15px 20px;
      border-radius: 0 12px 12px 0;
      margin: 15px 0;
    }

    .ht-tip strong {
      color: #5eead4;
    }

    .ht-code {
      background: rgba(0, 0, 0, 0.3);
      padding: 3px 8px;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      color: #ffd700;
    }

    .ht-steps {
      counter-reset: step;
    }

    .ht-step {
      position: relative;
      padding-left: 50px;
      margin-bottom: 20px;
    }

    .ht-step::before {
      counter-increment: step;
      content: counter(step);
      position: absolute;
      left: 0;
      top: 0;
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #0f2935;
      font-size: 14px;
    }

    .ht-step-title {
      color: #fff;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 8px;
    }

    .ht-step-desc {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      line-height: 1.6;
    }

    @media (max-width: 600px) {
      #how-to-widget {
        padding: 20px;
        margin: 10px;
      }

      #how-to-widget h2 {
        font-size: 22px;
      }

      .ht-tabs {
        gap: 6px;
      }

      .ht-tab {
        padding: 10px 16px;
        font-size: 12px;
      }

      .ht-section {
        padding: 20px;
      }

      .ht-section h3 {
        font-size: 18px;
      }
    }
  `;

  const GUIDES = {
    mentions: {
      icon: '💬',
      title: 'Mention Maker',
      content: `
        <div class="ht-section">
          <h3>💬 What is the Mention Maker?</h3>
          <p>The Mention Maker helps you quickly create Discord mention strings for multiple users at once. Perfect for pinging clan members for events!</p>
        </div>

        <div class="ht-section">
          <h3>📝 How to Use</h3>
          <div class="ht-steps">
            <div class="ht-step">
              <div class="ht-step-title">Enter Player Names</div>
              <div class="ht-step-desc">Type or paste player names in the text area. You can use one name per line, or separate with commas.</div>
            </div>
            <div class="ht-step">
              <div class="ht-step-title">Click Generate</div>
              <div class="ht-step-desc">The tool will look up each player's Discord ID and create mention strings.</div>
            </div>
            <div class="ht-step">
              <div class="ht-step-title">Copy & Paste</div>
              <div class="ht-step-desc">Copy the generated mentions and paste them directly into Discord!</div>
            </div>
          </div>
        </div>

        <div class="ht-section">
          <h4>💡 Tips</h4>
          <ul>
            <li>Names are <strong>case-insensitive</strong> - "Y U M E" and "y u m e" will both work</li>
            <li>If a player isn't found, they'll be shown with their RSN instead of a mention</li>
            <li>You can paste directly from a RuneLite screenshot or clan list</li>
          </ul>
        </div>
      `
    },
    eventlog: {
      icon: '📋',
      title: 'Event Log Parser',
      content: `
        <div class="ht-section">
          <h3>📋 What is the Event Log Parser?</h3>
          <p>The Event Log Parser extracts player names from clan event screenshots or chat logs. It's designed to work with RuneLite's clan chat and loot tracker output.</p>
        </div>

        <div class="ht-section">
          <h3>📝 How to Use</h3>
          <div class="ht-steps">
            <div class="ht-step">
              <div class="ht-step-title">Paste Your Log</div>
              <div class="ht-step-desc">Copy the text from your clan chat, RuneLite loot tracker, or any event log and paste it into the text area.</div>
            </div>
            <div class="ht-step">
              <div class="ht-step-title">Select Event Type</div>
              <div class="ht-step-desc">Choose the type of event (PvP, PvM, Skilling, etc.) to help categorize the data.</div>
            </div>
            <div class="ht-step">
              <div class="ht-step-title">Parse & Review</div>
              <div class="ht-step-desc">The parser will extract player names. Review the list and make any corrections.</div>
            </div>
            <div class="ht-step">
              <div class="ht-step-title">Export</div>
              <div class="ht-step-desc">Export the cleaned list for use in other tools or for attendance tracking.</div>
            </div>
          </div>
        </div>

        <div class="ht-section">
          <h4>💡 Supported Formats</h4>
          <ul>
            <li><strong>Clan Chat:</strong> Parses standard OSRS clan chat format</li>
            <li><strong>RuneLite Loot Tracker:</strong> Extracts names from loot splits</li>
            <li><strong>Plain Lists:</strong> One name per line or comma-separated</li>
          </ul>
          
          <div class="ht-tip">
            <strong>Pro Tip:</strong> For best results, copy directly from the RuneLite client rather than taking screenshots.
          </div>
        </div>
      `
    },
    infographic: {
      icon: '🎨',
      title: 'Infographic Maker',
      content: `
        <div class="ht-section">
          <h3>🎨 What is the Infographic Maker?</h3>
          <p>Create stunning OSRS-style infographics with the drag-and-drop editor. Perfect for event announcements, guides, and clan posts!</p>
        </div>

        <div class="ht-section">
          <h3>📝 How to Use</h3>
          <div class="ht-steps">
            <div class="ht-step">
              <div class="ht-step-title">Set Canvas Size</div>
              <div class="ht-step-desc">Choose your canvas dimensions. Common sizes: 800x600 for Discord embeds, 1920x1080 for full banners.</div>
            </div>
            <div class="ht-step">
              <div class="ht-step-title">Add Layers</div>
              <div class="ht-step-desc">Add text, shapes, or images using the toolbar buttons. Each element is a separate layer.</div>
            </div>
            <div class="ht-step">
              <div class="ht-step-title">Customize</div>
              <div class="ht-step-desc">Click any layer to select it. Use the properties panel to change colors, fonts, sizes, and positions.</div>
            </div>
            <div class="ht-step">
              <div class="ht-step-title">Arrange Layers</div>
              <div class="ht-step-desc">Drag layers in the layer list to reorder them. Top layers appear in front.</div>
            </div>
            <div class="ht-step">
              <div class="ht-step-title">Export</div>
              <div class="ht-step-desc">Click "Download PNG" to save your creation!</div>
            </div>
          </div>
        </div>

        <div class="ht-section">
          <h4>🎯 Features</h4>
          <ul>
            <li><strong>Text Layers:</strong> RuneScape fonts included! Use "RuneScape UF" for authentic styling</li>
            <li><strong>Shapes:</strong> Rectangles, circles, and lines with customizable colors and borders</li>
            <li><strong>Images:</strong> Upload your own images or use OSRS item icons</li>
            <li><strong>Undo/Redo:</strong> Press <span class="ht-code">Ctrl+Z</span> to undo, <span class="ht-code">Ctrl+Y</span> to redo</li>
          </ul>

          <div class="ht-tip">
            <strong>Pro Tip:</strong> Hold Shift while dragging to constrain movement to horizontal or vertical!
          </div>
        </div>

        <div class="ht-section">
          <h4>🎨 OSRS Color Palette</h4>
          <ul>
            <li><strong>Gold:</strong> <span class="ht-code">#FFD700</span> - Classic OSRS gold text</li>
            <li><strong>Green:</strong> <span class="ht-code">#00FF00</span> - Public chat green</li>
            <li><strong>Cyan:</strong> <span class="ht-code">#00FFFF</span> - Clan chat cyan</li>
            <li><strong>Orange:</strong> <span class="ht-code">#FF981F</span> - OSRS orange</li>
            <li><strong>Red:</strong> <span class="ht-code">#FF0000</span> - Warning/PK red</li>
          </ul>
        </div>
      `
    }
  };

  function injectStyles(doc) {
    if (doc.getElementById(CSS_ID)) return;
    const style = doc.createElement('style');
    style.id = CSS_ID;
    style.textContent = STYLE;
    doc.head.appendChild(style);
  }

  function render(container) {
    container.innerHTML = `
      <div id="how-to-widget">
        <h2>📖 How To Use</h2>
        
        <div class="ht-tabs">
          <button class="ht-tab active" data-tab="mentions">💬 Mention Maker</button>
          <button class="ht-tab" data-tab="eventlog">📋 Event Log Parser</button>
          <button class="ht-tab" data-tab="infographic">🎨 Infographic Maker</button>
        </div>

        <div class="ht-panel active" data-panel="mentions">
          ${GUIDES.mentions.content}
        </div>

        <div class="ht-panel" data-panel="eventlog">
          ${GUIDES.eventlog.content}
        </div>

        <div class="ht-panel" data-panel="infographic">
          ${GUIDES.infographic.content}
        </div>
      </div>
    `;

    // Tab switching
    const tabs = container.querySelectorAll('.ht-tab');
    const panels = container.querySelectorAll('.ht-panel');

    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        container.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
      };
    });
  }

  function mount(selectorOrEl, config = {}) {
    const tryMount = () => {
      const host = (typeof selectorOrEl === 'string') ? document.querySelector(selectorOrEl) : selectorOrEl;
      if (!host) {
        console.warn('[HowTo] Mount point not found:', selectorOrEl);
        return false;
      }
      console.log('[HowTo] Mounting to:', selectorOrEl);
      injectStyles(document);
      render(host);
      return true;
    };

    if (tryMount()) return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryMount);
    } else {
      setTimeout(tryMount, 100);
      setTimeout(tryMount, 500);
      setTimeout(tryMount, 1000);
    }
  }

  return { mount };
});


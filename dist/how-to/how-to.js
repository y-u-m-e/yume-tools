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
      margin: 0 0 25px 0;
      color: #5eead4;
      text-align: center;
      font-weight: 600;
      font-size: 26px;
    }

    .ht-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 25px;
      justify-content: center;
    }

    .ht-tab {
      padding: 10px 18px;
      background: rgba(15, 40, 50, 0.5);
      border: 1px solid rgba(94, 234, 212, 0.2);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s;
      font-family: inherit;
      white-space: nowrap;
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
      padding: 22px 25px;
      margin-bottom: 16px;
      border: 1px solid rgba(94, 234, 212, 0.1);
    }

    .ht-section h3 {
      color: #5eead4;
      font-size: 18px;
      margin: 0 0 12px 0;
      font-weight: 600;
    }

    .ht-section h4 {
      color: #5eead4;
      font-size: 15px;
      margin: 0 0 12px 0;
      font-weight: 600;
    }

    .ht-section p {
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.7;
      margin: 0;
      text-align: left;
    }

    .ht-section ul {
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.7;
      margin: 0;
      padding-left: 0;
      list-style: none;
    }

    .ht-section li {
      margin-bottom: 10px;
      padding-left: 20px;
      position: relative;
      text-align: left;
    }

    .ht-section li::before {
      content: '•';
      color: #5eead4;
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    .ht-section li strong {
      color: #5eead4;
    }

    .ht-tip {
      background: rgba(94, 234, 212, 0.1);
      border-left: 3px solid #5eead4;
      padding: 12px 16px;
      border-radius: 0 10px 10px 0;
      margin-top: 15px;
      text-align: left;
    }

    .ht-tip strong {
      color: #5eead4;
    }

    .ht-code {
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 7px;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      color: #ffd700;
    }

    .ht-steps {
      counter-reset: step;
    }

    .ht-step {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      margin-bottom: 16px;
    }

    .ht-step:last-child {
      margin-bottom: 0;
    }

    .ht-step-num {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #0f2935;
      font-size: 13px;
    }

    .ht-step-content {
      flex: 1;
      text-align: left;
    }

    .ht-step-title {
      color: #fff;
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 4px;
    }

    .ht-step-desc {
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
      line-height: 1.5;
    }

    .ht-color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }

    .ht-color-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(0, 0, 0, 0.2);
      padding: 8px 12px;
      border-radius: 8px;
    }

    .ht-color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .ht-color-info {
      flex: 1;
      text-align: left;
    }

    .ht-color-name {
      color: #fff;
      font-size: 13px;
      font-weight: 500;
    }

    .ht-color-hex {
      color: rgba(255, 255, 255, 0.5);
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 11px;
    }

    @media (max-width: 600px) {
      #how-to-widget {
        padding: 20px 15px;
        margin: 10px;
      }

      #how-to-widget h2 {
        font-size: 20px;
      }

      .ht-tabs {
        gap: 6px;
        flex-wrap: wrap;
      }

      .ht-tab {
        padding: 8px 12px;
        font-size: 11px;
      }

      .ht-section {
        padding: 18px;
      }

      .ht-section h3 {
        font-size: 16px;
      }

      .ht-color-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  const GUIDES = {
    mentions: {
      icon: '💬',
      title: 'Mention Maker',
      content: `
        <div class="ht-section">
          <h3>💬 What is it?</h3>
          <p>The Mention Maker helps you quickly create Discord mention strings for multiple users at once. Perfect for pinging clan members for events!</p>
        </div>

        <div class="ht-section">
          <h3>📝 Steps</h3>
          <div class="ht-steps">
            <div class="ht-step">
              <div class="ht-step-num">1</div>
              <div class="ht-step-content">
                <div class="ht-step-title">Enter Player Names</div>
                <div class="ht-step-desc">Type or paste player names in the text area. One name per line, or separate with commas.</div>
              </div>
            </div>
            <div class="ht-step">
              <div class="ht-step-num">2</div>
              <div class="ht-step-content">
                <div class="ht-step-title">Click Generate</div>
                <div class="ht-step-desc">The tool will look up each player's Discord ID and create mention strings.</div>
              </div>
            </div>
            <div class="ht-step">
              <div class="ht-step-num">3</div>
              <div class="ht-step-content">
                <div class="ht-step-title">Copy & Paste</div>
                <div class="ht-step-desc">Copy the generated mentions and paste them directly into Discord!</div>
              </div>
            </div>
          </div>
        </div>

        <div class="ht-section">
          <h4>💡 Tips</h4>
          <ul>
            <li>Names are <strong>case-insensitive</strong> — "Y U M E" and "y u m e" both work</li>
            <li>If a player isn't found, they'll show their RSN instead</li>
            <li>You can paste directly from RuneLite or clan list</li>
          </ul>
        </div>
      `
    },
    eventlog: {
      icon: '📋',
      title: 'Event Log Parser',
      content: `
        <div class="ht-section">
          <h3>📋 What is it?</h3>
          <p>The Event Log Parser extracts player names from clan event screenshots or chat logs. Works with RuneLite's clan chat and loot tracker output.</p>
        </div>

        <div class="ht-section">
          <h3>📝 Steps</h3>
          <div class="ht-steps">
            <div class="ht-step">
              <div class="ht-step-num">1</div>
              <div class="ht-step-content">
                <div class="ht-step-title">Paste Your Log</div>
                <div class="ht-step-desc">Copy the text from clan chat, RuneLite loot tracker, or any event log and paste it in.</div>
              </div>
            </div>
            <div class="ht-step">
              <div class="ht-step-num">2</div>
              <div class="ht-step-content">
                <div class="ht-step-title">Fill Event Details</div>
                <div class="ht-step-desc">Add the event name, time, and any notes for the formatted output.</div>
              </div>
            </div>
            <div class="ht-step">
              <div class="ht-step-num">3</div>
              <div class="ht-step-content">
                <div class="ht-step-title">Extract Names</div>
                <div class="ht-step-desc">Click Extract to pull player names from the log automatically.</div>
              </div>
            </div>
            <div class="ht-step">
              <div class="ht-step-num">4</div>
              <div class="ht-step-content">
                <div class="ht-step-title">Copy Output</div>
                <div class="ht-step-desc">Get the formatted attendance list ready for tracking.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="ht-section">
          <h4>💡 Supported Formats</h4>
          <ul>
            <li><strong>Clan Chat:</strong> Parses standard OSRS clan chat format</li>
            <li><strong>Loot Tracker:</strong> Extracts names from RuneLite splits</li>
            <li><strong>Plain Lists:</strong> One name per line or comma-separated</li>
          </ul>
          <div class="ht-tip">
            <strong>Tip:</strong> Copy directly from RuneLite rather than taking screenshots for best results.
          </div>
        </div>
      `
    },
    infographic: {
      icon: '🎨',
      title: 'Infographic Maker',
      content: `
        <div class="ht-section">
          <h3>🎨 What is it?</h3>
          <p>Create stunning OSRS-style infographics with the drag-and-drop editor. Perfect for event announcements, guides, and clan posts!</p>
        </div>

        <div class="ht-section">
          <h3>📝 Steps</h3>
          <div class="ht-steps">
            <div class="ht-step">
              <div class="ht-step-num">1</div>
              <div class="ht-step-content">
                <div class="ht-step-title">Set Canvas Size</div>
                <div class="ht-step-desc">Choose dimensions from the dropdown. 800×600 for Discord embeds, 1920×1080 for banners.</div>
              </div>
            </div>
            <div class="ht-step">
              <div class="ht-step-num">2</div>
              <div class="ht-step-content">
                <div class="ht-step-title">Add Layers</div>
                <div class="ht-step-desc">Use toolbar buttons to add text, shapes, or images. Each element is a separate layer.</div>
              </div>
            </div>
            <div class="ht-step">
              <div class="ht-step-num">3</div>
              <div class="ht-step-content">
                <div class="ht-step-title">Customize</div>
                <div class="ht-step-desc">Click any layer to select it. Use properties panel to change colors, fonts, sizes.</div>
              </div>
            </div>
            <div class="ht-step">
              <div class="ht-step-num">4</div>
              <div class="ht-step-content">
                <div class="ht-step-title">Arrange & Export</div>
                <div class="ht-step-desc">Reorder layers as needed, then click "Export PNG" to save your creation!</div>
              </div>
            </div>
          </div>
        </div>

        <div class="ht-section">
          <h4>🎯 Features</h4>
          <ul>
            <li><strong>Text:</strong> RuneScape fonts included! Use "RuneScape UF" for authentic styling</li>
            <li><strong>Shapes:</strong> Rectangles, circles, and lines with customizable colors</li>
            <li><strong>Icons:</strong> Built-in skill and prayer icons from OSRS</li>
            <li><strong>Undo/Redo:</strong> Press <span class="ht-code">Ctrl+Z</span> / <span class="ht-code">Ctrl+Y</span></li>
          </ul>
          <div class="ht-tip">
            <strong>Tip:</strong> Hold Shift while dragging to constrain to horizontal or vertical movement.
          </div>
        </div>

        <div class="ht-section">
          <h4>🎨 OSRS Colors</h4>
          <div class="ht-color-grid">
            <div class="ht-color-item">
              <div class="ht-color-swatch" style="background: #FFD700;"></div>
              <div class="ht-color-info">
                <div class="ht-color-name">Gold</div>
                <div class="ht-color-hex">#FFD700</div>
              </div>
            </div>
            <div class="ht-color-item">
              <div class="ht-color-swatch" style="background: #00FF00;"></div>
              <div class="ht-color-info">
                <div class="ht-color-name">Green</div>
                <div class="ht-color-hex">#00FF00</div>
              </div>
            </div>
            <div class="ht-color-item">
              <div class="ht-color-swatch" style="background: #00FFFF;"></div>
              <div class="ht-color-info">
                <div class="ht-color-name">Cyan</div>
                <div class="ht-color-hex">#00FFFF</div>
              </div>
            </div>
            <div class="ht-color-item">
              <div class="ht-color-swatch" style="background: #FF981F;"></div>
              <div class="ht-color-info">
                <div class="ht-color-name">Orange</div>
                <div class="ht-color-hex">#FF981F</div>
              </div>
            </div>
            <div class="ht-color-item">
              <div class="ht-color-swatch" style="background: #FF0000;"></div>
              <div class="ht-color-info">
                <div class="ht-color-name">Red</div>
                <div class="ht-color-hex">#FF0000</div>
              </div>
            </div>
            <div class="ht-color-item">
              <div class="ht-color-swatch" style="background: #9F00FF;"></div>
              <div class="ht-color-info">
                <div class="ht-color-name">Purple</div>
                <div class="ht-color-hex">#9F00FF</div>
              </div>
            </div>
          </div>
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
          <button class="ht-tab active" data-tab="mentions">💬 Mentions</button>
          <button class="ht-tab" data-tab="eventlog">📋 Event Logs</button>
          <button class="ht-tab" data-tab="infographic">🎨 Infographic</button>
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

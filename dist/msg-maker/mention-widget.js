/* mention-widget.js — UMD build from your existing Carrd embed
 *
 * What this does:
 * - Renders the same UI/behavior you pasted (message box, auto-@US/@EU/@AU based on time windows, copy button)
 * - No external deps. CSS is injected once. All DOM is self-contained.
 * - Exposes a single global: `MentionWidget.mount(selectorOrEl)`.
 *
 * How to use on Carrd (Embed → Code):
 *
 * <div id="mention-root"></div>
 * <script src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/dist/mention-widget.js"></script>
 * <script>
 *   MentionWidget.mount('#mention-root');
 * </script>
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MentionWidget = factory();
  }
})(this, function () {
  const CSS_ID = 'mention-widget-styles';

  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');
    
    #time-container {
      font-family: 'Outfit', 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 20px auto;
      text-align: center;
      padding: 25px;
      background: linear-gradient(135deg, rgba(20, 60, 60, 0.7) 0%, rgba(25, 50, 80, 0.7) 100%);
      backdrop-filter: blur(12px);
      border-radius: 16px;
      border: 1px solid rgba(94, 234, 212, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    #time-container h1 { margin-bottom: 75px; color: #fff; }
    #time-container h3, #time-container h4 {
      margin-bottom: 15px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }
    #time-container textarea {
      width: 100%;
      height: 100px;
      padding: 14px;
      font-size: 16px;
      border: 1px solid rgba(94, 234, 212, 0.3);
      border-radius: 10px;
      resize: none;
      margin-bottom: 20px;
      font-family: 'Outfit', 'Segoe UI', sans-serif;
      background: rgba(15, 40, 50, 0.6);
      color: #fff;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    #time-container textarea:focus {
      outline: none;
      border-color: #5eead4;
      box-shadow: 0 0 0 3px rgba(94, 234, 212, 0.15);
    }
    #time-container textarea::placeholder { color: rgba(255, 255, 255, 0.4); }
    #time-container #output {
      margin-top: 20px;
      padding: 16px;
      background: rgba(15, 40, 50, 0.5);
      border: 1px solid rgba(94, 234, 212, 0.2);
      border-radius: 10px;
      font-size: 16px;
      white-space: pre-wrap;
      min-height: 50px;
      font-family: 'Outfit', 'Segoe UI', sans-serif;
      color: rgba(255, 255, 255, 0.8);
    }
    #time-container button {
      display: block;
      width: 100%;
      margin-top: 12px;
      padding: 14px;
      font-size: 16px;
      font-weight: 500;
      border: none;
      background: linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%);
      color: #0f2935;
      border-radius: 10px;
      cursor: pointer;
      font-family: 'Outfit', 'Segoe UI', sans-serif;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(94, 234, 212, 0.3);
    }
    #time-container button:hover {
      background: linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(94, 234, 212, 0.4);
    }
  `;

  const HTML = `
    <div id="time-container">
      <h3>Type Your Message (Mentions Added Automatically)</h3>
      <textarea id="userMessage" placeholder="Write your message here..."></textarea>
      <h4>Final Message:</h4>
      <p id="output">Your message will appear here.</p>
      <button id="copyBtn" type="button">Copy to Clipboard</button>
    </div>
  `;

  function injectStyles(doc) {
    if (doc.getElementById(CSS_ID)) return; // inject once per document
    const style = doc.createElement('style');
    style.id = CSS_ID;
    style.textContent = STYLE;
    doc.head.appendChild(style);
  }

  function isInRange(num) { return num >= 8 && num <= 22; }

  function computeMentions() {
    const EST_time = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false });
    const UTC_time = new Date().toLocaleString('en-GB', { timeZone: 'UTC', hour: 'numeric', hour12: false });
    const AEDT_time = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', hour: 'numeric', hour12: false });

    let mentions = '';
    if (isInRange(Number(EST_time))) mentions += '@US ';
    if (isInRange(Number(UTC_time))) mentions += '@EU ';
    if (isInRange(Number(AEDT_time))) mentions += '@AU ';
    return mentions.trim();
  }

  function onlyMentions(str) {
    // Matches empty or any combo/spaces of @US/@EU/@AU only
    return /^\s*(?:@US\s*)?(?:@EU\s*)?(?:@AU\s*)?$/.test(str);
  }

  function wire(rootEl) {
    const userMessage = rootEl.querySelector('#userMessage');
    const output = rootEl.querySelector('#output');
    const copyBtn = rootEl.querySelector('#copyBtn');

    function updateMessage() {
      const mentions = computeMentions();
      const typed = (userMessage.value || '').trim();
      let finalMessage = typed.length > 0 ? `${mentions}${mentions? ' ' : ''}${typed}` : mentions;
      if (onlyMentions(finalMessage || '')) {
        finalMessage = 'Your message will appear here.';
      }
      output.textContent = finalMessage || 'Your message will appear here.';
    }

    function copyToClipboardMentionMaker() {
      const textToCopy = output.textContent || '';
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = textToCopy; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
        alert('Copied to clipboard!');
        return;
      }
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }

    userMessage.addEventListener('input', updateMessage);
    copyBtn.addEventListener('click', copyToClipboardMentionMaker);

    // initial paint
    updateMessage();
  }

  function mount(selectorOrEl) {
    const host = (typeof selectorOrEl === 'string') ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (!host) return;
    injectStyles(document);
    host.innerHTML = HTML;
    wire(host);
  }

  return { mount };
});

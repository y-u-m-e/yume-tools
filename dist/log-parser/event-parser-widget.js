/* event-parser-widget.js
 *
 * Features:
 * - Same UI/behavior as your original embed (Event Name/Time/Notes, paste log, Extract Names, Copy, Webhook send)
 * - No external deps. Injects its own HTML + CSS; all logic is encapsulated.
 * - Exposes a global: EventParserWidget.mount(selectorOrEl, options?)
 *
 * Options:
 *   { webhook?: string }  // override the POST target (default keeps your relay URL)
 *
 * Carrd usage (Embed → Code):
 * <div id="event-parser-root"></div>
 * <script src="https://cdn.jsdelivr.net/gh/USER/REPO@<TAG_OR_COMMIT>/dist/event-parser-widget.js"></script>
 * <script>
 *   EventParserWidget.mount('#event-parser-root', { webhook: 'https://discord-relay.itai.app/' });
 * </script>
 */

// UMD wrapper -> used to be browser agnostic
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EventParserWidget = factory();
  }
})(this, function () {
  const CSS_ID = 'event-parser-widget-styles';

  const STYLE = `
    #event-parser { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 20px auto; text-align: center; }
    #event-parser h3, #event-parser h4 { margin-bottom: 15px; }
    #event-parser textarea, #event-parser input { width: 100%; padding: 12px; font-size: 16px; border: 1px solid #ccc; border-radius: 5px; margin-bottom: 20px; font-family: 'Segoe UI', sans-serif; box-sizing: border-box; }
    #event-parser #outputNames { margin-top: 20px; padding: 15px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; white-space: pre-wrap; min-height: 150px; font-family: 'Segoe UI', sans-serif; resize: none; }
    #event-parser button { display: block; width: 100%; margin-top: 10px; padding: 10px; font-size: 16px; border: none; background: #8e9296; color: white; border-radius: 5px; cursor: pointer; font-family: 'Segoe UI', sans-serif; }
    #event-parser button:hover { background: #80b5eb; }
    
    /* Modal styles */
    .ep-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .ep-modal {
      background: #1a1a2e;
      padding: 25px;
      border-radius: 12px;
      max-width: 450px;
      width: 90%;
      text-align: center;
      color: #eee;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    }
    .ep-modal-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .ep-modal h4 {
      margin: 0 0 15px 0;
      color: #f5a623;
      font-size: 20px;
    }
    .ep-modal p {
      margin: 0 0 20px 0;
      color: #bbb;
      font-size: 14px;
      line-height: 1.5;
    }
    .ep-modal-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ep-modal-btn {
      padding: 12px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      font-family: 'Segoe UI', sans-serif;
      transition: all 0.2s;
    }
    .ep-modal-btn-primary {
      background: #80b5eb;
      color: #1a1a2e;
    }
    .ep-modal-btn-primary:hover { background: #6aa5db; }
    .ep-modal-btn-secondary {
      background: #3a3a5a;
      color: #eee;
    }
    .ep-modal-btn-secondary:hover { background: #4a4a6a; }
    .ep-modal-btn-text {
      background: transparent;
      color: #777;
      font-size: 12px;
    }
    .ep-modal-btn-text:hover { color: #aaa; }
  `;

  const HTML = `
    <div id="event-parser">
      <h3>Event Log to Attendance Parser</h3>
      <input type="text" id="eventName" placeholder="Event Name e.g. Wildy Wednesday! >.>">
      <input type="text" id="eventTime" placeholder="Event Time e.g. 7:00 PM">
      <textarea id="eventNotes" rows="10" placeholder="Event Notes e.g. Any notes or important info"></textarea>
      <textarea id="inputText" rows="10" placeholder="Paste your event log here..."></textarea>
      <button id="extractBtn" type="button">Extract Names</button>
      <h4 style="margin-top: 30px;">Formatted Output:</h4>
      <textarea id="outputNames" rows="6" readonly></textarea>
      <button id="copyBtn" type="button">Copy to Clipboard</button>
    </div>
  `;

    /**
    * injectStyles(doc)
    * -----------------
    * Adds the widget's CSS rules to the <head> of the page.
    * Uses a unique ID so it only injects once, even if you mount multiple widgets.
    */
  function injectStyles(doc) {
    if (doc.getElementById(CSS_ID)) return; // once
    const style = doc.createElement('style');
    style.id = CSS_ID;
    style.textContent = STYLE;
    doc.head.appendChild(style);
  }

    /**
    * parseNamesFromLog(text)
    * -----------------------
    * Parses a pasted event log and extracts the "Name" column.
    * Looks for a code-fenced table starting with "Name | Time | Late".
    * Returns an array of names until it hits the closing ``` fence.
    */
  function parseNamesFromLog(text) {
    const names = [];

    // Format 1: Code-fenced table with "Name | Time | Late"
    const nameSectionRegex = /```[\s\S]*?Name\s*\|\s*Time\s*\|\s*Late\s*\n/;
    const match = nameSectionRegex.exec(text);
    if (match) {
      const rest = text.slice(match.index + match[0].length);
      const lines = rest.split('\n');
      for (const line of lines) {
        if (line.includes('```')) break; // stop at closing code fence
        const nameMatch = line.match(/^(.*?)\s*\|/);
        if (nameMatch) {
          const candidate = (nameMatch[1] || '').trim();
          if (candidate && candidate !== 'Name') names.push(candidate);
        }
      }
      return names;
    }

    // Format 2: Plain table with "Name | Time | Late" header (no code fence)
    const plainTableRegex = /Name\s*\|\s*Time\s*\|\s*Late/i;
    const matchPlain = plainTableRegex.exec(text);
    if (matchPlain) {
      const rest = text.slice(matchPlain.index + matchPlain[0].length);
      const lines = rest.split('\n');
      for (const line of lines) {
        // Stop at empty line or "Thanks" message
        if (line.trim() === '' || /thanks/i.test(line)) continue;
        if (/^-+$/.test(line.trim())) continue; // skip separator lines like "-----"
        
        // Match lines with pipe separator: "Name | Time | Late"
        const nameMatch = line.match(/^(.+?)\s*\|/);
        if (nameMatch) {
          const candidate = (nameMatch[1] || '').trim();
          // Skip header row and separator
          if (candidate && candidate !== 'Name' && !candidate.match(/^-+$/)) {
            names.push(candidate);
          }
        }
      }
      if (names.length > 0) return names;
    }

    // Format 3: "Group attendance (N)" followed by "Name - MM:SS" lines
    const groupAttendanceRegex = /Group attendance\s*\(\d+\)/i;
    const matchGroup = groupAttendanceRegex.exec(text);
    if (matchGroup) {
      const rest = text.slice(matchGroup.index + matchGroup[0].length);
      const lines = rest.split('\n');
      for (const line of lines) {
        // Match lines like "AngmarRK - 00:10" or "Crisp Tofu - 00:10"
        const nameMatch = line.match(/^(.+?)\s*-\s*\d{1,2}:\d{2}\s*$/);
        if (nameMatch) {
          const candidate = (nameMatch[1] || '').trim();
          if (candidate) names.push(candidate);
        }
      }
      return names;
    }

    return names;
  }

    /**
    * sendToWebhook(url, body)
    * ------------------------
    * Sends the parsed event data to a webhook endpoint (e.g., Discord relay).
    * Makes a POST request with JSON body.
    * Resolves with the response text if successful; rejects on error.
    */
  function sendToWebhook(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(res => {
      if (!res.ok) throw new Error('Webhook failed: ' + res.status);
      return res.text();
    });
  }

    /**
    * wire(host, opts)
    * ----------------
    * The main setup function:
    * - Finds all DOM elements inside the widget container.
    * - Defines helper functions to build Discord embeds, extract names, copy output.
    * - Attaches event listeners to the buttons.
    */
  function wire(host, opts) {
    const q = (sel) => host.querySelector(sel);
    const eventNameEl = q('#eventName');
    const eventTimeEl = q('#eventTime');
    const eventNotesEl = q('#eventNotes');
    const inputTextEl = q('#inputText');
    const outputNamesEl = q('#outputNames');
    const extractBtn = q('#extractBtn');
    const copyBtn = q('#copyBtn');

    const webhookUrl = (opts && opts.webhook) || 'https://api.itai.gg/';


    /**
     * looksLikeEventLog(text)
     * -----------------------
     * Checks if text looks like it contains event log data that
     * should be in the log input field instead of notes.
     */
    function looksLikeEventLog(text) {
      if (!text) return false;
      // Check for patterns that indicate event log data
      const patterns = [
        /Name\s*\|\s*Time\s*\|\s*Late/i,           // Table header
        /Present Members/i,                         // Common log header
        /Group attendance\s*\(\d+\)/i,              // Group attendance format
        /^.+\s*\|\s*\d{1,2}:\d{2}\s*\|/m,          // Name | Time | ... row (flexible spacing)
        /^\s*.+\s+-\s+\d{1,2}:\d{2}\s*$/m,         // Name - MM:SS format
        /Event\s*name\s*:/i,                        // "Event name:" header
        /Hosted\s*by\s*:/i,                         // "Hosted by:" header
        /Event\s*Duration\s*:/i,                    // "Event Duration:" header
        /\|\s*-\s*$/m                               // Ends with | - (late column)
      ];
      return patterns.some(p => p.test(text));
    }

    /**
     * buildEmbed(names, eventName, eventTime, eventNotes)
     * ---------------------------------------------------
     * Creates a Discord-compatible embed payload object,
     * including event details and attendance list.
     */
    function buildEmbed(names, eventName, eventTime, eventNotes) {
      return {
        username: 'Events Logger TESTING 1.0.0',
        avatar_url: 'https://cdn.gameboost.com/itemoffers/654/gallery/conversions/5d73ec3d-bb83-408c-b126-77ab1eb93378-webp.webp?v=1723554052',
        embeds: [
          {
            title: 'Events Logger v4',
            color: 16711680,
            fields: [
              { name: '__**Event Name**__', value: `${eventName}`, inline: false },
              { name: '__**Event Time**__', value: `${eventTime}`, inline: false },
              { name: '__**Event Notes**__', value: `${eventNotes}`, inline: false },
              { name: '__**Attendance**__', value: 'Copy From Above', inline: false }
            ]
          }
        ],
        content: `__**Attendance**__\n\`\`\`${names.join(', ')}\`\`\``
      };
    }

    /**
     * showModal(options)
     * ------------------
     * Shows a custom modal dialog.
     * options: { icon, title, message, buttons: [{ text, class, action }] }
     */
    function showModal(options) {
      const overlay = document.createElement('div');
      overlay.className = 'ep-modal-overlay';
      overlay.innerHTML = `
        <div class="ep-modal">
          <div class="ep-modal-icon">${options.icon || '⚠️'}</div>
          <h4>${options.title || 'Notice'}</h4>
          <p>${options.message || ''}</p>
          <div class="ep-modal-actions">
            ${options.buttons.map((btn, i) => `
              <button class="ep-modal-btn ${btn.class || ''}" data-idx="${i}">${btn.text}</button>
            `).join('')}
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      overlay.querySelector('.ep-modal-actions').onclick = (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const idx = parseInt(btn.dataset.idx);
        overlay.remove();
        if (options.buttons[idx].action) {
          options.buttons[idx].action();
        }
      };
      
      // Close on overlay click
      overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
      };
    }

    /**
     * extractNames()
     * --------------
     * Handler for "Extract Names" button:
     * - Reads inputs and log text.
     * - Extracts names using parseNamesFromLog().
     * - Builds a formatted summary and shows it in the output textarea.
     * - Sends the same info to the webhook in the background.
     */
    function extractNames() {
      const eventName = (eventNameEl.value || '').trim();
      const eventTime = (eventTimeEl.value || '').trim();
      const eventNotes = (eventNotesEl.value || '').trim();
      const logText = inputTextEl.value || '';

      // Check if Event Notes contains log data (wrong field)
      if (looksLikeEventLog(eventNotes)) {
        showModal({
          icon: '📋',
          title: 'Event Log Detected in Notes',
          message: 'It looks like you pasted the event log into the <strong>Event Notes</strong> field instead of the <strong>Paste your event log here</strong> field.',
          buttons: [
            {
              text: '✨ Move to Correct Field',
              class: 'ep-modal-btn-primary',
              action: () => {
                // Move content from notes to log field
                inputTextEl.value = eventNotes;
                eventNotesEl.value = '';
                inputTextEl.focus();
              }
            },
            {
              text: 'Continue Anyway',
              class: 'ep-modal-btn-secondary',
              action: () => processExtraction(eventName, eventTime, eventNotes, logText)
            },
            {
              text: 'Cancel',
              class: 'ep-modal-btn-text',
              action: null
            }
          ]
        });
        return;
      }

      processExtraction(eventName, eventTime, eventNotes, logText);
    }

    /**
     * processExtraction()
     * -------------------
     * Actually performs the name extraction and webhook send.
     */
    function processExtraction(eventName, eventTime, eventNotes, logText) {
      const names = parseNamesFromLog(logText);

      // Warn if no names were extracted
      if (names.length === 0) {
        showModal({
          icon: '🔍',
          title: 'No Names Found',
          message: 'No attendance names were extracted from the event log.<br><br>Make sure you pasted the full event log into the correct field.',
          buttons: [
            {
              text: 'OK',
              class: 'ep-modal-btn-primary',
              action: null
            }
          ]
        });
        return;
      }

      const result = `Event Name:\n${eventName}\n\nEvent Time:\n${eventTime}\n\nEvent Notes:\n${eventNotes}\n\nAttendance:\n${names.join(', ')}`;
      outputNamesEl.value = result;

      // Fire-and-forget webhook (errors logged to console)
      const payload = buildEmbed(names, eventName, eventTime, eventNotes);
      sendToWebhook(webhookUrl, payload)
        .then(txt => console.log('✅ Message sent successfully!\n', txt))
        .catch(err => console.error('🚨 Webhook error:', err));
    }


    /**
     * copyToClipboard()
     * -----------------
     * Handler for "Copy to Clipboard" button:
     * - Copies the formatted output to the user's clipboard.
     * - Uses the modern Clipboard API if available, else falls back to execCommand.
     */
    function copyToClipboard() {
      const textToCopy = outputNamesEl.value || '';
      if (!textToCopy || textToCopy === 'Your message will appear here.') {
        showModal({
          icon: '📝',
          title: 'Nothing to Copy',
          message: 'Extract names from an event log first before copying.',
          buttons: [{ text: 'OK', class: 'ep-modal-btn-primary', action: null }]
        });
        return;
      }
      
      const showSuccess = () => {
        showModal({
          icon: '✅',
          title: 'Copied!',
          message: 'The formatted output has been copied to your clipboard.',
          buttons: [{ text: 'OK', class: 'ep-modal-btn-primary', action: null }]
        });
      };
      
      if (!navigator.clipboard) {
        const ta = document.createElement('textarea');
        ta.value = textToCopy; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); showSuccess(); }
        finally { document.body.removeChild(ta); }
        return;
      }
      navigator.clipboard.writeText(textToCopy)
        .then(showSuccess)
        .catch(err => console.error('Failed to copy: ', err));
    }

    extractBtn.addEventListener('click', extractNames);
    copyBtn.addEventListener('click', copyToClipboard);
  }

  /**
   * mount(selectorOrEl, opts)
   * -------------------------
   * Public API function you call to render the widget.
   * - Finds the target container (by selector or element).
   * - Injects styles if not already present.
   * - Inserts the HTML structure.
   * - Calls wire() to attach functionality.
   *
   * Example:
   *   EventParserWidget.mount('#event-parser-root', { webhook: 'https://my-relay.url' });
   */
  function mount(selectorOrEl, opts) {
    const host = (typeof selectorOrEl === 'string') ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (!host) return;
    injectStyles(document);
    host.innerHTML = HTML;
    wire(host, opts || {});
  }

  return { mount };
});

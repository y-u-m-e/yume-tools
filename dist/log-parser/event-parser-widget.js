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

    // Format 2: "Group attendance (N)" followed by "Name - MM:SS" lines
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
        /^\s*\w+\s*\|\s*\d{1,2}:\d{2}\s*\|/m,      // Name | Time | Late row
        /^\s*.+\s*-\s*\d{1,2}:\d{2}\s*$/m          // Name - MM:SS format
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
        const proceed = confirm(
          '⚠️ It looks like you may have pasted the event log into the "Event Notes" field.\n\n' +
          'The event log should be pasted into the "Paste your event log here" field below.\n\n' +
          'Click OK to continue anyway, or Cancel to go back and fix it.'
        );
        if (!proceed) return;
      }

      const names = parseNamesFromLog(logText);

      // Warn if no names were extracted
      if (names.length === 0) {
        alert('⚠️ No names were extracted from the event log.\n\nMake sure you pasted the full event log into the correct field.');
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
     * - Copies the formatted output to the user’s clipboard.
     * - Uses the modern Clipboard API if available, else falls back to execCommand.
     */
    function copyToClipboard() {
      const textToCopy = outputNamesEl.value || '';
      if (!navigator.clipboard) {
        const ta = document.createElement('textarea');
        ta.value = textToCopy; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); alert('Copied to clipboard!'); }
        finally { document.body.removeChild(ta); }
        return;
      }
      navigator.clipboard.writeText(textToCopy)
        .then(() => alert('Copied to clipboard!'))
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

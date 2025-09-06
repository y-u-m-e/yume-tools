/* event-parser-widget.js — UMD build for Carrd + jsDelivr
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

  function injectStyles(doc) {
    if (doc.getElementById(CSS_ID)) return; // once
    const style = doc.createElement('style');
    style.id = CSS_ID;
    style.textContent = STYLE;
    doc.head.appendChild(style);
  }

  function parseNamesFromLog(text) {
    const nameSectionRegex = /```[\s\S]*?Name\s*\|\s*Time\s*\|\s*Late\s*\n/;
    const match = nameSectionRegex.exec(text);
    const names = [];
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
    }
    return names;
  }

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

  function wire(host, opts) {
    const q = (sel) => host.querySelector(sel);
    const eventNameEl = q('#eventName');
    const eventTimeEl = q('#eventTime');
    const eventNotesEl = q('#eventNotes');
    const inputTextEl = q('#inputText');
    const outputNamesEl = q('#outputNames');
    const extractBtn = q('#extractBtn');
    const copyBtn = q('#copyBtn');

    const webhookUrl = (opts && opts.webhook) || 'https://discord-relay.itai.app/';

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

    function extractNames() {
      const names = parseNamesFromLog(inputTextEl.value || '');
      const eventName = (eventNameEl.value || '').trim();
      const eventTime = (eventTimeEl.value || '').trim();
      const eventNotes = (eventNotesEl.value || '').trim();

      const result = `Event Name:\n${eventName}\n\nEvent Time:\n${eventTime}\n\nEvent Notes:\n${eventNotes}\n\nAttendance:\n${names.join(', ')}`;
      outputNamesEl.value = result;

      // Fire-and-forget webhook (errors logged to console)
      const payload = buildEmbed(names, eventName, eventTime, eventNotes);
      sendToWebhook(webhookUrl, payload)
        .then(txt => console.log('✅ Message sent successfully!\n', txt))
        .catch(err => console.error('🚨 Webhook error:', err));
    }

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

  function mount(selectorOrEl, opts) {
    const host = (typeof selectorOrEl === 'string') ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (!host) return;
    injectStyles(document);
    host.innerHTML = HTML;
    wire(host, opts || {});
  }

  return { mount };
});

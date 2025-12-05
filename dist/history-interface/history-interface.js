/* history-interface.js — UMD build for Carrd embed
 *
 * Admin interface for managing attendance records in D1 database
 * - View all records with filtering
 * - Add new records
 * - Edit existing records
 * - Delete records
 *
 * Exposes: `HistoryInterface.mount(selectorOrEl, { apiBase: 'https://your-worker.url' })`
 *
 * How to use on Carrd (Embed → Code):
 *
 * <div id="history-root"></div>
 * <script src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/dist/history-interface/history-interface.js"></script>
 * <script>
 *   HistoryInterface.mount('#history-root', { apiBase: 'https://discord-relay.itai.app' });
 * </script>
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HistoryInterface = factory();
  }
})(this, function () {
  const CSS_ID = 'history-interface-styles';

  const STYLE = `
    #history-interface {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 1000px;
      margin: 20px auto;
      padding: 20px;
      background: #1a1a2e;
      border-radius: 10px;
      color: #eee;
    }
    #history-interface * { box-sizing: border-box; }
    #history-interface h2 {
      margin: 0 0 20px 0;
      color: #80b5eb;
      text-align: center;
    }
    
    /* Auth screens */
    #history-interface .hi-auth-screen {
      text-align: center;
      padding: 60px 20px;
    }
    #history-interface .hi-auth-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    #history-interface .hi-auth-title {
      font-size: 24px;
      color: #80b5eb;
      margin-bottom: 10px;
    }
    #history-interface .hi-auth-message {
      color: #888;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    #history-interface .hi-discord-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      background: #5865F2;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
    }
    #history-interface .hi-discord-btn:hover {
      background: #4752C4;
    }
    #history-interface .hi-unauthorized {
      background: linear-gradient(135deg, #2d1f1f 0%, #1a1a2e 100%);
    }
    #history-interface .hi-unauthorized .hi-auth-icon {
      color: #e74c3c;
    }
    #history-interface .hi-user-info {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 15px;
      padding: 10px;
      background: #2a2a4a;
      border-radius: 8px;
    }
    #history-interface .hi-user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }
    #history-interface .hi-user-name {
      color: #eee;
      font-size: 14px;
    }
    #history-interface .hi-logout-btn {
      padding: 6px 12px;
      background: #555;
      color: #eee;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }
    #history-interface .hi-logout-btn:hover {
      background: #666;
    }
    #history-interface .hi-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    #history-interface .hi-tab {
      padding: 10px 20px;
      background: #2a2a4a;
      border: none;
      border-radius: 5px 5px 0 0;
      color: #aaa;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    #history-interface .hi-tab:hover { background: #3a3a5a; color: #fff; }
    #history-interface .hi-tab.active { background: #80b5eb; color: #1a1a2e; }
    #history-interface .hi-panel { display: none; }
    #history-interface .hi-panel.active { display: block; }
    
    /* Filter/Search bar */
    #history-interface .hi-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    #history-interface .hi-filters input,
    #history-interface .hi-filters select {
      padding: 8px 12px;
      border: 1px solid #444;
      border-radius: 5px;
      background: #2a2a4a;
      color: #eee;
      font-size: 14px;
    }
    #history-interface .hi-filters input:focus,
    #history-interface .hi-filters select:focus {
      outline: none;
      border-color: #80b5eb;
    }
    #history-interface .hi-filters input::placeholder { color: #777; }
    #history-interface .hi-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    #history-interface .hi-btn-primary {
      background: #80b5eb;
      color: #1a1a2e;
    }
    #history-interface .hi-btn-primary:hover { background: #6aa5db; }
    #history-interface .hi-btn-danger {
      background: #e74c3c;
      color: #fff;
    }
    #history-interface .hi-btn-danger:hover { background: #c0392b; }
    #history-interface .hi-btn-secondary {
      background: #555;
      color: #fff;
    }
    #history-interface .hi-btn-secondary:hover { background: #666; }
    #history-interface .hi-btn-sm {
      padding: 4px 10px;
      font-size: 12px;
    }

    /* Table */
    #history-interface .hi-table-wrap {
      overflow-x: auto;
      margin-bottom: 15px;
    }
    #history-interface table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    #history-interface th, #history-interface td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #333;
    }
    #history-interface th {
      background: #2a2a4a;
      color: #80b5eb;
      font-weight: 600;
    }
    #history-interface tr:hover { background: #2a2a4a; }
    #history-interface .hi-actions {
      display: flex;
      gap: 5px;
    }

    /* Form */
    #history-interface .hi-form {
      display: grid;
      gap: 15px;
      max-width: 500px;
    }
    #history-interface .hi-form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    #history-interface .hi-form-group label {
      font-size: 14px;
      color: #aaa;
    }
    #history-interface .hi-form-group input {
      padding: 10px 12px;
      border: 1px solid #444;
      border-radius: 5px;
      background: #2a2a4a;
      color: #eee;
      font-size: 14px;
    }
    #history-interface .hi-form-group input:focus {
      outline: none;
      border-color: #80b5eb;
    }

    /* Modal */
    #history-interface .hi-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    #history-interface .hi-modal {
      background: #1a1a2e;
      padding: 25px;
      border-radius: 10px;
      min-width: 400px;
      max-width: 90%;
    }
    #history-interface .hi-modal h3 {
      margin: 0 0 20px 0;
      color: #80b5eb;
    }
    #history-interface .hi-modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      justify-content: flex-end;
    }

    /* Status messages */
    #history-interface .hi-status {
      padding: 10px 15px;
      border-radius: 5px;
      margin-bottom: 15px;
      font-size: 14px;
    }
    #history-interface .hi-status.success { background: #27ae60; color: #fff; }
    #history-interface .hi-status.error { background: #e74c3c; color: #fff; }
    #history-interface .hi-status.info { background: #3498db; color: #fff; }

    /* Loading */
    #history-interface .hi-loading {
      text-align: center;
      padding: 40px;
      color: #777;
    }
    #history-interface .hi-empty {
      text-align: center;
      padding: 40px;
      color: #777;
    }

    /* Pagination */
    #history-interface .hi-pagination {
      display: flex;
      gap: 5px;
      justify-content: center;
      align-items: center;
      margin-top: 15px;
    }
    #history-interface .hi-pagination span {
      color: #777;
      font-size: 14px;
      margin: 0 10px;
    }

    /* Event Groups */
    #history-interface .hi-event-group {
      background: #2a2a4a;
      border-radius: 8px;
      margin-bottom: 15px;
      overflow: hidden;
    }
    #history-interface .hi-event-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #3a3a5a;
      cursor: pointer;
      transition: background 0.2s;
    }
    #history-interface .hi-event-header:hover {
      background: #4a4a6a;
    }
    #history-interface .hi-event-title {
      font-size: 16px;
      font-weight: 600;
      color: #80b5eb;
    }
    #history-interface .hi-event-meta {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    #history-interface .hi-event-date {
      font-size: 13px;
      color: #aaa;
    }
    #history-interface .hi-event-count {
      background: #80b5eb;
      color: #1a1a2e;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    #history-interface .hi-event-toggle {
      color: #aaa;
      font-size: 18px;
      transition: transform 0.2s;
    }
    #history-interface .hi-event-group.expanded .hi-event-toggle {
      transform: rotate(180deg);
    }
    #history-interface .hi-event-body {
      display: none;
      padding: 15px;
      border-top: 1px solid #444;
    }
    #history-interface .hi-event-group.expanded .hi-event-body {
      display: block;
    }
    #history-interface .hi-attendee-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    #history-interface .hi-attendee {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #1a1a2e;
      padding: 6px 12px;
      border-radius: 5px;
      font-size: 13px;
    }
    #history-interface .hi-attendee-name {
      color: #eee;
    }
    #history-interface .hi-attendee-actions {
      display: flex;
      gap: 4px;
    }
    #history-interface .hi-attendee-actions button {
      padding: 2px 6px;
      font-size: 10px;
    }

    /* Leaderboard */
    #history-interface .hi-leaderboard-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: flex-end;
    }
    #history-interface .hi-control-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    #history-interface .hi-control-group label {
      font-size: 12px;
      color: #888;
    }
    #history-interface .hi-control-group select,
    #history-interface .hi-control-group input {
      padding: 8px 12px;
      border: 1px solid #444;
      border-radius: 5px;
      background: #2a2a4a;
      color: #eee;
      font-size: 14px;
    }
    #history-interface .hi-leaderboard {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    #history-interface .hi-leader-row {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px 16px;
      background: #2a2a4a;
      border-radius: 8px;
      transition: transform 0.2s, background 0.2s;
    }
    #history-interface .hi-leader-row:hover {
      background: #3a3a5a;
      transform: translateX(4px);
    }
    #history-interface .hi-leader-rank {
      font-size: 20px;
      font-weight: 700;
      width: 40px;
      text-align: center;
    }
    #history-interface .hi-leader-row:nth-child(1) .hi-leader-rank { color: #ffd700; }
    #history-interface .hi-leader-row:nth-child(2) .hi-leader-rank { color: #c0c0c0; }
    #history-interface .hi-leader-row:nth-child(3) .hi-leader-rank { color: #cd7f32; }
    #history-interface .hi-leader-row:nth-child(n+4) .hi-leader-rank { color: #666; }
    #history-interface .hi-leader-name {
      flex: 1;
      font-size: 16px;
      color: #eee;
    }
    #history-interface .hi-leader-count {
      font-size: 18px;
      font-weight: 600;
      color: #80b5eb;
    }
    #history-interface .hi-leader-bar {
      flex: 0 0 200px;
      height: 8px;
      background: #1a1a2e;
      border-radius: 4px;
      overflow: hidden;
    }
    #history-interface .hi-leader-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #80b5eb, #5a9fd4);
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    #history-interface .hi-leaderboard-summary {
      margin-top: 20px;
      padding: 15px;
      background: #2a2a4a;
      border-radius: 8px;
      display: flex;
      gap: 30px;
      flex-wrap: wrap;
    }
    #history-interface .hi-stat {
      text-align: center;
    }
    #history-interface .hi-stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #80b5eb;
    }
    #history-interface .hi-stat-label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
    }
  `;

  const HTML = `
    <div id="history-interface">
      <h2>📋 Attendance Manager</h2>
      
      <div class="hi-tabs">
        <button class="hi-tab active" data-tab="view">View Records</button>
        <button class="hi-tab" data-tab="events">View by Event</button>
        <button class="hi-tab" data-tab="leaderboard">🏆 Leaderboard</button>
        <button class="hi-tab" data-tab="add">Add Record</button>
      </div>

      <div id="hi-status"></div>

      <!-- View Records Panel -->
      <div class="hi-panel active" data-panel="view">
        <div class="hi-filters">
          <input type="text" id="hi-filter-name" placeholder="Filter by name...">
          <input type="text" id="hi-filter-event" placeholder="Filter by event...">
          <input type="date" id="hi-filter-start" title="Start date">
          <input type="date" id="hi-filter-end" title="End date">
          <button class="hi-btn hi-btn-primary" id="hi-search-btn">Search</button>
          <button class="hi-btn hi-btn-secondary" id="hi-clear-btn">Clear</button>
        </div>
        <div class="hi-table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Event</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="hi-records-body">
              <tr><td colspan="5" class="hi-loading">Loading records...</td></tr>
            </tbody>
          </table>
        </div>
        <div class="hi-pagination" id="hi-pagination"></div>
      </div>

      <!-- View by Event Panel -->
      <div class="hi-panel" data-panel="events">
        <div class="hi-filters">
          <input type="text" id="hi-event-filter-event" placeholder="Filter by event name...">
          <input type="date" id="hi-event-filter-start" title="Start date">
          <input type="date" id="hi-event-filter-end" title="End date">
          <button class="hi-btn hi-btn-primary" id="hi-event-search-btn">Search</button>
          <button class="hi-btn hi-btn-secondary" id="hi-event-clear-btn">Clear</button>
        </div>
        <div id="hi-event-groups">
          <div class="hi-loading">Loading events...</div>
        </div>
        <div class="hi-pagination" id="hi-event-pagination"></div>
      </div>

      <!-- Leaderboard Panel -->
      <div class="hi-panel" data-panel="leaderboard">
        <div class="hi-leaderboard-controls">
          <div class="hi-control-group">
            <label>Show Top</label>
            <select id="hi-leader-top">
              <option value="5">Top 5</option>
              <option value="10" selected>Top 10</option>
              <option value="25">Top 25</option>
              <option value="50">Top 50</option>
              <option value="100">Top 100</option>
            </select>
          </div>
          <div class="hi-control-group">
            <label>From Date</label>
            <input type="date" id="hi-leader-start">
          </div>
          <div class="hi-control-group">
            <label>To Date</label>
            <input type="date" id="hi-leader-end">
          </div>
          <button class="hi-btn hi-btn-primary" id="hi-leader-refresh">Refresh</button>
          <button class="hi-btn hi-btn-secondary" id="hi-leader-clear">All Time</button>
        </div>
        <div id="hi-leaderboard">
          <div class="hi-loading">Loading leaderboard...</div>
        </div>
        <div class="hi-leaderboard-summary" id="hi-leader-summary" style="display:none;">
          <div class="hi-stat">
            <div class="hi-stat-value" id="hi-stat-total">-</div>
            <div class="hi-stat-label">Total Events</div>
          </div>
          <div class="hi-stat">
            <div class="hi-stat-value" id="hi-stat-participants">-</div>
            <div class="hi-stat-label">Unique Participants</div>
          </div>
          <div class="hi-stat">
            <div class="hi-stat-value" id="hi-stat-avg">-</div>
            <div class="hi-stat-label">Avg per Person</div>
          </div>
        </div>
      </div>

      <!-- Add Record Panel -->
      <div class="hi-panel" data-panel="add">
        <div class="hi-form">
          <div class="hi-form-group">
            <label>Player Name</label>
            <input type="text" id="hi-add-name" placeholder="e.g. y u m e">
          </div>
          <div class="hi-form-group">
            <label>Event Name</label>
            <input type="text" id="hi-add-event" placeholder="e.g. Wildy Wednesday">
          </div>
          <div class="hi-form-group">
            <label>Date</label>
            <input type="date" id="hi-add-date">
          </div>
          <button class="hi-btn hi-btn-primary" id="hi-add-btn">Add Record</button>
        </div>
      </div>
    </div>
  `;

  function injectStyles(doc) {
    if (doc.getElementById(CSS_ID)) return;
    const style = doc.createElement('style');
    style.id = CSS_ID;
    style.textContent = STYLE;
    doc.head.appendChild(style);
  }

  // State
  let apiBase = '';
  let records = [];
  let eventGroups = [];
  let allEventGroups = [];
  let leaderboardData = [];
  let currentPage = 1;
  let eventCurrentPage = 1;
  const pageSize = 20;
  const eventPageSize = 10;

  // API calls
  async function fetchRecords(filters = {}) {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.event) params.append('event', filters.event);
    if (filters.start) params.append('start', filters.start);
    if (filters.end) params.append('end', filters.end);
    params.append('page', currentPage);
    params.append('limit', pageSize);

    const url = `${apiBase}/attendance/records?${params.toString()}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch records');
    return resp.json();
  }

  async function addRecord(name, event, date) {
    const resp = await fetch(`${apiBase}/attendance/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, event, date })
    });
    if (!resp.ok) throw new Error('Failed to add record');
    return resp.json();
  }

  async function updateRecord(id, name, event, date) {
    const resp = await fetch(`${apiBase}/attendance/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, event, date })
    });
    if (!resp.ok) throw new Error('Failed to update record');
    return resp.json();
  }

  async function deleteRecord(id) {
    const resp = await fetch(`${apiBase}/attendance/records/${id}`, {
      method: 'DELETE'
    });
    if (!resp.ok) throw new Error('Failed to delete record');
    return resp.json();
  }

  async function fetchAllRecords(filters = {}) {
    const params = new URLSearchParams();
    if (filters.event) params.append('event', filters.event);
    if (filters.start) params.append('start', filters.start);
    if (filters.end) params.append('end', filters.end);
    params.append('limit', 5000); // Fetch all for grouping

    const url = `${apiBase}/attendance/records?${params.toString()}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch records');
    return resp.json();
  }

  async function fetchLeaderboard(top = 10, start = '', end = '') {
    const params = new URLSearchParams();
    params.append('top', top);
    if (start) params.append('start', start);
    if (end) params.append('end', end);

    const url = `${apiBase}/attendance?${params.toString()}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to fetch leaderboard');
    return resp.json();
  }

  function groupRecordsByEvent(records) {
    const groups = {};
    for (const record of records) {
      const key = `${record.event}|||${record.date}`;
      if (!groups[key]) {
        groups[key] = {
          event: record.event,
          date: record.date,
          attendees: []
        };
      }
      groups[key].attendees.push({ id: record.id, name: record.name });
    }
    // Sort by date descending
    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }

  function renderEventGroups(rootEl) {
    const container = rootEl.querySelector('#hi-event-groups');
    const paginationEl = rootEl.querySelector('#hi-event-pagination');

    if (allEventGroups.length === 0) {
      container.innerHTML = '<div class="hi-empty">No events found</div>';
      paginationEl.innerHTML = '';
      return;
    }

    // Paginate the groups
    const totalPages = Math.ceil(allEventGroups.length / eventPageSize);
    const startIdx = (eventCurrentPage - 1) * eventPageSize;
    const endIdx = startIdx + eventPageSize;
    eventGroups = allEventGroups.slice(startIdx, endIdx);

    container.innerHTML = eventGroups.map((group, idx) => `
      <div class="hi-event-group" data-idx="${startIdx + idx}">
        <div class="hi-event-header">
          <div>
            <div class="hi-event-title">${escapeHtml(group.event)}</div>
          </div>
          <div class="hi-event-meta">
            <span class="hi-event-date">${group.date}</span>
            <span class="hi-event-count">${group.attendees.length} attendee${group.attendees.length !== 1 ? 's' : ''}</span>
            <button class="hi-btn hi-btn-danger hi-btn-sm hi-event-delete" title="Delete entire event">🗑</button>
            <span class="hi-event-toggle">▼</span>
          </div>
        </div>
        <div class="hi-event-body">
          <div class="hi-attendee-list">
            ${group.attendees.map(a => `
              <div class="hi-attendee" data-id="${a.id}">
                <span class="hi-attendee-name">${escapeHtml(a.name)}</span>
                <div class="hi-attendee-actions">
                  <button class="hi-btn hi-btn-secondary hi-btn-sm hi-attendee-edit">✎</button>
                  <button class="hi-btn hi-btn-danger hi-btn-sm hi-attendee-delete">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');

    // Render pagination
    if (totalPages > 1) {
      paginationEl.innerHTML = `
        <button class="hi-btn hi-btn-secondary hi-btn-sm" id="hi-event-prev" ${eventCurrentPage === 1 ? 'disabled' : ''}>← Prev</button>
        <span>Page ${eventCurrentPage} of ${totalPages} (${allEventGroups.length} events)</span>
        <button class="hi-btn hi-btn-secondary hi-btn-sm" id="hi-event-next" ${eventCurrentPage === totalPages ? 'disabled' : ''}>Next →</button>
      `;
    } else {
      paginationEl.innerHTML = allEventGroups.length > 0 ? `<span>${allEventGroups.length} event${allEventGroups.length !== 1 ? 's' : ''}</span>` : '';
    }
  }

  async function loadEventGroups(rootEl) {
    const container = rootEl.querySelector('#hi-event-groups');
    container.innerHTML = '<div class="hi-loading">Loading events...</div>';

    const filters = {
      event: rootEl.querySelector('#hi-event-filter-event').value.trim(),
      start: rootEl.querySelector('#hi-event-filter-start').value,
      end: rootEl.querySelector('#hi-event-filter-end').value
    };

    try {
      const data = await fetchAllRecords(filters);
      allEventGroups = groupRecordsByEvent(data.results || []);
      renderEventGroups(rootEl);
    } catch (err) {
      container.innerHTML = `<div class="hi-empty">Error loading events: ${err.message}</div>`;
    }
  }

  function renderLeaderboard(rootEl) {
    const container = rootEl.querySelector('#hi-leaderboard');
    const summaryEl = rootEl.querySelector('#hi-leader-summary');

    if (leaderboardData.length === 0) {
      container.innerHTML = '<div class="hi-empty">No attendance data found</div>';
      summaryEl.style.display = 'none';
      return;
    }

    const maxCount = leaderboardData[0]?.count || 1;
    const totalEvents = leaderboardData.reduce((sum, p) => sum + p.count, 0);
    const avgPerPerson = (totalEvents / leaderboardData.length).toFixed(1);

    container.innerHTML = leaderboardData.map((p, idx) => `
      <div class="hi-leader-row">
        <div class="hi-leader-rank">#${idx + 1}</div>
        <div class="hi-leader-name">${escapeHtml(p.name)}</div>
        <div class="hi-leader-bar">
          <div class="hi-leader-bar-fill" style="width: ${(p.count / maxCount) * 100}%"></div>
        </div>
        <div class="hi-leader-count">${p.count}</div>
      </div>
    `).join('');

    // Update summary stats
    rootEl.querySelector('#hi-stat-total').textContent = totalEvents;
    rootEl.querySelector('#hi-stat-participants').textContent = leaderboardData.length;
    rootEl.querySelector('#hi-stat-avg').textContent = avgPerPerson;
    summaryEl.style.display = 'flex';
  }

  async function loadLeaderboard(rootEl) {
    const container = rootEl.querySelector('#hi-leaderboard');
    container.innerHTML = '<div class="hi-loading">Loading leaderboard...</div>';

    const top = parseInt(rootEl.querySelector('#hi-leader-top').value) || 10;
    const start = rootEl.querySelector('#hi-leader-start').value;
    const end = rootEl.querySelector('#hi-leader-end').value;

    try {
      const data = await fetchLeaderboard(top, start, end);
      leaderboardData = data.results || [];
      renderLeaderboard(rootEl);
    } catch (err) {
      container.innerHTML = `<div class="hi-empty">Error loading leaderboard: ${err.message}</div>`;
      rootEl.querySelector('#hi-leader-summary').style.display = 'none';
    }
  }

  // UI helpers
  function showStatus(rootEl, message, type = 'info') {
    const statusEl = rootEl.querySelector('#hi-status');
    statusEl.className = `hi-status ${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
  }

  function renderRecords(rootEl, data) {
    const tbody = rootEl.querySelector('#hi-records-body');
    records = data.results || [];

    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="hi-empty">No records found</td></tr>';
      return;
    }

    tbody.innerHTML = records.map(r => `
      <tr data-id="${r.id}">
        <td>${r.id}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.event)}</td>
        <td>${r.date}</td>
        <td class="hi-actions">
          <button class="hi-btn hi-btn-secondary hi-btn-sm hi-edit-btn">Edit</button>
          <button class="hi-btn hi-btn-danger hi-btn-sm hi-delete-btn">Delete</button>
        </td>
      </tr>
    `).join('');

    // Pagination
    const paginationEl = rootEl.querySelector('#hi-pagination');
    const total = data.total || records.length;
    const totalPages = Math.ceil(total / pageSize);
    
    if (totalPages > 1) {
      paginationEl.innerHTML = `
        <button class="hi-btn hi-btn-secondary hi-btn-sm" id="hi-prev" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button class="hi-btn hi-btn-secondary hi-btn-sm" id="hi-next" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>
      `;
    } else {
      paginationEl.innerHTML = '';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function showEditModal(rootEl, record, onSuccess = null) {
    const overlay = document.createElement('div');
    overlay.className = 'hi-modal-overlay';
    overlay.innerHTML = `
      <div class="hi-modal">
        <h3>Edit Record #${record.id}</h3>
        <div class="hi-form">
          <div class="hi-form-group">
            <label>Player Name</label>
            <input type="text" id="hi-edit-name" value="${escapeHtml(record.name)}">
          </div>
          <div class="hi-form-group">
            <label>Event Name</label>
            <input type="text" id="hi-edit-event" value="${escapeHtml(record.event)}">
          </div>
          <div class="hi-form-group">
            <label>Date</label>
            <input type="date" id="hi-edit-date" value="${record.date}">
          </div>
        </div>
        <div class="hi-modal-actions">
          <button class="hi-btn hi-btn-secondary" id="hi-edit-cancel">Cancel</button>
          <button class="hi-btn hi-btn-primary" id="hi-edit-save">Save Changes</button>
        </div>
      </div>
    `;

    rootEl.appendChild(overlay);

    overlay.querySelector('#hi-edit-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#hi-edit-save').onclick = async () => {
      const name = overlay.querySelector('#hi-edit-name').value.trim();
      const event = overlay.querySelector('#hi-edit-event').value.trim();
      const date = overlay.querySelector('#hi-edit-date').value;

      if (!name || !event || !date) {
        alert('All fields are required');
        return;
      }

      try {
        await updateRecord(record.id, name, event, date);
        overlay.remove();
        showStatus(rootEl, 'Record updated successfully!', 'success');
        if (onSuccess) {
          onSuccess();
        } else {
          loadRecords(rootEl);
        }
      } catch (err) {
        showStatus(rootEl, 'Failed to update record: ' + err.message, 'error');
      }
    };
  }

  async function loadRecords(rootEl) {
    const tbody = rootEl.querySelector('#hi-records-body');
    tbody.innerHTML = '<tr><td colspan="5" class="hi-loading">Loading records...</td></tr>';

    const filters = {
      name: rootEl.querySelector('#hi-filter-name').value.trim(),
      event: rootEl.querySelector('#hi-filter-event').value.trim(),
      start: rootEl.querySelector('#hi-filter-start').value,
      end: rootEl.querySelector('#hi-filter-end').value
    };

    try {
      const data = await fetchRecords(filters);
      renderRecords(rootEl, data);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="hi-empty">Error loading records: ${err.message}</td></tr>`;
    }
  }

  function wire(rootEl, config) {
    apiBase = config.apiBase || '';

    // Tab switching
    const tabs = rootEl.querySelectorAll('.hi-tab');
    const panels = rootEl.querySelectorAll('.hi-panel');
    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        rootEl.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
        // Load data when switching to tabs
        if (tab.dataset.tab === 'events') {
          loadEventGroups(rootEl);
        } else if (tab.dataset.tab === 'leaderboard') {
          loadLeaderboard(rootEl);
        }
      };
    });

    // Search/filter
    rootEl.querySelector('#hi-search-btn').onclick = () => {
      currentPage = 1;
      loadRecords(rootEl);
    };
    rootEl.querySelector('#hi-clear-btn').onclick = () => {
      rootEl.querySelector('#hi-filter-name').value = '';
      rootEl.querySelector('#hi-filter-event').value = '';
      rootEl.querySelector('#hi-filter-start').value = '';
      rootEl.querySelector('#hi-filter-end').value = '';
      currentPage = 1;
      loadRecords(rootEl);
    };

    // Add record
    rootEl.querySelector('#hi-add-date').valueAsDate = new Date();
    rootEl.querySelector('#hi-add-btn').onclick = async () => {
      const name = rootEl.querySelector('#hi-add-name').value.trim();
      const event = rootEl.querySelector('#hi-add-event').value.trim();
      const date = rootEl.querySelector('#hi-add-date').value;

      if (!name || !event || !date) {
        showStatus(rootEl, 'All fields are required', 'error');
        return;
      }

      try {
        await addRecord(name, event, date);
        showStatus(rootEl, 'Record added successfully!', 'success');
        rootEl.querySelector('#hi-add-name').value = '';
        rootEl.querySelector('#hi-add-event').value = '';
        // Switch to view tab and refresh
        tabs[0].click();
        loadRecords(rootEl);
      } catch (err) {
        showStatus(rootEl, 'Failed to add record: ' + err.message, 'error');
      }
    };

    // Table row actions (edit/delete) - event delegation
    rootEl.querySelector('#hi-records-body').onclick = async (e) => {
      const row = e.target.closest('tr');
      if (!row) return;
      const id = parseInt(row.dataset.id);
      const record = records.find(r => r.id === id);
      if (!record) return;

      if (e.target.classList.contains('hi-edit-btn')) {
        showEditModal(rootEl, record);
      } else if (e.target.classList.contains('hi-delete-btn')) {
        if (confirm(`Delete record for "${record.name}" at "${record.event}" on ${record.date}?`)) {
          try {
            await deleteRecord(id);
            showStatus(rootEl, 'Record deleted successfully!', 'success');
            loadRecords(rootEl);
          } catch (err) {
            showStatus(rootEl, 'Failed to delete record: ' + err.message, 'error');
          }
        }
      }
    };

    // Pagination - event delegation
    rootEl.querySelector('#hi-pagination').onclick = (e) => {
      if (e.target.id === 'hi-prev' && currentPage > 1) {
        currentPage--;
        loadRecords(rootEl);
      } else if (e.target.id === 'hi-next') {
        currentPage++;
        loadRecords(rootEl);
      }
    };

    // Event groups - search/filter
    rootEl.querySelector('#hi-event-search-btn').onclick = () => {
      eventCurrentPage = 1;
      loadEventGroups(rootEl);
    };
    rootEl.querySelector('#hi-event-clear-btn').onclick = () => {
      rootEl.querySelector('#hi-event-filter-event').value = '';
      rootEl.querySelector('#hi-event-filter-start').value = '';
      rootEl.querySelector('#hi-event-filter-end').value = '';
      eventCurrentPage = 1;
      loadEventGroups(rootEl);
    };

    // Event groups - pagination
    rootEl.querySelector('#hi-event-pagination').onclick = (e) => {
      const totalPages = Math.ceil(allEventGroups.length / eventPageSize);
      if (e.target.id === 'hi-event-prev' && eventCurrentPage > 1) {
        eventCurrentPage--;
        renderEventGroups(rootEl);
      } else if (e.target.id === 'hi-event-next' && eventCurrentPage < totalPages) {
        eventCurrentPage++;
        renderEventGroups(rootEl);
      }
    };

    // Leaderboard controls
    rootEl.querySelector('#hi-leader-refresh').onclick = () => loadLeaderboard(rootEl);
    rootEl.querySelector('#hi-leader-clear').onclick = () => {
      rootEl.querySelector('#hi-leader-start').value = '';
      rootEl.querySelector('#hi-leader-end').value = '';
      loadLeaderboard(rootEl);
    };
    rootEl.querySelector('#hi-leader-top').onchange = () => loadLeaderboard(rootEl);

    // Event groups - expand/collapse and actions
    rootEl.querySelector('#hi-event-groups').onclick = async (e) => {
      const groupEl = e.target.closest('.hi-event-group');
      if (!groupEl) return;
      
      const groupIdx = parseInt(groupEl.dataset.idx);
      const group = allEventGroups[groupIdx];
      if (!group) return;

      // Delete entire event
      if (e.target.classList.contains('hi-event-delete')) {
        const count = group.attendees.length;
        if (confirm(`Delete entire event "${group.event}" on ${group.date}?\n\nThis will remove all ${count} attendance record${count !== 1 ? 's' : ''}.`)) {
          try {
            // Delete all records for this event
            for (const attendee of group.attendees) {
              await deleteRecord(attendee.id);
            }
            showStatus(rootEl, `Deleted ${count} record${count !== 1 ? 's' : ''} for "${group.event}"`, 'success');
            loadEventGroups(rootEl);
          } catch (err) {
            showStatus(rootEl, 'Failed to delete event: ' + err.message, 'error');
          }
        }
        return;
      }

      // Toggle expand/collapse
      const header = e.target.closest('.hi-event-header');
      if (header && !e.target.closest('button')) {
        header.closest('.hi-event-group').classList.toggle('expanded');
        return;
      }

      // Attendee actions
      const attendeeEl = e.target.closest('.hi-attendee');
      if (!attendeeEl) return;

      const id = parseInt(attendeeEl.dataset.id);
      const attendee = group.attendees.find(a => a.id === id);
      if (!attendee) return;

      if (e.target.classList.contains('hi-attendee-edit')) {
        // Edit - show modal with pre-filled event/date from group
        const record = { id, name: attendee.name, event: group.event, date: group.date };
        showEditModal(rootEl, record, () => loadEventGroups(rootEl));
      } else if (e.target.classList.contains('hi-attendee-delete')) {
        if (confirm(`Remove "${attendee.name}" from "${group.event}" on ${group.date}?`)) {
          try {
            await deleteRecord(id);
            showStatus(rootEl, 'Record deleted successfully!', 'success');
            loadEventGroups(rootEl);
          } catch (err) {
            showStatus(rootEl, 'Failed to delete record: ' + err.message, 'error');
          }
        }
      }
    };

    // Initial load
    loadRecords(rootEl);
  }

  // Auth screen HTML templates
  const LOGIN_HTML = `
    <div id="history-interface">
      <div class="hi-auth-screen">
        <div class="hi-auth-icon">🔐</div>
        <div class="hi-auth-title">Authentication Required</div>
        <p class="hi-auth-message">Sign in with Discord to access the Attendance Manager.</p>
        <a class="hi-discord-btn" id="hi-login-btn">
          <svg width="24" height="24" viewBox="0 0 71 55" fill="currentColor">
            <path d="M60.1 4.9A58.5 58.5 0 0045.4.4a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.5a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.5.2.2 0 00-.1.1A60 60 0 00.4 44.4a.2.2 0 000 .2 58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.3 36.3 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.2.1 58.5 58.5 0 0017.8-9 .2.2 0 000-.2c1.5-15.3-2.4-28.6-10.3-40.4a.2.2 0 00-.1-.1zM23.7 36.4c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.1-6.4 7.1zm23.6 0c-3.5 0-6.4-3.2-6.4-7.1s2.9-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.1-6.4 7.1z"/>
          </svg>
          Sign in with Discord
        </a>
      </div>
    </div>
  `;

  const UNAUTHORIZED_HTML = (username, avatar) => `
    <div id="history-interface" class="hi-unauthorized">
      <div class="hi-auth-screen">
        <div class="hi-auth-icon">🚫</div>
        <div class="hi-auth-title">Access Denied</div>
        <p class="hi-auth-message">
          Sorry <strong>${username}</strong>, you are not authorized to access this page.<br>
          Contact an administrator if you believe this is a mistake.
        </p>
        <a class="hi-discord-btn" id="hi-logout-btn" style="background: #555;">
          Sign Out
        </a>
      </div>
    </div>
  `;

  async function checkAuth(apiBase) {
    try {
      const resp = await fetch(`${apiBase}/auth/me`, { credentials: 'include' });
      if (!resp.ok) return { authenticated: false };
      return await resp.json();
    } catch {
      return { authenticated: false };
    }
  }

  async function mount(selectorOrEl, config = {}) {
    const host = (typeof selectorOrEl === 'string') ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (!host) return;
    
    const apiBase = config.apiBase || '';
    injectStyles(document);

    // Show loading state
    host.innerHTML = `
      <div id="history-interface">
        <div class="hi-auth-screen">
          <div class="hi-auth-icon">⏳</div>
          <div class="hi-auth-title">Loading...</div>
        </div>
      </div>
    `;

    // Check authentication
    const auth = await checkAuth(apiBase);

    if (!auth.authenticated) {
      // Show login screen
      host.innerHTML = LOGIN_HTML;
      host.querySelector('#hi-login-btn').onclick = () => {
        window.location.href = `${apiBase}/auth/login`;
      };
      return;
    }

    if (!auth.authorized) {
      // Show unauthorized screen
      host.innerHTML = UNAUTHORIZED_HTML(auth.user.username, auth.user.avatar);
      host.querySelector('#hi-logout-btn').onclick = () => {
        window.location.href = `${apiBase}/auth/logout`;
      };
      return;
    }

    // User is authenticated and authorized - show the full interface
    host.innerHTML = HTML;
    
    // Add user info bar at the top
    const container = host.querySelector('#history-interface');
    const userInfoHtml = `
      <div class="hi-user-info">
        ${auth.user.avatar ? `<img class="hi-user-avatar" src="https://cdn.discordapp.com/avatars/${auth.user.id}/${auth.user.avatar}.png" alt="">` : ''}
        <span class="hi-user-name">${auth.user.username}</span>
        <button class="hi-logout-btn" id="hi-logout-btn">Logout</button>
      </div>
    `;
    container.insertAdjacentHTML('afterbegin', userInfoHtml);

    // Wire up logout
    host.querySelector('#hi-logout-btn').onclick = () => {
      window.location.href = `${apiBase}/auth/logout`;
    };

    wire(container, config);
  }

  return { mount };
});

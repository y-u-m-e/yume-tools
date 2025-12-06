/* cruddy-panel.js — UMD build for Carrd embed
 *
 * Admin interface for managing attendance records in D1 database
 * - View all records with filtering
 * - Add new records
 * - Edit existing records
 * - Delete records
 *
 * Exposes: `CruddyPanel.mount(selectorOrEl, { apiBase: 'https://your-worker.url' })`
 *
 * How to use on Carrd (Embed → Code):
 *
 * <div id="cruddy-root"></div>
 * <script src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/dist/cruddy-panel/cruddy-panel.js"></script>
 * <script>
 *   CruddyPanel.mount('#cruddy-root', { apiBase: 'https://api.itai.gg' });
 * </script>
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CruddyPanel = factory();
  }
})(this, function () {
  const CSS_ID = 'cruddy-panel-styles';

  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
    
    #cruddy-panel {
      font-family: 'Outfit', 'Segoe UI', sans-serif;
      max-width: 1000px;
      margin: 20px auto;
      padding: 25px;
      background: linear-gradient(135deg, rgba(20, 60, 60, 0.7) 0%, rgba(25, 50, 80, 0.7) 100%);
      backdrop-filter: blur(12px);
      border-radius: 16px;
      border: 1px solid rgba(94, 234, 212, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      color: #eee;
    }
    #cruddy-panel * { box-sizing: border-box; }
    #cruddy-panel h2 {
      margin: 0 0 20px 0;
      color: #5eead4;
      text-align: center;
      font-weight: 600;
    }
    
    /* Auth screens */
    #cruddy-panel .cp-auth-screen {
      text-align: center;
      padding: 60px 20px;
    }
    #cruddy-panel .cp-auth-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    #cruddy-panel .cp-auth-title {
      font-size: 24px;
      color: #5eead4;
      margin-bottom: 10px;
      font-weight: 600;
    }
    #cruddy-panel .cp-auth-message {
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 30px;
      line-height: 1.6;
    }
    #cruddy-panel .cp-discord-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      background: #5865F2;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(88, 101, 242, 0.3);
    }
    #cruddy-panel .cp-discord-btn:hover {
      background: #4752C4;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(88, 101, 242, 0.4);
    }
    #cruddy-panel .cp-unauthorized {
      background: linear-gradient(135deg, rgba(60, 30, 30, 0.7) 0%, rgba(40, 25, 50, 0.7) 100%);
    }
    #cruddy-panel .cp-unauthorized .cp-auth-icon {
      color: #ef4444;
    }
    #cruddy-panel .cp-user-info {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 15px;
      padding: 12px 16px;
      background: rgba(15, 40, 50, 0.5);
      border-radius: 10px;
      border: 1px solid rgba(94, 234, 212, 0.15);
    }
    #cruddy-panel .cp-user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid rgba(94, 234, 212, 0.3);
    }
    #cruddy-panel .cp-user-name {
      color: #eee;
      font-size: 14px;
      font-weight: 500;
    }
    #cruddy-panel .cp-logout-btn {
      padding: 6px 14px;
      background: rgba(94, 234, 212, 0.15);
      color: #5eead4;
      border: 1px solid rgba(94, 234, 212, 0.3);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    #cruddy-panel .cp-logout-btn:hover {
      background: rgba(94, 234, 212, 0.25);
    }
    #cruddy-panel .cp-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      border-bottom: 2px solid rgba(94, 234, 212, 0.15);
      padding-bottom: 12px;
      flex-wrap: wrap;
    }
    #cruddy-panel .cp-tab {
      padding: 10px 18px;
      background: rgba(15, 40, 50, 0.5);
      border: 1px solid rgba(94, 234, 212, 0.2);
      border-radius: 8px 8px 0 0;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
      font-family: inherit;
    }
    #cruddy-panel .cp-tab:hover {
      background: rgba(94, 234, 212, 0.1);
      color: #fff;
    }
    #cruddy-panel .cp-tab.active {
      background: linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%);
      color: #0f2935;
      border-color: transparent;
    }
    #cruddy-panel .cp-panel { display: none; }
    #cruddy-panel .cp-panel.active { display: block; }
    
    /* Filter/Search bar */
    #cruddy-panel .cp-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    #cruddy-panel .cp-filters input,
    #cruddy-panel .cp-filters select {
      padding: 10px 14px;
      border: 1px solid rgba(94, 234, 212, 0.3);
      border-radius: 8px;
      background: rgba(15, 40, 50, 0.6);
      color: #eee;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    #cruddy-panel .cp-filters input:focus,
    #cruddy-panel .cp-filters select:focus {
      outline: none;
      border-color: #5eead4;
      box-shadow: 0 0 0 3px rgba(94, 234, 212, 0.15);
    }
    #cruddy-panel .cp-filters input::placeholder { color: rgba(255, 255, 255, 0.4); }
    #cruddy-panel .cp-btn {
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      font-family: inherit;
      transition: all 0.3s;
    }
    #cruddy-panel .cp-btn-primary {
      background: linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%);
      color: #0f2935;
      box-shadow: 0 4px 15px rgba(94, 234, 212, 0.3);
    }
    #cruddy-panel .cp-btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(94, 234, 212, 0.4);
    }
    #cruddy-panel .cp-btn-danger {
      background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
      color: #fff;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
    }
    #cruddy-panel .cp-btn-danger:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }
    #cruddy-panel .cp-btn-secondary {
      background: rgba(94, 234, 212, 0.15);
      color: #5eead4;
      border: 1px solid rgba(94, 234, 212, 0.3);
    }
    #cruddy-panel .cp-btn-secondary:hover {
      background: rgba(94, 234, 212, 0.25);
    }
    #cruddy-panel .cp-btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    /* Table */
    #cruddy-panel .cp-table-wrap {
      overflow-x: auto;
      margin-bottom: 15px;
      border-radius: 10px;
      border: 1px solid rgba(94, 234, 212, 0.15);
    }
    #cruddy-panel table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    #cruddy-panel th, #cruddy-panel td {
      padding: 12px 14px;
      text-align: left;
      border-bottom: 1px solid rgba(94, 234, 212, 0.1);
    }
    #cruddy-panel th {
      background: rgba(15, 40, 50, 0.6);
      color: #5eead4;
      font-weight: 600;
    }
    #cruddy-panel tr:hover { background: rgba(94, 234, 212, 0.05); }
    #cruddy-panel .cp-actions {
      display: flex;
      gap: 6px;
    }

    /* Form */
    #cruddy-panel .cp-form {
      display: grid;
      gap: 15px;
      max-width: 500px;
    }
    #cruddy-panel .cp-form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    #cruddy-panel .cp-form-group label {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 500;
    }
    #cruddy-panel .cp-form-group input {
      padding: 12px 14px;
      border: 1px solid rgba(94, 234, 212, 0.3);
      border-radius: 8px;
      background: rgba(15, 40, 50, 0.6);
      color: #eee;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    #cruddy-panel .cp-form-group input:focus {
      outline: none;
      border-color: #5eead4;
      box-shadow: 0 0 0 3px rgba(94, 234, 212, 0.15);
    }

    /* Modal */
    #cruddy-panel .cp-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 20, 30, 0.8);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    #cruddy-panel .cp-modal {
      background: linear-gradient(135deg, rgba(20, 60, 60, 0.95) 0%, rgba(25, 50, 80, 0.95) 100%);
      backdrop-filter: blur(12px);
      padding: 25px;
      border-radius: 16px;
      min-width: 400px;
      max-width: 90%;
      border: 1px solid rgba(94, 234, 212, 0.2);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    }
    #cruddy-panel .cp-modal h3 {
      margin: 0 0 20px 0;
      color: #5eead4;
      font-weight: 600;
    }
    #cruddy-panel .cp-modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      justify-content: flex-end;
    }

    /* Status messages */
    #cruddy-panel .cp-status {
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 15px;
      font-size: 14px;
      font-weight: 500;
    }
    #cruddy-panel .cp-status.success {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    #cruddy-panel .cp-status.error {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    #cruddy-panel .cp-status.info {
      background: rgba(94, 234, 212, 0.15);
      color: #5eead4;
      border: 1px solid rgba(94, 234, 212, 0.3);
    }

    /* Loading */
    #cruddy-panel .cp-loading {
      text-align: center;
      padding: 40px;
      color: rgba(255, 255, 255, 0.5);
    }
    #cruddy-panel .cp-empty {
      text-align: center;
      padding: 40px;
      color: rgba(255, 255, 255, 0.5);
    }

    /* Pagination */
    #cruddy-panel .cp-pagination {
      display: flex;
      gap: 8px;
      justify-content: center;
      align-items: center;
      margin-top: 15px;
    }
    #cruddy-panel .cp-pagination span {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      margin: 0 10px;
    }

    /* Event Groups */
    #cruddy-panel .cp-event-group {
      background: rgba(15, 40, 50, 0.5);
      border-radius: 12px;
      margin-bottom: 12px;
      overflow: hidden;
      border: 1px solid rgba(94, 234, 212, 0.15);
    }
    #cruddy-panel .cp-event-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 18px;
      background: rgba(94, 234, 212, 0.08);
      cursor: pointer;
      transition: background 0.2s;
    }
    #cruddy-panel .cp-event-header:hover {
      background: rgba(94, 234, 212, 0.12);
    }
    #cruddy-panel .cp-event-title {
      font-size: 16px;
      font-weight: 600;
      color: #5eead4;
    }
    #cruddy-panel .cp-event-meta {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    #cruddy-panel .cp-event-date {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
    }
    #cruddy-panel .cp-event-count {
      background: linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%);
      color: #0f2935;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    #cruddy-panel .cp-btn-copy {
      background: rgba(88, 101, 242, 0.2);
      color: #818cf8;
      border: 1px solid rgba(88, 101, 242, 0.3);
    }
    #cruddy-panel .cp-btn-copy:hover {
      background: rgba(88, 101, 242, 0.3);
    }
    #cruddy-panel .cp-event-toggle {
      color: rgba(255, 255, 255, 0.5);
      font-size: 18px;
      transition: transform 0.3s;
    }
    #cruddy-panel .cp-event-group.expanded .cp-event-toggle {
      transform: rotate(180deg);
    }
    #cruddy-panel .cp-event-body {
      display: none;
      padding: 15px 18px;
      border-top: 1px solid rgba(94, 234, 212, 0.1);
    }
    #cruddy-panel .cp-event-group.expanded .cp-event-body {
      display: block;
    }
    #cruddy-panel .cp-attendee-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    #cruddy-panel .cp-attendee {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(15, 40, 50, 0.6);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      border: 1px solid rgba(94, 234, 212, 0.1);
    }
    #cruddy-panel .cp-attendee-name {
      color: #eee;
    }
    #cruddy-panel .cp-attendee-actions {
      display: flex;
      gap: 4px;
    }
    #cruddy-panel .cp-attendee-actions button {
      padding: 3px 8px;
      font-size: 10px;
    }

    /* Leaderboard */
    #cruddy-panel .cp-leaderboard-controls {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: flex-end;
    }
    #cruddy-panel .cp-control-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    #cruddy-panel .cp-control-group label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
    }
    #cruddy-panel .cp-control-group select,
    #cruddy-panel .cp-control-group input {
      padding: 10px 14px;
      border: 1px solid rgba(94, 234, 212, 0.3);
      border-radius: 8px;
      background: rgba(15, 40, 50, 0.6);
      color: #eee;
      font-size: 14px;
      font-family: inherit;
    }
    #cruddy-panel .cp-leaderboard {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    #cruddy-panel .cp-leader-row {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 14px 18px;
      background: rgba(15, 40, 50, 0.5);
      border-radius: 12px;
      border: 1px solid rgba(94, 234, 212, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    #cruddy-panel .cp-leader-row:hover {
      background: rgba(94, 234, 212, 0.1);
      transform: translateX(6px);
      border-color: rgba(94, 234, 212, 0.25);
    }
    #cruddy-panel .cp-leader-rank {
      font-size: 20px;
      font-weight: 700;
      width: 40px;
      text-align: center;
    }
    #cruddy-panel .cp-leader-row:nth-child(1) .cp-leader-rank { color: #ffd700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
    #cruddy-panel .cp-leader-row:nth-child(2) .cp-leader-rank { color: #e0e0e0; text-shadow: 0 0 10px rgba(224, 224, 224, 0.4); }
    #cruddy-panel .cp-leader-row:nth-child(3) .cp-leader-rank { color: #cd7f32; text-shadow: 0 0 10px rgba(205, 127, 50, 0.4); }
    #cruddy-panel .cp-leader-row:nth-child(n+4) .cp-leader-rank { color: rgba(255, 255, 255, 0.4); }
    #cruddy-panel .cp-leader-name {
      flex: 1;
      font-size: 16px;
      color: #eee;
      font-weight: 500;
    }
    #cruddy-panel .cp-leader-count {
      font-size: 18px;
      font-weight: 700;
      color: #5eead4;
    }
    #cruddy-panel .cp-leader-bar {
      flex: 0 0 200px;
      height: 8px;
      background: rgba(15, 40, 50, 0.6);
      border-radius: 4px;
      overflow: hidden;
    }
    #cruddy-panel .cp-leader-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #2dd4bf, #5eead4);
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    #cruddy-panel .cp-leaderboard-summary {
      margin-top: 20px;
      padding: 18px;
      background: rgba(15, 40, 50, 0.5);
      border-radius: 12px;
      border: 1px solid rgba(94, 234, 212, 0.15);
      display: flex;
      gap: 40px;
      flex-wrap: wrap;
    }
    #cruddy-panel .cp-stat {
      text-align: center;
    }
    #cruddy-panel .cp-stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #5eead4;
    }
    #cruddy-panel .cp-stat-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `;

  const HTML = `
    <div id="cruddy-panel">
      <h2>📋 CruDDy Manager</h2>
      
      <div class="cp-tabs">
        <button class="cp-tab active" data-tab="view">View Records</button>
        <button class="cp-tab" data-tab="events">View by Event</button>
        <button class="cp-tab" data-tab="leaderboard">🏆 Leaderboard</button>
        <button class="cp-tab" data-tab="add">Add Record</button>
      </div>

      <div id="cp-status"></div>

      <!-- View Records Panel -->
      <div class="cp-panel active" data-panel="view">
        <div class="cp-filters">
          <input type="text" id="cp-filter-name" placeholder="Filter by name...">
          <input type="text" id="cp-filter-event" placeholder="Filter by event...">
          <input type="date" id="cp-filter-start" title="Start date">
          <input type="date" id="cp-filter-end" title="End date">
          <button class="cp-btn cp-btn-primary" id="cp-search-btn">Search</button>
          <button class="cp-btn cp-btn-secondary" id="cp-clear-btn">Clear</button>
        </div>
        <div class="cp-table-wrap">
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
            <tbody id="cp-records-body">
              <tr><td colspan="5" class="cp-loading">Loading records...</td></tr>
            </tbody>
          </table>
        </div>
        <div class="cp-pagination" id="cp-pagination"></div>
      </div>

      <!-- View by Event Panel -->
      <div class="cp-panel" data-panel="events">
        <div class="cp-filters">
          <input type="text" id="cp-event-filter-event" placeholder="Filter by event name...">
          <input type="date" id="cp-event-filter-start" title="Start date">
          <input type="date" id="cp-event-filter-end" title="End date">
          <button class="cp-btn cp-btn-primary" id="cp-event-search-btn">Search</button>
          <button class="cp-btn cp-btn-secondary" id="cp-event-clear-btn">Clear</button>
        </div>
        <div id="cp-event-groups">
          <div class="cp-loading">Loading events...</div>
        </div>
        <div class="cp-pagination" id="cp-event-pagination"></div>
      </div>

      <!-- Leaderboard Panel -->
      <div class="cp-panel" data-panel="leaderboard">
        <div class="cp-leaderboard-controls">
          <div class="cp-control-group">
            <label>Show Top</label>
            <select id="cp-leader-top">
              <option value="5">Top 5</option>
              <option value="10" selected>Top 10</option>
              <option value="25">Top 25</option>
              <option value="50">Top 50</option>
              <option value="100">Top 100</option>
            </select>
          </div>
          <div class="cp-control-group">
            <label>From Date</label>
            <input type="date" id="cp-leader-start">
          </div>
          <div class="cp-control-group">
            <label>To Date</label>
            <input type="date" id="cp-leader-end">
          </div>
          <button class="cp-btn cp-btn-primary" id="cp-leader-refresh">Refresh</button>
          <button class="cp-btn cp-btn-secondary" id="cp-leader-clear">All Time</button>
        </div>
        <div id="cp-leaderboard">
          <div class="cp-loading">Loading leaderboard...</div>
        </div>
        <div class="cp-leaderboard-summary" id="cp-leader-summary" style="display:none;">
          <div class="cp-stat">
            <div class="cp-stat-value" id="cp-stat-total">-</div>
            <div class="cp-stat-label">Total Events</div>
          </div>
          <div class="cp-stat">
            <div class="cp-stat-value" id="cp-stat-participants">-</div>
            <div class="cp-stat-label">Unique Participants</div>
          </div>
          <div class="cp-stat">
            <div class="cp-stat-value" id="cp-stat-avg">-</div>
            <div class="cp-stat-label">Avg per Person</div>
          </div>
        </div>
      </div>

      <!-- Add Record Panel -->
      <div class="cp-panel" data-panel="add">
        <div class="cp-form">
          <div class="cp-form-group">
            <label>Player Name</label>
            <input type="text" id="cp-add-name" placeholder="e.g. y u m e">
          </div>
          <div class="cp-form-group">
            <label>Event Name</label>
            <input type="text" id="cp-add-event" placeholder="e.g. Wildy Wednesday">
          </div>
          <div class="cp-form-group">
            <label>Date</label>
            <input type="date" id="cp-add-date">
          </div>
          <button class="cp-btn cp-btn-primary" id="cp-add-btn">Add Record</button>
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
    const container = rootEl.querySelector('#cp-event-groups');
    const paginationEl = rootEl.querySelector('#cp-event-pagination');

    if (allEventGroups.length === 0) {
      container.innerHTML = '<div class="cp-empty">No events found</div>';
      paginationEl.innerHTML = '';
      return;
    }

    // Paginate the groups
    const totalPages = Math.ceil(allEventGroups.length / eventPageSize);
    const startIdx = (eventCurrentPage - 1) * eventPageSize;
    const endIdx = startIdx + eventPageSize;
    eventGroups = allEventGroups.slice(startIdx, endIdx);

    container.innerHTML = eventGroups.map((group, idx) => `
      <div class="cp-event-group" data-idx="${startIdx + idx}">
        <div class="cp-event-header">
          <div>
            <div class="cp-event-title">${escapeHtml(group.event)}</div>
          </div>
          <div class="cp-event-meta">
            <span class="cp-event-date">${group.date}</span>
            <span class="cp-event-count">${group.attendees.length} attendee${group.attendees.length !== 1 ? 's' : ''}</span>
            <button class="cp-btn cp-btn-copy cp-btn-sm cp-event-copy" title="Copy ingots command">📋</button>
            <button class="cp-btn cp-btn-danger cp-btn-sm cp-event-delete" title="Delete entire event">🗑</button>
            <span class="cp-event-toggle">▼</span>
          </div>
        </div>
        <div class="cp-event-body">
          <div class="cp-attendee-list">
            ${group.attendees.map(a => `
              <div class="cp-attendee" data-id="${a.id}">
                <span class="cp-attendee-name">${escapeHtml(a.name)}</span>
                <div class="cp-attendee-actions">
                  <button class="cp-btn cp-btn-secondary cp-btn-sm cp-attendee-edit">✎</button>
                  <button class="cp-btn cp-btn-danger cp-btn-sm cp-attendee-delete">✕</button>
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
        <button class="cp-btn cp-btn-secondary cp-btn-sm" id="cp-event-prev" ${eventCurrentPage === 1 ? 'disabled' : ''}>← Prev</button>
        <span>Page ${eventCurrentPage} of ${totalPages} (${allEventGroups.length} events)</span>
        <button class="cp-btn cp-btn-secondary cp-btn-sm" id="cp-event-next" ${eventCurrentPage === totalPages ? 'disabled' : ''}>Next →</button>
      `;
    } else {
      paginationEl.innerHTML = allEventGroups.length > 0 ? `<span>${allEventGroups.length} event${allEventGroups.length !== 1 ? 's' : ''}</span>` : '';
    }
  }

  async function loadEventGroups(rootEl) {
    const container = rootEl.querySelector('#cp-event-groups');
    container.innerHTML = '<div class="cp-loading">Loading events...</div>';

    const filters = {
      event: rootEl.querySelector('#cp-event-filter-event').value.trim(),
      start: rootEl.querySelector('#cp-event-filter-start').value,
      end: rootEl.querySelector('#cp-event-filter-end').value
    };

    try {
      const data = await fetchAllRecords(filters);
      allEventGroups = groupRecordsByEvent(data.results || []);
      renderEventGroups(rootEl);
    } catch (err) {
      container.innerHTML = `<div class="cp-empty">Error loading events: ${err.message}</div>`;
    }
  }

  function renderLeaderboard(rootEl) {
    const container = rootEl.querySelector('#cp-leaderboard');
    const summaryEl = rootEl.querySelector('#cp-leader-summary');

    if (leaderboardData.length === 0) {
      container.innerHTML = '<div class="cp-empty">No attendance data found</div>';
      summaryEl.style.display = 'none';
      return;
    }

    const maxCount = leaderboardData[0]?.count || 1;
    const totalEvents = leaderboardData.reduce((sum, p) => sum + p.count, 0);
    const avgPerPerson = (totalEvents / leaderboardData.length).toFixed(1);

    container.innerHTML = leaderboardData.map((p, idx) => `
      <div class="cp-leader-row">
        <div class="cp-leader-rank">#${idx + 1}</div>
        <div class="cp-leader-name">${escapeHtml(p.name)}</div>
        <div class="cp-leader-bar">
          <div class="cp-leader-bar-fill" style="width: ${(p.count / maxCount) * 100}%"></div>
        </div>
        <div class="cp-leader-count">${p.count}</div>
      </div>
    `).join('');

    // Update summary stats
    rootEl.querySelector('#cp-stat-total').textContent = totalEvents;
    rootEl.querySelector('#cp-stat-participants').textContent = leaderboardData.length;
    rootEl.querySelector('#cp-stat-avg').textContent = avgPerPerson;
    summaryEl.style.display = 'flex';
  }

  async function loadLeaderboard(rootEl) {
    const container = rootEl.querySelector('#cp-leaderboard');
    container.innerHTML = '<div class="cp-loading">Loading leaderboard...</div>';

    const top = parseInt(rootEl.querySelector('#cp-leader-top').value) || 10;
    const start = rootEl.querySelector('#cp-leader-start').value;
    const end = rootEl.querySelector('#cp-leader-end').value;

    try {
      const data = await fetchLeaderboard(top, start, end);
      leaderboardData = data.results || [];
      renderLeaderboard(rootEl);
    } catch (err) {
      container.innerHTML = `<div class="cp-empty">Error loading leaderboard: ${err.message}</div>`;
      rootEl.querySelector('#cp-leader-summary').style.display = 'none';
    }
  }

  // UI helpers
  function showStatus(rootEl, message, type = 'info') {
    const statusEl = rootEl.querySelector('#cp-status');
    statusEl.className = `cp-status ${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
  }

  function renderRecords(rootEl, data) {
    const tbody = rootEl.querySelector('#cp-records-body');
    records = data.results || [];

    if (records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="cp-empty">No records found</td></tr>';
      return;
    }

    tbody.innerHTML = records.map(r => `
      <tr data-id="${r.id}">
        <td>${r.id}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.event)}</td>
        <td>${r.date}</td>
        <td class="cp-actions">
          <button class="cp-btn cp-btn-secondary cp-btn-sm cp-edit-btn">Edit</button>
          <button class="cp-btn cp-btn-danger cp-btn-sm cp-delete-btn">Delete</button>
        </td>
      </tr>
    `).join('');

    // Pagination
    const paginationEl = rootEl.querySelector('#cp-pagination');
    const total = data.total || records.length;
    const totalPages = Math.ceil(total / pageSize);
    
    if (totalPages > 1) {
      paginationEl.innerHTML = `
        <button class="cp-btn cp-btn-secondary cp-btn-sm" id="cp-prev" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button class="cp-btn cp-btn-secondary cp-btn-sm" id="cp-next" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>
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
    overlay.className = 'cp-modal-overlay';
    overlay.innerHTML = `
      <div class="cp-modal">
        <h3>Edit Record #${record.id}</h3>
        <div class="cp-form">
          <div class="cp-form-group">
            <label>Player Name</label>
            <input type="text" id="cp-edit-name" value="${escapeHtml(record.name)}">
          </div>
          <div class="cp-form-group">
            <label>Event Name</label>
            <input type="text" id="cp-edit-event" value="${escapeHtml(record.event)}">
          </div>
          <div class="cp-form-group">
            <label>Date</label>
            <input type="date" id="cp-edit-date" value="${record.date}">
          </div>
        </div>
        <div class="cp-modal-actions">
          <button class="cp-btn cp-btn-secondary" id="cp-edit-cancel">Cancel</button>
          <button class="cp-btn cp-btn-primary" id="cp-edit-save">Save Changes</button>
        </div>
      </div>
    `;

    rootEl.appendChild(overlay);

    overlay.querySelector('#cp-edit-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#cp-edit-save').onclick = async () => {
      const name = overlay.querySelector('#cp-edit-name').value.trim();
      const event = overlay.querySelector('#cp-edit-event').value.trim();
      const date = overlay.querySelector('#cp-edit-date').value;

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
    const tbody = rootEl.querySelector('#cp-records-body');
    tbody.innerHTML = '<tr><td colspan="5" class="cp-loading">Loading records...</td></tr>';

    const filters = {
      name: rootEl.querySelector('#cp-filter-name').value.trim(),
      event: rootEl.querySelector('#cp-filter-event').value.trim(),
      start: rootEl.querySelector('#cp-filter-start').value,
      end: rootEl.querySelector('#cp-filter-end').value
    };

    try {
      const data = await fetchRecords(filters);
      renderRecords(rootEl, data);
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="cp-empty">Error loading records: ${err.message}</td></tr>`;
    }
  }

  function wire(rootEl, config) {
    apiBase = config.apiBase || '';

    // Tab switching
    const tabs = rootEl.querySelectorAll('.cp-tab');
    const panels = rootEl.querySelectorAll('.cp-panel');
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
    rootEl.querySelector('#cp-search-btn').onclick = () => {
      currentPage = 1;
      loadRecords(rootEl);
    };
    rootEl.querySelector('#cp-clear-btn').onclick = () => {
      rootEl.querySelector('#cp-filter-name').value = '';
      rootEl.querySelector('#cp-filter-event').value = '';
      rootEl.querySelector('#cp-filter-start').value = '';
      rootEl.querySelector('#cp-filter-end').value = '';
      currentPage = 1;
      loadRecords(rootEl);
    };

    // Add record
    rootEl.querySelector('#cp-add-date').valueAsDate = new Date();
    rootEl.querySelector('#cp-add-btn').onclick = async () => {
      const name = rootEl.querySelector('#cp-add-name').value.trim();
      const event = rootEl.querySelector('#cp-add-event').value.trim();
      const date = rootEl.querySelector('#cp-add-date').value;

      if (!name || !event || !date) {
        showStatus(rootEl, 'All fields are required', 'error');
        return;
      }

      try {
        await addRecord(name, event, date);
        showStatus(rootEl, 'Record added successfully!', 'success');
        rootEl.querySelector('#cp-add-name').value = '';
        rootEl.querySelector('#cp-add-event').value = '';
        // Switch to view tab and refresh
        tabs[0].click();
        loadRecords(rootEl);
      } catch (err) {
        showStatus(rootEl, 'Failed to add record: ' + err.message, 'error');
      }
    };

    // Table row actions (edit/delete) - event delegation
    rootEl.querySelector('#cp-records-body').onclick = async (e) => {
      const row = e.target.closest('tr');
      if (!row) return;
      const id = parseInt(row.dataset.id);
      const record = records.find(r => r.id === id);
      if (!record) return;

      if (e.target.classList.contains('cp-edit-btn')) {
        showEditModal(rootEl, record);
      } else if (e.target.classList.contains('cp-delete-btn')) {
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
    rootEl.querySelector('#cp-pagination').onclick = (e) => {
      if (e.target.id === 'cp-prev' && currentPage > 1) {
        currentPage--;
        loadRecords(rootEl);
      } else if (e.target.id === 'cp-next') {
        currentPage++;
        loadRecords(rootEl);
      }
    };

    // Event groups - search/filter
    rootEl.querySelector('#cp-event-search-btn').onclick = () => {
      eventCurrentPage = 1;
      loadEventGroups(rootEl);
    };
    rootEl.querySelector('#cp-event-clear-btn').onclick = () => {
      rootEl.querySelector('#cp-event-filter-event').value = '';
      rootEl.querySelector('#cp-event-filter-start').value = '';
      rootEl.querySelector('#cp-event-filter-end').value = '';
      eventCurrentPage = 1;
      loadEventGroups(rootEl);
    };

    // Event groups - pagination
    rootEl.querySelector('#cp-event-pagination').onclick = (e) => {
      const totalPages = Math.ceil(allEventGroups.length / eventPageSize);
      if (e.target.id === 'cp-event-prev' && eventCurrentPage > 1) {
        eventCurrentPage--;
        renderEventGroups(rootEl);
      } else if (e.target.id === 'cp-event-next' && eventCurrentPage < totalPages) {
        eventCurrentPage++;
        renderEventGroups(rootEl);
      }
    };

    // Leaderboard controls
    rootEl.querySelector('#cp-leader-refresh').onclick = () => loadLeaderboard(rootEl);
    rootEl.querySelector('#cp-leader-clear').onclick = () => {
      rootEl.querySelector('#cp-leader-start').value = '';
      rootEl.querySelector('#cp-leader-end').value = '';
      loadLeaderboard(rootEl);
    };
    rootEl.querySelector('#cp-leader-top').onchange = () => loadLeaderboard(rootEl);

    // Event groups - expand/collapse and actions
    rootEl.querySelector('#cp-event-groups').onclick = async (e) => {
      const groupEl = e.target.closest('.cp-event-group');
      if (!groupEl) return;
      
      const groupIdx = parseInt(groupEl.dataset.idx);
      const group = allEventGroups[groupIdx];
      if (!group) return;

      // Copy ingots command
      if (e.target.classList.contains('cp-event-copy')) {
        const players = group.attendees.map(a => a.name).join(', ');
        const command = `/add_remove_ingots players:${players} ingots: 10,000 reason: clan event - ${group.event}`;
        try {
          await navigator.clipboard.writeText(command);
          showStatus(rootEl, 'Ingots command copied to clipboard!', 'success');
        } catch (err) {
          showStatus(rootEl, 'Failed to copy to clipboard', 'error');
        }
        return;
      }

      // Delete entire event
      if (e.target.classList.contains('cp-event-delete')) {
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
      const header = e.target.closest('.cp-event-header');
      if (header && !e.target.closest('button')) {
        header.closest('.cp-event-group').classList.toggle('expanded');
        return;
      }

      // Attendee actions
      const attendeeEl = e.target.closest('.cp-attendee');
      if (!attendeeEl) return;

      const id = parseInt(attendeeEl.dataset.id);
      const attendee = group.attendees.find(a => a.id === id);
      if (!attendee) return;

      if (e.target.classList.contains('cp-attendee-edit')) {
        // Edit - show modal with pre-filled event/date from group
        const record = { id, name: attendee.name, event: group.event, date: group.date };
        showEditModal(rootEl, record, () => loadEventGroups(rootEl));
      } else if (e.target.classList.contains('cp-attendee-delete')) {
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
    <div id="cruddy-panel">
      <div class="cp-auth-screen">
        <div class="cp-auth-icon">🔐</div>
        <div class="cp-auth-title">Authentication Required</div>
        <p class="cp-auth-message">Sign in with Discord to access the CruDDy Manager.</p>
        <a class="cp-discord-btn" id="cp-login-btn">
          <svg width="24" height="24" viewBox="0 0 71 55" fill="currentColor">
            <path d="M60.1 4.9A58.5 58.5 0 0045.4.4a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.5a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.5.2.2 0 00-.1.1A60 60 0 00.4 44.4a.2.2 0 000 .2 58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.3 36.3 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.2.1 58.5 58.5 0 0017.8-9 .2.2 0 000-.2c1.5-15.3-2.4-28.6-10.3-40.4a.2.2 0 00-.1-.1zM23.7 36.4c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.1-6.4 7.1zm23.6 0c-3.5 0-6.4-3.2-6.4-7.1s2.9-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 3.9-2.8 7.1-6.4 7.1z"/>
          </svg>
          Sign in with Discord
        </a>
      </div>
    </div>
  `;

  const UNAUTHORIZED_HTML = (username, avatar) => `
    <div id="cruddy-panel" class="cp-unauthorized">
      <div class="cp-auth-screen">
        <div class="cp-auth-icon">🚫</div>
        <div class="cp-auth-title">Access Denied</div>
        <p class="cp-auth-message">
          Sorry <strong>${username}</strong>, you are not authorized to access this page.<br>
          Contact an administrator if you believe this is a mistake.
        </p>
        <a class="cp-discord-btn" id="cp-logout-btn" style="background: #555;">
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
      <div id="cruddy-panel">
        <div class="cp-auth-screen">
          <div class="cp-auth-icon">⏳</div>
          <div class="cp-auth-title">Loading...</div>
        </div>
      </div>
    `;

    // Check authentication
    const auth = await checkAuth(apiBase);

    if (!auth.authenticated) {
      // Show login screen
      host.innerHTML = LOGIN_HTML;
      host.querySelector('#cp-login-btn').onclick = () => {
        window.location.href = `${apiBase}/auth/login`;
      };
      return;
    }

    if (!auth.authorized) {
      // Show unauthorized screen
      host.innerHTML = UNAUTHORIZED_HTML(auth.user.username, auth.user.avatar);
      host.querySelector('#cp-logout-btn').onclick = () => {
        window.location.href = `${apiBase}/auth/logout`;
      };
      return;
    }

    // User is authenticated and authorized - show the full interface
    host.innerHTML = HTML;
    
    // Add user info bar at the top
    const container = host.querySelector('#cruddy-panel');
    const userInfoHtml = `
      <div class="cp-user-info">
        ${auth.user.avatar ? `<img class="cp-user-avatar" src="https://cdn.discordapp.com/avatars/${auth.user.id}/${auth.user.avatar}.png" alt="">` : ''}
        <span class="cp-user-name">${auth.user.username}</span>
        <button class="cp-logout-btn" id="cp-logout-btn">Logout</button>
      </div>
    `;
    container.insertAdjacentHTML('afterbegin', userInfoHtml);

    // Wire up logout
    host.querySelector('#cp-logout-btn').onclick = () => {
      window.location.href = `${apiBase}/auth/logout`;
    };

    wire(container, config);
  }

  return { mount };
});

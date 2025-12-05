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
  `;

  const HTML = `
    <div id="history-interface">
      <h2>📋 Attendance Manager</h2>
      
      <div class="hi-tabs">
        <button class="hi-tab active" data-tab="view">View Records</button>
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
  let currentPage = 1;
  const pageSize = 20;

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

  function showEditModal(rootEl, record) {
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
        loadRecords(rootEl);
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

    // Initial load
    loadRecords(rootEl);
  }

  function mount(selectorOrEl, config = {}) {
    const host = (typeof selectorOrEl === 'string') ? document.querySelector(selectorOrEl) : selectorOrEl;
    if (!host) return;
    injectStyles(document);
    host.innerHTML = HTML;
    wire(host, config);
  }

  return { mount };
});

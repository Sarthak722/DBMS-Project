/**
 * Venues & Rooms Module
 * Clean, plain, working CRUD tables for:
 * - Escape Rooms
 * - Branches & Venues
 * - Staff Members & Game Masters
 * - Puzzle Clues
 */

const Part1Venues = {
  currentSubTab: 'rooms',
  cachedBranches: [],
  cachedRooms: [],
  cachedStaff: [],
  cachedClues: [],

  async init() {
    this.bindEvents();
    await this.loadAll();
  },

  bindEvents() {
    document.querySelectorAll('[data-subtab-part1]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-subtab-part1]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentSubTab = e.currentTarget.dataset.subtabPart1;
        this.renderCurrentSubTab();
      });
    });
  },

  async loadAll() {
    try {
      this.cachedBranches = await api.part1.getBranches();
      this.cachedRooms = await api.part1.getRooms();
      this.renderCurrentSubTab();
    } catch (err) {
      console.warn('Venues load error:', err);
    }
  },

  renderCurrentSubTab() {
    const container = document.getElementById('part1-content-area');
    if (!container) return;

    if (this.currentSubTab === 'rooms') {
      this.renderRooms(container);
    } else if (this.currentSubTab === 'branches') {
      this.renderBranches(container);
    } else if (this.currentSubTab === 'staff') {
      this.renderStaff(container);
    } else if (this.currentSubTab === 'clues') {
      this.renderClues(container);
    }
  },

  // =========================================================================
  // 1. ESCAPE ROOMS TABLE
  // =========================================================================
  async renderRooms(container) {
    container.innerHTML = '<div class="table-card"><div style="text-align:center; padding:2rem;"><span class="pulse-dot"></span> Loading Rooms...</div></div>';
    try {
      const rooms = await api.part1.getRooms();
      this.cachedRooms = rooms || [];
      App.updateToolbarCount(this.cachedRooms.length);

      if (!rooms || rooms.length === 0) {
        container.innerHTML = `
          <div class="table-card" style="padding:2.5rem; text-align:center; color:var(--text-muted);">
            No escape rooms found. Click <strong>(+)</strong> above to create one.
          </div>
        `;
        return;
      }

      let html = `
        <div class="table-card">
          <div class="table-responsive">
            <table class="crud-table" id="table-rooms">
              <thead>
                <tr>
                  <th class="col-checkbox"><input type="checkbox" class="table-checkbox" onclick="App.toggleAllCheckboxes(this)"></th>
                  <th class="sortable">Room ID <span class="th-arrow">▾</span></th>
                  <th class="sortable">Theme Name <span class="th-arrow">▾</span></th>
                  <th class="sortable">Branch / Venue <span class="th-arrow">▾</span></th>
                  <th class="sortable">Difficulty <span class="th-arrow">▾</span></th>
                  <th class="sortable">Capacity <span class="th-arrow">▾</span></th>
                  <th class="sortable">Base Price <span class="th-arrow">▾</span></th>
                  <th class="sortable">Duration <span class="th-arrow">▾</span></th>
                  <th class="sortable">Status <span class="th-arrow">▾</span></th>
                  <th class="sortable">Clues <span class="th-arrow">▾</span></th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      rooms.forEach(r => {
        html += `
          <tr data-searchable="${r.roomId} ${r.themeName} ${r.branchName || ''} ${r.difficulty} ${r.status}">
            <td class="col-checkbox"><input type="checkbox" class="table-checkbox"></td>
            <td><strong class="record-id">RM-${String(r.roomId).padStart(3, '0')}</strong></td>
            <td><strong>${r.themeName}</strong></td>
            <td>📍 ${r.branchName || 'Branch #' + r.branchId}</td>
            <td><span class="badge badge-gray">${r.difficulty}</span></td>
            <td>${r.capacity} players</td>
            <td><strong>$${parseFloat(r.basePrice).toFixed(2)}</strong></td>
            <td>${r.duration} mins</td>
            <td><span class="badge badge-gray">${r.status}</span></td>
            <td>${r.clueCount || 0} clues</td>
            <td class="col-actions">
              <button class="btn-kebab" onclick="App.toggleKebabMenu(event, 'kebab-room-${r.roomId}')">⋮</button>
              <div class="kebab-menu" id="kebab-room-${r.roomId}">
                <button class="kebab-item" onclick="Part1Venues.promptStatusChange(${r.roomId}, '${r.status}')">
                  ✏️ Change Status
                </button>
                <button class="kebab-item item-danger" onclick="Part1Venues.deleteRoom(${r.roomId})">
                  🗑️ Delete Room
                </button>
              </div>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table></div></div>`;
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="table-card" style="padding:2rem; color:var(--color-red);">Error: ${err.message}</div>`;
    }
  },

  async promptStatusChange(roomId, currentStatus) {
    App.closeAllKebabMenus();
    const newStatus = prompt(`Change status for Room #${roomId} (Available / Occupied / Maintenance / Inactive):`, currentStatus);
    if (!newStatus || newStatus === currentStatus) return;

    try {
      await api.part1.updateRoomStatus(roomId, newStatus);
      App.toast(`Room status updated to ${newStatus}`, 'success');
      this.renderRooms(document.getElementById('part1-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Update failed: ' + err.message, 'error');
    }
  },

  async deleteRoom(roomId) {
    App.closeAllKebabMenus();
    if (!confirm(`Delete Room #${roomId}?`)) return;

    try {
      await api.part1.deleteRoom(roomId);
      App.toast('Room deleted', 'success');
      this.renderRooms(document.getElementById('part1-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Delete error: ' + err.message, 'error');
    }
  },

  // =========================================================================
  // 2. PHYSICAL BRANCHES TABLE
  // =========================================================================
  async renderBranches(container) {
    container.innerHTML = '<div class="table-card"><div style="text-align:center; padding:2rem;"><span class="pulse-dot"></span> Loading Branches...</div></div>';
    try {
      const branches = await api.part1.getBranches();
      this.cachedBranches = branches || [];
      App.updateToolbarCount(this.cachedBranches.length);

      if (!branches || branches.length === 0) {
        container.innerHTML = `<div class="table-card" style="padding:2.5rem; text-align:center;">No branches registered. Click (+) to add one.</div>`;
        return;
      }

      let html = `
        <div class="table-card">
          <div class="table-responsive">
            <table class="crud-table" id="table-branches">
              <thead>
                <tr>
                  <th class="col-checkbox"><input type="checkbox" class="table-checkbox" onclick="App.toggleAllCheckboxes(this)"></th>
                  <th class="sortable">Branch ID <span class="th-arrow">▾</span></th>
                  <th class="sortable">Venue Name <span class="th-arrow">▾</span></th>
                  <th class="sortable">City &amp; State <span class="th-arrow">▾</span></th>
                  <th class="sortable">Street Address <span class="th-arrow">▾</span></th>
                  <th class="sortable">ZIP Code <span class="th-arrow">▾</span></th>
                  <th class="sortable">Phone <span class="th-arrow">▾</span></th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      branches.forEach(b => {
        html += `
          <tr data-searchable="${b.branchId} ${b.name} ${b.city} ${b.state} ${b.zip} ${b.phone}">
            <td class="col-checkbox"><input type="checkbox" class="table-checkbox"></td>
            <td><strong class="record-id">BR-${String(b.branchId).padStart(3, '0')}</strong></td>
            <td><strong>${b.name}</strong></td>
            <td>${b.city}, ${b.state}</td>
            <td>${b.street}</td>
            <td><code>${b.zip}</code></td>
            <td><a href="tel:${b.phone}" style="color:var(--text-dark); font-weight:600; text-decoration:none;">${b.phone}</a></td>
            <td class="col-actions">
              <button class="btn-kebab" onclick="App.toggleKebabMenu(event, 'kebab-branch-${b.branchId}')">⋮</button>
              <div class="kebab-menu" id="kebab-branch-${b.branchId}">
                <button class="kebab-item item-danger" onclick="Part1Venues.deleteBranch(${b.branchId})">
                  🗑️ Delete Branch
                </button>
              </div>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table></div></div>`;
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="table-card" style="padding:2rem; color:var(--color-red);">Error: ${err.message}</div>`;
    }
  },

  async deleteBranch(branchId) {
    App.closeAllKebabMenus();
    if (!confirm(`Delete Branch #${branchId}?`)) return;

    try {
      await api.part1.deleteBranch(branchId);
      App.toast('Branch deleted', 'success');
      this.renderBranches(document.getElementById('part1-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Delete error: ' + err.message, 'error');
    }
  },

  // =========================================================================
  // 3. STAFF MEMBERS TABLE
  // =========================================================================
  async renderStaff(container) {
    container.innerHTML = '<div class="table-card"><div style="text-align:center; padding:2rem;"><span class="pulse-dot"></span> Loading Staff...</div></div>';
    try {
      const staffList = await api.part1.getStaff();
      this.cachedStaff = staffList || [];
      App.updateToolbarCount(this.cachedStaff.length);

      if (!staffList || staffList.length === 0) {
        container.innerHTML = `<div class="table-card" style="padding:2.5rem; text-align:center;">No staff members found. Click (+) to register staff.</div>`;
        return;
      }

      let html = `
        <div class="table-card">
          <div class="table-responsive">
            <table class="crud-table" id="table-staff">
              <thead>
                <tr>
                  <th class="col-checkbox"><input type="checkbox" class="table-checkbox" onclick="App.toggleAllCheckboxes(this)"></th>
                  <th class="sortable">Staff ID <span class="th-arrow">▾</span></th>
                  <th class="sortable">Full Name <span class="th-arrow">▾</span></th>
                  <th class="sortable">Role <span class="th-arrow">▾</span></th>
                  <th class="sortable">Branch <span class="th-arrow">▾</span></th>
                  <th class="sortable">Pay Schedule <span class="th-arrow">▾</span></th>
                  <th class="sortable">Shift Hours <span class="th-arrow">▾</span></th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      staffList.forEach(s => {
        html += `
          <tr data-searchable="${s.staffId} ${s.name} ${s.role} ${s.branchName} ${s.payTime}">
            <td class="col-checkbox"><input type="checkbox" class="table-checkbox"></td>
            <td><strong class="record-id">ST-${String(s.staffId).padStart(3, '0')}</strong></td>
            <td><strong>${s.name}</strong></td>
            <td>${s.role}</td>
            <td>📍 ${s.branchName}</td>
            <td>${s.payTime}</td>
            <td><code>${s.inTime} - ${s.outTime}</code></td>
            <td class="col-actions">
              <button class="btn-kebab" onclick="App.toggleKebabMenu(event, 'kebab-staff-${s.staffId}')">⋮</button>
              <div class="kebab-menu" id="kebab-staff-${s.staffId}">
                <button class="kebab-item item-danger" onclick="Part1Venues.deleteStaff(${s.staffId})">
                  🗑️ Remove Staff
                </button>
              </div>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table></div></div>`;
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="table-card" style="padding:2rem; color:var(--color-red);">Error: ${err.message}</div>`;
    }
  },

  async deleteStaff(staffId) {
    App.closeAllKebabMenus();
    if (!confirm(`Remove staff member #${staffId}?`)) return;

    try {
      await api.part1.deleteStaff(staffId);
      App.toast('Staff member removed', 'success');
      this.renderStaff(document.getElementById('part1-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Delete error: ' + err.message, 'error');
    }
  },

  // =========================================================================
  // 4. PUZZLE CLUES TABLE
  // =========================================================================
  async renderClues(container) {
    container.innerHTML = '<div class="table-card"><div style="text-align:center; padding:2rem;"><span class="pulse-dot"></span> Loading Clues...</div></div>';
    try {
      const clues = await api.part1.getClues();
      this.cachedClues = clues || [];
      App.updateToolbarCount(this.cachedClues.length);

      if (!clues || clues.length === 0) {
        container.innerHTML = `<div class="table-card" style="padding:2.5rem; text-align:center;">No puzzle clues recorded. Click (+) to add a clue.</div>`;
        return;
      }

      let html = `
        <div class="table-card">
          <div class="table-responsive">
            <table class="crud-table" id="table-clues">
              <thead>
                <tr>
                  <th class="col-checkbox"><input type="checkbox" class="table-checkbox" onclick="App.toggleAllCheckboxes(this)"></th>
                  <th class="sortable">Clue ID <span class="th-arrow">▾</span></th>
                  <th class="sortable">Chamber <span class="th-arrow">▾</span></th>
                  <th class="sortable">Description <span class="th-arrow">▾</span></th>
                  <th class="sortable">Hint Text <span class="th-arrow">▾</span></th>
                  <th class="sortable">Prerequisite <span class="th-arrow">▾</span></th>
                  <th class="sortable">Points <span class="th-arrow">▾</span></th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      clues.forEach(c => {
        html += `
          <tr data-searchable="${c.clueId} ${c.roomTheme} ${c.description} ${c.hint}">
            <td class="col-checkbox"><input type="checkbox" class="table-checkbox"></td>
            <td><strong class="record-id">CL-${String(c.clueId).padStart(3, '0')}</strong></td>
            <td><strong>${c.roomTheme}</strong></td>
            <td>${c.description}</td>
            <td style="color:var(--text-muted); font-size:0.78rem;">${c.hint}</td>
            <td>${c.prereqClueId ? `Requires CL-${String(c.prereqClueId).padStart(3, '0')}` : 'None'}</td>
            <td><strong>${c.points} pts</strong></td>
            <td class="col-actions">
              <button class="btn-kebab" onclick="App.toggleKebabMenu(event, 'kebab-clue-${c.clueId}')">⋮</button>
              <div class="kebab-menu" id="kebab-clue-${c.clueId}">
                <button class="kebab-item item-danger" onclick="Part1Venues.deleteClue(${c.clueId})">
                  🗑️ Delete Clue
                </button>
              </div>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table></div></div>`;
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="table-card" style="padding:2rem; color:var(--color-red);">Error: ${err.message}</div>`;
    }
  },

  async deleteClue(clueId) {
    App.closeAllKebabMenus();
    if (!confirm(`Delete Clue #${clueId}?`)) return;

    try {
      await api.part1.deleteClue(clueId);
      App.toast('Clue deleted', 'success');
      this.renderClues(document.getElementById('part1-content-area'));
    } catch (err) {
      App.toast('Delete error: ' + err.message, 'error');
    }
  }
};

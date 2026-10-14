/**
 * Part 1: Venues & Mystery Rooms Module
 * Manages Physical Branches, Escape Rooms, Staff Roster, and Room Clues.
 */

const Part1Venues = {
  currentSubTab: 'rooms',
  cachedBranches: [],
  cachedRooms: [],

  async init() {
    this.bindEvents();
    await this.loadAll();
  },

  bindEvents() {
    // Sub-tab navigation
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
      App.toast('Failed to load venue data: ' + err.message, 'error');
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

  // ----------------------------------------------------
  // Render Rooms
  // ----------------------------------------------------
  async renderRooms(container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Loading Rooms...</div>';
    try {
      const rooms = await api.part1.getRooms();
      this.cachedRooms = rooms;

      if (!rooms || rooms.length === 0) {
        container.innerHTML = '<div class="custom-card" style="text-align:center;">No escape rooms found. Click "Add Room" to create one.</div>';
        return;
      }

      let html = '<div class="card-grid">';
      rooms.forEach(r => {
        const diffClass = `badge-${r.difficulty.toLowerCase()}`;
        const statusClass = `badge-${r.status.toLowerCase()}`;

        html += `
          <div class="custom-card">
            <div>
              <div class="card-top">
                <span class="card-badge ${diffClass}">${r.difficulty}</span>
                <span class="card-badge ${statusClass}">${r.status}</span>
              </div>
              <h3 class="card-title">${r.themeName}</h3>
              <div class="card-subtitle">
                <span>📍 ${r.branchName || 'Branch #' + r.branchId}</span>
              </div>
              <div class="card-meta-list">
                <div class="meta-item">
                  <span class="meta-label">Team Capacity</span>
                  <span class="meta-value">${r.capacity} Players Max</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Mission Duration</span>
                  <span class="meta-value">${r.duration} Mins</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Base Price</span>
                  <span class="meta-value">$${parseFloat(r.basePrice).toFixed(2)}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Clues Loaded</span>
                  <span class="meta-value">${r.clueCount || 0} Puzzles</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <select class="form-control" style="width: auto; padding: 0.3rem 0.5rem; font-size: 0.8rem;" onchange="Part1Venues.changeRoomStatus(${r.roomId}, this.value)">
                <option value="Available" ${r.status === 'Available' ? 'selected' : ''}>Available</option>
                <option value="Occupied" ${r.status === 'Occupied' ? 'selected' : ''}>Occupied</option>
                <option value="Maintenance" ${r.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                <option value="Inactive" ${r.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
              </select>
              <button class="btn btn-danger btn-sm" onclick="Part1Venues.deleteRoom(${r.roomId})">Delete</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="custom-card" style="color:var(--accent-rose);">Error: ${err.message}</div>`;
    }
  },

  async changeRoomStatus(roomId, newStatus) {
    try {
      await api.part1.updateRoomStatus(roomId, newStatus);
      App.toast(`Room status changed to ${newStatus}`, 'success');
      App.refreshStats();
    } catch (err) {
      App.toast('Failed to update status: ' + err.message, 'error');
    }
  },

  async deleteRoom(roomId) {
    if (!confirm('Are you sure you want to delete this room? Associated clues and bookings will be affected.')) return;
    try {
      await api.part1.deleteRoom(roomId);
      App.toast('Room deleted successfully', 'success');
      this.renderRooms(document.getElementById('part1-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Failed to delete room: ' + err.message, 'error');
    }
  },

  // ----------------------------------------------------
  // Render Branches
  // ----------------------------------------------------
  async renderBranches(container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Loading Branches...</div>';
    try {
      const branches = await api.part1.getBranches();
      this.cachedBranches = branches;

      let html = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Branch ID</th>
                <th>Venue Name</th>
                <th>City & State</th>
                <th>Street Address</th>
                <th>ZIP</th>
                <th>Contact Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
      `;
      branches.forEach(b => {
        html += `
          <tr>
            <td><strong style="color:var(--accent-cyan);">#${b.branchId}</strong></td>
            <td><strong>${b.name}</strong></td>
            <td>${b.city}, ${b.state}</td>
            <td>${b.street}</td>
            <td><code>${b.zip}</code></td>
            <td><a href="tel:${b.phone}" style="color:var(--accent-emerald); text-decoration:none;">${b.phone}</a></td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="Part1Venues.deleteBranch(${b.branchId})">Delete</button>
            </td>
          </tr>
        `;
      });
      html += '</tbody></table></div>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="custom-card" style="color:var(--accent-rose);">Error: ${err.message}</div>`;
    }
  },

  async deleteBranch(branchId) {
    if (!confirm('Delete this branch? Warning: Rooms and staff assigned here might prevent deletion (RESTRICT FK).')) return;
    try {
      await api.part1.deleteBranch(branchId);
      App.toast('Branch deleted successfully', 'success');
      this.renderBranches(document.getElementById('part1-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Error deleting branch: ' + err.message, 'error');
    }
  },

  // ----------------------------------------------------
  // Render Staff
  // ----------------------------------------------------
  async renderStaff(container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Loading Staff...</div>';
    try {
      const staffList = await api.part1.getStaff();
      let html = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Assigned Branch</th>
                <th>Pay Schedule</th>
                <th>Shift Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
      `;
      staffList.forEach(s => {
        html += `
          <tr>
            <td><code>#${s.staffId}</code></td>
            <td><strong>${s.name}</strong></td>
            <td><span class="card-badge badge-medium">${s.role}</span></td>
            <td>${s.branchName}</td>
            <td>${s.payTime}</td>
            <td><code>${s.inTime} - ${s.outTime}</code></td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="Part1Venues.deleteStaff(${s.staffId})">Remove</button>
            </td>
          </tr>
        `;
      });
      html += '</tbody></table></div>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="custom-card" style="color:var(--accent-rose);">Error: ${err.message}</div>`;
    }
  },

  async deleteStaff(staffId) {
    if (!confirm('Remove this staff member?')) return;
    try {
      await api.part1.deleteStaff(staffId);
      App.toast('Staff removed', 'success');
      this.renderStaff(document.getElementById('part1-content-area'));
    } catch (err) {
      App.toast('Error removing staff: ' + err.message, 'error');
    }
  },

  // ----------------------------------------------------
  // Render Clues
  // ----------------------------------------------------
  async renderClues(container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Loading Clues...</div>';
    try {
      const clues = await api.part1.getClues();
      let html = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Clue ID</th>
                <th>Room Theme</th>
                <th>Description</th>
                <th>Hint Text</th>
                <th>Prerequisite Clue</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
      `;
      clues.forEach(c => {
        html += `
          <tr>
            <td><code>#${c.clueId}</code></td>
            <td><strong>${c.roomTheme}</strong></td>
            <td>${c.description}</td>
            <td style="color:var(--accent-amber); font-style:italic;">"${c.hint}"</td>
            <td>${c.prereqClueId ? `<span class="card-badge badge-hard">Requires Clue #${c.prereqClueId}</span>` : '<span style="color:var(--text-dim);">None (Entry Clue)</span>'}</td>
            <td><strong style="color:var(--accent-cyan);">+${c.points} pts</strong></td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="Part1Venues.deleteClue(${c.clueId})">Delete</button>
            </td>
          </tr>
        `;
      });
      html += '</tbody></table></div>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="custom-card" style="color:var(--accent-rose);">Error: ${err.message}</div>`;
    }
  },

  async deleteClue(clueId) {
    if (!confirm('Delete this clue?')) return;
    try {
      await api.part1.deleteClue(clueId);
      App.toast('Clue deleted', 'success');
      this.renderClues(document.getElementById('part1-content-area'));
    } catch (err) {
      App.toast('Error deleting clue: ' + err.message, 'error');
    }
  }
};

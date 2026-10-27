/**
 * Teams & Players Module
 * Clean, plain, working CRUD tables for:
 * - Teams (Auto-size via SQL triggers)
 * - Registered Players Directory
 * - SQL View: team_members
 */

const Part2Teams = {
  currentSubTab: 'teams',
  cachedTeams: [],
  cachedPlayers: [],
  cachedRosters: [],

  async init() {
    this.bindEvents();
    await this.loadAll();
  },

  bindEvents() {
    document.querySelectorAll('[data-subtab-part2]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-subtab-part2]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentSubTab = e.currentTarget.dataset.subtabPart2;
        this.renderCurrentSubTab();
      });
    });
  },

  async loadAll() {
    try {
      this.cachedTeams = await api.part2.getTeams();
      this.cachedPlayers = await api.part2.getPlayers();
      this.renderCurrentSubTab();
    } catch (err) {
      console.warn('Teams load error:', err);
    }
  },

  renderCurrentSubTab() {
    const container = document.getElementById('part2-content-area');
    if (!container) return;

    if (this.currentSubTab === 'teams') {
      this.renderTeams(container);
    } else if (this.currentSubTab === 'players') {
      this.renderPlayers(container);
    } else if (this.currentSubTab === 'rosters') {
      this.renderRostersView(container);
    }
  },

  // =========================================================================
  // 1. REGISTERED TEAMS TABLE
  // =========================================================================
  async renderTeams(container) {
    container.innerHTML = '<div class="table-card"><div style="text-align:center; padding:2rem;"><span class="pulse-dot"></span> Loading Teams...</div></div>';
    try {
      const teams = await api.part2.getTeams();
      this.cachedTeams = teams || [];
      App.updateToolbarCount(this.cachedTeams.length);

      if (!teams || teams.length === 0) {
        container.innerHTML = `<div class="table-card" style="padding:2.5rem; text-align:center;">No teams registered yet. Click (+) to register a team.</div>`;
        return;
      }

      let html = `
        <div class="table-card">
          <div class="table-responsive">
            <table class="crud-table" id="table-teams">
              <thead>
                <tr>
                  <th class="col-checkbox"><input type="checkbox" class="table-checkbox" onclick="App.toggleAllCheckboxes(this)"></th>
                  <th class="sortable">Team ID <span class="th-arrow">▾</span></th>
                  <th class="sortable">Squad Name <span class="th-arrow">▾</span></th>
                  <th class="sortable">Team Size <span class="th-arrow">▾</span></th>
                  <th class="sortable">Active Members <span class="th-arrow">▾</span></th>
                  <th class="sortable">Created Date <span class="th-arrow">▾</span></th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      teams.forEach(t => {
        const memberNames = (t.members && t.members.length > 0)
          ? t.members.map(m => m.name).join(', ')
          : '<span style="color:var(--text-dim); font-size:0.75rem;">None</span>';

        html += `
          <tr data-searchable="${t.teamId} ${t.teamName} ${t.teamSize}">
            <td class="col-checkbox"><input type="checkbox" class="table-checkbox"></td>
            <td><strong class="record-id">TM-${String(t.teamId).padStart(3, '0')}</strong></td>
            <td><strong>${t.teamName}</strong></td>
            <td><strong>${t.teamSize}</strong> members</td>
            <td><div style="max-width:340px; font-size:0.8rem; color:#334155;">${memberNames}</div></td>
            <td><small style="color:var(--text-muted);">${t.createdAt ? t.createdAt.substring(0, 10) : 'Recent'}</small></td>
            <td class="col-actions">
              <button class="btn-kebab" onclick="App.toggleKebabMenu(event, 'kebab-team-${t.teamId}')">⋮</button>
              <div class="kebab-menu" id="kebab-team-${t.teamId}">
                <button class="kebab-item" onclick="Part2Teams.openAssignModal(${t.teamId}, '${encodeURIComponent(t.teamName)}')">
                  ➕ Assign Player
                </button>
                <button class="kebab-item item-danger" onclick="Part2Teams.deleteTeam(${t.teamId})">
                  🗑️ Disband Team
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

  openAssignModal(teamId, encodedTeamName) {
    App.closeAllKebabMenus();
    const teamName = decodeURIComponent(encodedTeamName);
    document.getElementById('assign-team-id').value = teamId;
    document.getElementById('assign-modal-team-title').innerText = `Assign Player to "${teamName}"`;

    const select = document.getElementById('assign-player-select');
    select.innerHTML = '<option value="">-- Choose Player --</option>';
    if (this.cachedPlayers && this.cachedPlayers.length > 0) {
      this.cachedPlayers.forEach(p => {
        select.innerHTML += `<option value="${p.playerId}">${p.name} (${p.email}) - Team: ${p.teamName || 'Unassigned'}</option>`;
      });
    }
    App.openModal('modal-assign-player');
  },

  async deleteTeam(teamId) {
    App.closeAllKebabMenus();
    if (!confirm(`Disband Team #${teamId}?`)) return;

    try {
      await api.part2.deleteTeam(teamId);
      App.toast('Team disbanded', 'success');
      this.loadAll();
      App.refreshStats();
    } catch (err) {
      App.toast('Delete error: ' + err.message, 'error');
    }
  },

  // =========================================================================
  // 2. PLAYERS DIRECTORY TABLE
  // =========================================================================
  async renderPlayers(container) {
    container.innerHTML = '<div class="table-card"><div style="text-align:center; padding:2rem;"><span class="pulse-dot"></span> Loading Players...</div></div>';
    try {
      const players = await api.part2.getPlayers();
      this.cachedPlayers = players || [];
      App.updateToolbarCount(this.cachedPlayers.length);

      if (!players || players.length === 0) {
        container.innerHTML = `<div class="table-card" style="padding:2.5rem; text-align:center;">No players registered. Click (+) to register a player.</div>`;
        return;
      }

      let html = `
        <div class="table-card">
          <div class="table-responsive">
            <table class="crud-table" id="table-players">
              <thead>
                <tr>
                  <th class="col-checkbox"><input type="checkbox" class="table-checkbox" onclick="App.toggleAllCheckboxes(this)"></th>
                  <th class="sortable">Player ID <span class="th-arrow">▾</span></th>
                  <th class="sortable">Full Name <span class="th-arrow">▾</span></th>
                  <th class="sortable">Email <span class="th-arrow">▾</span></th>
                  <th class="sortable">Phone <span class="th-arrow">▾</span></th>
                  <th class="sortable">Age <span class="th-arrow">▾</span></th>
                  <th class="sortable">Squad <span class="th-arrow">▾</span></th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      players.forEach(p => {
        html += `
          <tr data-searchable="${p.playerId} ${p.name} ${p.email} ${p.phone} ${p.teamName || ''}">
            <td class="col-checkbox"><input type="checkbox" class="table-checkbox"></td>
            <td><strong class="record-id">PL-${String(p.playerId).padStart(3, '0')}</strong></td>
            <td><strong>${p.name}</strong></td>
            <td><a href="mailto:${p.email}" style="color:var(--text-dark); text-decoration:none;">${p.email}</a></td>
            <td>${p.phone}</td>
            <td>${p.age || '—'} yrs</td>
            <td>${p.teamName ? p.teamName : '<span style="color:var(--text-dim);">Unassigned</span>'}</td>
            <td class="col-actions">
              <button class="btn-kebab" onclick="App.toggleKebabMenu(event, 'kebab-player-${p.playerId}')">⋮</button>
              <div class="kebab-menu" id="kebab-player-${p.playerId}">
                <button class="kebab-item" onclick="Part2Teams.promptTransferPlayer(${p.playerId}, '${encodeURIComponent(p.name)}')">
                  🔄 Transfer Squad
                </button>
                <button class="kebab-item item-danger" onclick="Part2Teams.deletePlayer(${p.playerId})">
                  🗑️ Delete Player
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

  async promptTransferPlayer(playerId, encodedName) {
    App.closeAllKebabMenus();
    const name = decodeURIComponent(encodedName);
    const teamPrompt = prompt(`Assign player "${name}" to Team ID (leave blank to unassign):`);
    if (teamPrompt === null) return;

    try {
      const targetTeamId = teamPrompt.trim() === '' ? null : parseInt(teamPrompt);
      await api.part2.assignPlayerToTeam(playerId, targetTeamId);
      App.toast(`Player updated`, 'success');
      this.loadAll();
      App.refreshStats();
    } catch (err) {
      App.toast('Transfer error: ' + err.message, 'error');
    }
  },

  async deletePlayer(playerId) {
    App.closeAllKebabMenus();
    if (!confirm(`Delete Player #${playerId}?`)) return;

    try {
      await api.part2.deletePlayer(playerId);
      App.toast('Player removed', 'success');
      this.loadAll();
      App.refreshStats();
    } catch (err) {
      App.toast('Delete error: ' + err.message, 'error');
    }
  },

  // =========================================================================
  // 3. SQL VIEW: team_members TABLE
  // =========================================================================
  async renderRostersView(container) {
    container.innerHTML = '<div class="table-card"><div style="text-align:center; padding:2rem;"><span class="pulse-dot"></span> Loading Roster View...</div></div>';
    try {
      const rosters = await api.part2.getRostersView();
      this.cachedRosters = rosters || [];
      App.updateToolbarCount(this.cachedRosters.length);

      if (!rosters || rosters.length === 0) {
        container.innerHTML = `<div class="table-card" style="padding:2.5rem; text-align:center;">No records in team_members view.</div>`;
        return;
      }

      let html = `
        <div class="table-card">
          <div class="table-responsive">
            <table class="crud-table" id="table-rosters">
              <thead>
                <tr>
                  <th class="col-checkbox"><input type="checkbox" class="table-checkbox" onclick="App.toggleAllCheckboxes(this)"></th>
                  <th class="sortable">Team ID <span class="th-arrow">▾</span></th>
                  <th class="sortable">Team Name <span class="th-arrow">▾</span></th>
                  <th class="sortable">Player Name <span class="th-arrow">▾</span></th>
                  <th class="sortable">Email <span class="th-arrow">▾</span></th>
                  <th class="sortable">Phone <span class="th-arrow">▾</span></th>
                </tr>
              </thead>
              <tbody>
      `;

      rosters.forEach(r => {
        html += `
          <tr data-searchable="${r.teamId || ''} ${r.teamName || ''} ${r.playerName || ''} ${r.email || ''}">
            <td class="col-checkbox"><input type="checkbox" class="table-checkbox"></td>
            <td><strong class="record-id">TM-${r.teamId}</strong></td>
            <td><strong>${r.teamName}</strong></td>
            <td>${r.playerName}</td>
            <td>${r.email}</td>
            <td><code>${r.phone}</code></td>
          </tr>
        `;
      });

      html += `</tbody></table></div></div>`;
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="table-card" style="padding:2rem; color:var(--color-red);">Error: ${err.message}</div>`;
    }
  }
};

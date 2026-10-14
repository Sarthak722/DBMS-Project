/**
 * Part 2: Teams & Players Module
 * Manages Teams, Player Registrations, Roster Assignment,
 * and demonstrates dynamic team_size triggers & SQL views.
 */

const Part2Teams = {
  currentSubTab: 'teams',
  cachedTeams: [],
  cachedPlayers: [],

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
      App.toast('Failed to load team/player data: ' + err.message, 'error');
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

  // ----------------------------------------------------
  // Render Teams
  // ----------------------------------------------------
  async renderTeams(container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Loading Teams...</div>';
    try {
      const teams = await api.part2.getTeams();
      this.cachedTeams = teams;

      if (!teams || teams.length === 0) {
        container.innerHTML = '<div class="custom-card" style="text-align:center;">No teams registered yet.</div>';
        return;
      }

      let html = '<div class="card-grid">';
      teams.forEach(t => {
        html += `
          <div class="custom-card">
            <div>
              <div class="card-top">
                <span class="card-badge badge-medium">Team #${t.teamId}</span>
                <span class="card-badge badge-available" title="Maintained automatically via SQL Trigger">
                  👥 ${t.teamSize} Members (Trigger)
                </span>
              </div>
              <h3 class="card-title">${t.teamName}</h3>
              <div class="card-subtitle">Registered: ${t.createdAt ? t.createdAt.substring(0, 10) : 'Active'}</div>

              <div style="margin: 1rem 0;">
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-dim); margin-bottom:0.5rem; font-weight:700;">
                  Active Roster Members:
                </div>
                <div style="display:flex; flex-direction:column; gap:0.4rem; max-height:140px; overflow-y:auto;">
                  ${t.members && t.members.length > 0 ? 
                    t.members.map(m => `
                      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:0.35rem 0.6rem; border-radius:var(--radius-sm); font-size:0.8rem;">
                        <span>👤 <strong>${m.name}</strong></span>
                        <span style="color:var(--text-dim); font-size:0.75rem;">${m.email}</span>
                      </div>
                    `).join('') :
                    '<span style="color:var(--text-dim); font-size:0.8rem; font-style:italic;">No players assigned yet.</span>'
                  }
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn btn-cyan btn-sm" onclick="Part2Teams.openAssignModal(${t.teamId}, '${escape(t.teamName)}')">+ Assign Player</button>
              <button class="btn btn-danger btn-sm" onclick="Part2Teams.deleteTeam(${t.teamId})">Disband</button>
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

  async deleteTeam(teamId) {
    if (!confirm('Disband this team? Players will be disassociated automatically (SET NULL).')) return;
    try {
      await api.part2.deleteTeam(teamId);
      App.toast('Team disbanded', 'success');
      this.renderTeams(document.getElementById('part2-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Error disbanding team: ' + err.message, 'error');
    }
  },

  // ----------------------------------------------------
  // Render Players
  // ----------------------------------------------------
  async renderPlayers(container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Loading Players...</div>';
    try {
      const players = await api.part2.getPlayers();
      this.cachedPlayers = players;

      let html = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Player ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Assigned Team</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
      `;
      players.forEach(p => {
        html += `
          <tr>
            <td><code>#${p.playerId}</code></td>
            <td><strong>${p.name}</strong></td>
            <td><code>${p.email}</code></td>
            <td>${p.phone}</td>
            <td>${p.age || 'N/A'}</td>
            <td>${p.teamName ? `<span class="card-badge badge-medium">🛡️ ${p.teamName}</span>` : '<span style="color:var(--text-dim);">Free Agent</span>'}</td>
            <td>${p.joinedDate || '—'}</td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="Part2Teams.changePlayerTeamPrompt(${p.playerId}, ${p.teamId || 'null'})">Change Team</button>
              <button class="btn btn-danger btn-sm" onclick="Part2Teams.deletePlayer(${p.playerId})">Remove</button>
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

  async changePlayerTeamPrompt(playerId, currentTeamId) {
    const teams = this.cachedTeams.length > 0 ? this.cachedTeams : await api.part2.getTeams();
    let promptText = 'Select New Team ID (or enter 0 to remove from team):\n\n';
    promptText += '0: Free Agent (No Team)\n';
    teams.forEach(t => {
      promptText += `${t.teamId}: ${t.teamName} (Current size: ${t.teamSize})\n`;
    });

    const choice = prompt(promptText, currentTeamId || '0');
    if (choice === null) return;
    const newTeamId = parseInt(choice);
    try {
      await api.part2.assignPlayerToTeam(playerId, newTeamId > 0 ? newTeamId : null);
      App.toast('Player assigned! Database trigger recalculated team sizes automatically.', 'success');
      this.renderPlayers(document.getElementById('part2-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Error assigning player: ' + err.message, 'error');
    }
  },

  async deletePlayer(playerId) {
    if (!confirm('Remove this player? Database triggers will update team size.')) return;
    try {
      await api.part2.deletePlayer(playerId);
      App.toast('Player removed and team size updated via trigger.', 'success');
      this.renderPlayers(document.getElementById('part2-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Error removing player: ' + err.message, 'error');
    }
  },

  // ----------------------------------------------------
  // Render Rosters View (Calls SQL view: team_members)
  // ----------------------------------------------------
  async renderRostersView(container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Loading SQL View `team_members`...</div>';
    try {
      const rosters = await api.part2.getRostersView();
      let html = `
        <div style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.85rem; color:var(--accent-cyan); font-family:var(--font-mono);">
            ⚡ Direct Query from SQL View: <code>CREATE VIEW team_members AS SELECT team_id, player_id, joined_date FROM players ...</code>
          </span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Team ID</th>
                <th>Team Name</th>
                <th>Player ID</th>
                <th>Player Name</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
      `;
      rosters.forEach(r => {
        html += `
          <tr>
            <td><code>#${r.teamId}</code></td>
            <td><strong style="color:var(--accent-purple);">${r.teamName}</strong></td>
            <td><code>#${r.playerId}</code></td>
            <td><strong>${r.playerName}</strong></td>
            <td><code>${r.joinedDate || 'Active'}</code></td>
          </tr>
        `;
      });
      html += '</tbody></table></div>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="custom-card" style="color:var(--accent-rose);">Error: ${err.message}</div>`;
    }
  },

  openAssignModal(teamId, unescapedTeamName) {
    const teamName = unescape(unescapedTeamName);
    const select = document.getElementById('assign-player-select');
    if (!select) return;

    select.innerHTML = '<option value="">Select a player...</option>';
    this.cachedPlayers.forEach(p => {
      select.innerHTML += `<option value="${p.playerId}">${p.name} (${p.email}) - Current: ${p.teamName || 'None'}</option>`;
    });

    document.getElementById('assign-team-id').value = teamId;
    document.getElementById('assign-modal-team-title').innerText = `Assign Player to "${teamName}"`;
    App.openModal('modal-assign-player');
  }
};

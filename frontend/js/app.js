/**
 * Main Application Orchestrator
 * Coordinates Navigation between 4 Modular Parts, Modals, Forms, and Stats.
 */

const App = {
  currentView: 'overview',
  currentPart: 1,

  async init() {
    this.bindNavigation();
    this.bindModals();
    this.bindForms();

    // Initialize all 4 sub-modules
    await Promise.all([
      Part1Venues.init(),
      Part2Teams.init(),
      Part3Bookings.init(),
      Part4Analytics.init()
    ]);

    await this.refreshStats();
    await this.loadOverview();
  },

  // ----------------------------------------------------
  // Natural View Navigation
  // ----------------------------------------------------
  bindNavigation() {
    // Natural Navigation Links
    document.querySelectorAll('[data-nav-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.navView;
        this.switchView(view);
      });
    });

    // Backward Compatibility for 4-part buttons
    document.querySelectorAll('[data-target-part]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const partNum = parseInt(e.currentTarget.dataset.targetPart);
        this.switchPart(partNum);
      });
    });
  },

  switchView(viewName) {
    this.currentView = viewName;

    // Update Tab Buttons
    document.querySelectorAll('[data-nav-view]').forEach(btn => {
      if (btn.dataset.navView === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Section Visibility
    document.querySelectorAll('.module-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSection = document.getElementById(`section-${viewName}`);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // Trigger dynamic data loader for active view
    if (viewName === 'overview') this.loadOverview();
    if (viewName === 'chambers') Part1Venues.renderCurrentSubTab();
    if (viewName === 'teams') Part2Teams.renderCurrentSubTab();
    if (viewName === 'operations') Part3Bookings.loadBookings();
    if (viewName === 'leaderboard') this.renderLeaderboardView();
    if (viewName === 'finance') Part4Analytics.renderCurrentSubTab();
  },

  switchPart(partNum) {
    const partMapping = {
      1: 'chambers',
      2: 'teams',
      3: 'operations',
      4: 'finance'
    };
    const targetView = partMapping[partNum] || 'overview';
    this.switchView(targetView);
  },

  jumpToStudentView(viewName) {
    this.closeModal('modal-lab-inspector');
    this.switchView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.toast(`Viewing ${viewName.toUpperCase()} module`, 'info');
  },

  // ----------------------------------------------------
  // Operations Dashboard Overview Data
  // ----------------------------------------------------
  async loadOverview() {
    const container = document.getElementById('overview-missions-container');
    if (!container) return;

    try {
      const bookings = await api.part3.getBookings();
      const activeOrScheduled = bookings.filter(b => b.status === 'In-Progress' || b.status === 'Scheduled');
      const liveBadge = document.getElementById('overview-live-count');
      if (liveBadge) liveBadge.innerText = `${activeOrScheduled.length} Active`;

      if (activeOrScheduled.length === 0) {
        container.innerHTML = `
          <div class="custom-card" style="text-align:center; padding:2rem; grid-column: 1 / -1;">
            <div style="font-size:1.5rem; margin-bottom:0.5rem;">🎉</div>
            <strong style="color:var(--text-main);">All Chambers Clear</strong>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">No sessions are currently in-progress or scheduled.</p>
            <button class="btn btn-primary btn-sm" style="margin-top:1rem;" onclick="App.prepareBookingModal()">+ Schedule New Mission</button>
          </div>
        `;
      } else {
        container.innerHTML = activeOrScheduled.map(b => {
          const isLive = b.status === 'In-Progress';
          const statusClass = isLive ? 'status-inprogress' : 'status-scheduled';
          return `
            <div class="mission-card">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                  <span class="status-pill ${statusClass}">${b.status}</span>
                  <code style="color:var(--accent-cyan); font-size:0.8rem;">${b.sessionId}</code>
                </div>
                <h4 style="font-size:1.1rem; font-weight:800; color:var(--text-main); margin-bottom:0.25rem;">${b.roomTheme}</h4>
                <div style="font-size:0.85rem; color:var(--text-muted);">
                  Squad: <strong style="color:var(--accent-purple);">${b.teamName}</strong> &bull; Host: <span>${b.hostStaff}</span>
                </div>
                <div style="font-size:0.75rem; color:var(--text-dim); margin-top:0.35rem;">
                  🕒 Scheduled: ${b.startTime.replace('T', ' ')}
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:0.75rem; margin-top:0.5rem;">
                <span style="font-size:0.75rem; color:var(--text-dim);">${b.hintsUsed || 0} Hints logged</span>
                <button class="btn btn-cyan btn-sm" onclick="Part3Bookings.openControlRoom('${b.sessionId}', '${b.roomTheme.replace(/'/g, "\\'")}', '${b.teamName.replace(/'/g, "\\'")}', '${b.hostStaff.replace(/'/g, "\\'")}', '${b.status}')">
                  🎮 Launch Console
                </button>
              </div>
            </div>
          `;
        }).join('');
      }

      // Load Distribution Stats
      const analytics = await api.part4.getAnalytics();
      const diffContainer = document.getElementById('overview-difficulty-stats');
      if (diffContainer && analytics.difficultyStats) {
        diffContainer.innerHTML = analytics.difficultyStats.map(d => `
          <div class="meta-item">
            <span class="meta-label">${d.difficulty} Difficulty</span>
            <span class="meta-value">${d.count} Chambers</span>
          </div>
        `).join('');
      }

      const branchContainer = document.getElementById('overview-branch-stats');
      if (branchContainer && analytics.revenueByBranch) {
        branchContainer.innerHTML = analytics.revenueByBranch.map(b => `
          <div class="meta-item">
            <span class="meta-label">${b.branchName}</span>
            <span class="meta-value" style="color:var(--accent-emerald);">$${b.revenue.toFixed(2)} (${b.transactions} tx)</span>
          </div>
        `).join('');
      }
    } catch (err) {
      console.warn('Error loading overview:', err);
    }
  },

  // ----------------------------------------------------
  // Dedicated Hall of Fame Leaderboard View
  // ----------------------------------------------------
  async renderLeaderboardView() {
    const container = document.getElementById('leaderboard-content-area');
    if (!container) return;
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Querying Hall of Fame Escape Leaderboard...</div>';

    try {
      const leaderboard = await api.part4.getLeaderboard();
      if (!leaderboard || leaderboard.length === 0) {
        container.innerHTML = '<div class="custom-card" style="text-align:center;">No teams have escaped yet! Complete an active game to record history.</div>';
        return;
      }

      let html = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team Name</th>
                <th>Room Conquered</th>
                <th>Session ID</th>
                <th>Escape Time</th>
                <th>Hints Used</th>
                <th>Host Master</th>
              </tr>
            </thead>
            <tbody>
      `;
      leaderboard.forEach(item => {
        const rankClass = item.rank <= 3 ? `rank-${item.rank}` : 'rank-other';
        const rankIcon = item.rank === 1 ? '🥇 1st' : item.rank === 2 ? '🥈 2nd' : item.rank === 3 ? '🥉 3rd' : `#${item.rank}`;

        html += `
          <tr>
            <td><span class="rank-badge ${rankClass}" style="width:auto; padding:0 0.5rem;">${rankIcon}</span></td>
            <td><strong style="color:var(--text-main); font-size:0.95rem;">${item.teamName}</strong></td>
            <td>${item.themeName}</td>
            <td><code>${item.sessionId}</code></td>
            <td><strong style="color:var(--accent-cyan); font-family:var(--font-mono); font-size:1rem;">⚡ ${item.completeTime}</strong></td>
            <td><span class="card-badge badge-medium">${item.hintsUsed} Hints</span></td>
            <td>👤 ${item.hostStaff}</td>
          </tr>
        `;
      });
      html += '</tbody></table></div>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="custom-card" style="color:var(--accent-rose);">Error: ${err.message}</div>`;
    }
  },

  // ----------------------------------------------------
  // Top Stats Ribbon Refresh
  // ----------------------------------------------------
  async refreshStats() {
    try {
      const analytics = await api.part4.getAnalytics();
      document.getElementById('stat-active-rooms').innerText = analytics.totalRooms || 0;
      document.getElementById('stat-total-teams').innerText = analytics.totalTeams || 0;
      document.getElementById('stat-total-revenue').innerText = '$' + (analytics.totalRevenue || 0).toFixed(0);
      document.getElementById('stat-escape-rate').innerText = (analytics.escapeRate || 0) + '%';
    } catch (e) {
      console.warn('Could not fetch quick stats:', e);
    }
  },

  // ----------------------------------------------------
  // Modals & Overlays
  // ----------------------------------------------------
  bindModals() {
    // Close button clicks
    document.querySelectorAll('.modal-close-btn, [data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      });
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  // ----------------------------------------------------
  // Form Submissions
  // ----------------------------------------------------
  bindForms() {
    // 1. Add Branch Form
    const formBranch = document.getElementById('form-add-branch');
    if (formBranch) {
      formBranch.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const branch = {
            name: document.getElementById('b-name').value,
            city: document.getElementById('b-city').value,
            street: document.getElementById('b-street').value,
            state: document.getElementById('b-state').value,
            zip: document.getElementById('b-zip').value,
            phone: document.getElementById('b-phone').value
          };
          await api.part1.createBranch(branch);
          App.toast('Branch created successfully', 'success');
          formBranch.reset();
          App.closeModal('modal-add-branch');
          Part1Venues.loadAll();
          App.refreshStats();
        } catch (err) {
          App.toast('Error creating branch: ' + err.message, 'error');
        }
      });
    }

    // 2. Add Room Form
    const formRoom = document.getElementById('form-add-room');
    if (formRoom) {
      formRoom.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const room = {
            branchId: parseInt(document.getElementById('r-branch-id').value),
            themeName: document.getElementById('r-theme').value,
            difficulty: document.getElementById('r-diff').value,
            capacity: parseInt(document.getElementById('r-cap').value),
            status: document.getElementById('r-status').value,
            basePrice: parseFloat(document.getElementById('r-price').value),
            duration: parseInt(document.getElementById('r-dur').value)
          };
          await api.part1.createRoom(room);
          App.toast('Escape Room created', 'success');
          formRoom.reset();
          App.closeModal('modal-add-room');
          Part1Venues.loadAll();
          App.refreshStats();
        } catch (err) {
          App.toast('Error creating room: ' + err.message, 'error');
        }
      });
    }

    // 3. Add Staff Form
    const formStaff = document.getElementById('form-add-staff');
    if (formStaff) {
      formStaff.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const staff = {
            branchId: parseInt(document.getElementById('s-branch-id').value),
            name: document.getElementById('s-name').value,
            role: document.getElementById('s-role').value,
            payTime: document.getElementById('s-paytime').value,
            inTime: document.getElementById('s-intime').value,
            outTime: document.getElementById('s-outtime').value
          };
          await api.part1.createStaff(staff);
          App.toast('Staff member registered', 'success');
          formStaff.reset();
          App.closeModal('modal-add-staff');
          Part1Venues.loadAll();
        } catch (err) {
          App.toast('Error registering staff: ' + err.message, 'error');
        }
      });
    }

    // 4. Add Clue Form
    const formClue = document.getElementById('form-add-clue');
    if (formClue) {
      formClue.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const clue = {
            roomId: parseInt(document.getElementById('c-room-id').value),
            description: document.getElementById('c-desc').value,
            hint: document.getElementById('c-hint').value,
            prereqClueId: document.getElementById('c-prereq').value ? parseInt(document.getElementById('c-prereq').value) : null,
            points: parseInt(document.getElementById('c-points').value || 10)
          };
          await api.part1.createClue(clue);
          App.toast('Clue puzzle added', 'success');
          formClue.reset();
          App.closeModal('modal-add-clue');
          Part1Venues.loadAll();
        } catch (err) {
          App.toast('Error adding clue: ' + err.message, 'error');
        }
      });
    }

    // 5. Register Team Form
    const formTeam = document.getElementById('form-add-team');
    if (formTeam) {
      formTeam.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const teamName = document.getElementById('t-name').value;
          await api.part2.createTeam(teamName);
          App.toast('Team registered successfully', 'success');
          formTeam.reset();
          App.closeModal('modal-add-team');
          Part2Teams.loadAll();
          App.refreshStats();
        } catch (err) {
          App.toast('Error registering team: ' + err.message, 'error');
        }
      });
    }

    // 6. Register Player Form
    const formPlayer = document.getElementById('form-add-player');
    if (formPlayer) {
      formPlayer.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const teamVal = document.getElementById('p-team-id').value;
          const player = {
            name: document.getElementById('p-name').value,
            email: document.getElementById('p-email').value,
            phone: document.getElementById('p-phone').value,
            age: document.getElementById('p-age').value ? parseInt(document.getElementById('p-age').value) : null,
            teamId: teamVal ? parseInt(teamVal) : null
          };
          await api.part2.createPlayer(player);
          App.toast('Player registered and assigned to team!', 'success');
          formPlayer.reset();
          App.closeModal('modal-add-player');
          Part2Teams.loadAll();
          App.refreshStats();
        } catch (err) {
          App.toast('Error registering player: ' + err.message, 'error');
        }
      });
    }

    // 7. Assign Player Modal Form
    const formAssign = document.getElementById('form-assign-player');
    if (formAssign) {
      formAssign.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const playerId = parseInt(document.getElementById('assign-player-select').value);
          const teamId = parseInt(document.getElementById('assign-team-id').value);
          await api.part2.assignPlayerToTeam(playerId, teamId);
          App.toast('Player assigned! `team_size` trigger updated automatically.', 'success');
          App.closeModal('modal-assign-player');
          Part2Teams.loadAll();
          App.refreshStats();
        } catch (err) {
          App.toast('Error assigning player: ' + err.message, 'error');
        }
      });
    }

    // 8. Book New Mission Form
    const formBooking = document.getElementById('form-add-booking');
    if (formBooking) {
      formBooking.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const booking = {
            sessionId: document.getElementById('bk-session-id').value || null,
            staffId: parseInt(document.getElementById('bk-staff-id').value),
            roomId: parseInt(document.getElementById('bk-room-id').value),
            teamId: parseInt(document.getElementById('bk-team-id').value),
            startTime: document.getElementById('bk-start-time').value.replace('T', ' ') + ':00',
            slotEndTime: document.getElementById('bk-end-time').value.replace('T', ' ') + ':00',
            status: 'Scheduled',
            outcome: 'Pending'
          };
          await api.part3.createBooking(booking);
          App.toast('Mission scheduled! Pending payment generated via trigger.', 'success');
          formBooking.reset();
          App.closeModal('modal-add-booking');
          Part3Bookings.loadBookings();
          App.refreshStats();
        } catch (err) {
          App.toast('Error scheduling booking: ' + err.message, 'error');
        }
      });
    }
  },

  // Helper to populate select dropdowns before opening creation modals
  async prepareBookingModal() {
    try {
      const [rooms, staff, teams] = await Promise.all([
        api.part1.getRooms(),
        api.part1.getStaff(),
        api.part2.getTeams()
      ]);

      const roomSelect = document.getElementById('bk-room-id');
      const staffSelect = document.getElementById('bk-staff-id');
      const teamSelect = document.getElementById('bk-team-id');

      if (roomSelect) {
        roomSelect.innerHTML = rooms.map(r => `<option value="${r.roomId}">${r.themeName} (${r.difficulty}, $${r.basePrice})</option>`).join('');
      }
      if (staffSelect) {
        staffSelect.innerHTML = staff.map(s => `<option value="${s.staffId}">${s.name} (${s.role} @ ${s.branchName})</option>`).join('');
      }
      if (teamSelect) {
        teamSelect.innerHTML = teams.map(t => `<option value="${t.teamId}">${t.teamName} (Size: ${t.teamSize})</option>`).join('');
      }

      // Generate randomized session ID
      document.getElementById('bk-session-id').value = 'SESS-' + Math.floor(1000 + Math.random() * 9000);

      // Default start time now, end time +1 hour
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      document.getElementById('bk-start-time').value = now.toISOString().slice(0, 16);
      
      const later = new Date(now.getTime() + 60 * 60 * 1000);
      document.getElementById('bk-end-time').value = later.toISOString().slice(0, 16);

      this.openModal('modal-add-booking');
    } catch (err) {
      App.toast('Failed to load options for booking: ' + err.message, 'error');
    }
  },

  async prepareRoomModal() {
    const branches = await api.part1.getBranches();
    const select = document.getElementById('r-branch-id');
    if (select) {
      select.innerHTML = branches.map(b => `<option value="${b.branchId}">${b.name} (${b.city})</option>`).join('');
    }
    this.openModal('modal-add-room');
  },

  async prepareStaffModal() {
    const branches = await api.part1.getBranches();
    const select = document.getElementById('s-branch-id');
    if (select) {
      select.innerHTML = branches.map(b => `<option value="${b.branchId}">${b.name} (${b.city})</option>`).join('');
    }
    this.openModal('modal-add-staff');
  },

  async prepareClueModal() {
    const [rooms, clues] = await Promise.all([
      api.part1.getRooms(),
      api.part1.getClues()
    ]);
    const roomSelect = document.getElementById('c-room-id');
    const prereqSelect = document.getElementById('c-prereq');

    if (roomSelect) {
      roomSelect.innerHTML = rooms.map(r => `<option value="${r.roomId}">${r.themeName}</option>`).join('');
    }
    if (prereqSelect) {
      prereqSelect.innerHTML = '<option value="">None (Independent First Puzzle)</option>' +
        clues.map(c => `<option value="${c.clueId}">Clue #${c.clueId}: ${c.description} (${c.roomTheme})</option>`).join('');
    }
    this.openModal('modal-add-clue');
  },

  async preparePlayerModal() {
    const teams = await api.part2.getTeams();
    const select = document.getElementById('p-team-id');
    if (select) {
      select.innerHTML = '<option value="">Free Agent (No Team)</option>' +
        teams.map(t => `<option value="${t.teamId}">${t.teamName} (Size: ${t.teamSize})</option>`).join('');
    }
    this.openModal('modal-add-player');
  },

  // ----------------------------------------------------
  // Toast Notification System
  // ----------------------------------------------------
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="font-weight:bold; font-size:1.1rem;">${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

// Bootstrap application on DOM load
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

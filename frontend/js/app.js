/**
 * Main Application Orchestrator
 * Coordinates:
 * - Enterprise Minimalist Navigation & Subtabs
 * - Global Search & Filtering
 * - Global Magenta (+) Action Trigger
 * - Champions Leaderboard & Dashboard Overview
 * - Modals, Forms & CRUD API dispatching
 */

const App = {
  currentView: 'overview',

  async init() {
    this.bindNavigation();
    this.bindModals();
    this.bindForms();
    this.bindGlobalClicks();

    // Initialize all sub-modules
    await Promise.all([
      Part1Venues.init(),
      Part2Teams.init(),
      Part3Bookings.init(),
      Part4Analytics.init()
    ]);

    await this.refreshStats();
    await this.loadChampionsLeaderboard();
  },

  // =========================================================================
  // NAVIGATION & VIEW SWITCHING
  // =========================================================================
  bindNavigation() {
    document.querySelectorAll('[data-nav-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.navView;
        this.switchView(view);
      });
    });
  },

  switchView(viewName) {
    this.currentView = viewName;
    this.closeAllKebabMenus();

    // Clear search box on view switch
    const searchInput = document.getElementById('global-table-search');
    if (searchInput) searchInput.value = '';

    // Update Nav Pills
    document.querySelectorAll('[data-nav-view]').forEach(btn => {
      if (btn.dataset.navView === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Section Visibility
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeSection = document.getElementById(`section-${viewName}`);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // Toggle Sub-tab bars
    const subtabsPart1 = document.getElementById('subtabs-part1');
    const subtabsPart2 = document.getElementById('subtabs-part2');
    const subtabsPart4 = document.getElementById('subtabs-part4');

    if (subtabsPart1) subtabsPart1.style.display = (viewName === 'chambers') ? 'flex' : 'none';
    if (subtabsPart2) subtabsPart2.style.display = (viewName === 'teams') ? 'flex' : 'none';
    if (subtabsPart4) subtabsPart4.style.display = (viewName === 'finance') ? 'flex' : 'none';

    // Trigger View Data Renderers
    if (viewName === 'overview') {
      this.refreshStats();
      this.loadChampionsLeaderboard();
      this.updateToolbarCount(undefined);
    } else if (viewName === 'chambers') {
      Part1Venues.renderCurrentSubTab();
    } else if (viewName === 'teams') {
      Part2Teams.renderCurrentSubTab();
    } else if (viewName === 'operations') {
      Part3Bookings.loadBookings();
    } else if (viewName === 'finance') {
      Part4Analytics.renderCurrentSubTab();
    }
  },

  updateToolbarCount(count) {
    const el = document.getElementById('toolbar-item-count');
    if (el) {
      el.innerText = count !== undefined ? `Total: ${count} records` : 'Showing all records';
    }
  },

  // =========================================================================
  // GLOBAL MAGENTA (+) ACTION TRIGGER
  // =========================================================================
  triggerAddAction() {
    this.closeAllKebabMenus();

    if (this.currentView === 'overview' || this.currentView === 'chambers') {
      const subtab = Part1Venues.currentSubTab;
      if (subtab === 'rooms') this.prepareRoomModal();
      else if (subtab === 'branches') this.openModal('modal-add-branch');
      else if (subtab === 'staff') this.prepareStaffModal();
      else if (subtab === 'clues') this.prepareClueModal();
      else this.prepareRoomModal();
    } else if (this.currentView === 'teams') {
      const subtab = Part2Teams.currentSubTab;
      if (subtab === 'players') this.preparePlayerModal();
      else this.openModal('modal-add-team');
    } else if (this.currentView === 'operations') {
      this.prepareBookingModal();
    } else if (this.currentView === 'finance') {
      this.preparePaymentModal();
    }
  },

  // =========================================================================
  // LIVE SEARCH & FILTER
  // =========================================================================
  handleLiveSearch(query) {
    const q = (query || '').toLowerCase().trim();
    const activeSection = document.querySelector('.view-section.active');
    if (!activeSection) return;

    const rows = activeSection.querySelectorAll('tbody tr');
    let visibleCount = 0;

    rows.forEach(tr => {
      const text = (tr.dataset.searchable || tr.innerText || '').toLowerCase();
      if (!q || text.includes(q)) {
        tr.style.display = '';
        visibleCount++;
      } else {
        tr.style.display = 'none';
      }
    });

    this.updateToolbarCount(visibleCount);
  },

  // =========================================================================
  // KEBAB ACTION DROPDOWNS & CHECKBOXES
  // =========================================================================
  toggleKebabMenu(event, menuId) {
    event.stopPropagation();
    const menu = document.getElementById(menuId);
    if (!menu) return;

    const isVisible = menu.classList.contains('show');
    this.closeAllKebabMenus();

    if (!isVisible) {
      menu.classList.add('show');
    }
  },

  closeAllKebabMenus() {
    document.querySelectorAll('.kebab-menu.show').forEach(m => m.classList.remove('show'));
  },

  bindGlobalClicks() {
    document.addEventListener('click', () => {
      this.closeAllKebabMenus();
    });
  },

  toggleAllCheckboxes(masterCheckbox) {
    const table = masterCheckbox.closest('table');
    if (!table) return;
    const cbs = table.querySelectorAll('tbody .table-checkbox');
    cbs.forEach(cb => cb.checked = masterCheckbox.checked);
  },

  // =========================================================================
  // CHAMPIONS / HALL OF FAME LEADERBOARD (Main Dashboard)
  // =========================================================================
  async loadChampionsLeaderboard() {
    const container = document.getElementById('champions-table-body');
    if (!container) return;

    container.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:1.5rem;"><span class="pulse-dot"></span> Loading Champions...</td></tr>';
    try {
      const champions = await api.part4.getLeaderboard();
      if (!champions || champions.length === 0) {
        container.innerHTML = '<tr><td colspan="6" class="text-center" style="padding:1.5rem; color:var(--text-muted);">No recorded escapes yet. Complete a session to see champions here!</td></tr>';
        return;
      }

      let html = '';
      champions.forEach((c, index) => {
        let rankBadge = `${index + 1}`;
        if (index === 0) rankBadge = '🥇';
        else if (index === 1) rankBadge = '🥈';
        else if (index === 2) rankBadge = '🥉';

        html += `
          <tr>
            <td style="font-weight:bold; font-size:1.1rem; text-align:center;">${rankBadge}</td>
            <td><strong>🛡️ ${c.teamName}</strong></td>
            <td>🏰 ${c.roomTheme}</td>
            <td>👤 ${c.hostMaster || 'Game Master'}</td>
            <td><strong style="color:var(--color-green); font-family:var(--font-mono); font-size:0.95rem;">${c.completionTimeMinutes} mins</strong></td>
            <td>${c.hintPenaltySeconds || 0}s penalty</td>
          </tr>
        `;
      });
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<tr><td colspan="6" class="text-center" style="color:var(--color-red); padding:1rem;">Error: ${err.message}</td></tr>`;
    }
  },

  // =========================================================================
  // STATS REFRESH
  // =========================================================================
  async refreshStats() {
    try {
      const [rooms, teams, analytics] = await Promise.all([
        api.part1.getRooms().catch(() => []),
        api.part2.getTeams().catch(() => []),
        api.part4.getAnalytics().catch(() => null)
      ]);

      const activeRooms = rooms.filter(r => r.status === 'Available' || r.status === 'Occupied').length;
      const elRooms = document.getElementById('stat-active-rooms');
      if (elRooms) elRooms.innerText = activeRooms || rooms.length;

      const elTeams = document.getElementById('stat-total-teams');
      if (elTeams) elTeams.innerText = teams.length;

      if (analytics) {
        const elRev = document.getElementById('stat-total-revenue');
        if (elRev) elRev.innerText = '$' + parseFloat(analytics.totalRevenue || 0).toFixed(0);

        const elRate = document.getElementById('stat-escape-rate');
        if (elRate) elRate.innerText = parseFloat(analytics.escapeSuccessRate || 0).toFixed(1) + '%';
      }
    } catch (err) {
      console.warn('Stats refresh error:', err);
    }
  },

  async refreshAllData() {
    await Promise.all([
      Part1Venues.loadAll(),
      Part2Teams.loadAll(),
      Part3Bookings.loadBookings(),
      Part4Analytics.loadAll(),
      this.refreshStats(),
      this.loadChampionsLeaderboard()
    ]);
    this.toast('All records refreshed from MySQL database', 'success');
  },

  // =========================================================================
  // MODAL LOGIC & FORM BINDINGS
  // =========================================================================
  bindModals() {
    document.querySelectorAll('[data-modal-close], .modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) overlay.classList.remove('active');
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });
  },

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  },

  // Prepare Modals with Dynamic Options
  async prepareRoomModal() {
    const select = document.getElementById('r-branch-id');
    select.innerHTML = '<option value="">Loading branches...</option>';
    try {
      const branches = await api.part1.getBranches();
      select.innerHTML = '';
      branches.forEach(b => {
        select.innerHTML += `<option value="${b.branchId}">${b.name} (${b.city})</option>`;
      });
      this.openModal('modal-add-room');
    } catch (err) {
      this.toast('Failed to load branches: ' + err.message, 'error');
    }
  },

  async prepareStaffModal() {
    const select = document.getElementById('s-branch-id');
    select.innerHTML = '<option value="">Loading branches...</option>';
    try {
      const branches = await api.part1.getBranches();
      select.innerHTML = '';
      branches.forEach(b => {
        select.innerHTML += `<option value="${b.branchId}">${b.name}</option>`;
      });
      this.openModal('modal-add-staff');
    } catch (err) {
      this.toast('Failed to load branches: ' + err.message, 'error');
    }
  },

  async prepareClueModal() {
    const roomSelect = document.getElementById('c-room-id');
    const prereqSelect = document.getElementById('c-prereq');
    try {
      const [rooms, clues] = await Promise.all([
        api.part1.getRooms(),
        api.part1.getClues()
      ]);

      roomSelect.innerHTML = '';
      rooms.forEach(r => {
        roomSelect.innerHTML += `<option value="${r.roomId}">${r.themeName} (Branch #${r.branchId})</option>`;
      });

      prereqSelect.innerHTML = '<option value="">None (Root Clue)</option>';
      clues.forEach(c => {
        prereqSelect.innerHTML += `<option value="${c.clueId}">CL-${c.clueId}: ${c.description} (${c.roomTheme})</option>`;
      });

      this.openModal('modal-add-clue');
    } catch (err) {
      this.toast('Failed to prepare clue form: ' + err.message, 'error');
    }
  },

  async preparePlayerModal() {
    const select = document.getElementById('p-team-id');
    select.innerHTML = '<option value="">-- No Team (Free Agent) --</option>';
    try {
      const teams = await api.part2.getTeams();
      teams.forEach(t => {
        select.innerHTML += `<option value="${t.teamId}">${t.teamName} (Size: ${t.teamSize})</option>`;
      });
      this.openModal('modal-add-player');
    } catch (err) {
      this.toast('Failed to load teams: ' + err.message, 'error');
    }
  },

  async prepareBookingModal() {
    const roomSelect = document.getElementById('bk-room-id');
    const teamSelect = document.getElementById('bk-team-id');
    const staffSelect = document.getElementById('bk-staff-id');

    const randCode = 'SESS-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('bk-session-id').value = randCode;

    const now = new Date();
    const plusOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const toIsoLocal = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    document.getElementById('bk-start-time').value = toIsoLocal(now);
    document.getElementById('bk-end-time').value = toIsoLocal(plusOneHour);

    try {
      const [rooms, teams, staffList] = await Promise.all([
        api.part1.getRooms(),
        api.part2.getTeams(),
        api.part1.getStaff()
      ]);

      roomSelect.innerHTML = '';
      rooms.forEach(r => {
        roomSelect.innerHTML += `<option value="${r.roomId}">${r.themeName} ($${parseFloat(r.basePrice).toFixed(0)})</option>`;
      });

      teamSelect.innerHTML = '';
      teams.forEach(t => {
        teamSelect.innerHTML += `<option value="${t.teamId}">🛡️ ${t.teamName} (Members: ${t.teamSize})</option>`;
      });

      staffSelect.innerHTML = '';
      staffList.forEach(s => {
        staffSelect.innerHTML += `<option value="${s.staffId}">👤 ${s.name} (${s.role})</option>`;
      });

      this.openModal('modal-add-booking');
    } catch (err) {
      this.toast('Failed to prepare booking form: ' + err.message, 'error');
    }
  },

  async preparePaymentModal() {
    const sessionSelect = document.getElementById('pay-session-id');
    sessionSelect.innerHTML = '<option value="">Loading sessions...</option>';
    try {
      const bookings = await api.part3.getBookings();
      sessionSelect.innerHTML = '';
      bookings.forEach(b => {
        sessionSelect.innerHTML += `<option value="${b.sessionId}">${b.sessionId} - ${b.roomTheme} (${b.teamName})</option>`;
      });
      this.openModal('modal-add-payment');
    } catch (err) {
      this.toast('Failed to load booking sessions: ' + err.message, 'error');
    }
  },

  // =========================================================================
  // FORM SUBMISSIONS
  // =========================================================================
  bindForms() {
    // 1. Add Branch
    const formBranch = document.getElementById('form-add-branch');
    if (formBranch) {
      formBranch.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await api.part1.createBranch({
            name: document.getElementById('b-name').value,
            city: document.getElementById('b-city').value,
            state: document.getElementById('b-state').value,
            street: document.getElementById('b-street').value,
            zip: document.getElementById('b-zip').value,
            phone: document.getElementById('b-phone').value
          });
          this.toast('Branch created successfully', 'success');
          this.closeModal('modal-add-branch');
          formBranch.reset();
          Part1Venues.renderBranches(document.getElementById('part1-content-area'));
          this.refreshStats();
        } catch (err) {
          this.toast('Error creating branch: ' + err.message, 'error');
        }
      });
    }

    // 2. Add Room
    const formRoom = document.getElementById('form-add-room');
    if (formRoom) {
      formRoom.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await api.part1.createRoom({
            branchId: document.getElementById('r-branch-id').value,
            themeName: document.getElementById('r-theme').value,
            difficulty: document.getElementById('r-diff').value,
            capacity: document.getElementById('r-cap').value,
            basePrice: document.getElementById('r-price').value,
            duration: document.getElementById('r-dur').value,
            status: document.getElementById('r-status').value
          });
          this.toast('Escape room created successfully', 'success');
          this.closeModal('modal-add-room');
          formRoom.reset();
          Part1Venues.renderRooms(document.getElementById('part1-content-area'));
          this.refreshStats();
        } catch (err) {
          this.toast('Error creating room: ' + err.message, 'error');
        }
      });
    }

    // 3. Add Staff
    const formStaff = document.getElementById('form-add-staff');
    if (formStaff) {
      formStaff.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await api.part1.createStaff({
            branchId: document.getElementById('s-branch-id').value,
            name: document.getElementById('s-name').value,
            role: document.getElementById('s-role').value,
            payTime: document.getElementById('s-paytime').value,
            inTime: document.getElementById('s-intime').value,
            outTime: document.getElementById('s-outtime').value
          });
          this.toast('Staff registered successfully', 'success');
          this.closeModal('modal-add-staff');
          formStaff.reset();
          Part1Venues.renderStaff(document.getElementById('part1-content-area'));
        } catch (err) {
          this.toast('Error creating staff: ' + err.message, 'error');
        }
      });
    }

    // 4. Add Clue
    const formClue = document.getElementById('form-add-clue');
    if (formClue) {
      formClue.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await api.part1.createClue({
            roomId: document.getElementById('c-room-id').value,
            description: document.getElementById('c-desc').value,
            hint: document.getElementById('c-hint').value,
            prereqClueId: document.getElementById('c-prereq').value || null,
            points: document.getElementById('c-points').value
          });
          this.toast('Clue added successfully', 'success');
          this.closeModal('modal-add-clue');
          formClue.reset();
          Part1Venues.renderClues(document.getElementById('part1-content-area'));
        } catch (err) {
          this.toast('Error creating clue: ' + err.message, 'error');
        }
      });
    }

    // 5. Register Team
    const formTeam = document.getElementById('form-add-team');
    if (formTeam) {
      formTeam.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await api.part2.createTeam(document.getElementById('t-name').value);
          this.toast('Team registered successfully', 'success');
          this.closeModal('modal-add-team');
          formTeam.reset();
          Part2Teams.loadAll();
          this.refreshStats();
        } catch (err) {
          this.toast('Error creating team: ' + err.message, 'error');
        }
      });
    }

    // 6. Register Player
    const formPlayer = document.getElementById('form-add-player');
    if (formPlayer) {
      formPlayer.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await api.part2.createPlayer({
            name: document.getElementById('p-name').value,
            email: document.getElementById('p-email').value,
            phone: document.getElementById('p-phone').value,
            age: document.getElementById('p-age').value || null,
            teamId: document.getElementById('p-team-id').value || null
          });
          this.toast('Player registered successfully', 'success');
          this.closeModal('modal-add-player');
          formPlayer.reset();
          Part2Teams.loadAll();
          this.refreshStats();
        } catch (err) {
          this.toast('Error registering player: ' + err.message, 'error');
        }
      });
    }

    // 7. Assign Player
    const formAssign = document.getElementById('form-assign-player');
    if (formAssign) {
      formAssign.addEventListener('submit', async (e) => {
        e.preventDefault();
        const teamId = document.getElementById('assign-team-id').value;
        const playerId = document.getElementById('assign-player-select').value;
        try {
          await api.part2.assignPlayerToTeam(playerId, teamId);
          this.toast('Player assigned to team', 'success');
          this.closeModal('modal-assign-player');
          Part2Teams.loadAll();
          this.refreshStats();
        } catch (err) {
          this.toast('Assignment error: ' + err.message, 'error');
        }
      });
    }

    // 8. Book New Mission
    const formBooking = document.getElementById('form-add-booking');
    if (formBooking) {
      formBooking.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const bookingData = {
            sessionId: document.getElementById('bk-session-id').value,
            roomId: document.getElementById('bk-room-id').value,
            teamId: document.getElementById('bk-team-id').value,
            staffId: document.getElementById('bk-staff-id').value,
            startTime: document.getElementById('bk-start-time').value.replace('T', ' ') + ':00',
            slotEndTime: document.getElementById('bk-end-time').value.replace('T', ' ') + ':00',
            status: 'Scheduled',
            outcome: 'Pending'
          };
          await api.part3.createBooking(bookingData);
          this.toast('Mission booked successfully', 'success');
          this.closeModal('modal-add-booking');
          Part3Bookings.loadBookings();
          this.refreshStats();
        } catch (err) {
          this.toast('Booking error: ' + err.message, 'error');
        }
      });
    }

    // 9. Record Payment
    const formPayment = document.getElementById('form-add-payment');
    if (formPayment) {
      formPayment.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await api.part4.createPayment({
            sessionId: document.getElementById('pay-session-id').value,
            amount: document.getElementById('pay-amount').value,
            paymentMode: document.getElementById('pay-mode').value,
            paymentStatus: document.getElementById('pay-status').value
          });
          this.toast('Payment recorded successfully', 'success');
          this.closeModal('modal-add-payment');
          formPayment.reset();
          Part4Analytics.renderPayments(document.getElementById('part4-content-area'));
          this.refreshStats();
        } catch (err) {
          this.toast('Payment error: ' + err.message, 'error');
        }
      });
    }
  },

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    else if (type === 'error') icon = '✕';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

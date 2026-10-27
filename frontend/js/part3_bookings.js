/**
 * Bookings & Operations Module
 * Clean, plain, working CRUD tables for:
 * - Bookings Schedule
 * - Live Game Master Console with Stopwatch Countdown & Hints
 */

const Part3Bookings = {
  activeSession: null,
  timerInterval: null,
  timerSecondsRemaining: 3600,
  timerRunning: false,
  cachedBookings: [],

  async init() {
    this.bindEvents();
    await this.loadBookings();
  },

  bindEvents() {
    const startBtn = document.getElementById('timer-start-btn');
    const pauseBtn = document.getElementById('timer-pause-btn');
    const resetBtn = document.getElementById('timer-reset-btn');

    if (startBtn) startBtn.addEventListener('click', () => this.startTimer());
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseTimer());
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetTimer(3600));
  },

  async loadBookings() {
    const container = document.getElementById('bookings-table-body');
    if (!container) return;

    container.innerHTML = '<tr><td colspan="10" class="text-center" style="padding:2rem;"><span class="pulse-dot"></span> Loading Bookings...</td></tr>';
    try {
      const bookings = await api.part3.getBookings();
      this.cachedBookings = bookings || [];
      App.updateToolbarCount(this.cachedBookings.length);

      if (!bookings || bookings.length === 0) {
        container.innerHTML = '<tr><td colspan="10" class="text-center" style="padding:2.5rem; color:var(--text-muted);">No bookings scheduled. Click (+) to schedule a mission.</td></tr>';
        return;
      }

      let html = '';
      bookings.forEach(b => {
        html += `
          <tr data-searchable="${b.sessionId} ${b.roomTheme} ${b.teamName} ${b.staffName} ${b.status} ${b.outcome}">
            <td class="col-checkbox"><input type="checkbox" class="table-checkbox"></td>
            <td><strong class="record-id">${b.sessionId}</strong></td>
            <td><strong>${b.roomTheme}</strong></td>
            <td>🛡️ ${b.teamName}</td>
            <td>👤 ${b.staffName}</td>
            <td><small style="color:var(--text-muted); font-family:var(--font-mono);">${b.startTime}</small></td>
            <td><span class="badge badge-gray">${b.status}</span></td>
            <td><span class="badge badge-gray">${b.outcome}</span></td>
            <td><strong>${b.hintsUsed}</strong></td>
            <td class="col-actions">
              <button class="btn-kebab" onclick="App.toggleKebabMenu(event, 'kebab-bk-${b.bookingId}')">⋮</button>
              <div class="kebab-menu" id="kebab-bk-${b.bookingId}">
                <button class="kebab-item" onclick="Part3Bookings.openControlRoom('${b.sessionId}')">
                  🎮 Host Console
                </button>
                <button class="kebab-item" onclick="Part3Bookings.promptStatusChange('${b.sessionId}', '${b.status}')">
                  ✏️ Update Status
                </button>
                <button class="kebab-item item-danger" onclick="Part3Bookings.cancelBooking(${b.bookingId})">
                  🗑️ Cancel Session
                </button>
              </div>
            </td>
          </tr>
        `;
      });
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<tr><td colspan="10" class="text-center" style="color:var(--color-red); padding:2rem;">Error: ${err.message}</td></tr>`;
    }
  },

  async promptStatusChange(sessionId, currentStatus) {
    App.closeAllKebabMenus();
    const newStatus = prompt(`Change status for Session ${sessionId} (Scheduled / In Progress / Completed / Cancelled):`, currentStatus);
    if (!newStatus || newStatus === currentStatus) return;

    try {
      await api.part3.updateBookingStatus(sessionId, newStatus);
      App.toast(`Session status updated to ${newStatus}`, 'success');
      this.loadBookings();
      App.refreshStats();
    } catch (err) {
      App.toast('Update error: ' + err.message, 'error');
    }
  },

  async cancelBooking(bookingId) {
    App.closeAllKebabMenus();
    if (!confirm(`Cancel Booking #${bookingId}?`)) return;

    try {
      await api.part3.deleteBooking(bookingId);
      App.toast('Booking cancelled', 'success');
      this.loadBookings();
      App.refreshStats();
    } catch (err) {
      App.toast('Delete error: ' + err.message, 'error');
    }
  },

  // =========================================================================
  // LIVE GAME MASTER CONTROL ROOM
  // =========================================================================
  async openControlRoom(sessionId) {
    App.closeAllKebabMenus();
    try {
      const booking = await api.part3.getBookings(sessionId);
      this.activeSession = booking;

      if (document.getElementById('cr-session-id')) document.getElementById('cr-session-id').innerText = booking.sessionId;
      if (document.getElementById('cr-room-theme')) document.getElementById('cr-room-theme').innerText = booking.roomTheme;
      if (document.getElementById('cr-team-name')) document.getElementById('cr-team-name').innerText = booking.teamName;
      if (document.getElementById('cr-staff-name')) document.getElementById('cr-staff-name').innerText = booking.staffName;
      if (document.getElementById('cr-session-status')) document.getElementById('cr-session-status').innerText = booking.status;

      this.resetTimer(60 * 60);
      await this.loadCluesForSession(booking.roomId, booking.sessionId);

      App.openModal('modal-control-room');
    } catch (err) {
      App.toast('Failed to load session details: ' + err.message, 'error');
    }
  },

  async loadCluesForSession(roomId, sessionId) {
    const container = document.getElementById('cr-clues-container');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:1rem;"><span class="pulse-dot"></span> Loading clues...</div>';
    try {
      const [allClues, usedHints] = await Promise.all([
        api.part1.getClues(),
        api.part3.getHints(sessionId).catch(() => [])
      ]);

      const roomClues = allClues.filter(c => c.roomId === roomId);
      const usedClueIds = new Set(usedHints.map(h => h.clueId));

      if (roomClues.length === 0) {
        container.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); text-align:center;">No clues configured for this chamber.</div>';
        return;
      }

      let html = '<div style="display:flex; flex-direction:column; gap:0.4rem;">';
      roomClues.forEach(c => {
        const isDispatched = usedClueIds.has(c.clueId);

        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid var(--table-border); padding:0.4rem 0.6rem; border-radius:var(--radius-sm); font-size:0.8rem;">
            <div>
              <strong>CL-${c.clueId}: ${c.description}</strong>
              <div style="color:var(--text-muted); font-size:0.75rem;">Hint: "${c.hint}" &bull; ${c.points} pts</div>
            </div>
            ${isDispatched 
              ? '<span class="badge badge-gray">Sent</span>'
              : `<button class="btn btn-secondary btn-sm" onclick="Part3Bookings.dispatchHint(${c.clueId}, '${sessionId}')">💡 Dispatch</button>`
            }
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div style="color:var(--color-red); font-size:0.8rem;">Error loading clues: ${err.message}</div>`;
    }
  },

  async dispatchHint(clueId, sessionId) {
    try {
      await api.part3.logHint(clueId, sessionId);
      App.toast('Hint recorded', 'success');
      if (this.activeSession) {
        await this.loadCluesForSession(this.activeSession.roomId, sessionId);
      }
      this.loadBookings();
    } catch (err) {
      App.toast('Failed to dispatch hint: ' + err.message, 'error');
    }
  },

  startTimer() {
    if (this.timerRunning) return;
    this.timerRunning = true;
    this.timerInterval = setInterval(() => {
      if (this.timerSecondsRemaining > 0) {
        this.timerSecondsRemaining--;
        this.updateTimerDisplay();
      } else {
        this.pauseTimer();
        App.toast('Time expired!', 'error');
      }
    }, 1000);
  },

  pauseTimer() {
    this.timerRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
  },

  resetTimer(seconds = 3600) {
    this.pauseTimer();
    this.timerSecondsRemaining = seconds;
    this.updateTimerDisplay();
  },

  updateTimerDisplay() {
    const mins = Math.floor(this.timerSecondsRemaining / 60);
    const secs = this.timerSecondsRemaining % 60;
    const str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const el = document.getElementById('cr-timer-text');
    if (el) el.innerText = str;
  },

  async finalizeSession(outcome) {
    if (!this.activeSession) return;
    const sessionId = this.activeSession.sessionId;
    const elapsedSeconds = 3600 - this.timerSecondsRemaining;
    const completeTimeMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    if (!confirm(`Finalize Session ${sessionId} as "${outcome}" (${completeTimeMinutes} mins)?`)) return;

    try {
      this.pauseTimer();
      await api.part3.completeSession(sessionId, completeTimeMinutes, outcome);
      App.toast(`Session finalized as ${outcome}`, 'success');
      App.closeModal('modal-control-room');
      this.loadBookings();
      App.refreshStats();
      App.loadChampionsLeaderboard();
    } catch (err) {
      App.toast('Finalization error: ' + err.message, 'error');
    }
  }
};

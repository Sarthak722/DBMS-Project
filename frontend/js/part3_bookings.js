/**
 * Part 3: Bookings & Live Game Operations Module
 * Manages Booking Schedules, Session Hosting, Live Stopwatch Timer,
 * Real-time Hint Usage Logger, and Game Outcome Recorder (Escaped/Failed/Timeout).
 */

const Part3Bookings = {
  activeSession: null,
  timerInterval: null,
  timerSecondsRemaining: 3600,
  timerRunning: false,

  async init() {
    this.bindEvents();
    await this.loadBookings();
  },

  bindEvents() {
    // Timer controls in Control Room Modal
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

    container.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:2rem;"><span class="pulse-dot"></span> Loading Bookings...</td></tr>';
    try {
      const bookings = await api.part3.getBookings();
      if (!bookings || bookings.length === 0) {
        container.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:2rem;">No bookings found. Click "Book New Mission" to schedule one.</td></tr>';
        return;
      }

      let html = '';
      bookings.forEach(b => {
        const statusClass = `status-${b.status.toLowerCase().replace(/[^a-z]/g, '')}`;
        const outcomeClass = `outcome-${b.outcome.toLowerCase()}`;

        html += `
          <tr>
            <td><strong style="color:var(--accent-cyan); font-family:var(--font-mono);">${b.sessionId}</strong></td>
            <td><strong>${b.roomTheme}</strong></td>
            <td>🛡️ ${b.teamName}</td>
            <td>👤 ${b.staffName}</td>
            <td><small style="color:var(--text-muted); font-family:var(--font-mono);">${b.startTime}</small></td>
            <td><span class="status-pill ${statusClass}">${b.status}</span></td>
            <td><span class="card-badge ${outcomeClass}">${b.outcome}</span></td>
            <td><strong style="color:var(--accent-amber); font-family:var(--font-mono);">${b.hintsUsed}</strong></td>
            <td>
              <div style="display:flex; gap:0.4rem;">
                <button class="btn btn-cyan btn-sm" onclick="Part3Bookings.openControlRoom('${b.sessionId}')">🎮 Host Console</button>
                <button class="btn btn-danger btn-sm" onclick="Part3Bookings.cancelBooking(${b.bookingId})">Cancel</button>
              </div>
            </td>
          </tr>
        `;
      });
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<tr><td colspan="9" style="color:var(--accent-rose); text-align:center;">Error: ${err.message}</td></tr>`;
    }
  },

  async cancelBooking(bookingId) {
    if (!confirm('Cancel / delete this booking session?')) return;
    try {
      await api.part3.deleteBooking(bookingId);
      App.toast('Booking cancelled', 'success');
      this.loadBookings();
      App.refreshStats();
    } catch (err) {
      App.toast('Error cancelling booking: ' + err.message, 'error');
    }
  },

  // ----------------------------------------------------
  // Live Game Master Control Room
  // ----------------------------------------------------
  async openControlRoom(sessionId) {
    try {
      const booking = await api.part3.getBookings(sessionId);
      this.activeSession = booking;

      if (document.getElementById('cr-session-id')) document.getElementById('cr-session-id').innerText = booking.sessionId;
      if (document.getElementById('cr-room-theme')) document.getElementById('cr-room-theme').innerText = booking.roomTheme;
      if (document.getElementById('cr-team-name')) document.getElementById('cr-team-name').innerText = booking.teamName;
      if (document.getElementById('cr-staff-name')) document.getElementById('cr-staff-name').innerText = booking.staffName;
      if (document.getElementById('cr-session-status')) document.getElementById('cr-session-status').innerText = booking.status;
      if (document.getElementById('cr-outcome')) document.getElementById('cr-outcome').innerText = booking.outcome;

      // Reset & set timer based on default room duration or remaining
      this.resetTimer(60 * 60);

      // Load Hints History & Clues for this room
      await this.loadControlRoomClues(booking.roomId, booking.sessionId);

      App.openModal('modal-control-room');
    } catch (err) {
      App.toast('Failed to launch control room: ' + err.message, 'error');
    }
  },

  async loadControlRoomClues(roomId, sessionId) {
    const listContainer = document.getElementById('cr-clues-container');
    if (!listContainer) return;

    listContainer.innerHTML = '<div style="text-align:center; padding:1rem;"><span class="pulse-dot"></span> Loading Room Puzzles & Hints...</div>';
    try {
      const allClues = await api.part1.getClues();
      const roomClues = allClues.filter(c => c.roomId === roomId);
      const usedHints = await api.part3.getHints(sessionId);

      if (roomClues.length === 0) {
        listContainer.innerHTML = '<div style="color:var(--text-dim); font-size:0.85rem;">No clues registered for this room yet.</div>';
        return;
      }

      let html = '<div class="clue-feed">';
      roomClues.forEach(c => {
        const hintCount = usedHints.filter(h => h.clueId === c.clueId).length;
        html += `
          <div class="clue-item-row ${hintCount > 0 ? 'unlocked' : ''}">
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                <span class="card-badge badge-medium">Clue #${c.clueId}</span>
                <strong>${c.description}</strong>
                ${c.prereqClueId ? `<span class="card-badge badge-hard">Req #${c.prereqClueId}</span>` : ''}
              </div>
              <div style="font-size:0.85rem; color:var(--accent-amber); font-style:italic;">
                💡 Hint: "${c.hint}"
              </div>
              <div style="font-size:0.75rem; color:var(--text-dim); margin-top:0.2rem;">
                Hints dispatched this session: <strong>${hintCount}</strong>
              </div>
            </div>
            <div>
              <button class="btn btn-cyan btn-sm" onclick="Part3Bookings.dispatchHint(${c.clueId}, '${sessionId}')">
                📢 Dispatch Hint
              </button>
            </div>
          </div>
        `;
      });
      html += '</div>';
      listContainer.innerHTML = html;
    } catch (err) {
      listContainer.innerHTML = `<div style="color:var(--accent-rose);">Error loading clues: ${err.message}</div>`;
    }
  },

  async dispatchHint(clueId, sessionId) {
    try {
      await api.part3.logHint(clueId, sessionId);
      App.toast('Hint dispatched and recorded into `hint_usage` table!', 'success');
      if (this.activeSession) {
        this.loadControlRoomClues(this.activeSession.roomId, sessionId);
      }
    } catch (err) {
      App.toast('Error logging hint: ' + err.message, 'error');
    }
  },

  // Stopwatch / Countdown Timer
  startTimer() {
    if (this.timerRunning) return;
    this.timerRunning = true;
    if (this.activeSession && this.activeSession.status !== 'In-Progress') {
      api.part3.updateBookingStatus(this.activeSession.sessionId, 'In-Progress')
        .then(() => {
          document.getElementById('cr-session-status').innerText = 'In-Progress';
          App.toast('Session status switched to In-Progress', 'info');
        })
        .catch(console.error);
    }

    this.timerInterval = setInterval(() => {
      if (this.timerSecondsRemaining > 0) {
        this.timerSecondsRemaining--;
        this.updateTimerDisplay();
      } else {
        this.pauseTimer();
        App.toast('⏰ TIME EXPIRED! Mission has timed out.', 'error');
      }
    }, 1000);
  },

  pauseTimer() {
    this.timerRunning = false;
    clearInterval(this.timerInterval);
  },

  resetTimer(seconds) {
    this.pauseTimer();
    this.timerSecondsRemaining = seconds;
    this.updateTimerDisplay();
  },

  updateTimerDisplay() {
    const mins = Math.floor(this.timerSecondsRemaining / 60);
    const secs = this.timerSecondsRemaining % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const el = document.getElementById('cr-timer-text');
    if (el) el.innerText = formatted;
  },

  // Finalize Session Outcome
  async finalizeSession(outcome) {
    if (!this.activeSession) return;
    const timeUsedSeconds = 3600 - this.timerSecondsRemaining;
    const mins = Math.floor(timeUsedSeconds / 60);
    const secs = timeUsedSeconds % 60;
    const completeTime = `00:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    try {
      await api.part3.completeSession(this.activeSession.sessionId, completeTime, outcome);
      this.pauseTimer();
      App.toast(`Session marked as ${outcome}! Time: ${completeTime}`, 'success');
      App.closeModal('modal-control-room');
      this.loadBookings();
      App.refreshStats();
    } catch (err) {
      App.toast('Error completing session: ' + err.message, 'error');
    }
  }
};

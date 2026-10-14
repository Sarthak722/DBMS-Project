/**
 * Part 4: Billing, Payments & Analytics Module
 * Manages Financial Transactions, Revenue Summaries,
 * Escape Rate Leaderboards, and View Queries.
 */

const Part4Analytics = {
  currentSubTab: 'payments',
  cachedAnalytics: null,

  async init() {
    this.bindEvents();
    await this.loadAll();
  },

  bindEvents() {
    document.querySelectorAll('[data-subtab-part4]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-subtab-part4]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentSubTab = e.currentTarget.dataset.subtabPart4;
        this.renderCurrentSubTab();
      });
    });
  },

  async loadAll() {
    try {
      this.renderCurrentSubTab();
    } catch (err) {
      App.toast('Failed to load analytics: ' + err.message, 'error');
    }
  },

  renderCurrentSubTab() {
    const container = document.getElementById('part4-content-area');
    if (!container) return;

    if (this.currentSubTab === 'payments') {
      this.renderPayments(container);
    } else if (this.currentSubTab === 'analytics') {
      this.renderAnalytics(container);
    } else if (this.currentSubTab === 'leaderboard') {
      this.renderLeaderboard(container);
    } else if (this.currentSubTab === 'phoneviews') {
      this.renderPhoneViews(container);
    }
  },

  // ----------------------------------------------------
  // Render Payments Table
  // ----------------------------------------------------
  async renderPayments(container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Loading Payments...</div>';
    try {
      const payments = await api.part4.getPayments();
      if (!payments || payments.length === 0) {
        container.innerHTML = '<div class="custom-card" style="text-align:center;">No payment transactions recorded yet.</div>';
        return;
      }

      let html = `
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Session ID</th>
                <th>Team</th>
                <th>Room Theme</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Quick Action</th>
              </tr>
            </thead>
            <tbody>
      `;
      payments.forEach(p => {
        const isPaid = p.paymentStatus === 'Completed';
        const statusBadge = isPaid ? 'badge-available' : 'badge-maintenance';

        html += `
          <tr>
            <td><code>#${p.paymentId}</code></td>
            <td><strong style="color:var(--accent-cyan); font-family:var(--font-mono);">${p.sessionId}</strong></td>
            <td>🛡️ ${p.teamName}</td>
            <td>${p.roomTheme}</td>
            <td><strong style="color:var(--accent-emerald); font-size:1rem; font-family:var(--font-mono);">$${p.amount.toFixed(2)}</strong></td>
            <td><span class="card-badge badge-medium">${p.paymentMode}</span></td>
            <td><span class="card-badge ${statusBadge}">${p.paymentStatus}</span></td>
            <td><small style="color:var(--text-dim);">${p.timestamp || 'Recent'}</small></td>
            <td>
              ${!isPaid ? `
                <button class="btn btn-emerald btn-sm" onclick="Part4Analytics.markPaid(${p.paymentId}, '${p.paymentMode}')">
                  ✓ Mark Paid
                </button>
              ` : `
                <button class="btn btn-secondary btn-sm" onclick="Part4Analytics.promptChangeStatus(${p.paymentId}, '${p.paymentStatus}', '${p.paymentMode}')">
                  Edit
                </button>
              `}
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

  async markPaid(paymentId, currentMode) {
    try {
      await api.part4.updatePaymentStatus(paymentId, 'Completed', currentMode || 'UPI');
      App.toast('Payment marked as Completed', 'success');
      this.renderPayments(document.getElementById('part4-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Error updating payment: ' + err.message, 'error');
    }
  },

  async promptChangeStatus(paymentId, curStatus, curMode) {
    const newStatus = prompt('Enter payment status (Completed, Pending, Refunded):', curStatus);
    if (!newStatus) return;
    const newMode = prompt('Enter payment mode (Cash, UPI, Credit Card, Debit Card, Net Banking):', curMode);
    if (!newMode) return;

    try {
      await api.part4.updatePaymentStatus(paymentId, newStatus, newMode);
      App.toast('Payment record updated', 'success');
      this.renderPayments(document.getElementById('part4-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Error updating payment: ' + err.message, 'error');
    }
  },

  // ----------------------------------------------------
  // Render Analytics & Financial Reports
  // ----------------------------------------------------
  async renderAnalytics(container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Calculating Financial Metrics & Aggregations...</div>';
    try {
      const data = await api.part4.getAnalytics();
      this.cachedAnalytics = data;

      let html = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1.25rem; margin-bottom:2rem;">
          <div class="custom-card">
            <span class="meta-label">Total Realized Revenue</span>
            <div style="font-size:2rem; font-weight:800; color:var(--accent-emerald); font-family:var(--font-mono); margin:0.5rem 0;">
              $${data.totalRevenue.toFixed(2)}
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted);">From settled payments</span>
          </div>

          <div class="custom-card">
            <span class="meta-label">Escape Rate %</span>
            <div style="font-size:2rem; font-weight:800; color:var(--accent-cyan); font-family:var(--font-mono); margin:0.5rem 0;">
              ${data.escapeRate}%
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted);">Teams successfully escaped</span>
          </div>

          <div class="custom-card">
            <span class="meta-label">Total Game Sessions</span>
            <div style="font-size:2rem; font-weight:800; color:var(--accent-purple); font-family:var(--font-mono); margin:0.5rem 0;">
              ${data.totalBookings}
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted);">Recorded bookings</span>
          </div>

          <div class="custom-card">
            <span class="meta-label">Registered Players</span>
            <div style="font-size:2rem; font-weight:800; color:var(--accent-amber); font-family:var(--font-mono); margin:0.5rem 0;">
              ${data.totalPlayers}
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted);">Across ${data.totalTeams} active teams</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap:1.5rem; margin-bottom:2rem;">
          <div class="custom-card">
            <h4 style="font-size:1.05rem; font-weight:700; margin-bottom:1rem;">💳 Revenue by Payment Mode</h4>
            <div class="card-meta-list">
              ${data.revenueByMode && data.revenueByMode.length > 0 ?
                data.revenueByMode.map(m => `
                  <div class="meta-item">
                    <span class="meta-label">${m.mode} (${m.count} tx)</span>
                    <span class="meta-value" style="color:var(--accent-emerald);">$${m.amount.toFixed(2)}</span>
                  </div>
                `).join('') : '<span style="color:var(--text-dim);">No transactions yet.</span>'}
            </div>
          </div>

          <div class="custom-card">
            <h4 style="font-size:1.05rem; font-weight:700; margin-bottom:1rem;">🏢 Revenue by Physical Branch</h4>
            <div class="card-meta-list">
              ${data.revenueByBranch && data.revenueByBranch.length > 0 ?
                data.revenueByBranch.map(b => `
                  <div class="meta-item">
                    <span class="meta-label">${b.branchName} (${b.transactions} tx)</span>
                    <span class="meta-value" style="color:var(--accent-cyan);">$${b.revenue.toFixed(2)}</span>
                  </div>
                `).join('') : '<span style="color:var(--text-dim);">No branch revenue data yet.</span>'}
            </div>
          </div>
        </div>
      `;
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="custom-card" style="color:var(--accent-rose);">Error: ${err.message}</div>`;
    }
  },

  // ----------------------------------------------------
  // Render Leaderboard
  // ----------------------------------------------------
  async renderLeaderboard(container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Querying Hall of Fame Escape Leaderboard...</div>';
    try {
      const leaderboard = await api.part4.getLeaderboard();
      if (!leaderboard || leaderboard.length === 0) {
        container.innerHTML = '<div class="custom-card" style="text-align:center;">No teams have escaped yet! Complete an in-progress game to set a record.</div>';
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
        const rankIcon = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`;

        html += `
          <tr>
            <td><span class="rank-badge ${rankClass}">${rankIcon}</span></td>
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
  // Render Phone Views (branch_phones & player_phones)
  // ----------------------------------------------------
  async renderPhoneViews(container) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="pulse-dot"></span> Querying Views `branch_phones` & `player_phones`...</div>';
    try {
      const res = await api.part4.getPhoneViews();
      const bp = res.branchPhones || [];
      const pp = res.playerPhones || [];

      let html = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap:1.5rem;">
          <div>
            <h4 style="margin-bottom:0.75rem; color:var(--accent-cyan); font-family:var(--font-mono); font-size:0.9rem;">
              ⚡ SQL View: <code>branch_phones</code>
            </h4>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Branch ID</th>
                    <th>Branch Name</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  ${bp.map(b => `
                    <tr>
                      <td><code>#${b.branchId}</code></td>
                      <td><strong>${b.name}</strong></td>
                      <td><a href="tel:${b.phone}" style="color:var(--accent-emerald); text-decoration:none;">${b.phone}</a></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 style="margin-bottom:0.75rem; color:var(--accent-purple); font-family:var(--font-mono); font-size:0.9rem;">
              ⚡ SQL View: <code>player_phones</code>
            </h4>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Player ID</th>
                    <th>Player Name</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  ${pp.map(p => `
                    <tr>
                      <td><code>#${p.playerId}</code></td>
                      <td><strong>${p.name}</strong></td>
                      <td><a href="tel:${p.phone}" style="color:var(--accent-emerald); text-decoration:none;">${p.phone}</a></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="custom-card" style="color:var(--accent-rose);">Error: ${err.message}</div>`;
    }
  }
};

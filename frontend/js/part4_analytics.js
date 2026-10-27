/**
 * Billing & Analytics Module
 * Clean, plain, working CRUD tables for:
 * - Payments Ledger
 * - Financial Analytics Summary
 * - SQL Views: branch_phones & player_phones
 */

const Part4Analytics = {
  currentSubTab: 'payments',
  cachedPayments: [],
  cachedAnalytics: null,
  cachedViews: null,

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
      this.cachedPayments = await api.part4.getPayments();
      this.renderCurrentSubTab();
    } catch (err) {
      console.warn('Billing load error:', err);
    }
  },

  renderCurrentSubTab() {
    const container = document.getElementById('part4-content-area');
    if (!container) return;

    if (this.currentSubTab === 'payments') {
      this.renderPayments(container);
    } else if (this.currentSubTab === 'analytics') {
      this.renderAnalytics(container);
    } else if (this.currentSubTab === 'phoneviews') {
      this.renderPhoneViews(container);
    }
  },

  // =========================================================================
  // 1. PAYMENTS LEDGER TABLE
  // =========================================================================
  async renderPayments(container) {
    container.innerHTML = '<div class="table-card"><div style="text-align:center; padding:2rem;"><span class="pulse-dot"></span> Loading Payments...</div></div>';
    try {
      const payments = await api.part4.getPayments();
      this.cachedPayments = payments || [];
      App.updateToolbarCount(this.cachedPayments.length);

      if (!payments || payments.length === 0) {
        container.innerHTML = `<div class="table-card" style="padding:2.5rem; text-align:center;">No payment transactions recorded yet. Click (+) to record a payment.</div>`;
        return;
      }

      let html = `
        <div class="table-card">
          <div class="table-responsive">
            <table class="crud-table" id="table-payments">
              <thead>
                <tr>
                  <th class="col-checkbox"><input type="checkbox" class="table-checkbox" onclick="App.toggleAllCheckboxes(this)"></th>
                  <th class="sortable">Tx ID <span class="th-arrow">▾</span></th>
                  <th class="sortable">Session ID <span class="th-arrow">▾</span></th>
                  <th class="sortable">Squad <span class="th-arrow">▾</span></th>
                  <th class="sortable">Room Theme <span class="th-arrow">▾</span></th>
                  <th class="sortable">Amount Paid <span class="th-arrow">▾</span></th>
                  <th class="sortable">Payment Mode <span class="th-arrow">▾</span></th>
                  <th class="sortable">Status <span class="th-arrow">▾</span></th>
                  <th class="sortable">Timestamp <span class="th-arrow">▾</span></th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
      `;

      payments.forEach(p => {
        const isPaid = p.paymentStatus === 'Completed';

        html += `
          <tr data-searchable="${p.paymentId} ${p.sessionId} ${p.teamName} ${p.roomTheme} ${p.paymentMode} ${p.paymentStatus}">
            <td class="col-checkbox"><input type="checkbox" class="table-checkbox"></td>
            <td><strong class="record-id">TX-${String(p.paymentId).padStart(4, '0')}</strong></td>
            <td><strong style="color:var(--text-dark); font-family:var(--font-mono);">${p.sessionId}</strong></td>
            <td>🛡️ ${p.teamName}</td>
            <td>${p.roomTheme}</td>
            <td><strong>$${parseFloat(p.amount).toFixed(2)}</strong></td>
            <td>${p.paymentMode}</td>
            <td><span class="badge badge-gray">${p.paymentStatus}</span></td>
            <td><small style="color:var(--text-muted); font-family:var(--font-mono);">${p.timestamp ? p.timestamp.substring(0, 16) : 'Recent'}</small></td>
            <td class="col-actions">
              <button class="btn-kebab" onclick="App.toggleKebabMenu(event, 'kebab-pay-${p.paymentId}')">⋮</button>
              <div class="kebab-menu" id="kebab-pay-${p.paymentId}">
                ${!isPaid ? `
                  <button class="kebab-item" onclick="Part4Analytics.markPaid(${p.paymentId}, '${p.paymentMode}')">
                    ✓ Mark Paid
                  </button>
                ` : ''}
                <button class="kebab-item" onclick="Part4Analytics.promptChangeStatus(${p.paymentId}, '${p.paymentStatus}', '${p.paymentMode}')">
                  ✏️ Edit Status
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

  async markPaid(paymentId, paymentMode) {
    App.closeAllKebabMenus();
    try {
      await api.part4.updatePaymentStatus(paymentId, 'Completed', paymentMode);
      App.toast(`Payment #${paymentId} marked as Completed`, 'success');
      this.renderPayments(document.getElementById('part4-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Update error: ' + err.message, 'error');
    }
  },

  async promptChangeStatus(paymentId, currentStatus, currentMode) {
    App.closeAllKebabMenus();
    const newStatus = prompt(`Change status for Payment #${paymentId} (Completed / Pending / Refunded):`, currentStatus);
    if (!newStatus || newStatus === currentStatus) return;

    const newMode = prompt(`Payment mode (Card / UPI / Cash / NetBanking):`, currentMode) || currentMode;

    try {
      await api.part4.updatePaymentStatus(paymentId, newStatus, newMode);
      App.toast(`Payment updated to ${newStatus}`, 'success');
      this.renderPayments(document.getElementById('part4-content-area'));
      App.refreshStats();
    } catch (err) {
      App.toast('Update failed: ' + err.message, 'error');
    }
  },

  // =========================================================================
  // 2. FINANCIAL ANALYTICS
  // =========================================================================
  async renderAnalytics(container) {
    container.innerHTML = '<div class="table-card"><div style="text-align:center; padding:2rem;"><span class="pulse-dot"></span> Calculating Analytics...</div></div>';
    try {
      const summary = await api.part4.getAnalytics();
      this.cachedAnalytics = summary;
      App.updateToolbarCount(undefined);

      let html = `
        <div class="stats-cards-grid" style="margin-bottom:1.5rem;">
          <div class="stat-card">
            <div class="stat-icon stat-icon-green">💰</div>
            <div>
              <div class="stat-title">Realized Revenue</div>
              <div class="stat-number">$${parseFloat(summary.totalRevenue || 0).toFixed(2)}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-amber">⏳</div>
            <div>
              <div class="stat-title">Pending Revenue</div>
              <div class="stat-number">$${parseFloat(summary.pendingRevenue || 0).toFixed(2)}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-blue">📊</div>
            <div>
              <div class="stat-title">Avg Duration</div>
              <div class="stat-number">${parseFloat(summary.avgCompletionTime || 0).toFixed(1)}m</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon stat-icon-purple">🎯</div>
            <div>
              <div class="stat-title">Success Rate</div>
              <div class="stat-number">${parseFloat(summary.escapeSuccessRate || 0).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div class="card-panel">
          <div class="panel-header">
            <h3 class="panel-title">🏢 Branch Revenue Breakdown</h3>
          </div>
          <div class="panel-body" style="padding:0;">
            <table class="crud-table">
              <thead>
                <tr>
                  <th>Branch / Venue</th>
                  <th>Concluded Missions</th>
                  <th>Realized Revenue</th>
                </tr>
              </thead>
              <tbody>
      `;

      if (summary.branchRevenue && summary.branchRevenue.length > 0) {
        summary.branchRevenue.forEach(b => {
          html += `
            <tr>
              <td><strong>📍 ${b.branchName}</strong></td>
              <td>${b.sessionCount} sessions</td>
              <td><strong>$${parseFloat(b.totalRevenue).toFixed(2)}</strong></td>
            </tr>
          `;
        });
      } else {
        html += `<tr><td colspan="3" class="text-center" style="padding:1.5rem; color:var(--text-muted);">No revenue recorded.</td></tr>`;
      }

      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="table-card" style="padding:2rem; color:var(--color-red);">Error: ${err.message}</div>`;
    }
  },

  // =========================================================================
  // 3. SQL VIEWS: branch_phones & player_phones
  // =========================================================================
  async renderPhoneViews(container) {
    container.innerHTML = '<div class="table-card"><div style="text-align:center; padding:2rem;"><span class="pulse-dot"></span> Querying Views...</div></div>';
    try {
      const views = await api.part4.getPhoneViews();
      this.cachedViews = views;
      App.updateToolbarCount(undefined);

      let html = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap:1.5rem;">
          
          <div class="table-card">
            <div class="panel-header">
              <h3 class="panel-title">📞 Branch Phones View</h3>
            </div>
            <div class="table-responsive">
              <table class="crud-table">
                <thead>
                  <tr>
                    <th>Branch ID</th>
                    <th>Branch Name</th>
                    <th>City</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
      `;

      if (views.branchPhones && views.branchPhones.length > 0) {
        views.branchPhones.forEach(bp => {
          html += `
            <tr data-searchable="${bp.branchId} ${bp.name} ${bp.city} ${bp.phone}">
              <td><code>#${bp.branchId}</code></td>
              <td><strong>${bp.name}</strong></td>
              <td>${bp.city}</td>
              <td><a href="tel:${bp.phone}" style="color:var(--text-dark); text-decoration:none;">${bp.phone}</a></td>
            </tr>
          `;
        });
      } else {
        html += `<tr><td colspan="4" class="text-center" style="padding:1.5rem;">No records.</td></tr>`;
      }

      html += `
                </tbody>
              </table>
            </div>
          </div>

          <div class="table-card">
            <div class="panel-header">
              <h3 class="panel-title">📱 Player Phones View</h3>
            </div>
            <div class="table-responsive">
              <table class="crud-table">
                <thead>
                  <tr>
                    <th>Player ID</th>
                    <th>Player Name</th>
                    <th>Phone</th>
                    <th>Team</th>
                  </tr>
                </thead>
                <tbody>
      `;

      if (views.playerPhones && views.playerPhones.length > 0) {
        views.playerPhones.forEach(pp => {
          html += `
            <tr data-searchable="${pp.playerId} ${pp.name} ${pp.phone} ${pp.teamName || ''}">
              <td><code>#${pp.playerId}</code></td>
              <td><strong>${pp.name}</strong></td>
              <td><a href="tel:${pp.phone}" style="color:var(--text-dark); text-decoration:none;">${pp.phone}</a></td>
              <td>${pp.teamName || 'Unassigned'}</td>
            </tr>
          `;
        });
      } else {
        html += `<tr><td colspan="4" class="text-center" style="padding:1.5rem;">No records.</td></tr>`;
      }

      html += `
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `;

      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<div class="table-card" style="padding:2rem; color:var(--color-red);">Error: ${err.message}</div>`;
    }
  }
};

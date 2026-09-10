/**
 * Smart Agricultural Procurement & Slot Management Platform (KrishiSetu)
 * Emergency & Delay Alert Console Controller
 */

class EmergencyConsole {
  constructor() {
    this.selectedTemplateId = null;
  }

  init() {
    this.renderTemplates();
    this.renderActiveAlertStatus();
    this.renderBroadcastHistory();
    this.bindEvents();
  }

  bindEvents() {
    const form = document.getElementById('emergency-broadcast-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleBroadcastSubmit();
      });
    }

    const msgInput = document.getElementById('emergency-msg-input');
    const charCounter = document.getElementById('emergency-char-count');
    if (msgInput && charCounter) {
      msgInput.addEventListener('input', () => {
        charCounter.textContent = `${msgInput.value.length} / 250`;
      });
    }

    window.addEventListener('ks-emergency-broadcast', () => {
      this.renderActiveAlertStatus();
      this.renderBroadcastHistory();
    });

    window.addEventListener('ks-emergency-resolved', () => {
      this.renderActiveAlertStatus();
      this.renderBroadcastHistory();
    });

    window.addEventListener('ks-db-updated', () => {
      this.renderActiveAlertStatus();
      this.renderBroadcastHistory();
    });
  }

  renderTemplates() {
    const container = document.getElementById('emergency-templates-grid');
    if (!container || typeof EMERGENCY_TEMPLATES === 'undefined') return;

    container.innerHTML = EMERGENCY_TEMPLATES.map(tpl => {
      const isSelected = tpl.id === this.selectedTemplateId;
      const severityClass = tpl.severity === 'EMERGENCY' ? 'danger' : (tpl.severity === 'DELAY' ? 'warning' : 'info');
      
      return `
        <div class="crop-card-item ${isSelected ? 'selected' : ''}" style="cursor: pointer; text-align: left; padding: 0.75rem;" onclick="emergencyConsole.selectTemplate('${tpl.id}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem; gap: 0.5rem;">
            <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-main); line-height: 1.3;">
              ${tpl.title}
            </div>
            <span class="badge-clean ${severityClass}" style="font-size: 0.65rem; white-space: nowrap;">
              ${tpl.severity}
            </span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.35; margin-bottom: 0.4rem;">
            ${tpl.message.length > 85 ? tpl.message.slice(0, 85) + '...' : tpl.message}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; color: var(--text-dim);">
            <span>${tpl.category}</span>
            <span style="font-weight: 600; color: var(--color-primary);">${tpl.delayMinutes > 0 ? `+${tpl.delayMinutes} Mins` : 'No Delay'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  selectTemplate(tplId) {
    this.selectedTemplateId = tplId;
    this.renderTemplates();

    const tpl = EMERGENCY_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;

    const titleInput = document.getElementById('emergency-title-input');
    const categorySelect = document.getElementById('emergency-category-select');
    const severitySelect = document.getElementById('emergency-severity-select');
    const delayInput = document.getElementById('emergency-delay-input');
    const targetSelect = document.getElementById('emergency-target-select');
    const msgInput = document.getElementById('emergency-msg-input');
    const charCounter = document.getElementById('emergency-char-count');

    if (titleInput) titleInput.value = tpl.title;
    if (categorySelect) categorySelect.value = tpl.category;
    if (severitySelect) severitySelect.value = tpl.severity;
    if (delayInput) delayInput.value = tpl.delayMinutes;
    if (targetSelect) targetSelect.value = tpl.targetAudience;
    if (msgInput) {
      msgInput.value = tpl.message;
      if (charCounter) charCounter.textContent = `${tpl.message.length} / 250`;
    }

    soundEngine.playBeep('success');
    app.showToast(`Loaded Template: "${tpl.title}"`, 'info');
  }

  handleBroadcastSubmit() {
    const titleInput = document.getElementById('emergency-title-input');
    const categorySelect = document.getElementById('emergency-category-select');
    const severitySelect = document.getElementById('emergency-severity-select');
    const delayInput = document.getElementById('emergency-delay-input');
    const targetSelect = document.getElementById('emergency-target-select');
    const centerSelect = document.getElementById('emergency-center-select');
    const msgInput = document.getElementById('emergency-msg-input');
    const sendSmsCheckbox = document.getElementById('emergency-send-sms');
    const voiceAnnounceCheckbox = document.getElementById('emergency-voice-announce');

    const title = titleInput ? titleInput.value.trim() : 'Mandi Operational Notice';
    const category = categorySelect ? categorySelect.value : 'General Advisory';
    const severity = severitySelect ? severitySelect.value : 'EMERGENCY';
    const delayMinutes = parseInt(delayInput ? delayInput.value : 0) || 0;
    const targetAudience = targetSelect ? targetSelect.value : 'ALL_QUEUED';
    const centerId = centerSelect ? centerSelect.value : 'all';
    const message = msgInput ? msgInput.value.trim() : '';

    if (!message) {
      app.showToast('Please enter an emergency or delay message to broadcast', 'warning');
      return;
    }

    const bookings = db.getBookings();
    let affectedBookings = [];

    if (targetAudience === 'ALL_QUEUED') {
      affectedBookings = bookings.filter(b => b.status === 'ACTIVE_QUEUE' || b.status === 'CHECKED_IN' || b.queueToken);
    } else if (targetAudience === 'SCHEDULED_TODAY') {
      const todayStr = new Date().toISOString().split('T')[0];
      affectedBookings = bookings.filter(b => b.scheduledDate === todayStr || b.status !== 'PAYMENT_COMPLETED');
    } else {
      affectedBookings = bookings;
    }

    if (centerId !== 'all') {
      affectedBookings = affectedBookings.filter(b => b.centerId === centerId);
    }

    const recipientsCount = Math.max(affectedBookings.length, 12);

    const alertObj = {
      id: `ALERT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      title: title,
      category: category,
      severity: severity,
      delayMinutes: delayMinutes,
      message: message,
      targetAudience: targetAudience === 'ALL_QUEUED' ? 'All Queued Farmers' : (targetAudience === 'SCHEDULED_TODAY' ? 'Farmers Scheduled Today' : 'All Mandi Users'),
      centerId: centerId,
      centerName: centerId === 'all' ? 'All Procurement Centers' : (db.getCenterById(centerId)?.name || 'Khanna Mandi'),
      dispatchedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dispatchedBy: 'Suresh Kumar (FCI Officer #104)',
      recipientsCount: recipientsCount,
      status: 'ACTIVE'
    };

    // Save to centralized database
    db.setEmergencyAlert(alertObj);

    // 1. Dispatch SMS Alerts to affected bookings
    if (sendSmsCheckbox && sendSmsCheckbox.checked) {
      affectedBookings.forEach(booking => {
        const smsText = `EMERGENCY ALERT [KrishiSetu]: ${title}. ${message} (Est Delay: +${delayMinutes}m)`;
        const updatedAlerts = booking.smsAlertsSent ? [...booking.smsAlertsSent] : [];
        updatedAlerts.unshift({
          type: 'EMERGENCY_BROADCAST',
          time: 'Just now',
          text: smsText
        });
        db.updateBooking(booking.id, { smsAlertsSent: updatedAlerts });
      });

      // Also trigger simulated SMS feed alert in Feature Phone simulator
      if (typeof ussdSimulator !== 'undefined' && ussdSimulator.triggerPRDAlert) {
        ussdSimulator.triggerPRDAlert('EMERGENCY_BROADCAST', {
          id: alertObj.id,
          farmerName: 'All Queued Farmers',
          farmerPhone: 'Broadcast (GSM)',
          cropName: 'Mandi Notice',
          smsAlertsSent: [{ type: 'EMERGENCY', time: 'Just now', text: `KrishiSetu Emergency Alert: ${title} - ${message}` }]
        });
      }
    }

    // 2. Play Sound & Speech Synthesis Broadcast
    if (voiceAnnounceCheckbox && voiceAnnounceCheckbox.checked) {
      if (typeof announceEmergencyAlert === 'function') {
        const currentLang = db.get().currentLanguage || 'en';
        announceEmergencyAlert(alertObj.title, alertObj.message, currentLang);
      }
    } else {
      soundEngine.playEmergencyChime();
    }

    app.showToast(`🚨 Emergency Alert Broadcasted to ${recipientsCount} Farmers!`, 'success');
    this.renderActiveAlertStatus();
    this.renderBroadcastHistory();
  }

  resolveActiveAlert() {
    const resolved = db.clearEmergencyAlert();
    soundEngine.playBeep('success');
    app.showToast('Emergency Notice Resolved. Mandi operations returned to Normal status.', 'info');
    this.renderActiveAlertStatus();
    this.renderBroadcastHistory();
  }

  extendDelay(extraMinutes) {
    const alert = db.getEmergencyAlert();
    if (!alert) return;

    alert.delayMinutes += extraMinutes;
    alert.message += ` [Update: +${extraMinutes}m delay added at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]`;
    
    db.setEmergencyAlert(alert);
    soundEngine.playBeep('warning');
    app.showToast(`Updated delay: +${alert.delayMinutes} mins. Notified all queued farmers.`, 'info');
    this.renderActiveAlertStatus();
  }

  renderActiveAlertStatus() {
    const container = document.getElementById('emergency-active-status-card');
    if (!container) return;

    const alert = db.getEmergencyAlert();

    if (!alert || alert.status !== 'ACTIVE') {
      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: var(--color-success);"></div>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">Mandi Yard Operations Normal</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">No active emergency or unhandled delay broadcasts. Standard slot throughput active.</div>
            </div>
          </div>
          <span class="badge-clean success">Status: Normal</span>
        </div>
      `;
      return;
    }

    const severityClass = alert.severity === 'EMERGENCY' ? 'danger' : (alert.severity === 'DELAY' ? 'warning' : 'info');

    container.innerHTML = `
      <div style="background: var(--bg-surface); border: 2px solid var(--color-${alert.severity === 'EMERGENCY' ? 'danger' : 'warning'}); border-radius: var(--radius-md); padding: 1.15rem; position: relative;">
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span class="pulsating-alert-dot"></span>
            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-${alert.severity === 'EMERGENCY' ? 'danger' : 'warning'});">
                ACTIVE MULTI-CHANNEL BROADCAST IN EFFECT
              </div>
              <h4 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-top: 0.15rem;">
                ${alert.title}
              </h4>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge-clean ${severityClass}">${alert.severity}</span>
            <span class="badge-clean info">${alert.targetAudience} (${alert.recipientsCount} Farmers)</span>
          </div>
        </div>

        <div style="background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-md); border-left: 4px solid var(--color-${alert.severity === 'EMERGENCY' ? 'danger' : 'warning'}); margin-bottom: 0.85rem;">
          <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.45; font-weight: 500;">
            "${alert.message}"
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
            <span>Dispatched: <strong>${alert.dispatchedAt}</strong> by ${alert.dispatchedBy}</span>
            <span>Est. Wait Impact: <strong style="color: var(--color-danger);">${alert.delayMinutes > 0 ? `+${alert.delayMinutes} Mins` : 'Advisory Only'}</strong></span>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="emergencyConsole.extendDelay(15)">+15 Mins Delay</button>
            <button class="btn btn-secondary btn-sm" onclick="emergencyConsole.extendDelay(30)">+30 Mins Delay</button>
            <button class="btn btn-secondary btn-sm" onclick="announceEmergencyAlert('${alert.title.replace(/'/g, "\\'")}', '${alert.message.replace(/'/g, "\\'")}', db.get().currentLanguage || 'en')">Re-Announce Voice</button>
          </div>
          <button class="btn btn-primary btn-sm" style="background: var(--color-success); border-color: var(--color-success); color: #fff;" onclick="emergencyConsole.resolveActiveAlert()">
            ✓ Resolve & Return to Normal
          </button>
        </div>

      </div>
    `;
  }

  renderBroadcastHistory() {
    const container = document.getElementById('emergency-history-table-body');
    if (!container) return;

    const history = db.getBroadcastHistory();

    if (!history || history.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No historical emergency broadcasts recorded.</td></tr>`;
      return;
    }

    container.innerHTML = history.map(item => {
      const isResolved = item.status === 'RESOLVED';
      const severityClass = item.severity === 'EMERGENCY' ? 'danger' : (item.severity === 'DELAY' ? 'warning' : 'info');

      return `
        <tr style="border-bottom: 1px solid var(--border-subtle); font-size: 0.82rem;">
          <td style="padding: 0.65rem 0.5rem;">
            <div style="font-family: var(--font-mono); font-weight: 600; color: var(--color-primary);">${item.id}</div>
            <div style="color: var(--text-dim); font-size: 0.72rem;">${item.dispatchedAt}</div>
          </td>
          <td style="padding: 0.65rem 0.5rem;">
            <div style="font-weight: 600; color: var(--text-main);">${item.title}</div>
            <div style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.15rem;">${item.message.slice(0, 90)}${item.message.length > 90 ? '...' : ''}</div>
          </td>
          <td style="padding: 0.65rem 0.5rem;">
            <span class="badge-clean ${severityClass}" style="font-size: 0.7rem;">${item.severity}</span>
          </td>
          <td style="padding: 0.65rem 0.5rem;">
            <div>${item.targetAudience}</div>
            <div style="color: var(--text-dim); font-size: 0.72rem;">~${item.recipientsCount} Farmers</div>
          </td>
          <td style="padding: 0.65rem 0.5rem; font-weight: 600; color: var(--text-main);">
            ${item.delayMinutes > 0 ? `+${item.delayMinutes}m` : 'None'}
          </td>
          <td style="padding: 0.65rem 0.5rem;">
            <span class="badge-clean ${isResolved ? 'success' : 'danger'}" style="font-size: 0.7rem;">
              ${item.status}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }
}

const emergencyConsole = new EmergencyConsole();

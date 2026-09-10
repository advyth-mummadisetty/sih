/**
 * Smart Agricultural Procurement & Slot Management Platform (KrishiSetu)
 * Live Yard TV Display Board (Public Mandi Broadcast)
 */

class YardDisplay {
  constructor() {
    this.counters = [
      { id: 'cnt-1', name: 'Weighbridge Counter #1 (Priority Lane)', token: 'T-101', farmer: 'Gurpreet Singh', crop: 'Wheat (120 Qtl)', status: 'WEIGHING' },
      { id: 'cnt-2', name: 'Weighbridge Counter #2', token: 'T-104', farmer: 'Ramesh Singh', crop: 'Wheat (65 Qtl)', status: 'APPROVING' },
      { id: 'cnt-3', name: 'Quality Testing Lab #1', token: 'T-105', farmer: 'Baldev Ram', crop: 'Mustard (40 Qtl)', status: 'TESTING' },
      { id: 'cnt-4', name: 'Unloading Bay #2', token: 'T-102', farmer: 'Jaswinder Kaur', crop: 'Paddy (80 Qtl)', status: 'UNLOADING' }
    ];
  }

  init() {
    this.renderTVDisplay();
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('ks-db-updated', () => {
      this.syncWithDatabase();
    });

    window.addEventListener('ks-emergency-broadcast', () => {
      this.renderTVDisplay();
    });

    window.addEventListener('ks-emergency-resolved', () => {
      this.renderTVDisplay();
    });
  }

  syncWithDatabase() {
    const bookings = db.getBookings();
    const active = bookings.filter(b => b.queueToken);

    if (active.length > 0 && active[0]) {
      this.counters[0].token = active[0].queueToken;
      this.counters[0].farmer = active[0].farmerName;
      this.counters[0].crop = `${active[0].cropName} (${active[0].declaredQuantityQuintals} Qtl)`;
    }
    this.renderTVDisplay();
  }

  renderTVDisplay() {
    const container = document.getElementById('yard-tv-display-container');
    if (!container) return;

    const center = db.getCenterById('center-1') || db.getCenters()[0];
    const bookings = db.getBookings();
    const waitingTokens = bookings.filter(b => b.queueToken && b.status === 'ACTIVE_QUEUE').slice(1, 6);
    const emergencyAlert = db.getEmergencyAlert();

    container.innerHTML = `
      <div class="yard-tv-screen">
        <div class="tv-broadcast-header">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="badge-clean success">LIVE YARD BROADCAST</span>
              <h2 style="font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; color: var(--text-main);">
                ${center.name}
              </h2>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">
              Automated Token Calling & Traffic Flow System
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <div style="text-align: right;">
              <div style="font-size: 0.75rem; color: var(--text-muted);">Average Yard Wait</div>
              <div style="font-family: var(--font-mono); font-size: 1.15rem; font-weight: 700; color: var(--color-primary);">
                ${emergencyAlert && emergencyAlert.delayMinutes > 0 ? `${18 + emergencyAlert.delayMinutes} Mins (+${emergencyAlert.delayMinutes}m delay)` : '18 Mins'}
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="yardDisplay.triggerManualChimeAndAnnouncement()">
              Chime & Announce Active Token
            </button>
          </div>
        </div>

        ${emergencyAlert && emergencyAlert.status === 'ACTIVE' ? `
          <div class="tv-emergency-marquee-bar" style="background: ${emergencyAlert.severity === 'EMERGENCY' ? '#912d2d' : '#9c651e'};">
            <span style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; letter-spacing: 0.05em;">
              <span class="pulsating-alert-dot" style="background: #ffffff;"></span>
              ${emergencyAlert.severity}:
            </span>
            <div class="tv-emergency-marquee-text">
              🚨 ${emergencyAlert.title} — ${emergencyAlert.message} ${emergencyAlert.delayMinutes > 0 ? `(Estimated Processing Delay: +${emergencyAlert.delayMinutes} Mins)` : ''} 🚨
            </div>
          </div>
        ` : ''}

        <div class="tv-grid-layout">
          <div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem;">
              ACTIVE PROCESSING STATIONS
            </div>

            <div class="tv-serving-counter-cards">
              ${this.counters.map((c, idx) => `
                <div class="tv-counter-card ${idx === 0 ? 'active-calling' : ''}">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="tv-counter-name">${c.name}</div>
                    <span class="badge-clean info" style="font-size: 0.7rem;">${c.status}</span>
                  </div>
                  <div class="tv-token-number-giant">${c.token}</div>
                  <div class="tv-token-farmer">${c.farmer}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">${c.crop}</div>
                  <div style="margin-top: 0.75rem;">
                    <button class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;" onclick="yardDisplay.callSpecificCounter('${c.token}', '${c.name}')">
                      Call Station
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="tv-queue-sidebar">
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.4rem;">
              NEXT UP IN QUEUE
            </div>

            <div class="tv-queue-list">
              ${waitingTokens.length === 0 ? `
                <div class="tv-queue-item">
                  <span class="t-token">T-106</span>
                  <div>
                    <div style="font-weight: 600; font-size: 0.85rem;">Surinder Pal</div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">Wheat (55 Qtl)</div>
                  </div>
                  <span class="badge-clean">Est: 6m</span>
                </div>
                <div class="tv-queue-item">
                  <span class="t-token">T-107</span>
                  <div>
                    <div style="font-weight: 600; font-size: 0.85rem;">Amarjeet Kaur</div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">Paddy (70 Qtl)</div>
                  </div>
                  <span class="badge-clean">Est: 14m</span>
                </div>
                <div class="tv-queue-item">
                  <span class="t-token">T-108</span>
                  <div>
                    <div style="font-weight: 600; font-size: 0.85rem;">Harnek Singh</div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">Mustard (45 Qtl)</div>
                  </div>
                  <span class="badge-clean">Est: 22m</span>
                </div>
              ` : waitingTokens.map(w => `
                <div class="tv-queue-item">
                  <span class="t-token">${w.queueToken}</span>
                  <div>
                    <div style="font-weight: 600; font-size: 0.85rem;">${w.farmerName}</div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">${w.cropName} (${w.declaredQuantityQuintals} Qtl)</div>
                  </div>
                  <span class="badge-clean">Est: ${w.estimatedWaitMins || 15}m</span>
                </div>
              `).join('')}
            </div>

            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.75rem; margin-top: 1.25rem; font-size: 0.75rem; color: var(--text-muted);">
              <strong>Yard Advisory:</strong> High-yield batches (>= 100 Qtl) proceed directly to Priority Scale Line 1. Digital slips dispatched via SMS.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  callSpecificCounter(token, counterName) {
    const lang = app.currentLanguage || 'en';
    announceToken(token, counterName, lang);
    app.showToast(`Announcing Token ${token} for ${counterName}`, 'info');
  }

  triggerManualChimeAndAnnouncement() {
    const activeToken = this.counters[0].token || 'T-101';
    const lang = app.currentLanguage || 'en';
    announceToken(activeToken, 'Weighbridge Counter 1', lang);
    app.showToast(`Broadcasting yard chime for Token ${activeToken}`, 'info');
  }
}

const yardDisplay = new YardDisplay();

/**
 * Smart Agricultural Procurement & Slot Management Platform (KrishiSetu)
 * Yard Manager & Procurement Officer Portal (Suresh Persona)
 */

class YardManager {
  constructor() {
    this.activeWeighmentBookingId = 'KS-2026-PB-08492';
    this.currentScaleGrossKg = 10700;
    this.currentScaleTareKg = 4200;
    this.currentMoisturePercent = 11.4;
    this.currentForeignMatterPercent = 0.4;
    this.currentGrade = 'A';
    this.draggedBookingId = null;
  }

  init() {
    this.renderYardPipeline();
    this.renderWeighbridgeTerminal();
    this.bindEvents();
  }

  bindEvents() {
    const scanForm = document.getElementById('yard-scan-form');
    if (scanForm) {
      scanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const codeInput = document.getElementById('yard-scan-input');
        if (codeInput && codeInput.value.trim()) {
          this.processCheckInScan(codeInput.value.trim());
          codeInput.value = '';
        }
      });
    }

    window.addEventListener('ks-db-updated', () => {
      this.renderYardPipeline();
    });

    window.addEventListener('ks-offline-synced', (e) => {
      app.showToast(`Synced ${e.detail.count} offline records to master server`, 'success');
      this.renderYardPipeline();
    });
  }

  processCheckInScan(searchRef) {
    const booking = db.getBookingById(searchRef);
    if (!booking) {
      soundEngine.playBeep('warning');
      app.showToast(`Pass reference or OTP '${searchRef}' not found`, 'warning');
      return;
    }

    if (booking.status === 'ACTIVE_QUEUE' || booking.status === 'CHECKED_IN') {
      soundEngine.playBeep('warning');
      app.showToast(`Farmer already checked-in with Token: ${booking.queueToken}`, 'info');
      this.activeWeighmentBookingId = booking.id;
      this.renderWeighbridgeTerminal();
      return;
    }

    const nextTokenNum = 100 + db.getBookings().filter(b => b.queueToken).length + 1;
    const newToken = generateTokenNumber(nextTokenNum);

    const updates = {
      status: 'ACTIVE_QUEUE',
      queueToken: newToken,
      queuePosition: booking.isPriorityHighYield ? 1 : 2,
      estimatedWaitMins: booking.isPriorityHighYield ? 8 : 18,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentLifecycle: {
        ...booking.paymentLifecycle,
        currentStage: 1,
        submittedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };

    if (app.isOffline) {
      db.queueOfflineAction({
        type: 'GATE_CHECKIN',
        bookingId: booking.id,
        payload: updates
      });
      app.showToast(`[Offline] Gate Check-in Saved. Token: ${newToken}`, 'info');
    } else {
      db.updateBooking(booking.id, updates);
      app.showToast(`Gate Verified via Pass/OTP. Token ${newToken} Issued to ${booking.farmerName}`, 'success');
    }

    soundEngine.playBeep('success');

    ussdSimulator.triggerPRDAlert('CHECKIN_TOKEN', { ...booking, ...updates });

    this.activeWeighmentBookingId = booking.id;
    this.renderWeighbridgeTerminal();
    this.renderYardPipeline();
  }

  renderYardPipeline() {
    const bookings = db.getBookings();
    const container = document.getElementById('yard-pipeline-columns');
    if (!container) return;

    const stages = [
      { id: 'gate', title: 'Gate Arrival & Tokens', items: bookings.filter(b => b.status === 'BOOKED' || b.status === 'CHECKED_IN') },
      { id: 'weighbridge', title: 'Digital Weighbridge', items: bookings.filter(b => b.status === 'ACTIVE_QUEUE') },
      { id: 'quality', title: 'Quality Testing Lab', items: bookings.filter(b => b.status === 'WEIGHED') },
      { id: 'unloading', title: 'Unloading & Acceptance', items: bookings.filter(b => b.status === 'QUALITY_APPROVED' || b.status === 'PAYMENT_INITIATED') },
      { id: 'disbursed', title: 'Completed & Disbursed', items: bookings.filter(b => b.status === 'PAYMENT_COMPLETED') }
    ];

    container.innerHTML = stages.map(col => `
      <div class="pipeline-col" 
           data-stage-id="${col.id}"
           ondragover="yardManager.handleDragOver(event)"
           ondragenter="yardManager.handleDragEnter(event)"
           ondragleave="yardManager.handleDragLeave(event)"
           ondrop="yardManager.handleDrop(event, '${col.id}')">
        
        <div class="pipeline-col-header">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <h4 style="font-size: 0.85rem; font-family: var(--font-display); font-weight: 600; margin: 0;">${col.title}</h4>
            <span class="badge-clean">${col.items.length}</span>
          </div>

          ${col.id === 'disbursed' && col.items.length > 0 ? `
            <button type="button" 
                    class="pipeline-discard-btn" 
                    style="padding: 0.15rem 0.45rem; font-size: 0.68rem;"
                    title="Discard all completed records from pipeline" 
                    onclick="event.stopPropagation(); yardManager.discardAllCompleted()">
              Discard All
            </button>
          ` : ''}
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; flex: 1;">
          ${col.items.length === 0 ? `
            <div style="font-size: 0.75rem; color: var(--text-dim); text-align: center; padding: 2.2rem 0; border: 1px dashed var(--border-subtle); border-radius: var(--radius-sm); user-select: none;">
              Drop Token Here
            </div>` : ''}
          
          ${col.items.map(b => `
            <div class="pipeline-card" 
                 id="pipeline-card-${b.id}"
                 draggable="true" 
                 data-booking-id="${b.id}"
                 data-current-stage="${col.id}"
                 ondragstart="yardManager.handleDragStart(event, '${b.id}')"
                 ondragend="yardManager.handleDragEnd(event)"
                 onclick="yardManager.selectBookingForWeighbridge('${b.id}')"
                 style="border-color: ${b.id === this.activeWeighmentBookingId ? 'var(--color-primary)' : 'var(--border-subtle)'};">
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <div style="display: flex; align-items: center; gap: 0.3rem;">
                  <span class="pipeline-drag-handle" title="Drag and drop across pipeline stages">⋮⋮</span>
                  <span style="font-family: var(--font-mono); font-weight: 600; color: var(--color-primary); font-size: 0.8rem;">
                    ${b.queueToken || 'No Token'}
                  </span>
                </div>
                ${b.isPriorityHighYield ? 
                  `<span class="badge-clean priority" style="font-size: 0.65rem;">Priority Yield</span>` : 
                  `<span class="badge-clean" style="font-size: 0.65rem;">${(b.scheduledSlot || '10:00 AM').split(' - ')[0]}</span>`}
              </div>

              <div style="font-weight: 600; font-size: 0.85rem; margin-bottom: 0.15rem;">${b.farmerName}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${b.cropName} • ${b.declaredQuantityQuintals} Qtl</div>
              <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.25rem;">${b.vehicleNo || 'Vehicle Unregistered'}</div>

              ${col.id === 'disbursed' ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.55rem; padding-top: 0.45rem; border-top: 1px dashed var(--border-subtle);">
                  <span style="font-size: 0.68rem; color: var(--color-success); font-weight: 600;">✓ Disbursed</span>
                  <button type="button" 
                          class="pipeline-discard-btn" 
                          title="Discard this completed record from pipeline"
                          onclick="event.stopPropagation(); yardManager.discardBooking('${b.id}')">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Discard
                  </button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // Drag and Drop Kanban Handlers
  handleDragStart(e, bookingId) {
    this.draggedBookingId = bookingId;
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', bookingId);
      e.dataTransfer.effectAllowed = 'move';
    }
    const card = document.getElementById(`pipeline-card-${bookingId}`) || e.currentTarget;
    if (card) {
      setTimeout(() => card.classList.add('dragging'), 10);
    }
  }

  handleDragEnd(e) {
    this.draggedBookingId = null;
    const draggingCards = document.querySelectorAll('.pipeline-card.dragging');
    draggingCards.forEach(c => c.classList.remove('dragging'));
    const cols = document.querySelectorAll('.pipeline-col');
    cols.forEach(col => col.classList.remove('drag-over'));
  }

  handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  handleDragEnter(e) {
    e.preventDefault();
    const col = e.currentTarget.closest('.pipeline-col');
    if (col) col.classList.add('drag-over');
  }

  handleDragLeave(e) {
    const col = e.currentTarget.closest('.pipeline-col');
    if (col && !col.contains(e.relatedTarget)) {
      col.classList.remove('drag-over');
    }
  }

  handleDrop(e, targetStageId) {
    e.preventDefault();
    const cols = document.querySelectorAll('.pipeline-col');
    cols.forEach(col => col.classList.remove('drag-over'));

    const bookingId = (e.dataTransfer ? e.dataTransfer.getData('text/plain') : null) || this.draggedBookingId;
    if (!bookingId) return;

    this.moveBookingToStage(bookingId, targetStageId);
  }

  moveBookingToStage(bookingId, stageId) {
    const booking = db.getBookingById(bookingId);
    if (!booking) return;

    const updates = {};
    let stageTitle = '';

    switch (stageId) {
      case 'gate':
        updates.status = 'CHECKED_IN';
        stageTitle = 'Gate Arrival & Tokens';
        break;

      case 'weighbridge':
        updates.status = 'ACTIVE_QUEUE';
        stageTitle = 'Digital Weighbridge';
        if (!booking.queueToken) {
          const nextTokenNum = 100 + db.getBookings().filter(b => b.queueToken).length + 1;
          updates.queueToken = generateTokenNumber(nextTokenNum);
        }
        if (!booking.checkInTime) {
          updates.checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        this.activeWeighmentBookingId = bookingId;
        break;

      case 'quality':
        updates.status = 'WEIGHED';
        stageTitle = 'Quality Testing Lab';
        if (!booking.weighment) {
          const gross = 5400;
          const tare = 1600;
          const net = gross - tare;
          updates.weighment = {
            grossKg: gross,
            tareKg: tare,
            netKg: net,
            netQtl: net / 100,
            moisturePercent: 11.2,
            qualityGrade: 'A',
            bonusOrDeductionPerQtl: 50,
            effectiveRate: 2325,
            calculatedGrossPayout: (net / 100) * 2325,
            weighedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        break;

      case 'unloading':
        updates.status = 'QUALITY_APPROVED';
        stageTitle = 'Unloading & Acceptance';
        updates.paymentLifecycle = {
          ...(booking.paymentLifecycle || {}),
          currentStage: 2,
          qualityApprovedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        break;

      case 'disbursed':
        updates.status = 'PAYMENT_COMPLETED';
        stageTitle = 'Completed & Disbursed';
        if (!booking.queueToken) {
          updates.queueToken = generateTokenNumber(100 + db.getBookings().filter(b => b.queueToken).length + 1);
        }
        const crop = db.getCropById(booking.cropId) || db.getCrops()[0];
        const msp = crop ? crop.msp : 2275;
        const total = booking.declaredQuantityQuintals * msp;
        const utrNum = booking.paymentLifecycle?.utrNumber || `UTR${Math.floor(10000000 + Math.random() * 90000000)}`;
        const batchNum = booking.paymentLifecycle?.dbtBatchId || `DBT-PFMS-${Math.floor(10000 + Math.random() * 90000)}`;

        updates.paymentLifecycle = {
          ...(booking.paymentLifecycle || {}),
          currentStage: 3,
          qualityApprovedAt: booking.paymentLifecycle?.qualityApprovedAt || 'Today, 11:30 AM',
          paymentInitiatedAt: booking.paymentLifecycle?.paymentInitiatedAt || 'Today, 11:45 AM',
          paymentCompletedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dbtBatchId: batchNum,
          utrNumber: utrNum,
          disbursedAmount: total
        };
        break;
    }

    db.updateBooking(bookingId, updates);
    soundEngine.playBeep('success');
    app.showToast(`Moved ${booking.farmerName} (${booking.queueToken || booking.id}) → ${stageTitle}`, 'success');

    this.renderYardPipeline();
    if (stageId === 'weighbridge') {
      this.renderWeighbridgeTerminal();
    }
  }

  discardBooking(bookingId) {
    const booking = db.getBookingById(bookingId);
    const label = booking ? (booking.queueToken || booking.farmerName) : bookingId;
    const removed = db.deleteBooking(bookingId);
    if (removed) {
      soundEngine.playBeep('success');
      app.showToast(`Record ${label} discarded from Completed & Disbursed`, 'info');
      this.renderYardPipeline();
    }
  }

  discardAllCompleted() {
    const count = db.deleteCompletedBookings();
    if (count > 0) {
      soundEngine.playBeep('success');
      app.showToast(`Discarded ${count} completed & disbursed records`, 'info');
      this.renderYardPipeline();
    } else {
      app.showToast('No completed records to discard', 'info');
    }
  }

  selectBookingForWeighbridge(bookingId) {
    this.activeWeighmentBookingId = bookingId;
    this.renderWeighbridgeTerminal();
  }

  renderWeighbridgeTerminal() {
    const booking = db.getBookingById(this.activeWeighmentBookingId) || db.getBookings()[0];
    const terminalContainer = document.getElementById('yard-weighbridge-terminal-box');
    if (!terminalContainer || !booking) return;

    const crop = db.getCropById(booking.cropId) || db.getCrops()[0];

    terminalContainer.innerHTML = `
      <div class="clean-card">
        <div class="card-header-simple">
          <div class="card-heading">Station: Automated Weighbridge #1 & Moisture Quality Lab</div>
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            ${booking.isPriorityHighYield ? `<span class="badge-clean priority">High-Yield Priority Lane</span>` : ''}
            <span class="badge-clean info">Active Token: ${booking.queueToken || booking.id}</span>
          </div>
        </div>

        <div class="weighbridge-terminal">
          <div class="scale-digital-display">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">Live Electronic Scale Indicator</div>
              <div class="scale-value-huge" id="scale-live-digits">${this.currentScaleGrossKg.toLocaleString()}</div>
            </div>
            <div class="scale-unit">KG (Gross)</div>
          </div>

          <div class="weight-math-grid">
            <div class="weight-box">
              <div class="w-title">Gross Weight (Loaded)</div>
              <div class="form-group" style="margin-bottom: 0;">
                <input type="number" id="wb-gross-weight" class="form-input" value="${this.currentScaleGrossKg}" style="text-align: center; font-family: var(--font-mono); font-size: 1rem;" />
              </div>
            </div>

            <div class="weight-box">
              <div class="w-title">Tare Weight (Empty)</div>
              <div class="form-group" style="margin-bottom: 0;">
                <input type="number" id="wb-tare-weight" class="form-input" value="${this.currentScaleTareKg}" style="text-align: center; font-family: var(--font-mono); font-size: 1rem;" />
              </div>
            </div>

            <div class="weight-box highlight">
              <div class="w-title" style="color: var(--color-primary);">Net Crop Weight</div>
              <div class="w-val" id="wb-net-calc" style="color: var(--color-primary);">
                ${((this.currentScaleGrossKg - this.currentScaleTareKg) / 100).toFixed(2)} Qtl
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted);" id="wb-net-kg-calc">
                (${Math.max(0, this.currentScaleGrossKg - this.currentScaleTareKg)} kg)
              </div>
            </div>
          </div>

          <div class="moisture-meter-box">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 0.9rem; font-weight: 600;">Digital Moisture Analyzer & Quality Grading</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Standard max moisture limit: <strong>${crop.maxMoisture}%</strong></div>
              </div>
              <div class="moisture-reading-badge ${this.currentMoisturePercent <= crop.maxMoisture ? 'safe' : 'warning'}" id="wb-moisture-badge">
                ${this.currentMoisturePercent}% Moisture
              </div>
            </div>

            <div class="moisture-slider-row">
              <input type="range" id="wb-moisture-slider" min="7.0" max="18.0" step="0.1" value="${this.currentMoisturePercent}" style="width: 100%; cursor: pointer;" />
            </div>

            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.4rem; margin-top: 0.75rem;">Quality Grade Rating:</div>
            <div class="grade-selector-group">
              <div class="grade-btn ${this.currentGrade === 'A' ? 'selected' : ''}" onclick="yardManager.selectGrade('A')">
                <div class="grade-letter" style="color: var(--color-primary);">Grade A (Premium)</div>
                <div class="grade-desc">+Rs 50/Qtl Incentive Bonus</div>
              </div>
              <div class="grade-btn ${this.currentGrade === 'B' ? 'selected' : ''}" onclick="yardManager.selectGrade('B')">
                <div class="grade-letter" style="color: var(--color-secondary);">Grade B (Standard FAQ)</div>
                <div class="grade-desc">Base MSP Rate (Rs ${crop.msp}/Qtl)</div>
              </div>
              <div class="grade-btn ${this.currentGrade === 'C' ? 'selected' : ''}" onclick="yardManager.selectGrade('C')">
                <div class="grade-letter" style="color: var(--color-warning);">Grade C (Dockage)</div>
                <div class="grade-desc">-Rs 75/Qtl Moisture Deduction</div>
              </div>
            </div>
          </div>

          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase;">Approved Farmer Payout</div>
              <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--color-primary);" id="wb-final-payout-val">
                ${this.calculateFinalPayout(booking, crop).display}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Direct Benefit Transfer (DBT-PFMS) Authorization</div>
            </div>

            <div style="display: flex; gap: 0.6rem;">
              <button class="btn btn-secondary btn-sm" onclick="farmerPortal.openWeighmentReceiptModal('${booking.id}')">
                Preview Weight Slip
              </button>
              <button class="btn btn-primary" onclick="yardManager.approveProcurementAndPay('${booking.id}')">
                Sign & Approve Acceptance
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindWeighbridgeLiveListeners();
  }

  bindWeighbridgeLiveListeners() {
    const grossInput = document.getElementById('wb-gross-weight');
    const tareInput = document.getElementById('wb-tare-weight');
    const moistureSlider = document.getElementById('wb-moisture-slider');

    if (grossInput) {
      grossInput.addEventListener('input', (e) => {
        this.currentScaleGrossKg = parseFloat(e.target.value) || 0;
        this.updateWeighbridgeMath();
      });
    }

    if (tareInput) {
      tareInput.addEventListener('input', (e) => {
        this.currentScaleTareKg = parseFloat(e.target.value) || 0;
        this.updateWeighbridgeMath();
      });
    }

    if (moistureSlider) {
      moistureSlider.addEventListener('input', (e) => {
        this.currentMoisturePercent = parseFloat(e.target.value) || 12.0;
        this.updateWeighbridgeMath();
      });
    }
  }

  selectGrade(grade) {
    this.currentGrade = grade;
    this.renderWeighbridgeTerminal();
  }

  calculateFinalPayout(booking, crop) {
    const netKg = Math.max(0, this.currentScaleGrossKg - this.currentScaleTareKg);
    const netQtl = netKg / 100;
    const bonus = this.currentGrade === 'A' ? 50 : (this.currentGrade === 'C' ? -75 : 0);
    const effectiveRate = crop.msp + bonus;
    const totalAmount = netQtl * effectiveRate;

    return {
      netKg,
      netQtl,
      bonus,
      effectiveRate,
      totalAmount,
      display: formatINR(totalAmount)
    };
  }

  updateWeighbridgeMath() {
    const booking = db.getBookingById(this.activeWeighmentBookingId) || db.getBookings()[0];
    const crop = db.getCropById(booking.cropId) || db.getCrops()[0];
    const math = this.calculateFinalPayout(booking, crop);

    const liveDigits = document.getElementById('scale-live-digits');
    const netCalc = document.getElementById('wb-net-calc');
    const netKgCalc = document.getElementById('wb-net-kg-calc');
    const moistureBadge = document.getElementById('wb-moisture-badge');
    const finalPayout = document.getElementById('wb-final-payout-val');

    if (liveDigits) liveDigits.textContent = this.currentScaleGrossKg.toLocaleString();
    if (netCalc) netCalc.textContent = `${math.netQtl.toFixed(2)} Qtl`;
    if (netKgCalc) netKgCalc.textContent = `(${math.netKg.toLocaleString()} kg)`;
    if (finalPayout) finalPayout.textContent = math.display;

    if (moistureBadge) {
      moistureBadge.textContent = `${this.currentMoisturePercent}% Moisture`;
      moistureBadge.className = `moisture-reading-badge ${this.currentMoisturePercent <= crop.maxMoisture ? 'safe' : 'warning'}`;
    }
  }

  approveProcurementAndPay(bookingId) {
    const booking = db.getBookingById(bookingId);
    if (!booking) return;

    const crop = db.getCropById(booking.cropId) || db.getCrops()[0];
    const math = this.calculateFinalPayout(booking, crop);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const weighmentRecord = {
      grossWeightKg: this.currentScaleGrossKg,
      tareWeightKg: this.currentScaleTareKg,
      netWeightKg: math.netKg,
      netWeightQuintals: math.netQtl,
      moisturePercent: this.currentMoisturePercent,
      foreignMatterPercent: this.currentForeignMatterPercent,
      assignedGrade: this.currentGrade,
      bonusPerQtl: math.bonus,
      deductionPerQtl: math.bonus < 0 ? Math.abs(math.bonus) : 0,
      finalRatePerQtl: math.effectiveRate,
      totalGrossAmount: math.totalAmount,
      mandiCessDeduction: 0,
      netPayableAmount: math.totalAmount,
      weighedBy: 'Operator Suresh (Weighbridge #1)',
      weighedAt: nowTime
    };

    const paymentUpdates = {
      currentStage: 3,
      submittedAt: booking.paymentLifecycle.submittedAt || 'Today, 09:48 AM',
      qualityApprovedAt: 'Today, ' + nowTime,
      paymentInitiatedAt: 'Today, ' + nowTime,
      paymentCompletedAt: null,
      dbtBatchId: 'DBT-2026-PB-00' + Math.floor(1000 + Math.random() * 9000),
      utrNumber: 'PUNBH260' + Math.floor(10000000 + Math.random() * 90000000),
      paymentMethod: 'Direct Benefit Transfer (DBT-PFMS)'
    };

    const updates = {
      status: 'PAYMENT_INITIATED',
      weighment: weighmentRecord,
      paymentLifecycle: paymentUpdates
    };

    if (app.isOffline) {
      db.queueOfflineAction({
        type: 'WEIGHMENT_SAVE',
        bookingId: booking.id,
        payload: updates
      });
      app.showToast(`[Offline] Weighment recorded offline`, 'info');
    } else {
      db.updateBooking(booking.id, updates);
      app.showToast(`Official Acceptance Approved. Payment of ${math.display} Dispatched via DBT.`, 'success');
    }

    soundEngine.playBeep('success');

    ussdSimulator.triggerPRDAlert('QUALITY_PASS', { ...booking, ...updates });
    ussdSimulator.triggerPRDAlert('PAYMENT_COMPLETED', { ...booking, ...updates });

    this.renderYardPipeline();
    this.renderWeighbridgeTerminal();
  }
}

const yardManager = new YardManager();

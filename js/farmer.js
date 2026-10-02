/**
 * Smart Agricultural Procurement & Slot Management Platform (KrishiSetu)
 * Farmer Portal (Side-by-Side Booking, Bottom Pass, Priority <= 100 Qtl & User Settings)
 */

class FarmerPortal {
  constructor() {
    this.selectedCenterId = 'center-1';
    this.selectedCropId = 'crop-1';
    this.selectedSlot = '10:00 AM - 11:00 AM';
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.currentFarmerPhone = '9872100412';
    this.currentFarmerName = 'Ramesh Singh';
    this.currentFarmerAadhaar = 'XXXX-XXXX-4821';
    this.currentFarmerId = 'PB-FARM-99402';
    this.currentBankMasked = 'HDFC Bank - A/C ..8921';
    this.currentBankIfsc = 'HDFC0001092';
    this.currentVillage = 'Village Alour, Khanna Tehsil, Ludhiana';
    this.activeBookingId = 'KS-2026-PB-08492';
  }

  loadActiveFarmerSession() {
    const savedPhone = localStorage.getItem('KS_ACTIVE_FARMER_PHONE') || '9872100412';
    const farmer = typeof db !== 'undefined' ? db.getFarmerByPhone(savedPhone) : null;
    if (farmer) {
      this.loadFarmer(farmer);
    } else {
      this.currentFarmerPhone = savedPhone;
      this.currentFarmerName = 'Ramesh Singh';
      this.currentFarmerAadhaar = 'XXXX-XXXX-4821';
      this.currentFarmerId = 'PB-FARM-99402';
      this.currentBankMasked = 'HDFC Bank - A/C ..8921';
      this.currentBankIfsc = 'HDFC0001092';
      this.currentVillage = 'Village Alour, Khanna Tehsil, Ludhiana';
    }
  }

  loadFarmer(farmer) {
    if (!farmer) return;
    this.currentFarmerPhone = farmer.phone || this.currentFarmerPhone;
    this.currentFarmerName = farmer.name || this.currentFarmerName;
    this.currentFarmerAadhaar = farmer.aadhaar || this.currentFarmerAadhaar;
    this.currentFarmerId = farmer.farmerId || this.currentFarmerId;
    this.currentBankMasked = farmer.bankMasked || this.currentBankMasked;
    this.currentBankIfsc = farmer.bankIfsc || 'SBIN0001420';
    this.currentVillage = farmer.address || farmer.village || this.currentVillage;

    localStorage.setItem('KS_ACTIVE_FARMER_PHONE', this.currentFarmerPhone);

    if (typeof db !== 'undefined') {
      const farmerBookings = db.getBookings().filter(b => b.farmerPhone === this.currentFarmerPhone);
      if (farmerBookings.length > 0) {
        this.activeBookingId = farmerBookings[0].id;
      }
    }

    const farmerHeaderName = document.getElementById('farmer-profile-name');
    const farmerHeaderAadhaar = document.getElementById('farmer-profile-aadhaar');
    const farmerHeaderId = document.getElementById('farmer-profile-id');
    const farmerHeaderBank = document.getElementById('farmer-profile-bank');

    if (farmerHeaderName) farmerHeaderName.textContent = this.currentFarmerName;
    if (farmerHeaderAadhaar) farmerHeaderAadhaar.textContent = this.currentFarmerAadhaar;
    if (farmerHeaderId) farmerHeaderId.textContent = this.currentFarmerId;
    if (farmerHeaderBank) farmerHeaderBank.textContent = this.currentBankMasked;

    this.renderFarmerPassesAndLifecycle();
  }

  init() {
    this.loadActiveFarmerSession();
    this.renderFarmerEmergencyBanner();
    this.renderCenterOptions();
    this.renderCropOptions();
    this.renderSlotTimeOptions();
    this.calculateMSPPreview();
    this.renderFarmerPassesAndLifecycle();
    this.bindEvents();
  }

  bindEvents() {
    const qtyInput = document.getElementById('farmer-crop-quantity');
    if (qtyInput) {
      qtyInput.addEventListener('input', () => this.calculateMSPPreview());
    }

    const dateInput = document.getElementById('farmer-booking-date');
    if (dateInput) {
      dateInput.min = new Date().toISOString().split('T')[0];
      dateInput.value = this.selectedDate;
      dateInput.addEventListener('change', (e) => {
        this.selectedDate = e.target.value;
        this.renderCenterOptions();
        this.renderSlotTimeOptions();
        this.updateCenterInfoCard();
      });
    }

    const centerSelect = document.getElementById('farmer-center-select');
    if (centerSelect) {
      centerSelect.addEventListener('change', (e) => {
        this.selectedCenterId = e.target.value;
        this.renderSlotTimeOptions();
        this.updateCenterInfoCard();
        this.calculateMSPPreview();
      });
    }

    const bookingForm = document.getElementById('farmer-booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleBookingSubmit();
      });
    }

    window.addEventListener('ks-db-updated', () => {
      this.renderFarmerEmergencyBanner();
      this.renderFarmerPassesAndLifecycle();
    });

    window.addEventListener('ks-emergency-broadcast', () => {
      this.renderFarmerEmergencyBanner();
    });

    window.addEventListener('ks-emergency-resolved', () => {
      this.renderFarmerEmergencyBanner();
    });
  }

  // Dynamic Date and Location Statistics Calculation Engine
  getCenterStatsForDate(center, dateStr) {
    if (!center) {
      return {
        name: 'Mandi Center',
        district: 'Punjab',
        state: 'Punjab',
        distanceKm: 5.0,
        dailyCapacityQuintals: 2500,
        bookedTodayQuintals: 1250,
        capacityPercent: 50,
        currentWaitMins: 15,
        operatingHours: '08:00 AM - 06:00 PM',
        weighbridgesActive: 3,
        qualityCounters: 2,
        formattedDate: dateStr || 'Today'
      };
    }

    const actualDate = dateStr || this.selectedDate || new Date().toISOString().split('T')[0];
    
    // Deterministic pseudo-random seed per (center.id + actualDate)
    const seedStr = `${center.id}_${actualDate}_stats_v2`;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);

    const d = new Date(actualDate);
    const dayOfWeek = isNaN(d.getDay()) ? 1 : d.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    // Dynamic base percentage per date: Weekdays (35% - 85%), Weekends (15% - 48%)
    let basePercent = (positiveHash % 50) + 36;
    if (isWeekend) {
      basePercent = Math.max(14, basePercent - 24);
    }

    const dailyCap = center.dailyCapacityQuintals || 2500;
    const bookedToday = Math.round((dailyCap * basePercent) / 100);
    const capacityPercent = Math.min(98, Math.max(12, Math.round((bookedToday / dailyCap) * 100)));

    // Wait time scales with congestion and active weighbridge lanes
    const lanes = center.weighbridgesActive || 3;
    let waitMins = Math.round(6 + (capacityPercent / 100) * 32 - (lanes * 2.2));
    waitMins = Math.max(5, Math.min(42, waitMins));

    // Formatted date string for display
    let dateLabel = actualDate;
    try {
      const parts = actualDate.split('-');
      if (parts.length === 3) {
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        dateLabel = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) {
      dateLabel = actualDate;
    }

    return {
      name: center.name,
      district: center.district,
      state: center.state,
      distanceKm: center.distanceKm,
      dailyCapacityQuintals: dailyCap,
      bookedTodayQuintals: bookedToday,
      capacityPercent: capacityPercent,
      currentWaitMins: waitMins,
      operatingHours: center.operatingHours || '08:00 AM - 06:00 PM',
      weighbridgesActive: lanes,
      qualityCounters: center.qualityCounters || 2,
      facilities: center.facilities || [],
      formattedDate: dateLabel
    };
  }

  // Dynamic Hourly Arrival Window Slot Generation (Per Center + Date)
  getSlotsForCenterAndDate(center, dateStr) {
    const centerObj = center || db.getCenterById(this.selectedCenterId) || db.getCenters()[0];
    const actualDate = dateStr || this.selectedDate || new Date().toISOString().split('T')[0];
    const opHours = centerObj.operatingHours || '08:00 AM - 06:00 PM';

    let startHour = 8;
    let endHour = 18;

    if (opHours.includes('06:30 AM') || opHours.includes('07:00 AM') || opHours.includes('07:30 AM')) {
      startHour = 7;
    }
    if (opHours.includes('07:00 PM') || opHours.includes('07:30 PM')) {
      endHour = 19;
    } else if (opHours.includes('08:00 PM') || opHours.includes('08:30 PM')) {
      endHour = 20;
    }

    const hourlyCap = centerObj.hourlySlotCapacityQuintals || 300;
    const slots = [];

    const d = new Date(actualDate);
    const dayOfWeek = isNaN(d.getDay()) ? 1 : d.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    for (let h = startHour; h < endHour; h++) {
      const hNext = h + 1;
      
      const formatTime = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        let displayHour = hour % 12;
        if (displayHour === 0) displayHour = 12;
        const strHour = displayHour < 10 ? `0${displayHour}` : `${displayHour}`;
        return `${strHour}:00 ${period}`;
      };

      const slotTime = `${formatTime(h)} - ${formatTime(hNext)}`;

      // Deterministic seed per date, center, and hour window
      const slotSeedStr = `${centerObj.id}_${actualDate}_h_${h}_v2`;
      let slotHash = 0;
      for (let i = 0; i < slotSeedStr.length; i++) {
        slotHash = ((slotHash << 5) - slotHash) + slotSeedStr.charCodeAt(i);
        slotHash |= 0;
      }
      const pHash = Math.abs(slotHash);

      // Realistic diurnal traffic distribution curve across the mandi day
      let hourBias = 0;
      if (h >= 9 && h <= 11) {
        hourBias = 26; // Morning rush peak
      } else if (h === 8) {
        hourBias = -6; // Early opening
      } else if (h >= 12 && h <= 13) {
        hourBias = -16; // Mid-day lull
      } else if (h >= 14 && h <= 15) {
        hourBias = 8; // Afternoon delivery wave
      } else if (h >= 16) {
        hourBias = -26; // Evening clearout
      }

      if (isWeekend) {
        hourBias -= 18;
      }

      let slotPercent = (pHash % 32) + 38 + hourBias;
      slotPercent = Math.max(8, Math.min(97, slotPercent));

      const bookedQtl = Math.round((hourlyCap * slotPercent) / 100);
      
      let status = 'Moderate';
      let isFastTrack = false;
      let statusClass = 'warning';

      if (slotPercent <= 35) {
        status = 'Fast Track';
        isFastTrack = true;
        statusClass = 'success';
      } else if (slotPercent <= 52) {
        status = 'Low Congestion';
        isFastTrack = true;
        statusClass = 'success';
      } else if (slotPercent <= 74) {
        status = 'Moderate';
        isFastTrack = false;
        statusClass = 'warning';
      } else if (slotPercent <= 89) {
        status = 'Peak Surge';
        isFastTrack = false;
        statusClass = 'orange';
      } else {
        status = 'Almost Full';
        isFastTrack = false;
        statusClass = 'danger';
      }

      slots.push({
        time: slotTime,
        booked: bookedQtl,
        cap: hourlyCap,
        percent: slotPercent,
        status: status,
        isFastTrack: isFastTrack,
        statusClass: statusClass,
        isFull: slotPercent >= 98
      });
    }

    return slots;
  }

  renderFarmerEmergencyBanner() {
    const bannerBox = document.getElementById('farmer-emergency-banner');
    if (!bannerBox) return;

    const alert = db.getEmergencyAlert();
    if (!alert || alert.status !== 'ACTIVE') {
      bannerBox.innerHTML = '';
      bannerBox.style.display = 'none';
      return;
    }

    const isUrgent = alert.severity === 'EMERGENCY';

    bannerBox.style.display = 'block';
    bannerBox.innerHTML = `
      <div class="emergency-farmer-banner ${isUrgent ? 'danger' : ''}">
        <div style="display: flex; gap: 0.85rem; align-items: flex-start;">
          <span class="pulsating-alert-dot" style="margin-top: 4px;"></span>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span class="badge-clean ${isUrgent ? 'danger' : 'warning'}" style="font-size: 0.7rem; font-weight: 700;">
                MANDI BROADCAST: ${alert.severity}
              </span>
              <strong style="color: var(--text-main); font-size: 0.95rem;">${alert.title}</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">(${alert.dispatchedAt})</span>
            </div>
            <p style="margin-top: 0.35rem; font-size: 0.88rem; color: var(--text-main); line-height: 1.4;">
              ${alert.message}
            </p>
            <div style="margin-top: 0.4rem; font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 1rem; flex-wrap: wrap;">
              <span>Target: <strong>${alert.targetAudience}</strong></span>
              ${alert.delayMinutes > 0 ? `<span style="color: var(--color-danger); font-weight: 600;">Estimated Processing Delay: +${alert.delayMinutes} Mins</span>` : ''}
              <span>Issued by: <strong>${alert.dispatchedBy}</strong></span>
            </div>
          </div>
        </div>
        <button class="btn-utility btn-sm" onclick="document.getElementById('farmer-emergency-banner').style.display='none'" title="Dismiss banner view">&times;</button>
      </div>
    `;
  }

  renderCenterOptions() {
    const centers = db.getCenters();
    const select = document.getElementById('farmer-center-select');
    if (!select) return;

    select.innerHTML = centers.map(c => {
      const stats = this.getCenterStatsForDate(c, this.selectedDate);
      return `
        <option value="${c.id}" ${c.id === this.selectedCenterId ? 'selected' : ''}>
          ${c.name} (${c.district}, ${c.state}) - ${c.distanceKm} km [Wait: ~${stats.currentWaitMins}m • ${stats.capacityPercent}% Booked]
        </option>
      `;
    }).join('');

    this.updateCenterInfoCard();
  }

  updateCenterInfoCard() {
    const center = db.getCenterById(this.selectedCenterId) || db.getCenters()[0];
    const infoBox = document.getElementById('center-info-summary');
    if (!center || !infoBox) return;

    const stats = this.getCenterStatsForDate(center, this.selectedDate);
    const capacityPercent = stats.capacityPercent;
    const statusClass = capacityPercent > 80 ? 'danger' : (capacityPercent > 55 ? 'warning' : 'success');

    infoBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.3rem;">
        <span style="font-size: 0.88rem; font-weight: 700; color: var(--text-main);">${stats.name}</span>
        <div style="display: flex; gap: 0.35rem;">
          <span class="badge-clean" style="font-size: 0.72rem;">📅 ${stats.formattedDate}</span>
          <span class="badge-clean" style="font-size: 0.72rem;">⏰ ${stats.operatingHours}</span>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: var(--text-muted); margin-bottom: 0.25rem;">
        <span>Daily Mandi Capacity: <strong>${stats.dailyCapacityQuintals.toLocaleString('en-IN')} Qtl</strong></span>
        <span><strong style="color: ${capacityPercent > 80 ? 'var(--color-danger)' : 'var(--color-primary)'};">${capacityPercent}% Booked</strong> (${stats.bookedTodayQuintals.toLocaleString('en-IN')} Qtl)</span>
      </div>
      <div class="capacity-slot-bar-wrapper">
        <div class="capacity-slot-bar-fill ${statusClass}" style="width: ${capacityPercent}%;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.45rem; font-size: 0.74rem;">
        <span style="color: var(--text-main); font-weight: 600;">
          ⏱️ Gate Wait: <strong style="color: ${stats.currentWaitMins > 20 ? 'var(--color-warning)' : 'var(--color-success)'};">~${stats.currentWaitMins} mins</strong> • ${stats.weighbridgesActive} Automated Lanes • ${stats.qualityCounters} Lab Bays
        </span>
        <span style="color: var(--color-primary); font-weight: 700; background: var(--color-primary-soft); padding: 0.1rem 0.4rem; border-radius: 4px;">
          ⚡ Priority &le; 100 Qtl Active
        </span>
      </div>
    `;
  }

  renderCropOptions() {
    const crops = db.getCrops();
    const container = document.getElementById('farmer-crops-grid');
    if (!container) return;

    container.innerHTML = crops.map(crop => `
      <div class="crop-card-item ${crop.id === this.selectedCropId ? 'selected' : ''}" onclick="farmerPortal.selectCrop('${crop.id}')">
        <div class="crop-card-name">${crop.name}</div>
        <div class="crop-msp-pill">MSP: Rs ${crop.msp.toLocaleString('en-IN')}/Qtl</div>
        <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.25rem;">Max Moisture: ${crop.maxMoisture}%</div>
      </div>
    `).join('');
  }

  selectCrop(cropId) {
    this.selectedCropId = cropId;
    this.renderCropOptions();
    this.calculateMSPPreview();
  }

  renderSlotTimeOptions() {
    const container = document.getElementById('farmer-slots-grid');
    if (!container) return;

    const center = db.getCenterById(this.selectedCenterId) || db.getCenters()[0];
    const slots = this.getSlotsForCenterAndDate(center, this.selectedDate);

    // Count Fast-Track slots (< 50% full)
    const fastTrackSlots = slots.filter(s => s.isFastTrack && !s.isFull);
    const fastTrackCount = fastTrackSlots.length;

    // Update Top Header Indicator
    const badgeEl = document.getElementById('farmer-fasttrack-badge');
    if (badgeEl) {
      if (fastTrackCount > 0) {
        badgeEl.innerHTML = `⚡ ${fastTrackCount} Fast-Track Slots Available`;
        badgeEl.style.background = 'var(--color-primary-soft)';
        badgeEl.style.color = 'var(--color-primary)';
        badgeEl.style.borderColor = 'var(--color-primary-border)';
      } else {
        badgeEl.innerHTML = `⚠️ Peak Harvest Demand`;
        badgeEl.style.background = 'var(--color-warning-soft)';
        badgeEl.style.color = 'var(--color-warning)';
        badgeEl.style.borderColor = 'var(--color-accent-border)';
      }
    }

    // Ensure selected slot is valid in current list
    const validSlotExists = slots.some(s => s.time === this.selectedSlot);
    if (!validSlotExists && slots.length > 0) {
      const recommendedSlot = fastTrackSlots[0] || slots[0];
      this.selectedSlot = recommendedSlot.time;
    }

    container.innerHTML = slots.map(slot => {
      const isSelected = slot.time === this.selectedSlot;
      const isFull = slot.isFull;

      return `
        <div class="crop-card-item ${isSelected ? 'selected' : ''}" style="${isFull ? 'opacity: 0.45; pointer-events: none;' : ''}" 
             onclick="farmerPortal.selectSlot('${slot.time}')">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">${slot.time}</span>
            ${slot.isFastTrack ? '<span style="font-size: 0.68rem; font-weight: 700; color: #15803d; background: #dcfce7; padding: 0.1rem 0.35rem; border-radius: 4px;">⚡ Fast Track</span>' : ''}
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--text-muted); margin-bottom: 0.25rem;">
            <span>${slot.status}</span>
            <span><strong>${slot.percent}%</strong> full (${slot.booked} Qtl)</span>
          </div>
          <div class="capacity-slot-bar-wrapper">
            <div class="capacity-slot-bar-fill ${slot.statusClass}" style="width: ${slot.percent}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  selectSlot(slotTime) {
    this.selectedSlot = slotTime;
    this.renderSlotTimeOptions();
  }

  calculateMSPPreview() {
    const crop = db.getCropById(this.selectedCropId);
    const qtyInput = document.getElementById('farmer-crop-quantity');
    const qty = parseFloat(qtyInput ? qtyInput.value : 50) || 0;

    if (!crop) return;

    const estimatedTotal = qty * crop.msp;
    // Priority Rule: <= 100 Quintals
    const isPriority = qty <= 100;

    const displayRate = document.getElementById('calc-msp-rate');
    const displayQty = document.getElementById('calc-crop-qty');
    const displayTotal = document.getElementById('calc-estimated-total');

    if (displayRate) displayRate.textContent = formatINR(crop.msp);
    if (displayQty) {
      displayQty.textContent = `${qty} Quintals (${(qty * 100).toFixed(0)} kg) • ${isPriority ? 'Priority Fast-Track (<= 100 Qtl)' : 'Standard Queue'}`;
    }
    if (displayTotal) displayTotal.textContent = formatINR(estimatedTotal);
  }

  handleBookingSubmit() {
    const crop = db.getCropById(this.selectedCropId);
    const center = db.getCenterById(this.selectedCenterId);
    const qtyInput = document.getElementById('farmer-crop-quantity');
    const vehicleInput = document.getElementById('farmer-vehicle-no');

    const qty = parseFloat(qtyInput ? qtyInput.value : 50) || 50;
    const vehicleNo = vehicleInput && vehicleInput.value.trim() ? vehicleInput.value.trim() : 'PB 10 CU 4829';

    const newBookingId = generateBookingId('PB');
    const newOtp = generateOTP();
    // Priority is assigned if yield is <= 100 Quintals
    const isPriority = qty <= 100;
    const estimatedPayout = qty * crop.msp;

    const newBooking = {
      id: newBookingId,
      farmerName: this.currentFarmerName,
      farmerPhone: this.currentFarmerPhone,
      farmerAadhaarMasked: this.currentFarmerAadhaar,
      farmerId: this.currentFarmerId,
      bankAccountMasked: this.currentBankMasked,
      bankIfsc: this.currentBankIfsc,
      villageAddress: this.currentVillage,
      centerId: center.id,
      centerName: center.name,
      cropId: crop.id,
      cropName: crop.name,
      declaredQuantityQuintals: qty,
      estimatedPayout: estimatedPayout,
      scheduledDate: this.selectedDate,
      scheduledSlot: this.selectedSlot,
      vehicleNo: vehicleNo,
      isPriorityHighYield: isPriority,
      otpCode: newOtp,
      status: 'BOOKED',
      queueToken: null,
      queuePosition: null,
      estimatedWaitMins: null,
      checkInTime: null,
      weighment: null,
      paymentLifecycle: {
        currentStage: 0,
        submittedAt: null,
        qualityApprovedAt: null,
        paymentInitiatedAt: null,
        paymentCompletedAt: null,
        dbtBatchId: null,
        utrNumber: null,
        paymentMethod: 'Direct Benefit Transfer (DBT-PFMS)'
      },
      smsAlertsSent: [
        {
          type: 'CONFIRMATION',
          time: 'Just now',
          text: `KrishiSetu: Slot CONFIRMED for ${crop.name} (${qty} Qtl). Gate Verification OTP: ${newOtp}. Pass Ref: ${newBookingId}`
        }
      ]
    };

    db.addBooking(newBooking);
    this.activeBookingId = newBookingId;

    soundEngine.playBeep('success');
    app.showToast(`Slot Booked! Gate Verification OTP: ${newOtp}`, 'success');

    ussdSimulator.triggerPRDAlert('CONFIRMATION', newBooking);

    this.renderFarmerPassesAndLifecycle();
    this.openBookingPassModal(newBookingId);
  }

  renderFarmerPassesAndLifecycle() {
    const bookings = db.getBookings().filter(b => b.farmerPhone === this.currentFarmerPhone || b.id === this.activeBookingId);
    const container = document.getElementById('farmer-active-passes-list');
    const lifecycleContainer = document.getElementById('farmer-active-lifecycle-box');

    // Update Farmer Profile Details in Header
    const farmerHeaderName = document.getElementById('farmer-profile-name');
    const farmerHeaderAadhaar = document.getElementById('farmer-profile-aadhaar');
    const farmerHeaderId = document.getElementById('farmer-profile-id');
    const farmerHeaderBank = document.getElementById('farmer-profile-bank');

    if (farmerHeaderName) farmerHeaderName.textContent = this.currentFarmerName;
    if (farmerHeaderAadhaar) farmerHeaderAadhaar.textContent = this.currentFarmerAadhaar;
    if (farmerHeaderId) farmerHeaderId.textContent = this.currentFarmerId;
    if (farmerHeaderBank) farmerHeaderBank.textContent = this.currentBankMasked;

    if (bookings.length === 0) {
      if (container) container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No active passes found. Use the slot booking form above to book a delivery pass.</div>`;
      if (lifecycleContainer) lifecycleContainer.innerHTML = '';
      return;
    }

    const currentBooking = bookings.find(b => b.id === this.activeBookingId) || bookings[0];

    // 1. Render 3-Space Transparent Payment Lifecycle (Section 2)
    if (lifecycleContainer) {
      const stage = currentBooking.paymentLifecycle.currentStage;
      const w = currentBooking.weighment;

      lifecycleContainer.innerHTML = `
        <div class="clean-card">
          <div class="card-header-simple">
            <div class="card-heading">Transparent Procurement & Payment Lifecycle</div>
            <span class="badge-clean info">3-Stage Verification Matrix</span>
          </div>

          <!-- Top Stepper Progress Bar -->
          <div class="lifecycle-stepper-container">
            <div class="lifecycle-stepper">
              <div class="stepper-progress-bar" style="width: ${stage === 0 ? 5 : (stage === 1 ? 33 : (stage === 2 ? 66 : 100))}%;"></div>

              <div class="step-item ${stage >= 1 ? 'completed' : (stage === 0 ? 'active' : '')}">
                <div class="step-node">${stage >= 1 ? '✓' : '1'}</div>
                <div class="step-title">Gate Verification</div>
                <div class="step-time">${currentBooking.paymentLifecycle.submittedAt || (stage === 0 ? 'Awaiting Arrival' : 'Verified')}</div>
              </div>

              <div class="step-item ${stage >= 2 ? 'completed' : (stage === 1 ? 'active' : '')}">
                <div class="step-node">${stage >= 2 ? '✓' : '2'}</div>
                <div class="step-title">Weighbridge & Quality</div>
                <div class="step-time">${currentBooking.paymentLifecycle.qualityApprovedAt || (stage < 2 ? 'Pending Weighing' : 'Approved')}</div>
              </div>

              <div class="step-item ${stage >= 4 ? 'completed' : (stage >= 3 ? 'active' : '')}">
                <div class="step-node">${stage >= 4 ? '✓' : '3'}</div>
                <div class="step-title">DBT Bank Transfer</div>
                <div class="step-time">${currentBooking.paymentLifecycle.paymentCompletedAt || (stage < 3 ? 'Pending Approval' : 'Processing')}</div>
              </div>
            </div>
          </div>

          <!-- 3 Distinct Spaces Grid -->
          <div class="payment-spaces-grid">
            
            <!-- SPACE 1: Gate Arrival & Token Verification -->
            <div class="payment-space-card ${stage >= 1 ? 'active' : ''}">
              <div>
                <div class="space-header">
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span class="space-number-tag">1</span>
                    <span class="space-title">Gate Verification</span>
                  </div>
                  <span class="badge-clean ${stage >= 1 ? 'success' : ''}">${stage >= 1 ? 'Verified' : 'Pending'}</span>
                </div>
                
                <div class="space-metric-row">
                  <span class="label">Gate Check-in:</span>
                  <span class="val">${currentBooking.checkInTime || 'Not arrived yet'}</span>
                </div>
                <div class="space-metric-row">
                  <span class="label">Sequence Token:</span>
                  <span class="val" style="font-family: var(--font-mono); color: var(--color-primary);">${currentBooking.queueToken || 'Pending Gate Scan'}</span>
                </div>
                <div class="space-metric-row">
                  <span class="label">Gate Pass OTP:</span>
                  <span class="val" style="font-family: var(--font-mono); font-weight: 700;">${currentBooking.otpCode || '8492'}</span>
                </div>
                <div class="space-metric-row">
                  <span class="label">Vehicle Registration:</span>
                  <span class="val">${currentBooking.vehicleNo}</span>
                </div>
              </div>
              <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.75rem; border-top: 1px dashed var(--border-subtle); padding-top: 0.35rem;">
                Official Gatekeeper Security Authentication
              </div>
            </div>

            <!-- SPACE 2: Digital Weighbridge & Quality Lab -->
            <div class="payment-space-card ${stage >= 2 ? 'active' : ''}">
              <div>
                <div class="space-header">
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span class="space-number-tag">2</span>
                    <span class="space-title">Scale & Quality</span>
                  </div>
                  <span class="badge-clean ${stage >= 2 ? 'success' : ''}">${stage >= 2 ? 'Approved' : 'Pending'}</span>
                </div>

                <div class="space-metric-row">
                  <span class="label">Verified Net Weight:</span>
                  <span class="val" style="font-family: var(--font-mono); color: var(--color-primary);">
                    ${w ? `${w.netWeightQuintals.toFixed(2)} Qtl` : `${currentBooking.declaredQuantityQuintals} Qtl (Est)`}
                  </span>
                </div>
                <div class="space-metric-row">
                  <span class="label">Moisture Content:</span>
                  <span class="val">${w ? `${w.moisturePercent}%` : 'Standard FAQ'}</span>
                </div>
                <div class="space-metric-row">
                  <span class="label">Assigned Grade:</span>
                  <span class="val">${w ? `Grade ${w.assignedGrade} (${w.bonusPerQtl >= 0 ? '+' : ''}Rs ${w.bonusPerQtl})` : 'Grade FAQ'}</span>
                </div>
                <div class="space-metric-row">
                  <span class="label">Effective Rate / Qtl:</span>
                  <span class="val" style="font-weight: 700;">Rs ${w ? w.finalRatePerQtl : '2,275'}/Qtl</span>
                </div>
              </div>
              <div style="margin-top: 0.75rem; border-top: 1px dashed var(--border-subtle); padding-top: 0.35rem; display: flex; justify-content: space-between; align-items: center;">
                ${w ? `
                  <button class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;" onclick="farmerPortal.openWeighmentReceiptModal('${currentBooking.id}')">
                    View Weight Slip
                  </button>
                ` : `<span style="font-size: 0.7rem; color: var(--text-dim);">Slip generated after scale</span>`}
              </div>
            </div>

            <!-- SPACE 3: DBT Bank Payout & Transfer Records -->
            <div class="payment-space-card ${stage >= 3 ? 'active' : ''}">
              <div>
                <div class="space-header">
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span class="space-number-tag">3</span>
                    <span class="space-title">DBT Bank Payout</span>
                  </div>
                  <span class="badge-clean ${stage >= 4 ? 'success' : 'accent'}">${stage >= 4 ? 'Disbursed' : (stage >= 3 ? 'Initiated' : 'Pending')}</span>
                </div>

                <div class="space-metric-row">
                  <span class="label">Total Net Payable:</span>
                  <span class="val" style="font-family: var(--font-mono); font-weight: 700; font-size: 1rem; color: var(--color-primary);">
                    ${formatINR(w ? w.netPayableAmount : currentBooking.estimatedPayout)}
                  </span>
                </div>
                <div class="space-metric-row">
                  <span class="label">Bank Account:</span>
                  <span class="val">${currentBooking.bankAccountMasked}</span>
                </div>
                <div class="space-metric-row">
                  <span class="label">DBT Batch Ref:</span>
                  <span class="val" style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-secondary);">
                    ${currentBooking.paymentLifecycle.dbtBatchId || 'DBT-2026-PB-009182'}
                  </span>
                </div>
                <div class="space-metric-row">
                  <span class="label">Bank UTR Ref:</span>
                  <span class="val" style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-secondary);">
                    ${currentBooking.paymentLifecycle.utrNumber || 'Processing UTR...'}
                  </span>
                </div>
              </div>
              <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.75rem; border-top: 1px dashed var(--border-subtle); padding-top: 0.35rem;">
                Aadhaar NPCI / PFMS Direct Bridge
              </div>
            </div>

          </div>
        </div>
      `;
    }

    // 2. Render Active Agriculture Procurement Pass Card (Section 3 - AT THE LAST/BOTTOM)
    if (container) {
      container.innerHTML = `
        <div class="clean-card">
          <div class="card-header-simple">
            <div class="card-heading">Active Agricultural Procurement Pass & Verification Token</div>
            <div>
              ${currentBooking.isPriorityHighYield ? `<span class="badge-clean priority">Priority Pass (&lt;= 100 Qtl)</span>` : `<span class="badge-clean info">Standard Delivery Pass</span>`}
            </div>
          </div>

          <div class="digital-pass-card">
            <div class="pass-header">
              <div>
                <h3>Agricultural Procurement Pass</h3>
                <div style="font-size: 0.75rem; color: var(--text-muted);">State Grain Procurement Token</div>
              </div>
              <div style="display: flex; gap: 0.4rem; align-items: center;">
                <div class="pass-token-badge">
                  ${currentBooking.queueToken ? `Token: ${currentBooking.queueToken}` : `Slot: ${currentBooking.scheduledSlot.split(' - ')[0]}`}
                </div>
              </div>
            </div>
            <div class="pass-body">
              <div class="pass-details-grid">
                <div class="pass-detail-item">
                  <div class="label">Farmer Name</div>
                  <div class="val">${currentBooking.farmerName}</div>
                </div>
                <div class="pass-detail-item">
                  <div class="label">Pass Reference</div>
                  <div class="val" style="font-family: var(--font-mono); color: var(--color-primary);">${currentBooking.id}</div>
                </div>
                <div class="pass-detail-item">
                  <div class="label">Gate Verification OTP</div>
                  <div class="val" style="font-family: var(--font-mono); font-weight: 700; color: var(--color-accent); font-size: 1.05rem;">
                    ${currentBooking.otpCode || '8492'}
                  </div>
                </div>
                <div class="pass-detail-item">
                  <div class="label">Center / Mandi</div>
                  <div class="val">${currentBooking.centerName}</div>
                </div>
                <div class="pass-detail-item">
                  <div class="label">Crop & Quantity</div>
                  <div class="val">${currentBooking.cropName} • ${currentBooking.declaredQuantityQuintals} Qtl</div>
                </div>
                <div class="pass-detail-item">
                  <div class="label">Arrival Window</div>
                  <div class="val">${currentBooking.scheduledDate} (${currentBooking.scheduledSlot})</div>
                </div>
              </div>
              <div class="pass-qr-box">
                ${generateQRCodeSVG(currentBooking.id, 120)}
                <span class="qr-ref">${currentBooking.id}</span>
              </div>
            </div>
            <div class="pass-footer">
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <span class="badge-clean success">${currentBooking.status.replace('_', ' ')}</span>
                ${currentBooking.queuePosition !== null ? `<span class="badge-clean info">Position #${currentBooking.queuePosition} in Queue</span>` : ''}
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary btn-sm" onclick="farmerPortal.openRescheduleModal('${currentBooking.id}')">Reschedule / Cancel</button>
                <button class="btn btn-primary btn-sm" onclick="farmerPortal.printPass('${currentBooking.id}')">Print Pass</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // User Settings Modal (Update Details, Sales History, Logout)
  openUserSettingsModal(defaultTab = 'profile') {
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    title.textContent = 'Farmer Account Settings & Procurement Records';
    body.innerHTML = `
      <div class="settings-tabs-header">
        <button class="settings-tab-btn ${defaultTab === 'profile' ? 'active' : ''}" onclick="farmerPortal.switchSettingsTab('profile')">Update Profile Details</button>
        <button class="settings-tab-btn ${defaultTab === 'history' ? 'active' : ''}" onclick="farmerPortal.switchSettingsTab('history')">History of Past Sales</button>
        <button class="settings-tab-btn ${defaultTab === 'account' ? 'active' : ''}" onclick="farmerPortal.switchSettingsTab('account')">Account & Session</button>
      </div>

      <!-- Tab 1: Update Profile Details -->
      <div id="settings-tab-profile" class="settings-panel ${defaultTab === 'profile' ? 'active' : ''}">
        <form onsubmit="farmerPortal.saveProfileUpdates(event)">
          <div class="form-group">
            <label class="form-label">Farmer Full Name</label>
            <input type="text" id="edit-farmer-name" class="form-input" value="${this.currentFarmerName}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Registered Mobile Number (Numbers Only)</label>
            <input type="tel" id="edit-farmer-phone" class="form-input" value="${this.currentFarmerPhone}" maxlength="10" required />
          </div>
          <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 0.75rem;">
            <div class="form-group">
              <label class="form-label">Bank Account (DBT Linked)</label>
              <input type="text" id="edit-farmer-bank" class="form-input" value="${this.currentBankMasked}" required />
            </div>
            <div class="form-group">
              <label class="form-label">IFSC Code</label>
              <input type="text" id="edit-farmer-ifsc" class="form-input" value="${this.currentBankIfsc}" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Village & District Address</label>
            <input type="text" id="edit-farmer-village" class="form-input" value="${this.currentVillage}" required />
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">
            Save Profile & Bank Details
          </button>
        </form>
      </div>

      <!-- Tab 2: History of Past Sales -->
      <div id="settings-tab-history" class="settings-panel ${defaultTab === 'history' ? 'active' : ''}">
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          Verified crop sale receipts and DBT bank disbursement history:
        </div>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-medium); color: var(--text-muted);">
                <th style="padding: 0.5rem 0.35rem;">Sale Ref / Date</th>
                <th style="padding: 0.5rem 0.35rem;">Crop & Quality</th>
                <th style="padding: 0.5rem 0.35rem;">Net Weight</th>
                <th style="padding: 0.5rem 0.35rem;">Total Payout</th>
                <th style="padding: 0.5rem 0.35rem;">Status / UTR</th>
              </tr>
            </thead>
            <tbody>
              ${HISTORICAL_SALES.map(s => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 0.6rem 0.35rem;">
                    <div style="font-weight: 600; color: var(--text-main);">${s.saleId}</div>
                    <div style="color: var(--text-dim); font-size: 0.75rem;">${s.deliveredDate}</div>
                  </td>
                  <td style="padding: 0.6rem 0.35rem;">
                    <div>${s.cropName}</div>
                    <div style="color: var(--text-dim); font-size: 0.75rem;">${s.qualityGrade}</div>
                  </td>
                  <td style="padding: 0.6rem 0.35rem; font-family: var(--font-mono); font-weight: 600;">
                    ${s.netWeightQtl.toFixed(2)} Qtl
                  </td>
                  <td style="padding: 0.6rem 0.35rem; font-family: var(--font-mono); font-weight: 700; color: var(--color-primary);">
                    ${formatINR(s.totalDisbursed)}
                  </td>
                  <td style="padding: 0.6rem 0.35rem;">
                    <div class="badge-clean success" style="font-size: 0.65rem;">${s.dbtStatus}</div>
                    <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-dim); margin-top: 0.15rem;">${s.utrNumber}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Account & Session Control -->
      <div id="settings-tab-account" class="settings-panel ${defaultTab === 'account' ? 'active' : ''}">
        <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.35rem;">Logged In Farmer Session</h4>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Farmer: <strong>${this.currentFarmerName}</strong> • Phone: <strong>${this.currentFarmerPhone}</strong>
          </p>
          <button class="btn btn-secondary" style="color: var(--color-danger); border-color: var(--color-danger-soft);" onclick="app.closeModal(); app.logout();">
            Logout of Farmer Account
          </button>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
    `;

    app.openModal();
  }

  switchSettingsTab(tabName) {
    const btns = document.querySelectorAll('.settings-tab-btn');
    const panels = document.querySelectorAll('.settings-panel');

    btns.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    const activeBtn = Array.from(btns).find(b => b.textContent.toLowerCase().includes(tabName));
    const activePanel = document.getElementById(`settings-tab-${tabName}`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activePanel) activePanel.classList.add('active');
  }

  saveProfileUpdates(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('edit-farmer-name').value.trim();
    const phone = document.getElementById('edit-farmer-phone').value.trim().replace(/\D/g, '');
    const bank = document.getElementById('edit-farmer-bank').value.trim();
    const ifsc = document.getElementById('edit-farmer-ifsc').value.trim();
    const village = document.getElementById('edit-farmer-village').value.trim();

    if (phone.length !== 10) {
      app.showToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }

    this.currentFarmerName = name;
    this.currentFarmerPhone = phone;
    this.currentBankMasked = bank;
    this.currentBankIfsc = ifsc;
    this.currentVillage = village;

    if (typeof db !== 'undefined') {
      db.saveFarmer({
        farmerId: this.currentFarmerId,
        name: this.currentFarmerName,
        phone: this.currentFarmerPhone,
        aadhaar: this.currentFarmerAadhaar,
        bankMasked: this.currentBankMasked,
        bankIfsc: this.currentBankIfsc,
        address: this.currentVillage
      });
      localStorage.setItem('KS_ACTIVE_FARMER_PHONE', this.currentFarmerPhone);
    }

    soundEngine.playBeep('success');
    app.showToast('Farmer Profile & Bank Details Updated', 'success');
    app.closeModal();

    this.renderFarmerPassesAndLifecycle();
  }

  openBookingPassModal(bookingId) {
    const booking = db.getBookingById(bookingId);
    if (!booking) return;

    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    title.textContent = 'Digital Procurement Pass Generated';
    body.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <div style="display: inline-block; padding: 0.5rem; background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
          ${generateQRCodeSVG(booking.id, 160)}
        </div>
        <h3 style="margin-top: 0.5rem; font-family: var(--font-mono); color: var(--color-primary);">${booking.id}</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Present this pass & OTP at the gate scanner</p>
      </div>

      <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">Farmer:</span>
          <strong>${booking.farmerName}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">Gate Verification OTP:</span>
          <strong style="color: var(--color-accent); font-family: var(--font-mono); font-size: 1.05rem;">${booking.otpCode || '8492'}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">Center:</span>
          <strong>${booking.centerName}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">Crop & Quantity:</span>
          <strong>${booking.cropName} (${booking.declaredQuantityQuintals} Qtl)</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="color: var(--text-muted);">Arrival Window:</span>
          <strong>${booking.scheduledDate} • ${booking.scheduledSlot}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-muted);">Priority Tier:</span>
          <strong>${booking.isPriorityHighYield ? 'Priority Fast-Track (<= 100 Qtl)' : 'Standard Queue'}</strong>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
      <button class="btn btn-primary" onclick="farmerPortal.printPass('${booking.id}')">Print / Save PDF</button>
    `;

    app.openModal();
  }

  openRescheduleModal(bookingId) {
    const booking = db.getBookingById(bookingId);
    if (!booking) return;

    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    title.textContent = `Reschedule / Cancel Pass ${booking.id}`;
    body.innerHTML = `
      <div style="background: var(--color-warning-soft); border: 1px solid var(--color-accent-border); border-radius: var(--radius-md); padding: 0.75rem; margin-bottom: 1rem; font-size: 0.85rem; color: var(--color-warning);">
        Farmers can reschedule or cancel slots up to 12 hours prior to the assigned arrival window.
      </div>
      <div class="form-group">
        <label class="form-label">Select New Date</label>
        <input type="date" id="reschedule-date" class="form-input" value="${booking.scheduledDate}" min="${new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="form-group">
        <label class="form-label">Select New Window</label>
        <select id="reschedule-slot" class="form-select">
          <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM (Fast Track)</option>
          <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM (Low Congestion)</option>
          <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM (Optimal)</option>
          <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM (Fast Track)</option>
        </select>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" style="color: var(--color-danger);" onclick="farmerPortal.confirmCancel('${booking.id}')">Cancel Slot</button>
      <button class="btn btn-secondary" onclick="app.closeModal()">Keep Current</button>
      <button class="btn btn-primary" onclick="farmerPortal.confirmReschedule('${booking.id}')">Confirm Reschedule</button>
    `;

    app.openModal();
  }

  confirmReschedule(bookingId) {
    const newDate = document.getElementById('reschedule-date').value;
    const newSlot = document.getElementById('reschedule-slot').value;

    db.updateBooking(bookingId, {
      scheduledDate: newDate,
      scheduledSlot: newSlot
    });

    soundEngine.playBeep('success');
    app.showToast('Slot Rescheduled Successfully', 'info');
    app.closeModal();
    this.renderFarmerPassesAndLifecycle();
  }

  confirmCancel(bookingId) {
    db.updateBooking(bookingId, {
      status: 'CANCELLED'
    });

    soundEngine.playBeep('warning');
    app.showToast('Slot Cancelled', 'warning');
    app.closeModal();
    this.renderFarmerPassesAndLifecycle();
  }

  openWeighmentReceiptModal(bookingId) {
    const booking = db.getBookingById(bookingId);
    if (!booking || !booking.weighment) return;

    const w = booking.weighment;
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    title.textContent = 'Digital Proof of Delivery & Weighment Slip';
    body.innerHTML = `
      <div style="background: #ffffff; color: #1f2937; padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid #d1d5db; font-family: monospace; font-size: 0.85rem;">
        <div style="text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 0.5rem; margin-bottom: 0.85rem;">
          <h2 style="font-size: 1.1rem; font-weight: 700;">GOVERNMENT PROCUREMENT SYSTEM</h2>
          <h3 style="font-size: 0.95rem;">OFFICIAL WEIGHBRIDGE SLIP</h3>
          <div style="font-size: 0.75rem;">Center: ${booking.centerName}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-bottom: 0.85rem;">
          <div><strong>Slip Ref:</strong> ${booking.id}</div>
          <div><strong>Token:</strong> ${booking.queueToken || 'T-104'}</div>
          <div><strong>Farmer:</strong> ${booking.farmerName}</div>
          <div><strong>Farmer ID:</strong> ${booking.farmerId}</div>
          <div><strong>Crop:</strong> ${booking.cropName}</div>
          <div><strong>Vehicle:</strong> ${booking.vehicleNo}</div>
          <div><strong>Weighed At:</strong> ${w.weighedAt}</div>
          <div><strong>Operator:</strong> ${w.weighedBy}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 0.85rem;">
          <tr style="border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;">
            <th style="text-align: left; padding: 0.3rem 0;">Metric</th>
            <th style="text-align: right; padding: 0.3rem 0;">Measurement</th>
          </tr>
          <tr>
            <td style="padding: 0.25rem 0;">Gross Vehicle Weight</td>
            <td style="text-align: right;">${w.grossWeightKg.toLocaleString()} kg</td>
          </tr>
          <tr>
            <td style="padding: 0.25rem 0;">Tare (Empty) Weight</td>
            <td style="text-align: right;">${w.tareWeightKg.toLocaleString()} kg</td>
          </tr>
          <tr style="font-weight: bold; border-top: 1px solid #1f2937;">
            <td style="padding: 0.3rem 0;">Net Crop Weight</td>
            <td style="text-align: right;">${w.netWeightKg.toLocaleString()} kg (${w.netWeightQuintals.toFixed(2)} Qtl)</td>
          </tr>
          <tr>
            <td style="padding: 0.25rem 0;">Moisture Content</td>
            <td style="text-align: right;">${w.moisturePercent}% (Limit: 12.0%)</td>
          </tr>
          <tr>
            <td style="padding: 0.25rem 0;">Assigned Grade</td>
            <td style="text-align: right;">Grade ${w.assignedGrade} (${w.bonusPerQtl >= 0 ? '+' : ''}Rs ${w.bonusPerQtl}/Qtl)</td>
          </tr>
          <tr>
            <td style="padding: 0.25rem 0;">Effective Rate</td>
            <td style="text-align: right;">Rs ${w.finalRatePerQtl.toLocaleString()}/Qtl</td>
          </tr>
          <tr style="font-weight: 700; border-top: 2px solid #1f2937; border-bottom: 2px solid #1f2937;">
            <td style="padding: 0.4rem 0;">NET PAYABLE TO FARMER</td>
            <td style="text-align: right; color: #166534;">Rs ${w.netPayableAmount.toLocaleString()}</td>
          </tr>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
          <div style="border: 1px solid #166534; padding: 0.3rem 0.6rem; color: #166534; font-weight: bold; border-radius: 4px;">
            VERIFIED & ACCEPTED
          </div>
          <div style="text-align: right; font-size: 0.7rem; color: #6b7280;">
            Digitally Authenticated<br>
            Aadhaar DBT Bridge
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Close</button>
      <button class="btn btn-primary" onclick="window.print()">Print Official Slip</button>
    `;

    app.openModal();
  }

  printPass(bookingId) {
    window.print();
  }
}

const farmerPortal = new FarmerPortal();

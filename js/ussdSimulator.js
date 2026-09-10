/**
 * Smart Agricultural Procurement & Slot Management Platform (KrishiSetu)
 * Feature Phone USSD (*99*1#) & SMS Notification Simulator (PRD Section 4.1 & 4.4)
 */

class USSDSimulator {
  constructor() {
    this.currentScreen = 'DIAL'; // DIAL, MAIN_MENU, SELECT_CROP, ENTER_QTY, SELECT_CENTER, PASS_SUCCESS, QUEUE_STATUS, PAYMENT_STATUS, EMERGENCY_OTP
    this.enteredCode = '*99*1#';
    this.tempBooking = {
      cropId: null,
      cropName: '',
      quantity: 50,
      centerId: null,
      centerName: '',
      generatedOtp: '',
      passRef: ''
    };

    this.smsHistory = [
      {
        id: 1,
        type: 'CONFIRMATION',
        title: '1. Booking Confirmation & Gate OTP',
        text: 'KrishiSetu: Slot CONFIRMED for Wheat (65 Qtl). Gate Verification OTP: 8492. Pass Ref: KS-2026-PB-08492.',
        time: 'Yesterday, 04:30 PM'
      },
      {
        id: 2,
        type: 'PROCEED_ALERT',
        title: '2. 2-Hour Advance Gate Alert',
        text: 'KrishiSetu: 2-Hour Alert. Your slot begins at 10:00 AM. Please proceed towards Khanna Mandi Gate 2.',
        time: 'Today, 08:00 AM'
      },
      {
        id: 3,
        type: 'CHECKIN_TOKEN',
        title: '3. Queue Status & Token Issue',
        text: 'KrishiSetu: Check-in Verified. Issued Token: T-104. You are 2nd in line. Est wait: 16 mins.',
        time: 'Today, 09:48 AM'
      },
      {
        id: 4,
        type: 'QUALITY_PASS',
        title: '4. Quality Pass & Weight Slip',
        text: 'KrishiSetu: Crop Quality Grade A Approved (Moisture 11.4%). Verified Net Weight: 65.00 Qtl. Total: Rs 1,51,125.',
        time: 'Today, 10:25 AM'
      },
      {
        id: 5,
        type: 'PAYMENT_COMPLETED',
        title: '5. DBT Payment Dispatched',
        text: 'KrishiSetu DBT Alert: Rs 1,51,125 credited to HDFC A/C ..8921 via UTR: PUNBH26070982143. Ref: KS-2026-PB-08492.',
        time: 'Today, 10:35 AM'
      }
    ];
  }

  init() {
    this.renderNokiaPhone();
    this.renderSMSTriggers();
  }

  renderNokiaPhone() {
    const screen = document.getElementById('nokia-screen-content');
    if (!screen) return;

    let content = '';

    if (this.currentScreen === 'DIAL') {
      content = `
        <div style="text-align: center; margin-top: 0.85rem;">
          <div style="font-size: 0.7rem; color: #172820; margin-bottom: 0.35rem;">GSM USSD NETWORK</div>
          <div style="font-size: 1.35rem; font-weight: 700; letter-spacing: 0.08em; color: #0f1c14;">
            ${this.enteredCode}
          </div>
          <div style="font-size: 0.65rem; margin-top: 0.75rem; color: #233b2c;">
            Press [CALL] to launch KrishiSetu USSD Service
          </div>
        </div>
      `;
    } else if (this.currentScreen === 'MAIN_MENU') {
      content = `
        <div class="ussd-menu-content">
-- KRISHI SETU USSD --
1. Book Mandi Slot (Get OTP)
2. Check Queue Status
3. Track DBT Payment
4. Quick Gate OTP
0. Exit
        </div>
        <div style="font-size: 0.7rem; border-top: 1px dashed #172820; padding-top: 0.2rem;">
          Enter Option Number:
        </div>
      `;
    } else if (this.currentScreen === 'SELECT_CROP') {
      content = `
        <div class="ussd-menu-content">
-- STEP 1: SELECT CROP --
1. Wheat (MSP Rs 2,275)
2. Paddy (MSP Rs 2,320)
3. Mustard (MSP Rs 5,650)
4. Cotton (MSP Rs 7,122)

Press 0 for Menu
        </div>
      `;
    } else if (this.currentScreen === 'ENTER_QTY') {
      content = `
        <div class="ussd-menu-content">
-- STEP 2: QUANTITY --
Selected: ${this.tempBooking.cropName}

1. 25 Quintals
2. 50 Quintals
3. 100 Quintals (High-Yield)
4. 150 Quintals (High-Yield)

Press 0 for Menu
        </div>
      `;
    } else if (this.currentScreen === 'SELECT_CENTER') {
      content = `
        <div class="ussd-menu-content">
-- STEP 3: SELECT MANDI --
1. Khanna Central Mandi
2. Samrala Agro Yard
3. Sirhind Coop Hub

Press 0 for Menu
        </div>
      `;
    } else if (this.currentScreen === 'PASS_SUCCESS') {
      content = `
        <div class="ussd-menu-content">
-- PASS CONFIRMED! --
Pass Ref: ${this.tempBooking.passRef}
GATE OTP: ${this.tempBooking.generatedOtp}
Crop: ${this.tempBooking.cropName} (${this.tempBooking.quantity} Qtl)
Mandi: ${this.tempBooking.centerName}
SMS Sent! Show OTP at Gate.

Press 0 for Menu
        </div>
      `;
    } else if (this.currentScreen === 'QUEUE_STATUS') {
      const booking = db.getBookingById('KS-2026-PB-08492') || db.getBookings()[0];
      content = `
        <div class="ussd-menu-content">
-- QUEUE STATUS --
Token: ${booking.queueToken || 'T-104'}
Mandi: Khanna Mandi
Position: #${booking.queuePosition || 2} in Line
Wait Time: ~${booking.estimatedWaitMins || 16} mins
Status: Active Queue

Press 0 for Menu
        </div>
      `;
    } else if (this.currentScreen === 'PAYMENT_STATUS') {
      const booking = db.getBookingById('KS-2026-PB-08492') || db.getBookings()[0];
      content = `
        <div class="ussd-menu-content">
-- DBT PAYOUT STATUS --
Pass: ${booking.id}
Amount: Rs 1,51,125
Stage: Payment Initiated
UTR: PUNBH26070982143
A/C: ..8921

Press 0 for Menu
        </div>
      `;
    } else if (this.currentScreen === 'EMERGENCY_OTP') {
      const quickOtp = generateOTP();
      content = `
        <div class="ussd-menu-content">
-- INSTANT GATE OTP --
Your Token OTP: ${quickOtp}
Ref: KS-2026-PB-QUICK
Valid for 4 hours at Gate Scanner.

Press 0 for Menu
        </div>
      `;
    }

    screen.innerHTML = content;
  }

  pressKey(key) {
    soundEngine.playBeep('success');

    if (this.currentScreen === 'DIAL') {
      if (key === 'CALL') {
        this.currentScreen = 'MAIN_MENU';
      } else if (key === 'END') {
        this.enteredCode = '';
      } else {
        this.enteredCode += key;
      }
    } else if (this.currentScreen === 'MAIN_MENU') {
      if (key === '1') this.currentScreen = 'SELECT_CROP';
      else if (key === '2') this.currentScreen = 'QUEUE_STATUS';
      else if (key === '3') this.currentScreen = 'PAYMENT_STATUS';
      else if (key === '4') this.currentScreen = 'EMERGENCY_OTP';
      else if (key === '0' || key === 'END') this.currentScreen = 'DIAL';
    } else if (this.currentScreen === 'SELECT_CROP') {
      if (key === '1') { this.tempBooking.cropId = 'crop-1'; this.tempBooking.cropName = 'Wheat'; this.currentScreen = 'ENTER_QTY'; }
      else if (key === '2') { this.tempBooking.cropId = 'crop-2'; this.tempBooking.cropName = 'Paddy'; this.currentScreen = 'ENTER_QTY'; }
      else if (key === '3') { this.tempBooking.cropId = 'crop-3'; this.tempBooking.cropName = 'Mustard'; this.currentScreen = 'ENTER_QTY'; }
      else if (key === '4') { this.tempBooking.cropId = 'crop-4'; this.tempBooking.cropName = 'Cotton'; this.currentScreen = 'ENTER_QTY'; }
      else if (key === '0' || key === 'END') this.currentScreen = 'MAIN_MENU';
    } else if (this.currentScreen === 'ENTER_QTY') {
      if (key === '1') { this.tempBooking.quantity = 25; this.currentScreen = 'SELECT_CENTER'; }
      else if (key === '2') { this.tempBooking.quantity = 50; this.currentScreen = 'SELECT_CENTER'; }
      else if (key === '3') { this.tempBooking.quantity = 100; this.currentScreen = 'SELECT_CENTER'; }
      else if (key === '4') { this.tempBooking.quantity = 150; this.currentScreen = 'SELECT_CENTER'; }
      else if (key === '0' || key === 'END') this.currentScreen = 'MAIN_MENU';
    } else if (this.currentScreen === 'SELECT_CENTER') {
      if (key === '1' || key === '2' || key === '3') {
        const centers = db.getCenters();
        const c = key === '1' ? centers[0] : (key === '2' ? centers[1] : centers[2]);
        this.tempBooking.centerId = c.id;
        this.tempBooking.centerName = c.name;
        this.tempBooking.generatedOtp = generateOTP();
        this.tempBooking.passRef = generateBookingId('PB');

        // Create booking in database
        const crop = db.getCropById(this.tempBooking.cropId) || db.getCrops()[0];
        const newBooking = {
          id: this.tempBooking.passRef,
          farmerName: 'Ramesh Singh (Feature Phone)',
          farmerPhone: '9872100412',
          farmerAadhaarMasked: 'XXXX-XXXX-4821',
          farmerId: 'PB-FARM-99402',
          bankAccountMasked: 'HDFC Bank - A/C ..8921',
          centerId: c.id,
          centerName: c.name,
          cropId: crop.id,
          cropName: crop.name,
          declaredQuantityQuintals: this.tempBooking.quantity,
          estimatedPayout: this.tempBooking.quantity * crop.msp,
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledSlot: '11:00 AM - 12:00 PM',
          vehicleNo: 'PB 10 CU 4829',
          isPriorityHighYield: this.tempBooking.quantity >= 100,
          otpCode: this.tempBooking.generatedOtp,
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
          smsAlertsSent: []
        };

        db.addBooking(newBooking);

        // Add SMS alert
        const smsMsg = `KrishiSetu USSD: Slot BOOKED for ${crop.name} (${this.tempBooking.quantity} Qtl). GATE VERIFICATION OTP: ${this.tempBooking.generatedOtp}. Pass: ${this.tempBooking.passRef}`;
        this.smsHistory.unshift({
          id: Date.now(),
          type: 'CONFIRMATION',
          title: 'USSD Slot Confirmation & Gate OTP',
          text: smsMsg,
          time: 'Just now'
        });

        app.showToast(`USSD Booking Confirmed. Gate OTP: ${this.tempBooking.generatedOtp}`, 'success');
        this.renderSMSTriggers();
        this.currentScreen = 'PASS_SUCCESS';
      } else if (key === '0' || key === 'END') {
        this.currentScreen = 'MAIN_MENU';
      }
    } else {
      if (key === '0' || key === 'END') {
        this.currentScreen = 'MAIN_MENU';
      }
    }

    this.renderNokiaPhone();
  }

  renderSMSTriggers() {
    const container = document.getElementById('sms-triggers-feed');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.65rem;">
        ${this.smsHistory.map(sms => `
          <div class="clean-card" style="margin-bottom: 0; padding: 0.85rem; cursor: pointer;" onclick="ussdSimulator.previewSMSModal(${sms.id})">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem;">
              <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-main);">${sms.title}</div>
              <span class="badge-clean info" style="font-size: 0.65rem;">Test Trigger</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.35rem;">${sms.text}</p>
            <div style="font-size: 0.7rem; color: var(--text-dim);">${sms.time} • 100% Reachability</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  previewSMSModal(smsId) {
    const sms = this.smsHistory.find(s => s.id === smsId);
    if (!sms) return;

    soundEngine.playBeep('success');
    app.showToast(`SMS Triggered: ${sms.title}`, 'info');

    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    title.textContent = `Automated SMS Alert (PRD Event #${sms.id})`;
    body.innerHTML = `
      <div style="background: var(--bg-surface-elevated); border-radius: var(--radius-md); padding: 1.25rem; border: 1px solid var(--border-subtle); max-width: 360px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.4rem;">
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">VK-KRISHI</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">Govt. Procurement Gateway</div>
        </div>

        <div style="background: var(--bg-surface); color: var(--text-main); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.85rem; line-height: 1.45;">
          ${sms.text}
        </div>

        <div style="text-align: right; font-size: 0.7rem; color: var(--text-dim); margin-top: 0.5rem;">
          Delivered via GSM SMS Gateway • 1.2s latency
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Dismiss</button>
    `;

    app.openModal();
  }

  triggerPRDAlert(type, booking) {
    soundEngine.playBeep('success');
    let text = '';

    if (type === 'CONFIRMATION') {
      text = `KrishiSetu: Slot CONFIRMED for ${booking.cropName} (${booking.declaredQuantityQuintals} Qtl). Gate OTP: ${booking.otpCode || '8492'}. Pass: ${booking.id}`;
    } else if (type === 'CHECKIN_TOKEN') {
      text = `KrishiSetu: Check-in Verified. Issued Token: ${booking.queueToken}. Active in yard queue.`;
    } else if (type === 'QUALITY_PASS') {
      text = `KrishiSetu: Quality Approved. Net Weight: ${booking.weighment ? booking.weighment.netWeightQuintals : '65'} Qtl.`;
    } else if (type === 'PAYMENT_COMPLETED') {
      text = `KrishiSetu DBT Alert: Payout dispatched to registered bank account. Ref: ${booking.id}`;
    }

    app.showToast(text, 'info');
  }
}

const ussdSimulator = new USSDSimulator();

/**
 * Smart Agricultural Procurement & Slot Management Platform (KrishiSetu)
 * Master Application Controller, Authentication & 22-Language Search System
 */

class AppController {
  constructor() {
    this.currentRole = 'farmer'; // 'auth', 'farmer', 'admin'
    this.currentAdminSubTab = 'yard'; // 'yard', 'tv', 'analytics'
    this.currentLanguage = 'en';
    this.isOffline = false;
    this.isDrawerOpen = false;
    this.theme = 'light';
    this.farmerAuthMode = 'login'; // 'login' or 'register'
    this.generatedFarmerOtp = null;
  }

  init() {
    if (typeof cardNav !== 'undefined') {
      cardNav.init();
    }
    this.loadSavedSession();
    this.loadLanguage();
    this.bindGlobalEvents();
    this.checkFarmerLoginFormValidity();

    farmerPortal.init();
    yardManager.init();
    yardDisplay.init();
    analyticsDashboard.init();
    ussdSimulator.init();
    if (typeof emergencyConsole !== 'undefined') {
      emergencyConsole.init();
    }

    this.renderRoleView();
    console.log('KrishiSetu Platform Initialized with Animated CardNav.');
  }

  loadSavedSession() {
    const savedRole = localStorage.getItem('KS_AUTH_ROLE') || 'auth';
    this.currentRole = savedRole;
  }

  setRole(role) {
    this.currentRole = role;
    if (role) {
      localStorage.setItem('KS_AUTH_ROLE', role);
    } else {
      localStorage.removeItem('KS_AUTH_ROLE');
    }
    if (typeof cardNav !== 'undefined') {
      cardNav.render();
    }
    this.renderRoleView();
  }

  // Toggle between Farmer Login and Farmer Registration
  setFarmerAuthMode(mode) {
    this.farmerAuthMode = mode;
    const loginMode = document.getElementById('farmer-login-mode');
    const regMode = document.getElementById('farmer-register-mode');
    const tabLogin = document.getElementById('farmer-tab-login');
    const tabRegister = document.getElementById('farmer-tab-register');

    if (mode === 'login') {
      if (loginMode) loginMode.style.display = 'block';
      if (regMode) regMode.style.display = 'none';
      if (tabLogin) tabLogin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');
      this.checkFarmerLoginFormValidity();
    } else {
      if (loginMode) loginMode.style.display = 'none';
      if (regMode) regMode.style.display = 'block';
      if (tabLogin) tabLogin.classList.remove('active');
      if (tabRegister) tabRegister.classList.add('active');
      
      const addressInput = document.getElementById('reg-farmer-address');
      if (addressInput && addressInput.value) {
        this.handleRegistrationAddressInput(addressInput.value);
      }
    }
  }

  // Check Farmer Login Form Validity: phone must be 10 digits and OTP must be 6 digits
  checkFarmerLoginFormValidity() {
    const phoneInput = document.getElementById('auth-farmer-phone');
    const otpInput = document.getElementById('auth-farmer-otp');
    const submitBtn = document.getElementById('auth-farmer-login-submit-btn');

    if (!submitBtn) return;

    const phoneVal = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';
    const otpVal = otpInput ? otpInput.value.replace(/\D/g, '') : '';

    const isPhoneValid = phoneVal.length === 10;
    const isOtpValid = otpVal.length === 6;

    submitBtn.disabled = !(isPhoneValid && isOtpValid);

    // Dynamic button label based on recognized farmer
    if (isPhoneValid && typeof db !== 'undefined') {
      const recognized = db.getFarmerByPhone(phoneVal);
      if (recognized && recognized.name) {
        submitBtn.textContent = `Login as Farmer (${recognized.name})`;
      } else {
        submitBtn.textContent = 'Login as Farmer';
      }
    } else {
      submitBtn.textContent = 'Login as Farmer';
    }
  }

  // 1. Farmer Login OTP Generation
  handleFarmerGetOtp() {
    const phoneInput = document.getElementById('auth-farmer-phone');
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    const digitsOnly = phoneVal.replace(/\D/g, '');

    if (digitsOnly.length !== 10) {
      if (phoneInput) phoneInput.classList.add('input-error');
      this.showToast('Please enter a valid 10-digit mobile number before requesting OTP', 'warning');
      return;
    }

    if (phoneInput) phoneInput.classList.remove('input-error');

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    this.generatedFarmerOtp = generatedOtp;

    const otpInput = document.getElementById('auth-farmer-otp');
    const otpHint = document.getElementById('auth-farmer-otp-hint');
    const getOtpBtn = document.getElementById('auth-farmer-get-otp-btn');

    if (otpInput) {
      otpInput.disabled = false;
      otpInput.value = ''; // Keep empty so user types the code
      otpInput.focus();
    }

    if (otpHint) {
      otpHint.innerHTML = `<span style="color: var(--color-success); font-weight: 600;">✓ OTP Dispatched to +91 ${digitsOnly}: <strong>${generatedOtp}</strong> (Enter to verify)</span>`;
    }

    if (getOtpBtn) {
      getOtpBtn.textContent = 'Resend OTP';
    }

    this.checkFarmerLoginFormValidity();

    if (typeof soundEngine !== 'undefined') {
      soundEngine.playBeep('success');
    }
    this.showToast(`Your verification OTP is: ${generatedOtp}`, 'info');
  }

  // Strict Validation for Farmer Login
  handleFarmerLoginSubmit(e) {
    if (e) e.preventDefault();
    const phoneInput = document.getElementById('auth-farmer-phone');
    const otpInput = document.getElementById('auth-farmer-otp');
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    const otpVal = otpInput ? otpInput.value.trim() : '';

    // Validate 10 digits numeric only
    const digitsOnly = phoneVal.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      if (phoneInput) phoneInput.classList.add('input-error');
      this.showToast('Please enter a valid 10-digit mobile number (numbers only)', 'warning');
      return;
    }
    if (phoneInput) phoneInput.classList.remove('input-error');

    // Validate OTP requested
    if (!this.generatedFarmerOtp) {
      this.showToast('Please click "Get OTP" to receive your verification code', 'warning');
      if (otpInput) {
        otpInput.disabled = false;
        otpInput.classList.add('input-error');
      }
      return;
    }

    if (!otpVal || otpVal.length !== 6) {
      if (otpInput) otpInput.classList.add('input-error');
      this.showToast('Please enter the 6-digit OTP verification code', 'warning');
      return;
    }

    // STRICT OTP MATCH VALIDATION
    if (otpVal !== this.generatedFarmerOtp) {
      if (otpInput) {
        otpInput.classList.add('input-error');
        otpInput.focus();
      }
      if (typeof soundEngine !== 'undefined') {
        soundEngine.playBeep('error');
      }
      this.showToast('Invalid OTP entered! Please check the code and try again.', 'warning');
      return;
    }

    if (otpInput) otpInput.classList.remove('input-error');

    // Load registered farmer or create profile for first-time phone
    let farmer = typeof db !== 'undefined' ? db.getFarmerByPhone(digitsOnly) : null;
    const farmerIdInput = document.getElementById('auth-farmer-id');
    const customId = farmerIdInput ? farmerIdInput.value.trim() : '';

    if (!farmer) {
      const newFarmerId = customId || `PB-FARM-${Math.floor(10000 + Math.random() * 90000)}`;
      farmer = {
        farmerId: newFarmerId,
        name: customId ? `Farmer (${customId})` : `Farmer (${digitsOnly.slice(-4)})`,
        phone: digitsOnly,
        aadhaar: 'XXXX-XXXX-4821',
        bankMasked: 'HDFC Bank - A/C ..8921',
        bankIfsc: 'HDFC0001092',
        address: 'Village Alour, Khanna Tehsil, Ludhiana',
        registeredAt: new Date().toISOString()
      };
      if (typeof db !== 'undefined') {
        db.saveFarmer(farmer);
      }
    } else if (customId && (!farmer.farmerId || farmer.farmerId !== customId)) {
      farmer.farmerId = customId;
      if (typeof db !== 'undefined') {
        db.saveFarmer(farmer);
      }
    }

    localStorage.setItem('KS_ACTIVE_FARMER_PHONE', farmer.phone);
    if (typeof farmerPortal !== 'undefined') {
      farmerPortal.loadFarmer(farmer);
    }

    this.loginFarmer(farmer.phone, farmer.name);
  }

  // Dynamic Suggestion for Nearest Procurement Center based on Address
  handleRegistrationAddressInput(address) {
    const box = document.getElementById('nearest-center-suggestion-box');
    const nameEl = document.getElementById('nearest-center-name');
    const metaEl = document.getElementById('nearest-center-meta');
    if (!nameEl || !metaEl) return;

    const text = (address || '').toLowerCase();

    let centerName = 'Khanna Central Grain Mandi';
    let centerMeta = '📍 Approx. 4.8 km • Active Capacity: 2,500 Qtl/day • Priority Fast-Track Available';

    if (text.includes('samrala') || text.includes('141114')) {
      centerName = 'Samrala Agro Procurement Yard';
      centerMeta = '📍 Approx. 3.2 km • Active Capacity: 1,800 Qtl/day • Fast Token Lane';
    } else if (text.includes('karnal') || text.includes('haryana') || text.includes('132001')) {
      centerName = 'Karnal Regional Agro Procurement Center';
      centerMeta = '📍 Approx. 5.1 km • Active Capacity: 3,200 Qtl/day • Multi-Lane Weighbridge';
    } else if (text.includes('sirhind') || text.includes('fatehgarh') || text.includes('140406')) {
      centerName = 'Sirhind Grain Mandi';
      centerMeta = '📍 Approx. 6.4 km • Active Capacity: 2,100 Qtl/day • Automated Moisture Labs';
    } else if (text.includes('moga') || text.includes('142001')) {
      centerName = 'Moga Grain Terminal';
      centerMeta = '📍 Approx. 7.9 km • Active Capacity: 4,000 Qtl/day • High-Capacity Silo Storage';
    } else if (text.includes('amritsar') || text.includes('143001')) {
      centerName = 'Amritsar Agro Logistics Yard';
      centerMeta = '📍 Approx. 8.5 km • Active Capacity: 3,500 Qtl/day • Direct Rail Siding';
    } else if (text.includes('patiala') || text.includes('nabha') || text.includes('147001')) {
      centerName = 'Patiala Mandi Complex';
      centerMeta = '📍 Approx. 6.0 km • Active Capacity: 2,800 Qtl/day • Direct DBT Counter';
    }

    nameEl.textContent = centerName;
    metaEl.textContent = centerMeta;
    if (box) {
      box.style.display = 'block';
    }
  }

  // Handle Farmer Registration Form Submission
  handleFarmerRegisterSubmit(e) {
    if (e) e.preventDefault();

    const nameInput = document.getElementById('reg-farmer-name');
    const phoneInput = document.getElementById('reg-farmer-phone');
    const bankInput = document.getElementById('reg-farmer-bank');
    const aadhaarInput = document.getElementById('reg-farmer-aadhaar');
    const addressInput = document.getElementById('reg-farmer-address');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim().replace(/\D/g, '') : '';
    const bank = bankInput ? bankInput.value.trim() : '';
    const aadhaarRaw = aadhaarInput ? aadhaarInput.value.trim().replace(/\D/g, '') : '';
    const address = addressInput ? addressInput.value.trim() : '';

    if (!name || name.length < 3) {
      if (nameInput) nameInput.classList.add('input-error');
      this.showToast('Please enter full Farmer Name (as per Aadhaar)', 'warning');
      return;
    }
    if (nameInput) nameInput.classList.remove('input-error');

    if (phone.length !== 10) {
      if (phoneInput) phoneInput.classList.add('input-error');
      this.showToast('Please enter a valid 10-digit phone number (numbers only)', 'warning');
      return;
    }
    if (phoneInput) phoneInput.classList.remove('input-error');

    if (!bank || bank.length < 8) {
      if (bankInput) bankInput.classList.add('input-error');
      this.showToast('Please enter a valid Bank Account Number (minimum 8 characters)', 'warning');
      return;
    }
    if (bankInput) bankInput.classList.remove('input-error');

    if (aadhaarRaw.length !== 12) {
      if (aadhaarInput) aadhaarInput.classList.add('input-error');
      this.showToast('Please enter a valid 12-digit Aadhaar Number', 'warning');
      return;
    }
    if (aadhaarInput) aadhaarInput.classList.remove('input-error');

    if (!address || address.length < 5) {
      if (addressInput) addressInput.classList.add('input-error');
      this.showToast('Please enter your address (village, tehsil, district, PIN)', 'warning');
      return;
    }
    if (addressInput) addressInput.classList.remove('input-error');

    const formattedAadhaar = `XXXX-XXXX-${aadhaarRaw.slice(-4)}`;
    const farmerId = `PB-FARM-${Math.floor(10000 + Math.random() * 90000)}`;
    const maskedBank = `Bank A/C ..${bank.slice(-4)}`;

    const newFarmer = {
      farmerId: farmerId,
      name: name,
      phone: phone,
      aadhaar: formattedAadhaar,
      bankMasked: maskedBank,
      bankIfsc: 'SBIN0001420',
      address: address,
      registeredAt: new Date().toISOString()
    };

    if (typeof db !== 'undefined') {
      db.saveFarmer(newFarmer);
    }

    localStorage.setItem('KS_ACTIVE_FARMER_PHONE', phone);

    if (typeof farmerPortal !== 'undefined') {
      farmerPortal.loadFarmer(newFarmer);
    }

    // Reset registration form inputs
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (bankInput) bankInput.value = '';
    if (aadhaarInput) aadhaarInput.value = '';
    if (addressInput) addressInput.value = '';

    if (typeof soundEngine !== 'undefined') {
      soundEngine.playBeep('success');
    }
    this.showToast(`Registration successful! Welcome to KrishiSetu, ${name}`, 'success');
    this.setRole('farmer');
  }

  loginFarmer(phone = '9872100412', name = '') {
    localStorage.setItem('KS_ACTIVE_FARMER_PHONE', phone);
    if (typeof farmerPortal !== 'undefined') {
      const farmer = typeof db !== 'undefined' ? db.getFarmerByPhone(phone) : null;
      if (farmer) {
        farmerPortal.loadFarmer(farmer);
        name = farmer.name;
      } else {
        farmerPortal.currentFarmerPhone = phone;
        if (name) farmerPortal.currentFarmerName = name;
      }
    }
    this.setRole('farmer');
    this.showToast(`Logged in as Farmer (${name || 'Verified'} - +91 ${phone})`, 'success');
  }

  // 2. Strict Comprehensive Validation for Official / Admin Login
  handleOfficialLoginSubmit(e) {
    if (e) e.preventDefault();
    const idInput = document.getElementById('auth-officer-id');
    const centerSelect = document.getElementById('auth-officer-center');
    const pinInput = document.getElementById('auth-officer-pin');

    const officerId = idInput ? idInput.value.trim() : '';
    const center = centerSelect ? centerSelect.value.trim() : '';
    const pin = pinInput ? pinInput.value.trim() : '';

    // Employee ID: strictly max 12 characters
    if (!officerId || officerId.length > 12) {
      if (idInput) idInput.classList.add('input-error');
      this.showToast('Official Employee ID is required and must not exceed 12 characters', 'warning');
      return;
    }
    if (idInput) idInput.classList.remove('input-error');

    // Center selection from dropdown
    if (!center) {
      if (centerSelect) centerSelect.classList.add('input-error');
      this.showToast('Please select a valid Procurement Mandi / Center', 'warning');
      return;
    }
    if (centerSelect) centerSelect.classList.remove('input-error');

    // PIN: strictly numeric and max 6 digits
    const pinDigits = pin.replace(/\D/g, '');
    if (!pinDigits || pinDigits.length > 6) {
      if (pinInput) pinInput.classList.add('input-error');
      this.showToast('Please enter a valid security PIN (up to 6 digits only)', 'warning');
      return;
    }
    if (pinInput) pinInput.classList.remove('input-error');

    this.loginAdmin(officerId, center);
  }

  loginAdmin(officerId = 'OFFICER-PB10', center = 'Khanna Central Grain Mandi') {
    this.setRole('admin');
    this.setAdminSubTab('yard');
    this.showToast(`Logged in as Official (${officerId} @ ${center})`, 'success');
  }

  logout() {
    this.setRole('auth');
    this.showToast('Logged out successfully', 'info');

    const phoneInput = document.getElementById('auth-farmer-phone');
    const otpInput = document.getElementById('auth-farmer-otp');
    const farmerIdInput = document.getElementById('auth-farmer-id');
    const otpHint = document.getElementById('auth-farmer-otp-hint');
    const getOtpBtn = document.getElementById('auth-farmer-get-otp-btn');
    const officerIdInput = document.getElementById('auth-officer-id');
    const officerPinInput = document.getElementById('auth-officer-pin');

    if (phoneInput) phoneInput.value = '';
    if (otpInput) {
      otpInput.value = '';
      otpInput.disabled = true;
    }
    if (farmerIdInput) farmerIdInput.value = '';
    if (otpHint) otpHint.innerHTML = "Click 'Get OTP' to receive verification code.";
    if (getOtpBtn) getOtpBtn.textContent = 'Get OTP';
    if (officerIdInput) officerIdInput.value = '';
    if (officerPinInput) officerPinInput.value = '';
    this.generatedFarmerOtp = null;
    this.checkFarmerLoginFormValidity();
  }

  setAdminSubTab(tabId) {
    this.currentAdminSubTab = tabId;

    const subBtns = document.querySelectorAll('.admin-sub-btn');
    subBtns.forEach(btn => {
      if (btn.getAttribute('data-admin-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const subPanels = document.querySelectorAll('.admin-sub-panel');
    subPanels.forEach(p => {
      if (p.id === `admin-sub-${tabId}`) {
        p.style.display = 'block';
      } else {
        p.style.display = 'none';
      }
    });

    if (tabId === 'tv') {
      yardDisplay.renderTVDisplay();
    } else if (tabId === 'analytics') {
      analyticsDashboard.renderKPIs();
      analyticsDashboard.renderRegionalCentersTable();
    } else if (tabId === 'emergency') {
      if (typeof emergencyConsole !== 'undefined') {
        emergencyConsole.renderTemplates();
        emergencyConsole.renderActiveAlertStatus();
        emergencyConsole.renderBroadcastHistory();
      }
    } else if (tabId === 'yard') {
      yardManager.renderYardPipeline();
      yardManager.renderWeighbridgeTerminal();
    }
  }

  renderRoleView() {
    const viewAuth = document.getElementById('view-auth');
    const viewFarmer = document.getElementById('view-farmer');
    const viewAdmin = document.getElementById('view-admin');
    const userSessionPill = document.getElementById('header-user-session');

    if (viewAuth) viewAuth.style.display = 'none';
    if (viewFarmer) viewFarmer.style.display = 'none';
    if (viewAdmin) viewAdmin.style.display = 'none';

    if (this.currentRole === 'farmer') {
      if (viewFarmer) viewFarmer.style.display = 'block';
      if (userSessionPill) {
        userSessionPill.innerHTML = `
          <span>Farmer: ${farmerPortal.currentFarmerName.split(' ')[0]}</span>
          <button class="btn-utility" style="padding: 0.2rem 0.4rem; font-size: 0.75rem;" onclick="app.logout()">Logout</button>
        `;
        userSessionPill.style.display = 'inline-flex';
      }
      farmerPortal.renderFarmerPassesAndLifecycle();
    } else if (this.currentRole === 'admin') {
      if (viewAdmin) viewAdmin.style.display = 'block';
      if (userSessionPill) {
        userSessionPill.innerHTML = `
          <span>Official: Suresh Verma</span>
          <button class="btn-utility" style="padding: 0.2rem 0.4rem; font-size: 0.75rem;" onclick="app.logout()">Logout</button>
        `;
        userSessionPill.style.display = 'inline-flex';
      }
      this.setAdminSubTab(this.currentAdminSubTab || 'yard');
    } else {
      if (viewAuth) viewAuth.style.display = 'block';
      if (userSessionPill) userSessionPill.style.display = 'none';
    }

    if (typeof GradualBlur !== 'undefined') {
      setTimeout(() => GradualBlur.initAuto(), 50);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  bindGlobalEvents() {
    // Farmer Mobile input restriction to numbers only (10 digits)
    const phoneInput = document.getElementById('auth-farmer-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        this.checkFarmerLoginFormValidity();
      });
    }

    // Farmer OTP input restriction to numbers only (6 digits)
    const otpInput = document.getElementById('auth-farmer-otp');
    if (otpInput) {
      otpInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
        this.checkFarmerLoginFormValidity();
      });
    }

    // Registration Phone input (10 digits numeric only)
    const regPhoneInput = document.getElementById('reg-farmer-phone');
    if (regPhoneInput) {
      regPhoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      });
    }

    // Registration Bank Account (numeric/alphanumeric max 18 chars)
    const regBankInput = document.getElementById('reg-farmer-bank');
    if (regBankInput) {
      regBankInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18);
      });
    }

    // Registration Aadhaar (12 digits with XXXX-XXXX-XXXX auto formatting)
    const regAadhaarInput = document.getElementById('reg-farmer-aadhaar');
    if (regAadhaarInput) {
      regAadhaarInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 12);
        if (v.length > 8) {
          v = `${v.slice(0, 4)}-${v.slice(4, 8)}-${v.slice(8)}`;
        } else if (v.length > 4) {
          v = `${v.slice(0, 4)}-${v.slice(4)}`;
        }
        e.target.value = v;
      });
    }

    // Official Employee ID restriction to max 12 characters (alphanumeric/hyphen)
    const officerIdInput = document.getElementById('auth-officer-id');
    if (officerIdInput) {
      officerIdInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 12);
      });
    }

    // Official PIN restriction to numbers only (max 6 digits)
    const officerPinInput = document.getElementById('auth-officer-pin');
    if (officerPinInput) {
      officerPinInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
      });
    }

    // Network Toggle Button (Simulate Offline/Online)
    const networkBadge = document.getElementById('network-status-badge');
    if (networkBadge) {
      networkBadge.addEventListener('click', () => {
        this.toggleNetworkStatus();
      });
    }

    // Theme Toggle Button
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Close modal when clicking outside
    const modal = document.getElementById('global-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    // Close Drawer when clicking backdrop
    const drawerBackdrop = document.getElementById('global-drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', (e) => {
        if (e.target === drawerBackdrop) {
          this.toggleDrawer(false);
        }
      });
    }
  }

  // 22-Scheduled Languages Modal with Live Search
  openLanguageModal() {
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');

    title.textContent = 'Select Language (22 Scheduled Indian Languages)';
    body.innerHTML = `
      <div>
        <input type="text" id="lang-search-box" class="lang-search-input" placeholder="Type language name in English or native script (e.g. Tamil, বাংলা, ਪੰਜਾਬੀ)..." oninput="app.filterLanguages(this.value)" />
        
        <div id="lang-options-grid" class="lang-grid-container">
          ${this.renderLanguageGrid(SCHEDULED_LANGUAGES)}
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
    `;

    this.openModal();

    setTimeout(() => {
      const box = document.getElementById('lang-search-box');
      if (box) box.focus();
    }, 100);
  }

  renderLanguageGrid(langList) {
    return langList.map(lang => `
      <div class="lang-option-btn ${lang.code === this.currentLanguage ? 'selected' : ''}" onclick="app.selectLanguage('${lang.code}', '${lang.nameNative}')">
        <div class="lang-name-native">${lang.nameNative}</div>
        <div class="lang-name-en">${lang.nameEn} • ${lang.region}</div>
      </div>
    `).join('');
  }

  filterLanguages(query) {
    const q = query.trim().toLowerCase();
    const filtered = SCHEDULED_LANGUAGES.filter(l => 
      l.nameEn.toLowerCase().includes(q) || 
      l.nameNative.toLowerCase().includes(q) ||
      l.region.toLowerCase().includes(q)
    );

    const grid = document.getElementById('lang-options-grid');
    if (grid) {
      grid.innerHTML = filtered.length > 0 ? this.renderLanguageGrid(filtered) : `<div style="padding: 1.5rem; text-align: center; color: var(--text-dim); grid-column: 1 / -1;">No matching languages found.</div>`;
    }
  }

  selectLanguage(langCode, nativeName) {
    this.setLanguage(langCode);
    this.closeModal();
  }

  toggleDrawer(forceState = null) {
    this.isDrawerOpen = forceState !== null ? forceState : !this.isDrawerOpen;
    const drawer = document.getElementById('global-drawer-backdrop');
    if (drawer) {
      if (this.isDrawerOpen) {
        drawer.classList.add('active');
      } else {
        drawer.classList.remove('active');
      }
    }
  }

  setLanguage(langCode) {
    this.currentLanguage = langCode || 'en';
    localStorage.setItem('KS_CURRENT_LANG', this.currentLanguage);
    const dict = (typeof DICTIONARY !== 'undefined' && DICTIONARY[this.currentLanguage]) 
      ? DICTIONARY[this.currentLanguage] 
      : (typeof DICTIONARY !== 'undefined' && DICTIONARY['en'] ? DICTIONARY['en'] : {});

    // 1. Translate all text elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      } else if (DICTIONARY && DICTIONARY['en'] && DICTIONARY['en'][key]) {
        el.textContent = DICTIONARY['en'][key];
      }
    });

    // 2. Translate all placeholder inputs
    const placeholderEls = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderEls.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      } else if (DICTIONARY && DICTIONARY['en'] && DICTIONARY['en'][key]) {
        el.setAttribute('placeholder', DICTIONARY['en'][key]);
      }
    });

    // 3. Translate all titles/tooltips
    const titleEls = document.querySelectorAll('[data-i18n-title]');
    titleEls.forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key]) {
        el.setAttribute('title', dict[key]);
      }
    });

    // 4. Update html lang attribute
    document.documentElement.lang = this.currentLanguage;

    // 5. Update Navbar Card
    if (typeof cardNav !== 'undefined') {
      cardNav.render();
    }

    // 6. Update Active Sub views if initialized
    if (typeof farmerPortal !== 'undefined' && this.currentRole === 'farmer') {
      farmerPortal.renderFarmerPassesAndLifecycle();
    }
    if (typeof yardManager !== 'undefined' && this.currentRole === 'admin') {
      yardManager.renderYardPipeline();
    }
    if (typeof yardDisplay !== 'undefined' && this.currentAdminSubTab === 'tv') {
      yardDisplay.renderTVDisplay();
    }

    const langObj = (typeof SCHEDULED_LANGUAGES !== 'undefined') ? SCHEDULED_LANGUAGES.find(l => l.code === this.currentLanguage) : null;
    const label = langObj ? `${langObj.nameNative} (${langObj.nameEn})` : this.currentLanguage.toUpperCase();
    this.showToast(`Language switched to ${label}`, 'info');
  }

  loadLanguage() {
    const savedLang = localStorage.getItem('KS_CURRENT_LANG') || 'en';
    this.currentLanguage = savedLang;
    this.setLanguage(this.currentLanguage);
  }

  toggleNetworkStatus() {
    this.isOffline = !this.isOffline;
    const badge = document.getElementById('network-status-badge');
    const offlineNotice = document.getElementById('global-offline-banner');

    if (this.isOffline) {
      badge.className = 'badge-clean danger';
      badge.textContent = 'Offline (Simulated)';
      if (offlineNotice) offlineNotice.style.display = 'block';
      this.showToast('Offline Mode Active. Entries are saved locally.', 'warning');
    } else {
      badge.className = 'badge-clean success';
      badge.textContent = 'Online (Synced)';
      if (offlineNotice) offlineNotice.style.display = 'none';
      const syncedCount = db.syncOfflineQueue();
      if (syncedCount > 0) {
        this.showToast(`Back online. Synced ${syncedCount} queued records.`, 'success');
      } else {
        this.showToast('Network Connected', 'success');
      }
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.textContent = this.theme === 'light' ? 'Dark Mode' : 'Light Mode';
    }
  }

  openModal() {
    const modal = document.getElementById('global-modal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeModal() {
    const modal = document.getElementById('global-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  showToast(message, type = 'success') {
    const container = document.getElementById('global-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-card`;
    toast.innerHTML = `
      <h4>Notification</h4>
      <p>${message}</p>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }
}

const app = new AppController();

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

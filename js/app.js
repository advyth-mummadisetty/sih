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
  }

  init() {
    this.loadSavedSession();
    this.loadLanguage();
    this.bindGlobalEvents();

    farmerPortal.init();
    yardManager.init();
    yardDisplay.init();
    analyticsDashboard.init();
    ussdSimulator.init();
    if (typeof emergencyConsole !== 'undefined') {
      emergencyConsole.init();
    }

    this.renderRoleView();
    console.log('KrishiSetu Platform Initialized in Light Pastel Green.');
  }

  loadSavedSession() {
    const savedRole = localStorage.getItem('KS_AUTH_ROLE') || 'farmer';
    this.currentRole = savedRole;
  }

  setRole(role) {
    this.currentRole = role;
    if (role) {
      localStorage.setItem('KS_AUTH_ROLE', role);
    } else {
      localStorage.removeItem('KS_AUTH_ROLE');
    }
    this.renderRoleView();
  }

  // Strict Numeric Validation for Farmer Login
  handleFarmerLoginSubmit(e) {
    if (e) e.preventDefault();
    const phoneInput = document.getElementById('auth-farmer-phone');
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';

    // Validate 10 digits numeric only
    const digitsOnly = phoneVal.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      if (phoneInput) phoneInput.classList.add('input-error');
      this.showToast('Please enter a valid 10-digit mobile number (numbers only)', 'warning');
      return;
    }

    if (phoneInput) phoneInput.classList.remove('input-error');
    this.loginFarmer(digitsOnly, 'Ramesh Singh');
  }

  loginFarmer(phone = '9872100412', name = 'Ramesh Singh') {
    farmerPortal.currentFarmerPhone = phone;
    farmerPortal.currentFarmerName = name;
    this.setRole('farmer');
    this.showToast(`Logged in as Farmer (${name} - ${phone})`, 'success');
  }

  // Strict Comprehensive Validation for Official Login
  handleOfficialLoginSubmit(e) {
    if (e) e.preventDefault();
    const idInput = document.getElementById('auth-officer-id');
    const centerInput = document.getElementById('auth-officer-center');
    const deptInput = document.getElementById('auth-officer-dept');
    const pinInput = document.getElementById('auth-officer-pin');

    const officerId = idInput ? idInput.value.trim() : '';
    const center = centerInput ? centerInput.value.trim() : '';
    const dept = deptInput ? deptInput.value.trim() : '';
    const pin = pinInput ? pinInput.value.trim() : '';

    if (!officerId || !center || !dept || !pin) {
      this.showToast('Please fill in ALL official login details before proceeding', 'warning');
      if (idInput && !officerId) idInput.classList.add('input-error');
      if (centerInput && !center) centerInput.classList.add('input-error');
      if (deptInput && !dept) deptInput.classList.add('input-error');
      if (pinInput && !pin) pinInput.classList.add('input-error');
      return;
    }

    if (idInput) idInput.classList.remove('input-error');
    if (centerInput) centerInput.classList.remove('input-error');
    if (deptInput) deptInput.classList.remove('input-error');
    if (pinInput) pinInput.classList.remove('input-error');

    this.loginAdmin(officerId, center);
  }

  loginAdmin(officerId = 'OFFICER-PB-104', center = 'Khanna Mandi') {
    this.setRole('admin');
    this.setAdminSubTab('yard');
    this.showToast(`Logged in as Official (${officerId} @ ${center})`, 'success');
  }

  logout() {
    this.setRole('auth');
    this.showToast('Logged out successfully', 'info');
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

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  bindGlobalEvents() {
    // Phone input restriction to numbers only
    const phoneInput = document.getElementById('auth-farmer-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        // Strip everything except digits
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
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
    const triggerBtn = document.getElementById('lang-active-display-btn');
    if (triggerBtn) {
      triggerBtn.textContent = nativeName;
    }
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
    this.currentLanguage = langCode;
    const dict = DICTIONARY[langCode] || DICTIONARY['en'];

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    const langObj = SCHEDULED_LANGUAGES.find(l => l.code === langCode);
    const label = langObj ? `${langObj.nameNative} (${langObj.nameEn})` : langCode.toUpperCase();
    this.showToast(`Language: ${label}`, 'info');
  }

  loadLanguage() {
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

/**
 * Smart Agricultural Procurement & Slot Management Platform (KrishiSetu)
 * Role-Based Animated CardNav Component
 * Hidden on Login Page | Clean 3-Line Menu Symbol | No Emojis | Role-Specific Cards
 */

class CardNavComponent {
  constructor(options = {}) {
    this.isOpen = false;
    this.baseColor = options.baseColor || '#ffffff';
    this.menuColor = options.menuColor || '#1b2e21';
    this.buttonBgColor = options.buttonBgColor || '#233d2b';
    this.buttonTextColor = options.buttonTextColor || '#ffffff';
    this.ease = options.ease || 'power3.out'; // cubic-bezier(0.215, 0.61, 0.355, 1)
    this.theme = options.theme || 'light';
  }

  getItemsForRole(role = 'farmer') {
    if (role === 'farmer') {
      // FARMER LOGIN: Farmer Services + Mobile Tools & Profile
      return [
        {
          label: "Farmer Services",
          bgColor: "#1d3623",
          textColor: "#ffffff",
          badge: "Farmer Self-Service",
          description: "Direct quota allocation, digital pass & live payment tracking",
          links: [
            { label: "Book Procurement Slot", action: "bookSlot", ariaLabel: "Book Procurement Slot" },
            { label: "3-Space Payment Lifecycle", action: "paymentMatrix", ariaLabel: "3-Space Payment Lifecycle" },
            { label: "Active Pass & Gate OTP", action: "activePass", ariaLabel: "View Digital Pass and Gate OTP" },
            { label: "History of Past Sales & Slips", action: "salesHistory", ariaLabel: "History of Past Sales" }
          ]
        },
        {
          label: "Mobile Tools & Profile",
          bgColor: "#264831",
          textColor: "#ffffff",
          badge: "Tools & Profile",
          description: "2G GSM phone simulator and farmer profile settings",
          links: [
            { label: "Feature Phone Simulator (*99*1#)", action: "featurePhone", ariaLabel: "Feature Phone USSD Drawer" },
            { label: "Farmer Profile & Account Settings", action: "farmerProfile", ariaLabel: "Farmer Profile Settings" }
          ]
        }
      ];
    } else if (role === 'admin') {
      // OFFICIAL / ADMIN LOGIN: Mandi Operations + Emergency Broadcast + Yard Utilities
      return [
        {
          label: "Mandi Operations",
          bgColor: "#1c3824",
          textColor: "#ffffff",
          badge: "Yard Operations",
          description: "Gate scanning, weighbridge scale & live queue pipeline",
          links: [
            { label: "Digital Gate Arrival Scanner", action: "gateScanner", ariaLabel: "Digital Gate Arrival Scanner" },
            { label: "Weighbridge Terminal & Scale", action: "weighbridge", ariaLabel: "Scale and Moisture Testing" },
            { label: "Live Mandi Queue Pipeline", action: "pipeline", ariaLabel: "Mandi Queue Pipeline" },
            { label: "Live Yard TV Display Screen", action: "liveTV", ariaLabel: "Yard TV Display Screen" }
          ]
        },
        {
          label: "Emergency & Governance",
          bgColor: "#45241b",
          textColor: "#ffffff",
          badge: "High Priority",
          description: "Instant multi-channel emergency broadcast & capacity",
          links: [
            { label: "Emergency & Delay Alert Console", action: "emergencyConsole", ariaLabel: "Broadcast Instant Alert" },
            { label: "Regional Capacity Throttler", action: "capacityThrottler", ariaLabel: "Mandi Capacity Control" },
            { label: "Security & Audit Compliance Logs", action: "auditLogs", ariaLabel: "Enterprise Audit Logs" },
            { label: "Direct Benefit Transfer (DBT) Status", action: "dbtStatus", ariaLabel: "Direct Benefit Transfer Bridge" }
          ]
        },
        {
          label: "Yard Utilities & Audio",
          bgColor: "#293d30",
          textColor: "#ffffff",
          badge: "Yard Utilities",
          description: "Mandi voice token caller, audio chime & offline storage sync",
          links: [
            { label: "Voice Yard Announcer & Token Chime", action: "voiceAnnouncer", ariaLabel: "Voice Token Calling" },
            { label: "Offline Storage & Master Sync Status", action: "offlineToggle", ariaLabel: "Toggle Offline Cache" }
          ]
        }
      ];
    }
    return [];
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const container = document.getElementById('card-nav-root');
    if (!container) return;

    const currentRole = (typeof app !== 'undefined' && app.currentRole) ? app.currentRole : 'auth';
    const currentLang = (typeof app !== 'undefined' && app.currentLanguage) ? app.currentLanguage : (localStorage.getItem('KS_CURRENT_LANG') || 'en');
    const langObj = (typeof SCHEDULED_LANGUAGES !== 'undefined') ? SCHEDULED_LANGUAGES.find(l => l.code === currentLang) : null;
    const langDisplay = langObj ? langObj.nameNative : 'English';

    container.style.display = 'block';

    // 1. Auth / Login Screen Navigation Bar
    if (currentRole === 'auth') {
      container.innerHTML = `
        <div class="card-nav-wrapper">
          <div class="card-nav-bar">
            <div class="card-nav-left">
              <div class="card-nav-brand" onclick="cardNav.handleAction('home')">
                <img src="assets/krishisetu-logo.png" alt="KrishiSetu Logo" class="card-nav-logo-img" />
                <div class="card-nav-brand-text">
                  <span class="brand-title">KrishiSetu</span>
                  <span class="brand-tagline">${t('govtTagline', 'Government of India • Ministry of Agriculture')}</span>
                </div>
              </div>
            </div>

            <div class="card-nav-right">
              <button id="lang-active-display-btn" class="btn-utility" onclick="app.openLanguageModal()" title="Select Language (22 Indian Languages)" aria-label="Select Language">
                🌐 Language: <strong>${langDisplay}</strong>
              </button>
              <button id="theme-toggle-btn" class="btn-utility" onclick="app.toggleTheme()" title="Toggle Light/Dark Theme">
                ${app.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const items = this.getItemsForRole(currentRole);
    this.items = items;

    container.innerHTML = `
      <div class="card-nav-wrapper">
        <!-- Top Nav Main Bar -->
        <div class="card-nav-bar">
          <div class="card-nav-left">
            <!-- Feature Phone Drawer Quick Trigger (For Farmers) -->
            ${currentRole === 'farmer' ? `
              <button class="drawer-toggle-btn" onclick="app.toggleDrawer(true)" title="Open Feature Phone (USSD) Menu" aria-label="Feature Phone Menu">
                <div class="hamburger-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="desktop-only-text">${t('featurePhone', 'Feature Phone (USSD)')}</span>
              </button>
            ` : ''}

            <!-- Brand Logo & Identity -->
            <div class="card-nav-brand" onclick="cardNav.handleAction('home')">
              <img src="assets/krishisetu-logo.png" alt="KrishiSetu Logo" class="card-nav-logo-img" />
              <div class="card-nav-brand-text">
                <span class="brand-title">KrishiSetu</span>
                <span class="brand-tagline">
                  ${currentRole === 'farmer' ? t('farmerAccess', 'Farmer Procurement Portal') : t('officialAccess', 'Mandi Administration Portal')}
                </span>
              </div>
            </div>
          </div>

          <!-- Right Action Controls (Languages, Network Status, 3-Line Menu, and Logout on extreme right) -->
          <div class="card-nav-right">
            <!-- 22 Languages Modal Trigger -->
            <button id="lang-active-display-btn" class="btn-utility" onclick="app.openLanguageModal()" title="Select Language (22 Indian Languages)" aria-label="Select Language">
              🌐 Language: <strong>${langDisplay}</strong>
            </button>

            <!-- Offline Network Toggle -->
            <div id="network-status-badge" class="badge-clean ${app.isOffline ? 'danger' : 'success'}" style="cursor: pointer;" onclick="app.toggleNetworkStatus()" title="Toggle Simulated Offline Mode">
              ${app.isOffline ? t('offline', 'Offline') : t('online', 'Online')}
            </div>

            <!-- Simple 3-Line Menu Symbol Button -->
            <button id="card-nav-toggle-btn" class="card-nav-menu-btn" onclick="cardNav.toggleCardDeck()" aria-label="Toggle Navigation Menu" aria-expanded="false" title="Menu">
              <div class="hamburger-lines">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>

            <!-- Logout Button (Extreme Right) -->
            <button id="header-logout-btn" class="btn-utility btn-logout-nav" onclick="app.logout()" title="Logout Session" aria-label="Logout">
              ${t('logout', 'Logout')}
            </button>
          </div>
        </div>

        <!-- Animated Expandable Card Deck Container (power3.out) -->
        <div id="card-nav-deck" class="card-nav-deck" aria-hidden="true">
          <div class="card-nav-deck-inner">
            <div class="card-nav-deck-header">
              <div style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">
                ${currentRole === 'farmer' ? t('farmerAccess', 'Farmer Self-Service Navigation') : t('officialAccess', 'Official Mandi Operations Navigation')}
              </div>
              <button class="card-nav-close-btn" onclick="cardNav.closeCardDeck()" aria-label="Close Card Navigation">
                ${t('close', 'Close')}
              </button>
            </div>

            <!-- The Staggered Animated Cards Grid -->
            <div class="card-nav-grid" style="--card-count: ${items.length};">
              ${items.map((item, idx) => `
                <div class="nav-card-item" style="background: ${item.bgColor}; color: ${item.textColor}; --card-index: ${idx};">
                  <div class="nav-card-top">
                    <div class="nav-card-badge">${item.badge}</div>
                    <h3 class="nav-card-title">${item.label}</h3>
                    <p class="nav-card-desc">${item.description}</p>
                  </div>
                  <div class="nav-card-links-list">
                    ${item.links.map(link => `
                      <a href="javascript:void(0)" class="nav-card-link-item" onclick="cardNav.handleAction('${link.action}')" aria-label="${link.ariaLabel}">
                        <span class="link-label">
                          ${link.label}
                        </span>
                        <span class="link-arrow">→</span>
                      </a>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

      </div>
    `;
  }

  bindEvents() {
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeCardDeck();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const container = document.getElementById('card-nav-root');
      if (this.isOpen && container && !container.contains(e.target)) {
        this.closeCardDeck();
      }
    });
  }

  toggleCardDeck() {
    if (this.isOpen) {
      this.closeCardDeck();
    } else {
      this.openCardDeck();
    }
  }

  openCardDeck() {
    this.isOpen = true;
    const deck = document.getElementById('card-nav-deck');
    const toggleBtn = document.getElementById('card-nav-toggle-btn');
    
    if (deck) {
      deck.classList.add('open');
      deck.setAttribute('aria-hidden', 'false');
    }
    if (toggleBtn) {
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }

    soundEngine.playBeep('success');
  }

  closeCardDeck() {
    this.isOpen = false;
    const deck = document.getElementById('card-nav-deck');
    const toggleBtn = document.getElementById('card-nav-toggle-btn');
    
    if (deck) {
      deck.classList.remove('open');
      deck.setAttribute('aria-hidden', 'true');
    }
    if (toggleBtn) {
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  handleAction(action) {
    this.closeCardDeck();

    switch (action) {
      case 'home':
        if (app.currentRole === 'farmer') {
          app.setRole('farmer');
        } else if (app.currentRole === 'admin') {
          app.setRole('admin');
        } else {
          app.setRole('auth');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;

      case 'bookSlot':
        app.setRole('farmer');
        setTimeout(() => {
          const form = document.getElementById('farmer-booking-form');
          if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        break;

      case 'paymentMatrix':
        app.setRole('farmer');
        setTimeout(() => {
          const box = document.getElementById('farmer-active-lifecycle-box');
          if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        break;

      case 'activePass':
        app.setRole('farmer');
        setTimeout(() => {
          const passes = document.getElementById('farmer-active-passes-list');
          if (passes) passes.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        break;

      case 'salesHistory':
        if (typeof farmerPortal !== 'undefined') {
          farmerPortal.openUserSettingsModal('history');
        }
        break;

      case 'farmerProfile':
        if (typeof farmerPortal !== 'undefined') {
          farmerPortal.openUserSettingsModal('profile');
        }
        break;

      case 'gateScanner':
        app.setRole('admin');
        app.setAdminSubTab('yard');
        setTimeout(() => {
          const input = document.getElementById('yard-scan-input');
          if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
        break;

      case 'weighbridge':
        app.setRole('admin');
        app.setAdminSubTab('yard');
        setTimeout(() => {
          const terminal = document.getElementById('yard-weighbridge-terminal-box');
          if (terminal) terminal.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        break;

      case 'pipeline':
        app.setRole('admin');
        app.setAdminSubTab('yard');
        setTimeout(() => {
          const pipeline = document.getElementById('yard-pipeline-columns');
          if (pipeline) pipeline.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        break;

      case 'liveTV':
        app.setRole('admin');
        app.setAdminSubTab('tv');
        break;

      case 'emergencyConsole':
        app.setRole('admin');
        app.setAdminSubTab('emergency');
        setTimeout(() => {
          const emergencyBox = document.getElementById('admin-sub-emergency');
          if (emergencyBox) emergencyBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        break;

      case 'capacityThrottler':
      case 'auditLogs':
      case 'dbtStatus':
        app.setRole('admin');
        app.setAdminSubTab('analytics');
        break;

      case 'languageModal':
        app.openLanguageModal();
        break;

      case 'featurePhone':
        app.toggleDrawer(true);
        break;

      case 'voiceAnnouncer':
        app.setRole('admin');
        app.setAdminSubTab('tv');
        setTimeout(() => {
          if (typeof yardDisplay !== 'undefined') {
            yardDisplay.triggerManualChimeAndAnnouncement();
          }
        }, 250);
        break;

      case 'offlineToggle':
        app.toggleNetworkStatus();
        break;

      case 'logout':
        app.logout();
        break;

      default:
        console.log('Action triggered:', action);
    }
  }
}

const cardNav = new CardNavComponent();

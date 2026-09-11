/**
 * Smart Agricultural Procurement & Slot Management Platform (KrishiSetu)
 * Utilities: Audio Synthesizer, Speech Engine, SVG QR Generator, Storage, and Reactive State
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const playTone = (freq, start, duration, gainVal = 0.25) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(gainVal, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      playTone(523.25, now + 0.0, 0.45, 0.3); // C5
      playTone(659.25, now + 0.35, 0.55, 0.3); // E5
      playTone(783.99, now + 0.75, 0.8, 0.35); // G5
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  }

  playEmergencyChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Urgent two-tone chime for emergency alerts
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(660, now);
      osc1.frequency.setValueAtTime(880, now + 0.2);
      osc1.frequency.setValueAtTime(660, now + 0.4);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.7);
    } catch (e) {
      console.warn('Emergency audio chime notice:', e);
    }
  }

  playBeep(type = 'success') {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type === 'success' ? 'sine' : 'triangle';
      const freq = type === 'success' ? 880 : 330;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Audio beep error:', e);
    }
  }
}

const soundEngine = new SoundEngine();

// Robust Speech Synthesis with Voice Cache & Resume
let availableVoices = [];

function initVoiceSynthesizer() {
  if ('speechSynthesis' in window) {
    availableVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      availableVoices = window.speechSynthesis.getVoices();
    };
  }
}

initVoiceSynthesizer();

function announceEmergencyAlert(title, message, lang = 'en') {
  if (!('speechSynthesis' in window)) return;
  
  soundEngine.playEmergencyChime();

  setTimeout(() => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      let text = `Attention all farmers. Emergency Mandi Notice: ${title}. ${message}`;
      if (lang === 'hi') {
        text = `सभी किसान भाइयों कृपया ध्यान दें। मंडी आपातकालीन सूचना: ${title}। ${message}`;
      } else if (lang === 'pa') {
        text = `ਸਾਰੇ ਕਿਸਾਨ ਵੀਰ ਧਿਆਨ ਦੇਣ ਜੀ। ਮੰਡੀ ਐਮਰਜੈਂਸੀ ਸੂਚਨਾ: ${title}। ${message}`;
      } else if (lang === 'te') {
        text = `రైతు సోదరులందరూ దయచేసి గమనించండి. మార్కెట్ యార్డ్ అత్యవసర ప్రకటన: ${title}. ${message}`;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.90;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      if (availableVoices.length === 0) {
        availableVoices = window.speechSynthesis.getVoices();
      }

      const matchingVoice = availableVoices.find(v => v.lang.startsWith(lang)) || availableVoices.find(v => v.lang.startsWith('en'));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Emergency speech announcement notice:', e);
    }
  }, 900);
}

function announceToken(tokenNumber, location = 'Weighbridge Counter 1', lang = 'en') {
  if (!('speechSynthesis' in window)) return;
  
  soundEngine.playChime();

  setTimeout(() => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      let text = `Attention please. Token number ${tokenNumber}, please proceed to ${location}.`;
      if (lang === 'hi') {
        text = `कृपया ध्यान दें। टोकन नंबर ${tokenNumber}, कृपया ${location} पर पहुंचें।`;
      } else if (lang === 'pa') {
        text = `ਧਿਆਨ ਦਿਓ ਜੀ। ਟੋਕਨ ਨੰਬਰ ${tokenNumber}, ਕਿਰਪਾ ਕਰਕੇ ${location} ਵੱਲ ਆਓ।`;
      } else if (lang === 'te') {
        text = `దయచేసి గమనించండి. టోకెన్ సంఖ్య ${tokenNumber}, దయచేసి ${location} వద్దకు రండి.`;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Find matching regional voice if available
      if (availableVoices.length === 0) {
        availableVoices = window.speechSynthesis.getVoices();
      }

      const matchingVoice = availableVoices.find(v => v.lang.startsWith(lang)) || availableVoices.find(v => v.lang.startsWith('en'));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis notice:', e);
    }
  }, 1000);
}

// LocalStorage Database Manager
class DatabaseManager {
  constructor() {
    this.STORAGE_KEY = 'KRISHI_SETU_DB_V3';
    this.OFFLINE_QUEUE_KEY = 'KRISHI_SETU_OFFLINE_QUEUE';
    this.init();
  }

  init() {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const initialData = {
        centers: INITIAL_CENTERS,
        crops: INITIAL_CROPS,
        bookings: INITIAL_BOOKINGS,
        activeEmergencyAlert: null,
        broadcastHistory: typeof INITIAL_BROADCAST_HISTORY !== 'undefined' ? INITIAL_BROADCAST_HISTORY : [],
        activeCenterId: 'center-1',
        currentLanguage: 'en',
        lastUpdated: new Date().toISOString()
      };
      this.save(initialData);
    } else {
      // Ensure broadcast fields exist in existing storage
      try {
        const parsed = JSON.parse(existing);
        if (typeof parsed.activeEmergencyAlert === 'undefined') {
          parsed.activeEmergencyAlert = null;
          parsed.broadcastHistory = typeof INITIAL_BROADCAST_HISTORY !== 'undefined' ? INITIAL_BROADCAST_HISTORY : [];
          this.save(parsed);
        }
      } catch (e) {}
    }
  }

  get() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Failed to parse storage:', e);
      return null;
    }
  }

  save(data) {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('ks-db-updated', { detail: data }));
  }

  getBookings() {
    const data = this.get();
    return data ? data.bookings : [];
  }

  getBookingById(id) {
    const bookings = this.getBookings();
    return bookings.find(b => b.id === id || b.queueToken === id || b.otpCode === id);
  }

  addBooking(booking) {
    const data = this.get();
    data.bookings.unshift(booking);
    this.save(data);
    return booking;
  }

  updateBooking(id, updates) {
    const data = this.get();
    const index = data.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      data.bookings[index] = { ...data.bookings[index], ...updates };
      this.save(data);
      return data.bookings[index];
    }
    return null;
  }

  getCenters() {
    const data = this.get();
    return data ? data.centers : [];
  }

  getCenterById(id) {
    const centers = this.getCenters();
    return centers.find(c => c.id === id);
  }

  getCrops() {
    const data = this.get();
    return data ? data.crops : [];
  }

  getCropById(id) {
    const crops = this.getCrops();
    return crops.find(c => c.id === id);
  }

  // Offline Sync Queue
  queueOfflineAction(action) {
    const queue = this.getOfflineQueue();
    queue.push({
      ...action,
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('ks-offline-queued', { detail: queue }));
  }

  getOfflineQueue() {
    try {
      const raw = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  clearOfflineQueue() {
    localStorage.removeItem(this.OFFLINE_QUEUE_KEY);
  }

  syncOfflineQueue() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return 0;
    
    queue.forEach(item => {
      if (item.type === 'WEIGHMENT_SAVE') {
        this.updateBooking(item.bookingId, item.payload);
      } else if (item.type === 'GATE_CHECKIN') {
        this.updateBooking(item.bookingId, item.payload);
      }
    });

    this.clearOfflineQueue();
    window.dispatchEvent(new CustomEvent('ks-offline-synced', { detail: { count: queue.length } }));
    return queue.length;
  }

  // Emergency & Delay Alert Broadcasts
  getEmergencyAlert() {
    const data = this.get();
    return data ? data.activeEmergencyAlert : null;
  }

  setEmergencyAlert(alert) {
    const data = this.get();
    data.activeEmergencyAlert = alert;
    if (!data.broadcastHistory) data.broadcastHistory = [];
    // Insert at beginning of history
    data.broadcastHistory.unshift(alert);
    this.save(data);
    window.dispatchEvent(new CustomEvent('ks-emergency-broadcast', { detail: alert }));
    return alert;
  }

  clearEmergencyAlert() {
    const data = this.get();
    const current = data.activeEmergencyAlert;
    if (current) {
      // Mark as resolved in broadcast history
      if (data.broadcastHistory) {
        const histItem = data.broadcastHistory.find(h => h.id === current.id);
        if (histItem) histItem.status = 'RESOLVED';
      }
    }
    data.activeEmergencyAlert = null;
    this.save(data);
    window.dispatchEvent(new CustomEvent('ks-emergency-resolved', { detail: current }));
    return current;
  }

  getBroadcastHistory() {
    const data = this.get();
    return data && data.broadcastHistory ? data.broadcastHistory : (typeof INITIAL_BROADCAST_HISTORY !== 'undefined' ? INITIAL_BROADCAST_HISTORY : []);
  }

  addBroadcastHistoryRecord(record) {
    const data = this.get();
    if (!data.broadcastHistory) data.broadcastHistory = [];
    data.broadcastHistory.unshift(record);
    this.save(data);
    return record;
  }
}

const db = new DatabaseManager();

// SVG QR Code Generator
function generateQRCodeSVG(text, size = 160) {
  const hash = Array.from(text).reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
  const matrixSize = 25;
  const cellSize = size / matrixSize;

  let rects = '';

  const isFinderPattern = (r, c) => {
    if (r < 7 && c < 7) {
      return (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
    }
    if (r < 7 && c >= matrixSize - 7) {
      const col = c - (matrixSize - 7);
      return (r === 0 || r === 6 || col === 0 || col === 6 || (r >= 2 && r <= 4 && col >= 2 && col <= 4));
    }
    if (r >= matrixSize - 7 && c < 7) {
      const row = r - (matrixSize - 7);
      return (row === 0 || row === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
    }
    return false;
  };

  const isTimingPattern = (r, c) => {
    if (r === 6 && c >= 7 && c < matrixSize - 7) return c % 2 === 0;
    if (c === 6 && r >= 7 && r < matrixSize - 7) return r % 2 === 0;
    return false;
  };

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      let filled = false;
      if (isFinderPattern(r, c) || isTimingPattern(r, c)) {
        filled = true;
      } else {
        const charCode = text.charCodeAt((r * 5 + c) % text.length);
        const bit = ((hash ^ (r * 31 + c * 17) ^ (charCode << 2)) % 3) === 0;
        filled = bit;
      }

      if (filled) {
        rects += `<rect x="${(c * cellSize).toFixed(1)}" y="${(r * cellSize).toFixed(1)}" width="${cellSize.toFixed(1)}" height="${cellSize.toFixed(1)}" fill="#18261e" rx="0.5"/>`;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="qr-svg-generated">
      <rect width="${size}" height="${size}" fill="#FFFFFF" rx="6"/>
      <g transform="translate(6, 6) scale(${((size - 12) / size).toFixed(3)})">
        ${rects}
      </g>
      <rect x="${size / 2 - 12}" y="${size / 2 - 12}" width="24" height="24" rx="4" fill="#3d684d" stroke="#FFFFFF" stroke-width="2"/>
      <text x="${size / 2}" y="${size / 2 + 4}" font-size="10" font-weight="bold" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif">KS</text>
    </svg>
  `;
}

// Formatters & OTP generator
function formatINR(amount) {
  if (amount === null || amount === undefined) return 'Rs 0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount).replace('₹', 'Rs ');
}

function formatWeight(quintals) {
  if (!quintals) return '0.00 Qtl';
  return `${Number(quintals).toFixed(2)} Qtl (${(quintals * 100).toFixed(0)} kg)`;
}

function generateBookingId(stateCode = 'PB') {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `KS-${year}-${stateCode}-${randomNum}`;
}

function generateTokenNumber(currentCount = 105) {
  return `T-${currentCount}`;
}

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Global Internationalization Translation Helper
function t(key, fallback = '') {
  const lang = (typeof app !== 'undefined' && app.currentLanguage) ? app.currentLanguage : (localStorage.getItem('KS_CURRENT_LANG') || 'en');
  const dict = (typeof DICTIONARY !== 'undefined' && DICTIONARY[lang]) ? DICTIONARY[lang] : (typeof DICTIONARY !== 'undefined' && DICTIONARY['en'] ? DICTIONARY['en'] : {});
  if (dict && dict[key]) {
    return dict[key];
  }
  if (typeof DICTIONARY !== 'undefined' && DICTIONARY['en'] && DICTIONARY['en'][key]) {
    return DICTIONARY['en'][key];
  }
  return fallback || key;
}


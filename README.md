# KrishiSetu 🌾
> **Smart Agricultural Procurement & Transparent Payout Platform**

KrishiSetu is an integrated, end-to-end digital procurement management platform built to modernize agricultural supply chains, eliminate mandi bottlenecks, and streamline farmer payouts with complete transparency.

---

## 🌟 Key Features

- **🌾 Farmer Portal**:
  - Hourly slot booking with dynamic capacity management.
  - Transparent quality grading & moisture analysis calculator.
  - Real-time Direct Benefit Transfer (DBT) payout tracker.
  - Multi-language support (English, Hindi, Telugu, Punjabi, Marathi, Kannada, Tamil, etc.).

- **📱 USSD & Feature Phone Simulator**:
  - Interactive USSD flow (`*999#`) for offline and feature phone accessibility.
  - Offline booking, live queue check, and grievance registration.

- **🏢 Mandi Yard Management**:
  - Live gate entry verification & QR token scanning.
  - Automated weighbridge & moisture content recording.
  - Dynamic slot assignment and real-time gate pass generation.

- **📺 Public Yard Display & Token Announcer**:
  - Real-time digital billboard for yard queues, currently called tokens, and weighbridge allocations.
  - Multi-lingual audio announcement synthesis.

- **📊 Central Analytics & Emergency Console**:
  - Mandi throughput, capacity utilization, and DBT settlement speed tracking.
  - Emergency rerouting, quota adjustment, and mandi overflow controls.

---

## 🚀 Getting Started

### Local Setup (No build step required)

Simply serve the directory with any static HTTP server or open `index.html` directly in your browser.

#### Using PowerShell:
```powershell
./serve.ps1
```
Or with Python:
```bash
python -m http.server 8080
```
Or with Node.js:
```bash
npx serve .
```

Open `http://localhost:8080` in your web browser.

---

## 📁 Project Structure

```
├── css/
│   ├── main.css           # Global layout, variables, typography & base design system
│   └── components.css     # Component styles, modals, tokens & UI elements
├── js/
│   ├── app.js             # Core application state & routing controller
│   ├── data.js            # Initial mock datasets, mandi configurations & slots
│   ├── farmer.js          # Farmer dashboard, slot booking & DBT payout tracking
│   ├── yardManager.js     # Mandi officer gate check, weighment & inspection logic
│   ├── yardDisplay.js     # Public yard token board & announcement system
│   ├── emergencyConsole.js# Emergency controls & quota adjustments
│   ├── analytics.js       # Procurement trends & settlement analytics
│   ├── ussdSimulator.js   # USSD feature phone interactive terminal
│   └── utils.js           # Shared utilities, QR helpers & localization
├── index.html             # Single-page application entry point
├── serve.ps1              # Local development HTTP server script
└── README.md
```

---

## 📄 License

MIT License. Built for Smart India Hackathon (SIH).

/**
 * Smart Agricultural Procurement & Slot Management Platform (KrishiSetu)
 * Master Data: 22 Scheduled Indian Languages, Crops, Centers & Historical Sales
 */

const SCHEDULED_LANGUAGES = [
  { code: 'en', nameEn: 'English', nameNative: 'English', region: 'Global / Official' },
  { code: 'as', nameEn: 'Assamese', nameNative: 'অসমীয়া', region: 'Assam' },
  { code: 'bn', nameEn: 'Bengali', nameNative: 'বাংলা', region: 'West Bengal / Tripura' },
  { code: 'brx', nameEn: 'Bodo', nameNative: 'बड़ो', region: 'Assam' },
  { code: 'doi', nameEn: 'Dogri', nameNative: 'डोगरी', region: 'Jammu & Kashmir' },
  { code: 'gu', nameEn: 'Gujarati', nameNative: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'hi', nameEn: 'Hindi', nameNative: 'हिन्दी', region: 'Northern / Central India' },
  { code: 'kn', nameEn: 'Kannada', nameNative: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ks', nameEn: 'Kashmiri', nameNative: 'کٲشُر / कश्मीरी', region: 'Jammu & Kashmir' },
  { code: 'kok', nameEn: 'Konkani', nameNative: 'कोंकणी', region: 'Goa / Maharashtra' },
  { code: 'mai', nameEn: 'Maithili', nameNative: 'मैथिली', region: 'Bihar' },
  { code: 'ml', nameEn: 'Malayalam', nameNative: 'മലയാളം', region: 'Kerala' },
  { code: 'mni', nameEn: 'Manipuri (Meitei)', nameNative: 'মৈতৈলোন্', region: 'Manipur' },
  { code: 'mr', nameEn: 'Marathi', nameNative: 'मराठी', region: 'Maharashtra' },
  { code: 'ne', nameEn: 'Nepali', nameNative: 'नेपाली', region: 'Sikkim / West Bengal' },
  { code: 'or', nameEn: 'Odia', nameNative: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'pa', nameEn: 'Punjabi', nameNative: 'ਪੰਜਾਬੀ', region: 'Punjab / Haryana' },
  { code: 'sa', nameEn: 'Sanskrit', nameNative: 'संस्कृतम्', region: 'Classical India' },
  { code: 'sat', nameEn: 'Santali', nameNative: 'ᱥᱟᱱᱛᱟᱲᱤ', region: 'Jharkhand / Odisha' },
  { code: 'sd', nameEn: 'Sindhi', nameNative: 'سنڌي / सिंधी', region: 'Sindh Heritage' },
  { code: 'ta', nameEn: 'Tamil', nameNative: 'தமிழ்', region: 'Tamil Nadu' },
  { code: 'te', nameEn: 'Telugu', nameNative: 'తెలుగు', region: 'Andhra Pradesh / Telangana' },
  { code: 'ur', nameEn: 'Urdu', nameNative: 'اردو', region: 'National / Official' }
];

const INITIAL_CROPS = [
  {
    id: 'crop-1',
    name: 'Wheat (Gehun / Kanak)',
    code: 'WHEAT',
    msp: 2275,
    unit: 'Quintal',
    maxMoisture: 12.0,
    standardWeightTolerance: 0.5,
    qualityGrades: {
      A: { bonus: 50, desc: 'Moisture < 11%, Lustrous, No foreign matter' },
      B: { bonus: 0, desc: 'Moisture 11-12%, Standard Fair Average Quality' },
      C: { bonus: -75, desc: 'Moisture 12.1-14%, Minor dockage' }
    }
  },
  {
    id: 'crop-2',
    name: 'Paddy / Rice (Dhan / Jhona)',
    code: 'PADDY',
    msp: 2320,
    unit: 'Quintal',
    maxMoisture: 14.0,
    qualityGrades: {
      A: { bonus: 60, desc: 'Grade A Long Grain, Moisture < 13%' },
      B: { bonus: 0, desc: 'Common Paddy, FAQ standard' },
      C: { bonus: -80, desc: 'Moisture 14.1-16%, High chaff' }
    }
  },
  {
    id: 'crop-3',
    name: 'Mustard (Sarson)',
    code: 'MUSTARD',
    msp: 5650,
    unit: 'Quintal',
    maxMoisture: 8.0,
    qualityGrades: {
      A: { bonus: 100, desc: 'High Oil content (>40%), Moisture < 7%' },
      B: { bonus: 0, desc: 'Standard Oil content (38-40%)' },
      C: { bonus: -120, desc: 'Moisture > 8.5%, High foreign seed' }
    }
  },
  {
    id: 'crop-4',
    name: 'Cotton (Kapas)',
    code: 'COTTON',
    msp: 7122,
    unit: 'Quintal',
    maxMoisture: 8.5,
    qualityGrades: {
      A: { bonus: 150, desc: 'Long Staple, Bright White, Low Trash' },
      B: { bonus: 0, desc: 'Medium Staple, Standard' },
      C: { bonus: -150, desc: 'High yellow stain, High trash' }
    }
  },
  {
    id: 'crop-5',
    name: 'Maize / Corn (Makka)',
    code: 'MAIZE',
    msp: 2090,
    unit: 'Quintal',
    maxMoisture: 13.0,
    qualityGrades: {
      A: { bonus: 40, desc: 'Sound grains, Moisture < 12%' },
      B: { bonus: 0, desc: 'Standard FAQ' },
      C: { bonus: -60, desc: 'Discolored, Moisture > 13.5%' }
    }
  },
  {
    id: 'crop-6',
    name: 'Soyabean (Soybean)',
    code: 'SOYABEAN',
    msp: 4892,
    unit: 'Quintal',
    maxMoisture: 10.0,
    qualityGrades: {
      A: { bonus: 80, desc: 'Clean, Yellow, Moisture < 9%' },
      B: { bonus: 0, desc: 'Standard FAQ (9-10% moisture)' },
      C: { bonus: -100, desc: 'Split seeds, High moisture' }
    }
  }
];

const INITIAL_CENTERS = [
  {
    id: 'center-1',
    name: 'Khanna Central Grain Mandi',
    district: 'Ludhiana',
    state: 'Punjab',
    pincode: '141401',
    distanceKm: 4.8,
    dailyCapacityQuintals: 2500,
    hourlySlotCapacityQuintals: 300,
    currentBookedTodayQuintals: 1980, // >70% capacity
    operatingHours: '08:00 AM - 07:00 PM',
    weighbridgesActive: 3,
    qualityCounters: 2,
    currentWaitMins: 22,
    managerName: 'Suresh Kumar Verma',
    phone: '+91 98765 43210',
    facilities: ['Automated Weighbridge', 'Moisture Testing Lab', 'Farmer Rest Shed', 'Covered Bay', 'Priority Fast-Track Lane']
  },
  {
    id: 'center-2',
    name: 'Samrala Agro Procurement Yard',
    district: 'Ludhiana',
    state: 'Punjab',
    pincode: '141114',
    distanceKm: 12.3,
    dailyCapacityQuintals: 1800,
    hourlySlotCapacityQuintals: 220,
    currentBookedTodayQuintals: 950,
    operatingHours: '08:00 AM - 06:00 PM',
    weighbridgesActive: 2,
    qualityCounters: 1,
    currentWaitMins: 14,
    managerName: 'Harpreet Singh',
    phone: '+91 98765 11223',
    facilities: ['Digital Weighbridge', 'Moisture Analyzer', 'Drinking Water', 'Rest Area']
  },
  {
    id: 'center-3',
    name: 'Sirhind Cooperative Procurement Hub',
    district: 'Fatehgarh Sahib',
    state: 'Punjab',
    pincode: '140406',
    distanceKm: 18.5,
    dailyCapacityQuintals: 3200,
    hourlySlotCapacityQuintals: 400,
    currentBookedTodayQuintals: 2900,
    operatingHours: '07:30 AM - 08:00 PM',
    weighbridgesActive: 4,
    qualityCounters: 3,
    currentWaitMins: 38,
    managerName: 'Rajeshwar Patil',
    phone: '+91 98765 88990',
    facilities: ['Heavy Duty Weighbridge', 'Direct Rail Siding', 'Automated Lab', 'Priority Lane']
  },
  {
    id: 'center-4',
    name: 'Ambala Cantonment Agro Terminal',
    district: 'Ambala',
    state: 'Haryana',
    pincode: '133001',
    distanceKm: 34.0,
    dailyCapacityQuintals: 2200,
    hourlySlotCapacityQuintals: 260,
    currentBookedTodayQuintals: 1100,
    operatingHours: '08:00 AM - 06:30 PM',
    weighbridgesActive: 2,
    qualityCounters: 2,
    currentWaitMins: 18,
    managerName: 'Virender Hooda',
    phone: '+91 98765 33445',
    facilities: ['Electronic Scales', 'Grading Lab', 'DBT Helpdesk']
  }
];

const INITIAL_BOOKINGS = [
  {
    id: 'KS-2026-PB-08492',
    farmerName: 'Ramesh Singh',
    farmerPhone: '9872100412',
    farmerAadhaarMasked: 'XXXX-XXXX-4821',
    farmerId: 'PB-FARM-99402',
    bankAccountMasked: 'HDFC Bank - A/C ..8921',
    bankIfsc: 'HDFC0001092',
    villageAddress: 'Village Alour, Khanna Tehsil, Ludhiana',
    centerId: 'center-1',
    centerName: 'Khanna Central Grain Mandi',
    cropId: 'crop-1',
    cropName: 'Wheat',
    declaredQuantityQuintals: 65,
    estimatedPayout: 147875,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledSlot: '10:00 AM - 11:00 AM',
    vehicleNo: 'PB 10 CU 4829 (Tractor Trolley)',
    isPriorityHighYield: true, // Priority <= 100 Qtl
    otpCode: '8492',
    status: 'ACTIVE_QUEUE',
    queueToken: 'T-104',
    queuePosition: 2,
    estimatedWaitMins: 16,
    checkInTime: '09:48 AM',
    weighment: {
      grossWeightKg: 10700,
      tareWeightKg: 4200,
      netWeightKg: 6500,
      netWeightQuintals: 65.0,
      moisturePercent: 11.4,
      foreignMatterPercent: 0.4,
      assignedGrade: 'A',
      bonusPerQtl: 50,
      deductionPerQtl: 0,
      finalRatePerQtl: 2325,
      totalGrossAmount: 151125,
      mandiCessDeduction: 0,
      netPayableAmount: 151125,
      weighedBy: 'Operator Vikram (Scale #1)',
      weighedAt: '10:15 AM'
    },
    paymentLifecycle: {
      currentStage: 3,
      submittedAt: 'Today, 09:48 AM',
      qualityApprovedAt: 'Today, 10:22 AM',
      paymentInitiatedAt: 'Today, 10:35 AM',
      paymentCompletedAt: null,
      dbtBatchId: 'DBT-2026-PB-009182',
      utrNumber: 'PUNBH26070982143',
      paymentMethod: 'Direct Benefit Transfer (PFMS/Aadhaar Bridge)'
    },
    smsAlertsSent: [
      { type: 'CONFIRMATION', time: 'Yesterday, 04:30 PM', text: 'KrishiSetu: Slot CONFIRMED for Wheat (65 Qtl). Gate OTP: 8492. Pass Ref: KS-2026-PB-08492.' },
      { type: 'CHECKIN_TOKEN', time: 'Today, 09:48 AM', text: 'KrishiSetu: Check-in Verified via OTP. Issued Token: T-104. Current Position: #2 in queue.' },
      { type: 'QUALITY_PASS', time: 'Today, 10:25 AM', text: 'KrishiSetu: Quality Grade A Approved (Moisture 11.4%). Verified Net: 65.00 Qtl. Total: Rs 1,51,125.' }
    ]
  },
  {
    id: 'KS-2026-PB-08493',
    farmerName: 'Gurpreet Singh Dhillon',
    farmerPhone: '9814055672',
    farmerAadhaarMasked: 'XXXX-XXXX-9102',
    farmerId: 'PB-FARM-33109',
    bankAccountMasked: 'SBI - A/C ..4410',
    bankIfsc: 'SBIN0004928',
    villageAddress: 'Village Bija, Samrala, Ludhiana',
    centerId: 'center-1',
    centerName: 'Khanna Central Grain Mandi',
    cropId: 'crop-1',
    cropName: 'Wheat',
    declaredQuantityQuintals: 120,
    estimatedPayout: 273000,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledSlot: '09:00 AM - 10:00 AM',
    vehicleNo: 'PB 23 J 9901 (Eicher Truck)',
    isPriorityHighYield: false, // > 100 Qtl (Standard queue)
    otpCode: '3310',
    status: 'PAYMENT_COMPLETED',
    queueToken: 'T-101',
    queuePosition: 0,
    estimatedWaitMins: 0,
    checkInTime: '08:50 AM',
    weighment: {
      grossWeightKg: 18200,
      tareWeightKg: 6200,
      netWeightKg: 12000,
      netWeightQuintals: 120.0,
      moisturePercent: 11.8,
      foreignMatterPercent: 0.5,
      assignedGrade: 'B',
      bonusPerQtl: 0,
      deductionPerQtl: 0,
      finalRatePerQtl: 2275,
      totalGrossAmount: 273000,
      mandiCessDeduction: 0,
      netPayableAmount: 273000,
      weighedBy: 'Operator Vikram (Scale #2)',
      weighedAt: '09:20 AM'
    },
    paymentLifecycle: {
      currentStage: 4,
      submittedAt: 'Today, 08:50 AM',
      qualityApprovedAt: 'Today, 09:30 AM',
      paymentInitiatedAt: 'Today, 09:45 AM',
      paymentCompletedAt: 'Today, 10:10 AM',
      dbtBatchId: 'DBT-2026-PB-009170',
      utrNumber: 'SBIN00492810931',
      paymentMethod: 'Direct Benefit Transfer (DBT-PFMS)'
    },
    smsAlertsSent: [
      { type: 'CONFIRMATION', time: 'Yesterday, 02:00 PM', text: 'Slot Confirmed: Ref KS-2026-PB-08493' },
      { type: 'PAYMENT_COMPLETED', time: 'Today, 10:10 AM', text: 'KrishiSetu DBT Alert: Rs 2,73,000 credited to SBI A/C ..4410 via UTR: SBIN00492810931.' }
    ]
  }
];

// Historical Sales Data for Farmer Profile
const HISTORICAL_SALES = [
  {
    saleId: 'SALE-2025-PB-7810',
    cropName: 'Paddy (Dhan FAQ)',
    deliveredDate: '18 Oct 2025',
    mandiName: 'Khanna Central Grain Mandi',
    netWeightQtl: 85.50,
    qualityGrade: 'Grade A (Moisture 12.2%)',
    ratePerQtl: 2320,
    totalDisbursed: 198360,
    dbtStatus: 'Credited (100% Complete)',
    utrNumber: 'HDFCR52025101892'
  },
  {
    saleId: 'SALE-2025-PB-3419',
    cropName: 'Wheat (Kanak PBW-550)',
    deliveredDate: '12 Apr 2025',
    mandiName: 'Khanna Central Grain Mandi',
    netWeightQtl: 72.00,
    qualityGrade: 'Grade A (+Rs 50 Bonus)',
    ratePerQtl: 2275,
    totalDisbursed: 163800,
    dbtStatus: 'Credited (100% Complete)',
    utrNumber: 'HDFCR52025041244'
  },
  {
    saleId: 'SALE-2024-PB-9012',
    cropName: 'Mustard (Sarson)',
    deliveredDate: '24 Mar 2024',
    mandiName: 'Samrala Agro Procurement Yard',
    netWeightQtl: 38.00,
    qualityGrade: 'Grade B (FAQ Standard)',
    ratePerQtl: 5650,
    totalDisbursed: 214700,
    dbtStatus: 'Credited (100% Complete)',
    utrNumber: 'PUNBR52024032488'
  }
];

// Emergency & Delay Templates for Procurement Officers
const EMERGENCY_TEMPLATES = [
  {
    id: 'tpl-rain',
    title: 'Monsoon / Heavy Rain Downpour Warning',
    severity: 'EMERGENCY', // EMERGENCY | DELAY | ADVISORY
    category: 'Weather Alert',
    delayMinutes: 45,
    message: 'Sudden rainstorm detected in Khanna Tehsil. All open-shed grain unloading is temporarily paused for 45 mins. Tarpaulin covers deployed across all bays.',
    targetAudience: 'ALL_QUEUED'
  },
  {
    id: 'tpl-scale-calib',
    title: 'Weighbridge Line #2 Sensor Calibration',
    severity: 'DELAY',
    category: 'Equipment Maintenance',
    delayMinutes: 20,
    message: 'Weighbridge Scale Line #2 is undergoing a 20-minute digital calibration test. All trucks in queue are temporarily rerouted to Line #1. Please hold positions.',
    targetAudience: 'ALL_QUEUED'
  },
  {
    id: 'tpl-gate-congestion',
    title: 'North Gate Traffic Congestion & Holding Bay Divert',
    severity: 'DELAY',
    category: 'Logistics / Traffic',
    delayMinutes: 15,
    message: 'High vehicle volume at Main Gate 1. Inward tractor-trolleys with tokens T-105 to T-120 please proceed to Eastern Holding Bay for queue staging.',
    targetAudience: 'SCHEDULED_TODAY'
  },
  {
    id: 'tpl-moisture-notice',
    title: 'FAQ Moisture Quality Protocol Advisory',
    severity: 'ADVISORY',
    category: 'Quality Testing',
    delayMinutes: 0,
    message: 'Standard Mandi FAQ moisture limit for Wheat is strictly 12.0%. Ensure lots are sun-dried before presenting at gate to avoid dockage deductions.',
    targetAudience: 'ALL_FARMERS'
  },
  {
    id: 'tpl-power-backup',
    title: 'Grid Power Switchover to Industrial Backup Generator',
    severity: 'DELAY',
    category: 'Facility Operations',
    delayMinutes: 10,
    message: 'State electricity grid voltage drop. Switching to on-site 250 kVA backup generator. Scale data terminals will resume operations in 5-10 minutes.',
    targetAudience: 'ALL_QUEUED'
  }
];

// Initial Emergency Broadcast History Records
const INITIAL_BROADCAST_HISTORY = [
  {
    id: 'ALERT-2026-0910-01',
    title: 'Morning Gate 1 Inflow Regulation',
    category: 'Logistics',
    severity: 'ADVISORY',
    message: 'Gate #1 opened on schedule. High-yield and priority fast-track lanes active on Weighbridge Counter 1.',
    dispatchedAt: 'Today, 07:30 AM',
    dispatchedBy: 'Suresh Kumar (FCI Officer #104)',
    targetAudience: 'All Queued Farmers',
    delayMinutes: 0,
    recipientsCount: 42,
    status: 'RESOLVED'
  }
];

const DICTIONARY = {
  en: {
    appTitle: 'Smart Agricultural Procurement & Slot Management',
    tagline: 'Procurement Digitization, Queue Elimination & Transparent Payouts',
    roleFarmer: 'Farmer Portal',
    roleAdmin: 'Admin & Operations',
    roleYard: 'Yard Manager',
    roleTV: 'Live Yard TV Display',
    roleAnalysis: 'Enterprise Analysis',
    bookSlot: 'Book New Slot',
    myPasses: 'My Passes & Queues',
    payoutTracker: 'Payout Tracking',
    centerSelect: 'Select Procurement Center',
    cropSelect: 'Select Crop & Quantity',
    slotSelect: 'Choose Preferred Slot',
    submitBooking: 'Confirm & Generate Digital Pass',
    statusBooked: 'Slot Confirmed',
    statusCheckedIn: 'At Gate / Token Issued',
    statusActiveQueue: 'In Processing Queue',
    statusWeighed: 'Weighment Completed',
    statusApproved: 'Quality Approved',
    statusPaymentInitiated: 'DBT Initiated',
    statusPaymentCompleted: 'Payout Completed',
    servingNow: 'NOW SERVING',
    nextInQueue: 'NEXT IN LINE',
    estimatedWait: 'Est. Wait Time',
    currentStage: 'Current Stage',
    offlineBanner: 'Offline Mode Active. On-site entries are cached locally and will auto-sync.'
  },
  hi: {
    appTitle: 'कृषि खरीद एवं स्लॉट प्रबंधन प्रणाली',
    tagline: 'मंडी की कतारों से मुक्ति, पारदर्शी प्रत्यक्ष बैंक भुगतान',
    roleFarmer: 'किसान पोर्टल',
    roleAdmin: 'प्रशासन एवं संचालन',
    roleYard: 'यार्ड प्रबंधक',
    roleTV: 'लाइव टीवी डिस्प्ले',
    roleAnalysis: 'प्रशासनिक विश्लेषण',
    bookSlot: 'नया स्लॉट बुक करें',
    myPasses: 'मेरे पास और कतार स्थिति',
    payoutTracker: 'भुगतान स्थिति ट्रैकर',
    centerSelect: 'खरीद केंद्र चुनें',
    cropSelect: 'फसल और मात्रा दर्ज करें',
    slotSelect: 'पसंदीदा समय स्लॉट चुनें',
    submitBooking: 'पुष्टि करें और डिजिटल पास प्राप्त करें',
    statusBooked: 'स्लॉट बुक हुआ',
    statusCheckedIn: 'गेट आगमन / टोकन जारी',
    statusActiveQueue: 'कतार में प्रक्रियाधीन',
    statusWeighed: 'वजन दर्ज हुआ',
    statusApproved: 'गुणवत्ता स्वीकृत',
    statusPaymentInitiated: 'डीबीटी भुगतान प्रेषित',
    statusPaymentCompleted: 'भुगतान पूर्ण',
    servingNow: 'वर्तमान में सेवारत टोकन',
    nextInQueue: 'कतार में अगले किसान',
    estimatedWait: 'अनुमानित प्रतीक्षा समय',
    currentStage: 'वर्तमान स्थिति',
    offlineBanner: 'ऑफलाइन मोड सक्रिय। प्रविष्टियां स्थानीय रूप से सुरक्षित हैं।'
  },
  pa: {
    appTitle: 'ਖੇਤੀਬਾੜੀ ਖਰੀਦ ਅਤੇ ਸਲਾਟ ਪ੍ਰਬੰਧਨ ਪ੍ਰਣਾਲੀ',
    tagline: 'ਮੰਡੀ ਦੀਆਂ ਲੰਬੀਆਂ ਲਾਈਨਾਂ ਤੋਂ ਮੁਕਤੀ, ਸਿੱਧਾ ਖਾਤਾ ਭੁਗਤਾਨ',
    roleFarmer: 'ਕਿਸਾਨ ਪੋਰਟਲ',
    roleAdmin: 'ਪ੍ਰਸ਼ਾਸਨ ਅਤੇ ਸੰਚਾਲਨ',
    roleYard: 'ਮੰਡੀ ਪ੍ਰਬੰਧਕ',
    roleTV: 'ਲਾਈਵ ਟੀਵੀ ਡਿਸਪਲੇ',
    roleAnalysis: 'ਐਂਟਰਪ੍ਰਾਈਜ਼ ਵਿਸ਼ਲੇਸ਼ਣ',
    bookSlot: 'ਨਵਾਂ ਸਲਾਟ ਬੁੱਕ ਕਰੋ',
    myPasses: 'ਮੇਰੇ ਡਿਜੀਟਲ ਪਾਸ',
    payoutTracker: 'ਭੁਗਤਾਨ ਟ੍ਰੈਕਰ',
    centerSelect: 'ਖਰੀਦ ਕੇਂਦਰ ਚੁਣੋ',
    cropSelect: 'ਫ਼ਸਲ ਅਤੇ ਮਾਤਰਾ ਦੱਸੋ',
    slotSelect: 'ਸਮਾਂ ਸਲਾਟ ਚੁਣੋ',
    submitBooking: 'ਬੁਕਿੰਗ ਪੱਕੀ ਕਰੋ ਅਤੇ ਪਾਸ ਲਓ',
    statusBooked: 'ਸਲਾਟ ਬੁੱਕ ਹੋਇਆ',
    statusCheckedIn: 'ਗੇਟ ਤੇ ਆਮਦ ਦਰਜ',
    statusActiveQueue: 'ਪ੍ਰੋਸੈਸਿੰਗ ਕਤਾਰ ਵਿੱਚ',
    statusWeighed: 'ਤੋਲ ਮੁਕੰਮਲ',
    statusApproved: 'ਗੁਣਵੱਤਾ ਪ੍ਰਵਾਨਿਤ',
    statusPaymentInitiated: 'DBT ਭੁਗਤਾਨ ਸ਼ੁਰੂ',
    statusPaymentCompleted: 'ਖਾਤੇ ਵਿੱਚ ਰਕਮ ਜਮ੍ਹਾਂ',
    servingNow: 'ਹੁਣ ਸੇਵਾ ਦਿੱਤੀ ਜਾ ਰਹੀ ਹੈ',
    nextInQueue: 'ਕਤਾਰ ਵਿੱਚ ਅਗਲੇ',
    estimatedWait: 'ਅੰਦਾਜ਼ਨ ਉਡੀਕ ਸਮਾਂ',
    currentStage: 'ਮੌਜੂਦਾ ਸਥਿਤੀ',
    offlineBanner: 'ਆਫਲਾਈਨ ਮੋਡ ਸਰਗਰਮ ਹੈ।'
  },
  te: {
    appTitle: 'వ్యవసాయ సేకరణ & స్లాట్ నిర్వహణ వేదిక',
    tagline: 'మార్కెట్ యార్డ్ రద్దీ నివారణ, పారదర్శక ప్రత్యక్ష నగదు బదిలీ',
    roleFarmer: 'రైతు పోర్టల్',
    roleAdmin: 'అడ్మిన్ & కార్యకలాపాలు',
    roleYard: 'యార్డ్ మేనేజర్',
    roleTV: 'లైవ్ టీవీ డిస్ప్లే',
    roleAnalysis: 'విశ్లేషణలు',
    bookSlot: 'కొత్త స్లాట్ బుక్ చేయండి',
    myPasses: 'నా పాస్‌లు & క్యూ స్థితి',
    payoutTracker: 'చెల్లింపుల ట్రాకింగ్',
    centerSelect: 'సేకరణ కేంద్రాన్ని ఎంచుకోండి',
    cropSelect: 'పంట & పరిమాణం నమోదు చేయండి',
    slotSelect: 'స్లాట్ సమయం ఎంచుకోండి',
    submitBooking: 'బుకింగ్ నిర్ధారించండి',
    statusBooked: 'స్లాట్ ఖరారైంది',
    statusCheckedIn: 'గేట్ వద్దకు చేరారు',
    statusActiveQueue: 'క్యూలో ఉంది',
    statusWeighed: 'తూకం పూర్తయింది',
    statusApproved: 'నాణ్యత ఆమోదించబడింది',
    statusPaymentInitiated: 'చెల్లింపు ప్రక్రియ ప్రారంభమైంది',
    statusPaymentCompleted: 'ఖాతాలో జమయింది',
    servingNow: 'ప్రస్తుతం సేవలందిస్తున్న టోకెన్',
    nextInQueue: 'తదుపరి టోకెన్లు',
    estimatedWait: 'వేచి ఉండే సమయం',
    currentStage: 'ప్రస్తుత దశ',
    offlineBanner: 'ఆఫ్‌లైన్ మోడ్ యాక్టివ్‌గా ఉంది.'
  }
};

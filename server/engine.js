import { ZONES } from './constants.js';

let nextPatientId = 1;
const FIRST_NAMES = ["John", "Jane", "Robert", "Alice", "Michael", "Sarah", "David", "Emily"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];
const CLINICAL_CASES = [
  { disease: "Acute Myocardial Infarction (STEMI)", isCritical: true, hrRange: [110, 140], sysRange: [80, 100], diaRange: [50, 70], spO2Range: [88, 92] },
  { disease: "Ischemic Stroke", isCritical: true, hrRange: [90, 110], sysRange: [180, 220], diaRange: [100, 120], spO2Range: [92, 96] },
  { disease: "Hemorrhagic Stroke", isCritical: true, hrRange: [50, 65], sysRange: [200, 240], diaRange: [110, 130], spO2Range: [90, 95] },
  { disease: "Aortic Dissection", isCritical: true, hrRange: [120, 150], sysRange: [160, 200], diaRange: [90, 110], spO2Range: [94, 98] },
  { disease: "Septic Shock", isCritical: true, hrRange: [130, 160], sysRange: [70, 90], diaRange: [40, 60], spO2Range: [85, 90] },
  { disease: "Pulmonary Embolism", isCritical: true, hrRange: [115, 145], sysRange: [90, 110], diaRange: [60, 75], spO2Range: [80, 88] },
  { disease: "Diabetic Ketoacidosis (DKA)", isCritical: true, hrRange: [110, 130], sysRange: [100, 120], diaRange: [60, 80], spO2Range: [95, 99] },
  { disease: "Tension Pneumothorax", isCritical: true, hrRange: [130, 150], sysRange: [75, 95], diaRange: [45, 65], spO2Range: [75, 85] },
  { disease: "Ruptured Ectopic Pregnancy", isCritical: true, hrRange: [125, 145], sysRange: [80, 100], diaRange: [50, 65], spO2Range: [95, 98] },
  { disease: "Status Epilepticus", isCritical: true, hrRange: [140, 170], sysRange: [150, 180], diaRange: [90, 110], spO2Range: [82, 89] },
  { disease: "Acute Appendicitis", isCritical: false, hrRange: [90, 110], sysRange: [110, 130], diaRange: [70, 85], spO2Range: [96, 100] },
  { disease: "Uncomplicated Pneumonia", isCritical: false, hrRange: [100, 115], sysRange: [115, 135], diaRange: [75, 85], spO2Range: [92, 95] },
  { disease: "Renal Colic (Kidney Stone)", isCritical: false, hrRange: [95, 115], sysRange: [130, 160], diaRange: [85, 95], spO2Range: [98, 100] },
  { disease: "Gastroenteritis", isCritical: false, hrRange: [90, 110], sysRange: [105, 120], diaRange: [65, 80], spO2Range: [97, 100] },
  { disease: "Concussion", isCritical: false, hrRange: [75, 95], sysRange: [110, 125], diaRange: [70, 80], spO2Range: [98, 100] }
];

export function generatePatient() {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const caseTemplate = CLINICAL_CASES[Math.floor(Math.random() * CLINICAL_CASES.length)];

  // Create basic vitals based on specific case template
  const hr = Math.floor(Math.random() * (caseTemplate.hrRange[1] - caseTemplate.hrRange[0] + 1)) + caseTemplate.hrRange[0];
  const sysBp = Math.floor(Math.random() * (caseTemplate.sysRange[1] - caseTemplate.sysRange[0] + 1)) + caseTemplate.sysRange[0];
  const diaBp = Math.floor(Math.random() * (caseTemplate.diaRange[1] - caseTemplate.diaRange[0] + 1)) + caseTemplate.diaRange[0];
  const spO2 = Math.floor(Math.random() * (caseTemplate.spO2Range[1] - caseTemplate.spO2Range[0] + 1)) + caseTemplate.spO2Range[0];
  
  const patient = {
    id: `PT-${nextPatientId++}`,
    name: `${firstName} ${lastName}`,
    vitalityScore: caseTemplate.isCritical ? 60 : 95, // 0 to 100
    location: ZONES.ER_WAITING,
    triageStatus: 'UNASSIGNED', // UNASSIGNED, GREEN, YELLOW, RED
    vitals: {
      hr,
      bp: `${sysBp}/${diaBp}`,
      spO2,
      temp: (Math.random() * 3 + 36.5).toFixed(1)
    },
    hiddenDiagnoses: [caseTemplate.disease],
    discoveredDiagnoses: [],
    treatments: [],
    isDead: false,
    admittedAt: Date.now()
  };
  return patient;
}

export function processDecay(patient) {
  if (patient.isDead || patient.location === ZONES.DISCHARGED) return;

  let decayRate = 0;
  
  // Base decay if in waiting room unassigned
  if (patient.location === ZONES.ER_WAITING && patient.triageStatus === 'UNASSIGNED') {
    decayRate += 0.05;
  }
  
  // Triage based decay rate (red patients decay fast if not treated!)
  if (patient.triageStatus === 'RED') decayRate += 0.3;
  else if (patient.triageStatus === 'YELLOW') decayRate += 0.1;
  else if (patient.triageStatus === 'GREEN') decayRate += 0.02;

  // Mitigation from treatments
  const mitigation = patient.treatments.length * 0.1;
  decayRate = Math.max(0.01, decayRate - mitigation); // Minimum baseline decay if not cured

  // Apply decay
  patient.vitalityScore = Math.max(0, patient.vitalityScore - decayRate);

  // If vitals drop to 0, patient dies
  if (patient.vitalityScore <= 0) {
    patient.isDead = true;
    patient.vitalityScore = 0;
    patient.location = ZONES.MORGUE;
    
    // Flatten vitals
    patient.vitals.hr = 0;
    patient.vitals.bp = '0/0';
    patient.vitals.spO2 = 0;
  } else {
    // Dynamically adjust raw vitals roughly based on vitality score to reflect the UI
    if (patient.vitalityScore < 40) {
        // Patient starts crashing objectively
        if (patient.vitals.hr < 130) patient.vitals.hr += 1;
    }
  }
}

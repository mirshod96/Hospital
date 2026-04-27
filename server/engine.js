import { ZONES } from './constants.js';

let nextPatientId = 1;
const FIRST_NAMES = ["John", "Jane", "Robert", "Alice", "Michael", "Sarah", "David", "Emily"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];
const HIDDEN_CONDITIONS = ["Sepsis", "Myocardial Infarction", "Pulmonary Embolism", "Internal Bleeding", "Pneumothorax", "Stroke", "DKA"];

export function generatePatient() {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const disease = HIDDEN_CONDITIONS[Math.floor(Math.random() * HIDDEN_CONDITIONS.length)];

  // Create basic vitals based on condition severity (randomized for now)
  const isCritical = Math.random() > 0.7;
  const hr = isCritical ? Math.floor(Math.random() * 40) + 110 : Math.floor(Math.random() * 40) + 60;
  const sysBp = isCritical ? Math.floor(Math.random() * 40) + 70 : Math.floor(Math.random() * 40) + 110;
  const diaBp = isCritical ? Math.floor(Math.random() * 20) + 40 : Math.floor(Math.random() * 20) + 70;
  
  const patient = {
    id: `PT-${nextPatientId++}`,
    name: `${firstName} ${lastName}`,
    vitalityScore: isCritical ? 60 : 95, // 0 to 100
    location: ZONES.ER_WAITING,
    triageStatus: 'UNASSIGNED', // UNASSIGNED, GREEN, YELLOW, RED
    vitals: {
      hr,
      bp: `${sysBp}/${diaBp}`,
      spO2: isCritical ? Math.floor(Math.random() * 10) + 85 : Math.floor(Math.random() * 5) + 95,
      temp: (Math.random() * 3 + 36.5).toFixed(1)
    },
    hiddenDiagnoses: [disease],
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
    decayRate += 0.2;
  }
  
  // Triage based decay rate (red patients decay fast if not treated!)
  if (patient.triageStatus === 'RED') decayRate += 1.5;
  else if (patient.triageStatus === 'YELLOW') decayRate += 0.5;
  else if (patient.triageStatus === 'GREEN') decayRate += 0.1;

  // Mitigation from treatments
  const mitigation = patient.treatments.length * 0.4;
  decayRate = Math.max(0.05, decayRate - mitigation); // Minimum baseline decay if not cured

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

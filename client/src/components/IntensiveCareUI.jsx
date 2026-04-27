import React, { useState } from 'react';
import { ZONES } from '../constants';

export default function IntensiveCareUI({ state, socket, role }) {
  const { patients } = state;
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // ICU sees all patients in ICU or Ward
  const icuPatients = patients.filter(p => !p.isDead && (p.location === ZONES.ICU || p.location === ZONES.WARD));
  const activeVents = patients.filter(p => !p.isDead && p.treatments.includes('Mechanical Ventilation')).length;
  const MAX_VENTS = 3;

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleIntervention = (treatmentName) => {
    socket.emit('addTreatment', { patientId: selectedPatientId, treatment: treatmentName });
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
      {/* List */}
      <div className="glass-panel" style={{ flex: '0 0 300px', padding: '1rem', overflowY: 'auto' }}>
        <h3 className="gradient-text">ICU / Ward Registry</h3>
        <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Role: {role}</p>
        <div style={{ marginBottom: '1rem', color: activeVents >= MAX_VENTS ? 'var(--triage-red)' : 'var(--text-accent)' }}>
            Ventilators in Use: {activeVents} / {MAX_VENTS}
        </div>
        {icuPatients.map(p => (
           <div 
             key={p.id} 
             onClick={() => setSelectedPatientId(p.id)}
             style={{ 
               background: p.id === selectedPatientId ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.4)', 
               padding: '0.8rem', 
               borderRadius: '8px', 
               cursor: 'pointer',
               marginBottom: '0.5rem', 
               borderLeft: `4px solid var(--triage-${p.vitalityScore < 40 ? 'red' : 'yellow'})` 
             }}
           >
             <div style={{ fontWeight: 'bold' }}>{p.name} [{p.id}]</div>
             <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loc: {p.location} | Vits: {Math.floor(p.vitalityScore)}%</div>
           </div>
        ))}
      </div>

      {/* Details */}
      <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {selectedPatient ? (
           <>
             <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
               <div>
                  <h2>{selectedPatient.name}</h2>
                  <div style={{ color: 'var(--text-muted)' }}>ID: {selectedPatient.id} | Loc: {selectedPatient.location}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: selectedPatient.vitalityScore < 30 ? 'var(--triage-red)' : 'var(--triage-green)' }}>
                    {Math.floor(selectedPatient.vitalityScore)}% 
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vitality Score</div>
               </div>
             </div>

             <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                   <h3 style={{ color: 'var(--text-accent)' }}>Telemetry</h3>
                   <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '1.2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>HR: {selectedPatient.vitals.hr}</div>
                      <div>BP: {selectedPatient.vitals.bp}</div>
                      <div>SpO2: {selectedPatient.vitals.spO2}%</div>
                      <div>Temp: {selectedPatient.vitals.temp}</div>
                   </div>
                   
                   <h3 style={{ marginTop: '2rem', color: 'var(--text-accent)' }}>Current Regimen</h3>
                   <ul style={{ marginBottom: '2rem' }}>
                     {selectedPatient.treatments.map((t, i) => <li key={i}>{t}</li>)}
                   </ul>
                </div>

                <div style={{ flex: 1 }}>
                   <h3 style={{ color: 'var(--text-accent)' }}>Critical Interventions</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <button 
                        className="btn primary" 
                        onClick={() => handleIntervention('Mechanical Ventilation')}
                        disabled={selectedPatient.treatments.includes('Mechanical Ventilation') || activeVents >= MAX_VENTS}
                     >
                        Initiate Mechanical Ventilation {activeVents >= MAX_VENTS && '(NO VENTS)'}
                     </button>
                     <button className="btn primary" onClick={() => handleIntervention('Vasopressors (Norepinephrine)')}>Start Vasopressors</button>
                     <button className="btn primary" onClick={() => handleIntervention('Sedation (Propofol)')}>Administer Sedation</button>
                     <button className="btn danger" onClick={() => handleIntervention('CPR / Defibrillation')}>Emergency CPR / Defib</button>
                   </div>
                </div>
             </div>
           </>
        ) : (
           <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
             Select a patient to manage life support and critical care.
           </div>
        )}
      </div>
    </div>
  );
}

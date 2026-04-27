import React, { useState } from 'react';
import { ZONES } from '../constants';

export default function ERPhysicianUI({ state, socket, role }) {
  const { patients } = state;
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  // ER sees all waiting + relevant triage
  const erPatients = patients.filter(p => !p.isDead && p.location === ZONES.ER_WAITING);
  
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleTriage = (status) => {
    socket.emit('updatePatientState', { patientId: selectedPatientId, patch: { triageStatus: status } });
  };

  const handleOrderTest = (testName) => {
    // Stub for ordering test
    socket.emit('addTreatment', { patientId: selectedPatientId, treatment: testName });
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
      {/* List */}
      <div className="glass-panel" style={{ flex: '0 0 300px', padding: '1rem', overflowY: 'auto' }}>
        <h3 className="gradient-text">ER Queue ({erPatients.length})</h3>
        <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Role: {role}</p>
        {erPatients.map(p => (
           <div 
             key={p.id} 
             onClick={() => setSelectedPatientId(p.id)}
             style={{ 
               background: p.id === selectedPatientId ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.4)', 
               padding: '0.8rem', 
               borderRadius: '8px', 
               cursor: 'pointer',
               marginBottom: '0.5rem', 
               borderLeft: `4px solid var(--triage-${p.triageStatus.toLowerCase()})` 
             }}
           >
             <div style={{ fontWeight: 'bold' }}>{p.name} [{p.id}]</div>
             <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status: {p.triageStatus}</div>
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
                   <h3 style={{ color: 'var(--text-accent)' }}>Vitals Monitor</h3>
                   <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '1.2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><span style={{color:'var(--triage-green)'}}>HR:</span> {selectedPatient.vitals.hr} bpm</div>
                      <div><span style={{color:'var(--triage-red)'}}>BP:</span> {selectedPatient.vitals.bp} mmHg</div>
                      <div><span style={{color:'var(--text-accent)'}}>SpO2:</span> {selectedPatient.vitals.spO2}%</div>
                      <div><span style={{color:'var(--triage-yellow)'}}>Temp:</span> {selectedPatient.vitals.temp} °C</div>
                   </div>

                   <h3 style={{ marginTop: '2rem' }}>Triage Assignment</h3>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn" style={{flex: 1, background: 'var(--triage-red)'}} onClick={() => handleTriage('RED')}>RED (Priority 1)</button>
                      <button className="btn" style={{flex: 1, background: 'var(--triage-yellow)'}} onClick={() => handleTriage('YELLOW')}>YELLOW (Priority 2)</button>
                      <button className="btn" style={{flex: 1, background: 'var(--triage-green)'}} onClick={() => handleTriage('GREEN')}>GREEN (Priority 3)</button>
                   </div>
                </div>

                <div style={{ flex: 1 }}>
                   <h3 style={{ color: 'var(--text-accent)' }}>Interventions & Diagnostics</h3>
                   <p style={{ color: 'var(--text-muted)' }}>Active Orders / Treatments:</p>
                   <ul style={{ marginBottom: '2rem' }}>
                     {selectedPatient.treatments.map((t, i) => <li key={i}>{t}</li>)}
                     {selectedPatient.treatments.length === 0 && <li style={{color: 'grey', fontStyle:'italic'}}>None</li>}
                   </ul>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <button className="btn primary" onClick={() => handleOrderTest('IV Fluids')}>Administer IV Fluids</button>
                     <button className="btn primary" onClick={() => handleOrderTest('Broad-Spectrum Antibiotics')}>Give Broad-Spectrum ABX</button>
                     <button className="btn primary" onClick={() => handleOrderTest('Request CT Scan')}>Request CT Scan (Rad)</button>
                     <button className="btn primary" onClick={() => handleOrderTest('Request Comprehensive Metabolic Panel')}>Request CMP (Lab)</button>
                   </div>
                </div>
             </div>
           </>
        ) : (
           <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
             Select a patient from the queue to view details.
           </div>
        )}
      </div>
    </div>
  );
}

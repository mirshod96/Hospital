import React, { useState } from 'react';

export default function PharmacologistUI({ state, socket }) {
  const { patients } = state;
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Pharmacologist looks at patients with many treatments or specific drug interactions
  const polypharmacyPatients = patients.filter(p => !p.isDead && p.treatments.length >= 2);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleApprove = (patientId) => {
    socket.emit('addTreatment', { patientId, treatment: 'Pharmacology Review Completed (Safe)' });
    socket.emit('sendMessage', { text: `Drug regimen for ${patientId} approved.`, channel: 'Global' });
  };
  
  const handleFlagInteraction = (patientId) => {
    socket.emit('addTreatment', { patientId, treatment: 'LETHAL INTERACTION FLAGGED' });
    socket.emit('sendMessage', { text: `CRITICAL: Major drug interaction flagged for ${patientId}! Discontinue immediately.`, channel: 'Global' });
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
      {/* Queue */}
      <div className="glass-panel" style={{ flex: '0 0 300px', padding: '1rem', overflowY: 'auto' }}>
        <h3 className="gradient-text">Polypharmacy Alerts ({polypharmacyPatients.length})</h3>
        {polypharmacyPatients.map(p => (
           <div 
             key={p.id} 
             onClick={() => setSelectedPatientId(p.id)}
             style={{ 
               background: p.id === selectedPatientId ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.4)', 
               padding: '0.8rem', 
               borderRadius: '8px', 
               cursor: 'pointer',
               marginBottom: '0.5rem', 
               borderLeft: `4px solid var(--triage-yellow)` 
             }}
           >
             <div style={{ fontWeight: 'bold' }}>{p.name} [{p.id}]</div>
             <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drugs/Orders: {p.treatments.length}</div>
           </div>
        ))}
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {selectedPatient ? (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <h2>Medication Review: {selectedPatient.name}</h2>
             <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px' }}>
                <h4 style={{ color: 'var(--text-accent)' }}>Active Orders</h4>
                <ul>
                    {selectedPatient.treatments.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
             </div>
             
             <div style={{ display: 'flex', gap: '1rem' }}>
                 <button className="btn primary" onClick={() => handleApprove(selectedPatient.id)}>Approve Regimen (Safe)</button>
                 <button className="btn danger" onClick={() => handleFlagInteraction(selectedPatient.id)}>Flag Lethal Interaction!</button>
             </div>
           </div>
        ) : (
           <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
             Select a patient to review their pharmacology regimen.
           </div>
        )}
      </div>
    </div>
  );
}

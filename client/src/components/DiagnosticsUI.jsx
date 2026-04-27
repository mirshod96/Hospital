import React, { useState } from 'react';
import { ZONES, ROLES } from '../constants';

export default function DiagnosticsUI({ state, socket, role }) {
  const { patients } = state;
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Filter patients based on role
  // Radiologist looks for 'Request CT Scan'
  // Lab looks for 'Request Comprehensive Metabolic Panel'
  let pendingRequestString = '';
  let completeString = '';

  if (role === ROLES.RADIOLOGIST) {
    pendingRequestString = 'Request CT Scan';
    completeString = 'CT Scan Results Uploaded';
  } else if (role === ROLES.LAB_PHYSICIAN) {
    pendingRequestString = 'Request Comprehensive Metabolic Panel';
    completeString = 'CMP Results Uploaded';
  }

  // Patients who have a pending request that isn't completed yet
  const pendingPatients = patients.filter(
    p => !p.isDead && p.treatments.includes(pendingRequestString) && !p.treatments.includes(completeString)
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleUploadResults = (patientId, hiddenDiagnosis) => {
    socket.emit('addTreatment', { patientId, treatment: completeString });
    
    // Auto-message to chat
    const text = role === ROLES.RADIOLOGIST 
        ? `Scan uploaded for ${patientId}. Findings: ${hiddenDiagnosis || 'Normal'}`
        : `Lab values for ${patientId} processed. Notes: ${hiddenDiagnosis || 'Normal'}`;
        
    socket.emit('sendMessage', { text, channel: 'Global' });
    setSelectedPatientId(null);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
      {/* Queue */}
      <div className="glass-panel" style={{ flex: '0 0 300px', padding: '1rem', overflowY: 'auto' }}>
        <h3 className="gradient-text">Pending Orders ({pendingPatients.length})</h3>
        <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Role: {role}</p>
        {pendingPatients.length === 0 && <div style={{color: 'var(--text-muted)'}}>No pending diagnostic requests.</div>}
        {pendingPatients.map(p => (
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
             <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loc: {p.location}</div>
           </div>
        ))}
      </div>

      {/* Upload Station */}
      <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {selectedPatient ? (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <h2>Evaluate & Upload Results: {selectedPatient.name}</h2>
             <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px' }}>
                <h4 style={{ color: 'var(--text-accent)' }}>Raw Biometric Telemetry</h4>
                <div style={{fontFamily: 'monospace', fontSize: '1.1rem', marginTop: '1rem'}}>
                    HR: {selectedPatient.vitals.hr} | BP: {selectedPatient.vitals.bp} | SpO2: {selectedPatient.vitals.spO2}%
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <strong>System Suspected Condition (True Diagnosis):</strong>
                    <div style={{ color: 'var(--triage-red)', fontSize: '1.2rem', marginTop: '0.5rem' }}>
                        {selectedPatient.hiddenDiagnoses[0] || "None"}
                    </div>
                </div>
             </div>
             
             <div>
                 <button 
                    className="btn primary" 
                    style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                    onClick={() => handleUploadResults(selectedPatient.id, selectedPatient.hiddenDiagnoses[0])}
                 >
                    Publish Official Report to MIS
                 </button>
             </div>
           </div>
        ) : (
           <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
             Select an order from the queue to process.
           </div>
        )}
      </div>
    </div>
  );
}

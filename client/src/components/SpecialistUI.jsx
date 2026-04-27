import React, { useState } from 'react';
import { ZONES } from '../constants';

export default function SpecialistUI({ state, socket, role }) {
  const { patients } = state;
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  // Specialists can access any patient in the hospital for consultation
  // But usually look at admitted ones or active ER ones
  const activePatients = patients.filter(p => !p.isDead && p.location !== ZONES.DISCHARGED);
  
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleIntervention = (treatmentName) => {
    socket.emit('addTreatment', { patientId: selectedPatientId, treatment: treatmentName });
    socket.emit('sendMessage', { 
        text: `Performed intervention: ${treatmentName} on pt ${selectedPatientId}`, 
        channel: 'Global' 
    });
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
      {/* Patient Directory */}
      <div className="glass-panel" style={{ flex: '0 0 300px', padding: '1rem', overflowY: 'auto' }}>
        <h3 className="gradient-text">Hospital Registry</h3>
        <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Role: {role}</p>
        
        {/* Quick grouped registry */}
        {Object.values(ZONES).map(zone => {
            const pts = activePatients.filter(p => p.location === zone);
            if (pts.length === 0) return null;
            return (
                <div key={zone} style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--text-accent)', fontSize: '0.9rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>{zone}</div>
                    {pts.map(p => (
                        <div 
                         key={p.id} 
                         onClick={() => setSelectedPatientId(p.id)}
                         style={{ 
                           background: p.id === selectedPatientId ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.4)', 
                           padding: '0.5rem 0.8rem', 
                           borderRadius: '6px', 
                           cursor: 'pointer',
                           marginBottom: '0.5rem',
                           fontSize: '0.9rem'
                         }}
                       >
                         {p.name} [{p.id}] - Vitals: {Math.floor(p.vitalityScore)}%
                       </div>
                    ))}
                </div>
            )
        })}
      </div>

      {/* Consultation Area */}
      <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {selectedPatient ? (
           <>
             <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
               <div>
                  <h2>{selectedPatient.name}</h2>
                  <div style={{ color: 'var(--text-muted)' }}>ID: {selectedPatient.id} | Loc: {selectedPatient.location} | Triage: {selectedPatient.triageStatus}</div>
               </div>
             </div>

             <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ flex: 1 }}>
                   <h3 style={{ color: 'var(--text-accent)' }}>Clinical History & Active Orders</h3>
                   <ul style={{ marginBottom: '2rem', background: 'rgba(0,0,0,0.3)', padding: '1rem 2rem', borderRadius: '8px' }}>
                     {selectedPatient.treatments.map((t, i) => <li key={i}>{t}</li>)}
                     {selectedPatient.treatments.length === 0 && <li style={{color: 'grey', fontStyle:'italic'}}>No treatments recorded</li>}
                   </ul>
                   
                   {/* Require Radiology check for surgeons */}
                   {role.includes('Surgeon') && !selectedPatient.treatments.includes('CT Scan Results Uploaded') && (
                       <div style={{ padding: '1rem', background: 'rgba(255,0,0,0.2)', border: '1px solid red', borderRadius: '8px' }}>
                           <strong>WARNING:</strong> Cannot perform surgery without Imaging clearance from Radiology!
                       </div>
                   )}
                </div>

                <div style={{ flex: 1 }}>
                   <h3 style={{ color: 'var(--text-accent)' }}>Specialist Interventions</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     {role.includes('Surgeon') && (
                        <button 
                            className="btn danger" 
                            disabled={!selectedPatient.treatments.includes('CT Scan Results Uploaded')}
                            onClick={() => handleIntervention('Emergency Surgical Operation')}
                        >
                            Perform Indicated Surgery
                        </button>
                     )}
                     
                     {role === ROLES.CARDIOLOGIST && (
                        <button className="btn primary" onClick={() => handleIntervention('PCI / Stent Placement')}>Emergency Cath Lab (PCI)</button>
                     )}

                     {role === ROLES.NEUROLOGIST && (
                        <button className="btn primary" onClick={() => handleIntervention('Thrombolysis (tPA)')}>Administer tPA (Stroke Protocol)</button>
                     )}

                     {role === ROLES.INFECTIOUS_DISEASE && (
                        <button className="btn primary" onClick={() => handleIntervention('Targeted Isolation Protocol')}>Enforce Target Isolation</button>
                     )}

                     <button className="btn" onClick={() => handleIntervention('Specialist Consultation Completed')}>Record Note in MIS</button>
                   </div>
                </div>
             </div>
           </>
        ) : (
           <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
             Select a patient from the hospital registry for specialist consultation.
           </div>
        )}
      </div>
    </div>
  );
}

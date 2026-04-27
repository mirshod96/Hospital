import React from 'react';

export default function ModeratorUI({ state, socket }) {
  const { patients } = state;

  const triggerChaos = (type) => {
    socket.emit('chaosEvent', { type });
  };

  return (
    <div style={{ padding: '1rem', overflowY: 'auto' }}>
      <h2 className="gradient-text">GOD MODE: Overlord Dashboard</h2>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        {/* Chaos Engine */}
        <div className="glass-panel" style={{ flex: 1, padding: '2rem' }}>
           <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Chaos Engine</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
             <button className="btn danger" onClick={() => triggerChaos('MassCasualty')}>TRIGGER: Mass Casualty Incident (5-8 ER Patients)</button>
             <button className="btn danger" onClick={() => triggerChaos('HardwareFailure')} disabled>TRIGGER: Hardware Failure (CT Scanner Down) - Stub</button>
           </div>
        </div>

        {/* Global Truth View */}
        <div className="glass-panel" style={{ flex: 2, padding: '2rem' }}>
           <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Absolute Truth View</h3>
           <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
             <thead>
               <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                 <th>ID</th>
                 <th>Name</th>
                 <th>Loc / Triage</th>
                 <th>Vitals %</th>
                 <th style={{ color: 'var(--text-accent)' }}>Actual Diagnosis (Hidden)</th>
               </tr>
             </thead>
             <tbody>
               {patients.map(p => (
                 <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: p.isDead ? 'rgba(255,0,0,0.1)' : 'transparent' }}>
                   <td>{p.id}</td>
                   <td>{p.name} {p.isDead && '(DEAD)'}</td>
                   <td>{p.location} / {p.triageStatus}</td>
                   <td>{Math.floor(p.vitalityScore)}%</td>
                   <td style={{ color: 'var(--text-accent)' }}>{p.hiddenDiagnoses.join(', ')}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

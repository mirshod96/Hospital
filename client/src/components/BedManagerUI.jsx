import React from 'react';
import { ZONES } from '../constants';

export default function BedManagerUI({ state, socket }) {
  const { patients } = state;

  const handleMovePatient = (patientId, newLocation) => {
    socket.emit('movePatient', { patientId, newLocation });
  };

  // Group by location
  const getPatientsByLocation = (loc) => patients.filter(p => p.location === loc);
  const totalBedsUsed = patients.filter(p => [ZONES.WARD, ZONES.ICU, ZONES.SURGERY].includes(p.location)).length;
  const BED_CAPACITY = 10;

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '100%' }}>
      {/* ER Waiting list */}
      <div className="glass-panel" style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <h3 className="gradient-text">ER Queues</h3>
        {getPatientsByLocation(ZONES.ER_WAITING).map(p => (
           <div key={p.id} style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: `4px solid var(--triage-${p.triageStatus.toLowerCase()})` }}>
             <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
               <span>{p.name} [{p.id}]</span>
               <span style={{ color: 'var(--text-accent)' }}>Vitals: ~{p.vitalityScore}%</span>
             </div>
             <div style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Triage: {p.triageStatus}</div>
             
             {/* Admit Controls */}
             <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
               <button className="btn" style={{flex: 1, padding: '0.4rem'}} onClick={() => handleMovePatient(p.id, ZONES.WARD)} disabled={totalBedsUsed >= BED_CAPACITY}>Admit Ward</button>
               <button className="btn" style={{flex: 1, padding: '0.4rem'}} onClick={() => handleMovePatient(p.id, ZONES.ICU)} disabled={totalBedsUsed >= BED_CAPACITY}>Admit ICU</button>
             </div>
           </div>
        ))}
      </div>

      {/* Ward overview */}
      <div className="glass-panel" style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <h3 className="gradient-text">Inpatient Beds ({totalBedsUsed}/{BED_CAPACITY})</h3>
        
        <h4 style={{marginTop: '2rem'}}>General Ward</h4>
        {getPatientsByLocation(ZONES.WARD).map(p => (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', margin: '0.5rem 0', borderRadius: '4px' }}>
              {p.name} - {p.vitalityScore}%
              <button className="btn danger" style={{float: 'right', padding: '0.2rem 0.5rem'}} onClick={() => handleMovePatient(p.id, ZONES.DISCHARGED)}>Discharge</button>
            </div>
        ))}

        <h4 style={{marginTop: '2rem'}}>ICU</h4>
        {getPatientsByLocation(ZONES.ICU).map(p => (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', margin: '0.5rem 0', borderRadius: '4px' }}>
              {p.name} - CRITICAL - {p.vitalityScore}%
              <button className="btn primary" style={{float: 'right', padding: '0.2rem 0.5rem'}} onClick={() => handleMovePatient(p.id, ZONES.WARD)}>Move Ward</button>
            </div>
        ))}
        
        <h4 style={{marginTop: '2rem'}}>Operating Room</h4>
        {getPatientsByLocation(ZONES.SURGERY).map(p => (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', margin: '0.5rem 0', borderRadius: '4px' }}>
              {p.name} - IN SURGERY - {p.vitalityScore}%
              <button className="btn primary" style={{float: 'right', padding: '0.2rem 0.5rem'}} onClick={() => handleMovePatient(p.id, ZONES.ICU)}>Move ICU</button>
            </div>
        ))}
      </div>
    </div>
  );
}

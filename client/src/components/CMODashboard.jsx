import React from 'react';
import { ZONES } from '../constants';

export default function CMODashboard({ state }) {
  const { patients, gameState } = state;
  const totalLiving = patients.filter(p => !p.isDead).length;

  return (
    <div style={{ padding: '1rem', overflowY: 'auto' }}>
      <h2 className="gradient-text">Chief Medical Officer (CMO) Dashboard</h2>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '2rem' }}>
           <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Resource Triage</h3>
           <div style={{ marginTop: '1rem' }}>
               <p style={{ color: 'var(--text-muted)' }}>As CMO, you determine the ethical and financial flow of the hospital. Watch out for bottlenecks in diagnostics and ER queues.</p>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                   <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                       <div style={{ color: 'var(--triage-yellow)' }}>Wait Time Indicator</div>
                       <h2 style={{ margin: 0 }}>ER: {patients.filter(p => p.location === ZONES.ER_WAITING).length} Pts</h2>
                   </div>
                   <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                       <div style={{ color: 'var(--triage-red)' }}>Hospital Bed Capacity</div>
                       <h2 style={{ margin: 0 }}>Ward: {patients.filter(p => p.location === ZONES.WARD).length} / 10</h2>
                   </div>
                   <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                       <div style={{ color: 'var(--text-accent)' }}>Critical Capacity</div>
                       <h2 style={{ margin: 0 }}>ICU: {patients.filter(p => p.location === ZONES.ICU).length} Pts</h2>
                   </div>
                   <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                       <div style={{ color: 'var(--triage-green)' }}>Total Active</div>
                       <h2 style={{ margin: 0 }}>{totalLiving} Patients</h2>
                   </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}

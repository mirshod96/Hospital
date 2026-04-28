import React from 'react';
import { ROLES } from '../constants';

export default function InstructionScreen({ role, onReady }) {
  let imgSrc = '';
  let title = '';
  let desc = '';

  if ([ROLES.CMO, ROLES.BED_MANAGER, ROLES.MODERATOR].includes(role)) {
    imgSrc = '/assets/admin_instr.png';
    title = 'Administration Protocol';
    desc = 'Oversee the hospital. Manage beds, triage bottlenecks, and budget.';
  } else if ([ROLES.ER_RED, ROLES.ER_YELLOW, ROLES.ER_GREEN].includes(role)) {
    imgSrc = '/assets/er_instr.png';
    title = 'Emergency Response Protocol';
    desc = 'Triage incoming patients, stabilize vitals, and order initial diagnostics.';
  } else if ([ROLES.RADIOLOGIST, ROLES.LAB_PHYSICIAN, ROLES.FUNC_DIAGNOSTICS].includes(role)) {
    imgSrc = '/assets/diag_instr.png';
    title = 'Diagnostic Hub Protocol';
    desc = 'Process requested labs and scans. Uncover hidden conditions.';
  } else if ([ROLES.ICU_1, ROLES.ICU_2, ROLES.ICU_3].includes(role)) {
    imgSrc = '/assets/icu_instr.png';
    title = 'Intensive Care Protocol';
    desc = 'Manage critical patients. Monitor ventilators and administer life support.';
  } else {
    // Surgery / Specialists
    imgSrc = '/assets/surg_instr.png';
    title = 'Specialist & Surgical Protocol';
    desc = 'Consult on complex cases and perform life-saving interventions.';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: 'var(--bg-dark)' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '800px', animation: 'fadeInUp 0.6s ease' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{title}</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>{desc}</p>
        <div style={{ marginBottom: '2rem' }}>
          <img src={imgSrc} alt="Role Instructions" style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', boxShadow: 'var(--shadow-glass)' }} />
        </div>
        <button className="btn primary" style={{ fontSize: '1.5rem', padding: '1rem 3rem' }} onClick={onReady}>
          ACKNOWLEDGE & ENTER HOSPITAL
        </button>
      </div>
    </div>
  );
}

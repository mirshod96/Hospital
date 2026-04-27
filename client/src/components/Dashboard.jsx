import React from 'react';
import ChatPanel from './ChatPanel';
import { ROLES } from '../constants';
import BedManagerUI from './BedManagerUI';
import ERPhysicianUI from './ERPhysicianUI';
import ModeratorUI from './ModeratorUI';
import DiagnosticsUI from './DiagnosticsUI';
import SpecialistUI from './SpecialistUI';
import IntensiveCareUI from './IntensiveCareUI';
import PharmacologistUI from './PharmacologistUI';
import CMODashboard from './CMODashboard';

export default function Dashboard({ state, playerInfo, socket }) {
  const { gameState } = state;
  
  // Format game time (e.g. 125s -> 02:05)
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${mins}:${s}`;
  };

  const renderRoleSpecificUI = () => {
    if (playerInfo.role === ROLES.CMO) {
      return <CMODashboard state={state} socket={socket} />;
    }
    if (playerInfo.role === ROLES.BED_MANAGER) {
      return <BedManagerUI state={state} socket={socket} />;
    }
    if (playerInfo.role === ROLES.MODERATOR) {
      return <ModeratorUI state={state} socket={socket} />;
    }
    if ([ROLES.ER_RED, ROLES.ER_YELLOW, ROLES.ER_GREEN].includes(playerInfo.role)) {
      return <ERPhysicianUI state={state} socket={socket} role={playerInfo.role} />;
    }
    if ([ROLES.RADIOLOGIST, ROLES.LAB_PHYSICIAN, ROLES.FUNC_DIAGNOSTICS].includes(playerInfo.role)) {
      return <DiagnosticsUI state={state} socket={socket} role={playerInfo.role} />;
    }
    if ([ROLES.SURGEON_TRAUMA, ROLES.SURGEON_GENERAL, ROLES.CARDIOLOGIST, ROLES.NEUROLOGIST, ROLES.INFECTIOUS_DISEASE, ROLES.OB_GYN].includes(playerInfo.role)) {
      return <SpecialistUI state={state} socket={socket} role={playerInfo.role} />;
    }
    if ([ROLES.ICU_1, ROLES.ICU_2, ROLES.ICU_3].includes(playerInfo.role)) {
      return <IntensiveCareUI state={state} socket={socket} role={playerInfo.role} />;
    }
    if (playerInfo.role === ROLES.PHARMACOLOGIST) {
      return <PharmacologistUI state={state} socket={socket} />;
    }
    return (
        <div style={{ background: 'rgba(0,0,0,0.2)', flex: 1, borderRadius: '8px', border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--glass-border-hilite)' }}>[ Interface pending Stage 3 & 4 implementation for {playerInfo.role} ]</span>
        </div>
    );
  };

  return (
    <>
      {/* Top Banner */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div>
            <h2 className="gradient-text" style={{ margin: 0 }}>HEUC-18 Session Active</h2>
            <div style={{ color: 'var(--text-muted)' }}>{playerInfo.name} • {playerInfo.role}</div>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Game Clock</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-accent)' }}>
                {formatTime(gameState.gameTimeSecs)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mortality Rate</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: gameState.mortalityRate > 10 ? 'var(--triage-red)' : 'var(--text-main)' }}>
                {gameState.mortalityRate}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Budget</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: gameState.budget < 200000 ? 'var(--triage-red)' : 'var(--triage-green)' }}>
                ${gameState.budget.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Main Work Area Workspace */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderRoleSpecificUI()}
        </div>
        
        {/* Chat / MIS system */}
        <ChatPanel socket={socket} playerInfo={playerInfo} />
      </div>
    </>
  );
}

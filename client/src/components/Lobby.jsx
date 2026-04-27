import React, { useState } from 'react';
import { ROLES } from '../constants';

const ROLE_GROUPS = {
  "Administration": [ROLES.CMO, ROLES.BED_MANAGER, ROLES.MODERATOR],
  "Emergency": [ROLES.ER_RED, ROLES.ER_YELLOW, ROLES.ER_GREEN],
  "Diagnostics": [ROLES.RADIOLOGIST, ROLES.LAB_PHYSICIAN, ROLES.FUNC_DIAGNOSTICS],
  "Intensive Care": [ROLES.ICU_1, ROLES.ICU_2, ROLES.ICU_3],
  "Specialized": [ROLES.SURGEON_TRAUMA, ROLES.SURGEON_GENERAL, ROLES.CARDIOLOGIST, ROLES.NEUROLOGIST, ROLES.INFECTIOUS_DISEASE, ROLES.OB_GYN, ROLES.PHARMACOLOGIST]
};

export default function Lobby({ onJoin, onSelectRole, onStart, state, playerInfo }) {
  const [nameInput, setNameInput] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onJoin(nameInput.trim());
    }
  };

  const currentPlayers = Object.values(state.players);

  return (
    <div className="glass-panel" style={{ maxWidth: '800px', margin: 'auto', padding: '2rem', width: '100%' }}>
      <h1 className="gradient-text" style={{ textAlign: 'center', fontSize: '2.5rem' }}>HEUC-18</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Hospital Ecosystem: Ultimate Crisis</p>
      
      {!playerInfo.name ? (
        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Enter Your Name to Enter the Simulation</label>
            <input 
              className="input-field"
              type="text" 
              placeholder="Dr. House" 
              value={nameInput} 
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
            />
          </div>
          <button className="btn primary" type="submit" disabled={!nameInput.trim()}>Authorize Identity</button>
        </form>
      ) : !playerInfo.role ? (
        <div style={{ marginTop: '2rem' }}>
          <h2>Select Your Specialty</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.entries(ROLE_GROUPS).map(([groupName, groupRoles]) => (
              <div key={groupName}>
                <h3 style={{ color: 'var(--text-accent)', marginBottom: '0.5rem' }}>{groupName}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {groupRoles.map(role => {
                    const isTaken = state.takenRoles.includes(role);
                    return (
                      <button 
                        key={role}
                        className={`btn ${isTaken ? '' : 'primary'}`}
                        style={{ flex: '1 1 calc(33% - 0.5rem)' }}
                        disabled={isTaken}
                        onClick={() => onSelectRole(role)}
                      >
                        {role} {isTaken && '(Filled)'}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <h2 className="gradient-text">Identity Confirmed</h2>
            <p style={{ fontSize: '1.2rem' }}>Welcome, Dr. {playerInfo.name}</p>
            <p style={{ color: 'var(--text-accent)' }}>{playerInfo.role}</p>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>Current Roster ({currentPlayers.filter(p => p.role).length}/18)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
              {currentPlayers.map((p, idx) => p.role && (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                  {p.name} - {p.role}
                </div>
              ))}
            </div>
          </div>

          {playerInfo.role === ROLES.MODERATOR && (
            <div style={{ marginTop: '2rem' }}>
              <button className="btn danger" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }} onClick={onStart}>
                INITIATE CRISIS (START GAME)
              </button>
            </div>
          )}
          {playerInfo.role !== ROLES.MODERATOR && (
            <div style={{ marginTop: '2rem', color: 'var(--text-accent)' }}>
              Awaiting Moderator signal to begin...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

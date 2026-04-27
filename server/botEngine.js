import { ROLES, ZONES } from './constants.js';

export function runBots(gameState, patients, messages, io, takenRoles) {
    if (gameState.status !== 'RUNNING') return;

    // Which roles are NOT filled by humans?
    const allRoles = Object.values(ROLES).filter(r => r !== ROLES.MODERATOR);
    const botRoles = allRoles.filter(r => !takenRoles.includes(r));

    // Bots act slowly to simulate human interaction processing time
    const shouldAct = Math.random() < 0.2; // 20% chance any bot system acts this tick
    if (!shouldAct) return;

    let chatUpdated = false;

    const botMessage = (role, text, channel = 'Global') => {
        messages.push({
            id: Date.now() + Math.random().toString(),
            senderName: "[BOT]",
            senderRole: role,
            text,
            channel,
            timestamp: Date.now()
        });
        chatUpdated = true;
    };

    botRoles.forEach(role => {
        // Bed Manager Bot: Moves Triaged patients to Ward if beds available
        if (role === ROLES.BED_MANAGER) {
             const wardPatients = patients.filter(p => p.location === ZONES.WARD);
             const toAdmit = patients.find(p => !p.isDead && p.location === ZONES.ER_WAITING && (p.triageStatus === 'RED' || p.triageStatus === 'YELLOW'));
             if (toAdmit && wardPatients.length < 8) { // Keep 2 beds buffer
                 toAdmit.location = ZONES.WARD;
                 botMessage(role, `Admitted ${toAdmit.name} (${toAdmit.id}) to Ward.`);
             }
        }
        
        // Radiologist Bot: Provides CT scans automatically
        if (role === ROLES.RADIOLOGIST) {
            const pendingRad = patients.find(p => !p.isDead && p.treatments.includes('Request CT Scan') && !p.treatments.includes('CT Scan Results Uploaded'));
            if (pendingRad) {
                pendingRad.treatments.push('CT Scan Results Uploaded');
                // Bot reveals a hidden diagnosis based on the scan
                const foundIssue = pendingRad.hiddenDiagnoses[0] || "No acute findings";
                botMessage(role, `CT Report for ${pendingRad.name} (${pendingRad.id}): Findings consistent with ${foundIssue}.`);
            }
        }

        // Lab Physician Bot: Provides lab results
        if (role === ROLES.LAB_PHYSICIAN) {
            const pendingLab = patients.find(p => !p.isDead && p.treatments.includes('Request Comprehensive Metabolic Panel') && !p.treatments.includes('CMP Results Uploaded'));
            if (pendingLab) {
                pendingLab.treatments.push('CMP Results Uploaded');
                botMessage(role, `Lab Results for ${pendingLab.name} (${pendingLab.id}) are ready. Critical values highlighted in chart.`);
            }
        }

        // ER Physician Bot (If ER is empty): Assigns Triage status randomly, orders basics
        if ([ROLES.ER_RED, ROLES.ER_YELLOW, ROLES.ER_GREEN].includes(role)) {
            const autoTriagePt = patients.find(p => !p.isDead && p.location === ZONES.ER_WAITING && p.triageStatus === 'UNASSIGNED');
            if (autoTriagePt && Math.random() < 0.1) {
                const isCrit = autoTriagePt.vitalityScore < 70;
                autoTriagePt.triageStatus = isCrit ? 'RED' : 'YELLOW';
                botMessage(role, `Initial triage complete for ${autoTriagePt.name}. Status: ${autoTriagePt.triageStatus}.`);
            }
        }
    });

    if (chatUpdated) {
        io.emit('chatUpdate', messages);
    }
}

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ROLES, ZONES } from './constants.js';
import { generatePatient, processDecay } from './engine.js';
import { runBots } from './botEngine.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Game State
let players = {}; // socketId -> { name, role }
let patients = [];
let messages = []; // { id, senderName, senderRole, text, channel, timestamp }
let gameState = {
  status: 'LOBBY', // LOBBY, RUNNING, ENDED
  mortalityRate: 0,
  budget: 1000000,
  gameTimeSecs: 0,
  deadCount: 0,
  dischargedCount: 0,
};

// Available roles checklist
const getTakenRoles = () => {
  const taken = [];
  for (const id in players) {
    if (players[id].role) {
      taken.push(players[id].role);
    }
  }
  return taken;
};

const broadcastState = () => {
  io.emit('stateUpdate', {
    players,
    patients,
    gameState,
    takenRoles: getTakenRoles()
  });
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial state so client can render the lobby!
  socket.emit('stateUpdate', {
    players,
    patients,
    gameState,
    takenRoles: getTakenRoles()
  });

  socket.on('joinLobby', ({ name }) => {
    players[socket.id] = { name, role: null };
    broadcastState();
  });

  socket.on('selectRole', ({ role }) => {
    // Check if role is taken. Moderator can always be selected
    if (getTakenRoles().includes(role) && role !== ROLES.MODERATOR) {
        return;
    }
    if (players[socket.id]) {
      players[socket.id].role = role;
    }
    broadcastState();
  });

  socket.on('sendMessage', (data) => {
    const player = players[socket.id];
    if (!player) return;

    const msg = {
      id: Date.now() + Math.random().toString(),
      senderName: player.name,
      senderRole: player.role,
      text: data.text,
      channel: data.channel || 'Global',
      timestamp: Date.now(),
    };
    messages.push(msg);
    io.emit('chatUpdate', messages);
  });

  // Gameplay Actions Action Handlers
  socket.on('movePatient', ({ patientId, newLocation }) => {
    const pt = patients.find(p => p.id === patientId);
    if (pt) {
        pt.location = newLocation;
        broadcastState();
    }
  });

  socket.on('updatePatientState', ({ patientId, patch }) => {
    const pt = patients.find(p => p.id === patientId);
    if (pt) {
        Object.assign(pt, patch);
        broadcastState();
    }
  });

  socket.on('addTreatment', ({ patientId, treatment }) => {
    const pt = patients.find(p => p.id === patientId);
    if (pt) {
        if (!pt.treatments.includes(treatment)) {
            pt.treatments.push(treatment);
        }
        broadcastState();
    }
  });

  socket.on('resetGame', () => {
    patients.length = 0; // Clear array while keeping reference
    gameState.status = 'LOBBY';
    gameState.gameTimeSecs = 0;
    gameState.mortalityRate = 0;
    gameState.deadCount = 0;
    gameState.dischargedCount = 0;
    
    // Let players keep their names and roles, just reset the game state
    // but maybe we can unassign roles if they want a hard reset
    // For now, let's keep roles so they can just hit Start Game immediately again!
    
    io.emit('systemAlert', { message: 'Simulation has been reset. Returning to Lobby.' });
    broadcastState();
  });

  // Moderator Controls
  socket.on('startGame', () => {
    const player = players[socket.id];
    if (player && player.role === ROLES.MODERATOR) {
      gameState.status = 'RUNNING';
      // Spawn initial 3 patients
      patients.push(generatePatient());
      patients.push(generatePatient());
      patients.push(generatePatient());
      broadcastState();
    }
  });

  socket.on('chaosEvent', ({ type }) => {
    const player = players[socket.id];
    if (player && player.role === ROLES.MODERATOR) {
      if (type === 'MassCasualty') {
        const count = Math.floor(Math.random() * 4) + 5; // 5-8 patients
        for(let i=0; i<count; i++) {
          patients.push(generatePatient());
        }
        broadcastState();
        io.emit('systemAlert', { message: 'CRITICAL: MULTIPLE CASUALTIES ARRIVING AT ER!' });
      }
      // Add more chaos triggers here
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    broadcastState();
    console.log('Client disconnected:', socket.id);
  });
});

// Game loop (1 second tick)
setInterval(() => {
  if (gameState.status === 'RUNNING') {
    gameState.gameTimeSecs++;
    
    let stateChanged = false;
    let newDead = 0;

    patients.forEach(p => {
      const wasDead = p.isDead;
      processDecay(p);
      if (p.isDead && !wasDead) {
        newDead++;
        stateChanged = true;
      } else {
        // Assume vitals change slightly, forcing an update
        stateChanged = true;
      }
    });

    if (newDead > 0) {
      gameState.deadCount += newDead;
      const totalPatients = patients.length;
      gameState.mortalityRate = ((gameState.deadCount / totalPatients) * 100).toFixed(1);
      
      if (gameState.mortalityRate > 15) {
         gameState.status = 'ENDED';
         io.emit('systemAlert', { message: 'SIMULATION FAILED: MORTALITY RATE EXCEEDED 15%' });
      }
    }

    // Run Automated Bots
    runBots(gameState, patients, messages, io, getTakenRoles());

    // Only force emit if state actually changed (which is every second due to time/decay)
    broadcastState();
  }
}, 1000);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

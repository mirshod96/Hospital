import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import Dashboard from './components/Dashboard';
import InstructionScreen from './components/InstructionScreen';
import './App.css';

// Create single socket instance
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const socket = io(SOCKET_URL, { autoConnect: false });

function App() {
  const [gameState, setGameState] = useState(null);
  const [playerInfo, setPlayerInfo] = useState({ name: '', role: null });
  const [hasSeenInstructions, setHasSeenInstructions] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      // Re-hydrate session if disconnected by network
      setPlayerInfo((currentInfo) => {
         if (currentInfo.name) {
            socket.emit('joinLobby', { name: currentInfo.name });
            if (currentInfo.role) {
                setTimeout(() => socket.emit('selectRole', { role: currentInfo.role }), 100);
            }
         }
         return currentInfo;
      });
    });

    socket.on('stateUpdate', (state) => {
      setGameState(state);
    });

    return () => {
      socket.off('connect');
      socket.off('stateUpdate');
      socket.disconnect();
    };
  }, []);

  const handleJoin = (name) => {
    socket.emit('joinLobby', { name });
    setPlayerInfo((prev) => ({ ...prev, name }));
  };

  const handleSelectRole = (role) => {
    socket.emit('selectRole', { role });
    setPlayerInfo((prev) => ({ ...prev, role }));
  };

  const handleStartGame = () => {
    socket.emit('startGame');
  };

  if (!gameState) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <h2 className="gradient-text">Connecting to HEUC-18 Server...</h2>
      </div>
    );
  }

  if (gameState.gameState.status === 'ENDED') {
    return (
       <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', animation: 'fadeInUp 0.6s ease' }}>
              <h1 style={{ color: 'var(--triage-red)', fontSize: '3rem' }}>SIMULATION FAILED</h1>
              <h2>Mortality Rate: {gameState.gameState.mortalityRate}%</h2>
              <p style={{ color: 'var(--text-muted)' }}>The hospital ecosystem has collapsed. Critical errors in triage or slow diagnostics led to unacceptable patient mortality.</p>
              <button 
                  className="btn primary" 
                  style={{ marginTop: '2rem' }} 
                  onClick={() => {
                      socket.emit('resetGame');
                      setHasSeenInstructions(false);
                      setPlayerInfo(prev => ({ ...prev, role: null }));
                  }}
              >
                  Reset Server & Return to Lobby
              </button>
          </div>
       </div>
    );
  }

  // Determine which screen to show
  const isRunning = gameState.gameState.status === 'RUNNING';

  if (isRunning && !hasSeenInstructions) {
    return <InstructionScreen role={playerInfo.role} onReady={() => setHasSeenInstructions(true)} />;
  }

  return (
    <div className="app-container">
      {!isRunning ? (
        <Lobby 
          onJoin={handleJoin} 
          onSelectRole={handleSelectRole}
          onStart={handleStartGame}
          state={gameState} 
          playerInfo={playerInfo} 
        />
      ) : (
        <Dashboard 
          state={gameState} 
          playerInfo={playerInfo}
          socket={socket}
        />
      )}
    </div>
  );
}

export default App;

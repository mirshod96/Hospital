import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import Dashboard from './components/Dashboard';
import './App.css';

// Create single socket instance
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const socket = io(SOCKET_URL, { autoConnect: false });

function App() {
  const [gameState, setGameState] = useState(null);
  const [playerInfo, setPlayerInfo] = useState({ name: '', role: null });

  useEffect(() => {
    socket.connect();

    socket.on('stateUpdate', (state) => {
      setGameState(state);
    });

    return () => {
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

  // Determine which screen to show
  const isRunning = gameState.gameState.status === 'RUNNING';

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

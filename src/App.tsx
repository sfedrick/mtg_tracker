import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, X, Users, Copy, Check } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Modifier {
  id: number;
  name: string;
  color: string;
}

interface Creature {
  id: number;
  name: string;
  basePower: number;
  baseToughness: number;
  powerMod: number;
  toughnessMod: number;
  modifiers: Modifier[];
}

interface Player {
  id: number;
  name: string;
  life: number;
  creatures: Creature[];
}

interface GameState {
  players: Player[];
  numPlayers: number;
}

// In dev, set VITE_SERVER_URL=http://localhost:3001 in .env.local.
// In production (combined deploy) leave it unset — io() connects to same origin.
const SERVER_URL = import.meta.env.VITE_SERVER_URL as string | undefined;

const PLAYER_COLORS = [
  { bg: '#1e3a5f', border: '#3b82f6' },
  { bg: '#5f1e1e', border: '#ef4444' },
  { bg: '#1e3d1e', border: '#22c55e' },
  { bg: '#3d1e5f', border: '#a855f7' },
];

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#111827',
    padding: '16px',
    fontFamily: 'sans-serif',
  },
  center: {
    minHeight: '100vh',
    backgroundColor: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: '8px',
    padding: '32px',
    maxWidth: '400px',
    width: '100%',
    border: '2px solid #374151',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  titleText: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
  },
  label: {
    color: '#d1d5db',
    marginBottom: '8px',
    fontWeight: '600',
    display: 'block',
  },
  playerBtns: {
    display: 'flex',
    gap: '8px',
  },
  startBtn: {
    width: '100%',
    backgroundColor: '#16a34a',
    color: '#fff',
    fontWeight: 'bold',
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '16px',
  },
  backBtn: {
    width: '100%',
    backgroundColor: '#374151',
    color: '#d1d5db',
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    marginTop: '8px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  newGameBtn: {
    backgroundColor: '#dc2626',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  playerName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '12px',
  },
  lifeBox: {
    backgroundColor: '#111827',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  lifeNum: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center' as const,
    flex: 1,
  },
  lifeLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center' as const,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: '600',
    margin: 0,
  },
  creatureList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    maxHeight: '384px',
    overflowY: 'auto' as const,
  },
  creatureCard: {
    backgroundColor: '#1f2937',
    borderRadius: '6px',
    padding: '12px',
    border: '1px solid #374151',
  },
  creatureHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  creatureName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: '14px',
    margin: 0,
  },
  statRow: {
    display: 'flex',
    gap: '16px',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    marginBottom: '4px',
  },
  statControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statNum: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '20px',
    flex: 1,
    textAlign: 'center' as const,
  },
  formBox: {
    backgroundColor: '#374151',
    borderRadius: '6px',
    padding: '12px',
    border: '2px solid #22c55e',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  input: {
    width: '100%',
    backgroundColor: '#1f2937',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #4b5563',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  },
  formBtns: {
    display: 'flex',
    gap: '8px',
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    color: '#fff',
    padding: '8px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#4b5563',
    color: '#fff',
    padding: '8px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
  },
  iconContainer: {
    marginRight: '12px',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
  },
  gridContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  inputFlex: {
    flex: 1,
  },
  lifeCenterDiv: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  // Room UI styles
  homeBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    border: 'none',
    marginBottom: '10px',
  },
  roomCodeBox: {
    backgroundColor: '#111827',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  roomCodeLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    marginBottom: '6px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },
  roomCodeText: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#60a5fa',
    letterSpacing: '0.2em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  roomCodeBadge: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '6px',
    padding: '5px 10px',
    color: '#9ca3af',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  errorText: {
    color: '#f87171',
    fontSize: '14px',
    marginTop: '8px',
    textAlign: 'center' as const,
  },
  waitingText: {
    color: '#6b7280',
    fontSize: '14px',
    textAlign: 'center' as const,
    marginTop: '8px',
  },
  modifierBadgeRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '4px', marginTop: '8px' },
  modifierBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    borderRadius: '9999px', padding: '2px 8px 2px 6px',
    fontSize: '11px', fontWeight: '600' as const, color: '#fff',
  },
  modifierFormBox: {
    backgroundColor: '#374151', borderRadius: '6px', padding: '10px',
    border: '2px solid #8b5cf6',
    display: 'flex', flexDirection: 'column' as const, gap: '8px', marginTop: '8px',
  },
  addModifierBtn: {
    background: 'none', border: '1px dashed #4b5563', borderRadius: '4px',
    color: '#9ca3af', fontSize: '11px', cursor: 'pointer',
    padding: '3px 8px', marginTop: '6px', width: '100%',
  },
  modifierRemoveBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '0', display: 'flex', alignItems: 'center',
  },
  colorSwatchRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  colorSwatchLabel: { fontSize: '11px', color: '#9ca3af' },
};

const getPlayerBtnStyle = (active: boolean) => ({
  flex: 1,
  padding: '12px',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: 'none',
  backgroundColor: active ? '#2563eb' : '#374151',
  color: active ? '#fff' : '#d1d5db',
  fontSize: '16px',
});

const getGridStyle = (numPlayers: number, width: number) => {
  if (width < 768) {
    return { display: 'grid', gap: '16px', gridTemplateColumns: '1fr' };
  } else if (width < 1024) {
    return {
      display: 'grid',
      gap: '16px',
      gridTemplateColumns: numPlayers >= 2 ? 'repeat(2, 1fr)' : '1fr',
    };
  }
  return {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns:
      numPlayers === 2
        ? 'repeat(2, 1fr)'
        : numPlayers === 3
        ? 'repeat(3, 1fr)'
        : 'repeat(2, 1fr)',
  };
};

const getPlayerCardStyle = (idx: number) => ({
  backgroundColor: PLAYER_COLORS[idx].bg,
  borderRadius: '8px',
  padding: '16px',
  border: `2px solid ${PLAYER_COLORS[idx].border}`,
});

const getIconBtnStyle = (color: string) => ({
  backgroundColor: color,
  border: 'none',
  borderRadius: '6px',
  padding: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const getCreatureBackground = (modifiers: Modifier[]): string => {
  if (modifiers.length === 0) return '#1f2937';
  if (modifiers.length === 1) return modifiers[0].color;
  return `linear-gradient(135deg, ${modifiers.map(m => m.color).join(', ')})`;
};

const getSmallIconBtnStyle = (color: string) => ({
  backgroundColor: color,
  border: 'none',
  borderRadius: '4px',
  padding: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

type SetupMode = 'home' | 'solo' | 'create' | 'join' | 'waiting';

export default function MTGTracker() {
  const [gameStarted, setGameStarted] = useState(false);
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState<Player[]>([]);
  const [addingCreature, setAddingCreature] = useState<number | null>(null);
  const [creatureForm, setCreatureForm] = useState({ name: '', power: '1', toughness: '1' });
  const [addingModifier, setAddingModifier] = useState<{ pid: number; cid: number } | null>(null);
  const [modifierForm, setModifierForm] = useState({ name: '', color: '#8b5cf6' });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [setupMode, setSetupMode] = useState<SetupMode>('home');
  const [roomCode, setRoomCode] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [roomError, setRoomError] = useState('');
  const [copied, setCopied] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const isSoloRef = useRef(false);
  // Use a ref so emitState always sees the current numPlayers without needing it
  // in a dependency array
  const numPlayersRef = useRef(numPlayers);

  useEffect(() => {
    numPlayersRef.current = numPlayers;
  }, [numPlayers]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const savedCode = sessionStorage.getItem('mtg_room_code');
    if (!savedCode) return;
    isSoloRef.current = false;
    const socket = initSocket();
    socket.emit(
      'join-room',
      { roomCode: savedCode },
      (res: { gameState: GameState | null; error?: string }) => {
        if (res.error) {
          sessionStorage.removeItem('mtg_room_code');
          return;
        }
        setRoomCode(savedCode);
        if (res.gameState) {
          setPlayers(res.gameState.players);
          setNumPlayers(res.gameState.numPlayers);
          numPlayersRef.current = res.gameState.numPlayers;
          setGameStarted(true);
        } else {
          setSetupMode('waiting');
        }
      }
    );
  }, []);

  const emitState = (updatedPlayers: Player[]) => {
    if (!isSoloRef.current) {
      socketRef.current?.emit('update-state', {
        players: updatedPlayers,
        numPlayers: numPlayersRef.current,
      });
    }
  };

  const initSocket = () => {
    if (socketRef.current?.connected) return socketRef.current;
    const socket = SERVER_URL ? io(SERVER_URL) : io();
    socketRef.current = socket;
    socket.on('state-updated', (state: GameState) => {
      setPlayers(state.players);
      setNumPlayers(state.numPlayers);
      numPlayersRef.current = state.numPlayers;
      setGameStarted(true);
    });
    return socket;
  };

  const handleCreateRoom = () => {
    isSoloRef.current = false;
    const socket = initSocket();
    socket.emit('create-room', (res: { roomCode: string }) => {
      setRoomCode(res.roomCode);
      setSetupMode('create');
    });
  };

  const handleJoinRoom = () => {
    const code = joinInput.toUpperCase().trim();
    if (!code) return;
    setRoomError('');
    isSoloRef.current = false;
    const socket = initSocket();
    socket.emit(
      'join-room',
      { roomCode: code },
      (res: { gameState: GameState | null; error?: string }) => {
        if (res.error) {
          setRoomError(res.error);
          return;
        }
        setRoomCode(code);
        sessionStorage.setItem('mtg_room_code', code);
        if (res.gameState) {
          setPlayers(res.gameState.players);
          setNumPlayers(res.gameState.numPlayers);
          numPlayersRef.current = res.gameState.numPlayers;
          setGameStarted(true);
        } else {
          setSetupMode('waiting');
        }
      }
    );
  };

  const startGame = () => {
    const newPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      life: 20,
      creatures: [],
    }));
    numPlayersRef.current = numPlayers;
    setPlayers(newPlayers);
    setGameStarted(true);
    if (!isSoloRef.current) {
      sessionStorage.setItem('mtg_room_code', roomCode);
      socketRef.current?.emit('update-state', { players: newPlayers, numPlayers });
    }
  };

  const newGame = () => {
    setGameStarted(false);
    setPlayers([]);
    setRoomCode('');
    setJoinInput('');
    setRoomError('');
    setSetupMode('home');
    socketRef.current?.disconnect();
    socketRef.current = null;
    isSoloRef.current = false;
    sessionStorage.removeItem('mtg_room_code');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const updateLife = (pid: number, delta: number) => {
    const updated = players.map(p => (p.id === pid ? { ...p, life: p.life + delta } : p));
    setPlayers(updated);
    emitState(updated);
  };

  const startAddCreature = (pid: number) => {
    setAddingModifier(null);
    setAddingCreature(pid);
    setCreatureForm({ name: '', power: '1', toughness: '1' });
  };

  const submitCreature = () => {
    if (!creatureForm.name.trim()) return;
    const updated = players.map(p =>
      p.id === addingCreature
        ? {
            ...p,
            creatures: [
              ...p.creatures,
              {
                id: Date.now(),
                name: creatureForm.name,
                basePower: parseInt(creatureForm.power) || 1,
                baseToughness: parseInt(creatureForm.toughness) || 1,
                powerMod: 0,
                toughnessMod: 0,
                modifiers: [],
              },
            ],
          }
        : p
    );
    setPlayers(updated);
    setAddingCreature(null);
    emitState(updated);
  };

  const removeCreature = (pid: number, cid: number) => {
    const updated = players.map(p =>
      p.id === pid ? { ...p, creatures: p.creatures.filter(c => c.id !== cid) } : p
    );
    setPlayers(updated);
    emitState(updated);
  };

  const modifyCreature = (
    pid: number,
    cid: number,
    field: 'powerMod' | 'toughnessMod',
    delta: number
  ) => {
    const updated = players.map(p =>
      p.id === pid
        ? {
            ...p,
            creatures: p.creatures.map(c =>
              c.id === cid ? { ...c, [field]: c[field] + delta } : c
            ),
          }
        : p
    );
    setPlayers(updated);
    emitState(updated);
  };

  const startAddModifier = (pid: number, cid: number) => {
    setAddingCreature(null);
    setAddingModifier({ pid, cid });
    setModifierForm({ name: '', color: '#8b5cf6' });
  };

  const submitModifier = () => {
    if (!modifierForm.name.trim() || !addingModifier) return;
    const { pid, cid } = addingModifier;
    const updated = players.map(p =>
      p.id === pid
        ? { ...p, creatures: p.creatures.map(c =>
            c.id === cid
              ? { ...c, modifiers: [...c.modifiers, { id: Date.now(), name: modifierForm.name.trim(), color: modifierForm.color }] }
              : c
          )}
        : p
    );
    setPlayers(updated);
    setAddingModifier(null);
    emitState(updated);
  };

  const removeModifier = (pid: number, cid: number, mid: number) => {
    const updated = players.map(p =>
      p.id === pid
        ? { ...p, creatures: p.creatures.map(c =>
            c.id === cid
              ? { ...c, modifiers: c.modifiers.filter(m => m.id !== mid) }
              : c
          )}
        : p
    );
    setPlayers(updated);
    emitState(updated);
  };

  const disconnectAndGoHome = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setRoomCode('');
    setJoinInput('');
    setRoomError('');
    setSetupMode('home');
  };

  // ── Setup screens ──────────────────────────────────────────────────────────

  if (!gameStarted) {
    // Home: choose mode
    if (setupMode === 'home') {
      return (
        <div style={styles.center}>
          <div style={styles.card}>
            <div style={styles.title}>
              <div style={styles.iconContainer}>
                <Users size={48} color="#60a5fa" />
              </div>
              <h1 style={styles.titleText}>MTG Tracker</h1>
            </div>
            <button
              onClick={() => { isSoloRef.current = true; setSetupMode('solo'); }}
              style={{ ...styles.homeBtn, backgroundColor: '#2563eb', color: '#fff' }}
            >
              Play Solo
            </button>
            <button
              onClick={handleCreateRoom}
              style={{ ...styles.homeBtn, backgroundColor: '#16a34a', color: '#fff' }}
            >
              Create Room
            </button>
            <button
              onClick={() => setSetupMode('join')}
              style={{ ...styles.homeBtn, backgroundColor: '#7c3aed', color: '#fff', marginBottom: 0 }}
            >
              Join Room
            </button>
          </div>
        </div>
      );
    }

    // Solo: pick player count and start
    if (setupMode === 'solo') {
      return (
        <div style={styles.center}>
          <div style={styles.card}>
            <div style={styles.title}>
              <div style={styles.iconContainer}>
                <Users size={48} color="#60a5fa" />
              </div>
              <h1 style={styles.titleText}>MTG Tracker</h1>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={styles.label}>Number of Players</label>
              <div style={styles.playerBtns}>
                {[2, 3, 4].map(n => (
                  <button key={n} onClick={() => setNumPlayers(n)} style={getPlayerBtnStyle(numPlayers === n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={startGame} style={styles.startBtn}>Start Game</button>
            <button onClick={() => setSetupMode('home')} style={styles.backBtn}>Back</button>
          </div>
        </div>
      );
    }

    // Create room: show room code + pick player count
    if (setupMode === 'create') {
      return (
        <div style={styles.center}>
          <div style={styles.card}>
            <div style={styles.title}>
              <h1 style={styles.titleText}>Create Room</h1>
            </div>
            <div style={styles.roomCodeBox}>
              <div style={styles.roomCodeLabel}>Room Code</div>
              <div style={styles.roomCodeText}>
                {roomCode}
                <button onClick={copyRoomCode} style={styles.copyBtn}>
                  {copied
                    ? <Check size={20} color="#22c55e" />
                    : <Copy size={20} color="#60a5fa" />}
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                Share this code with other players
              </div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={styles.label}>Number of Players</label>
              <div style={styles.playerBtns}>
                {[2, 3, 4].map(n => (
                  <button key={n} onClick={() => setNumPlayers(n)} style={getPlayerBtnStyle(numPlayers === n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={startGame} style={styles.startBtn}>Start Game</button>
            <button onClick={disconnectAndGoHome} style={styles.backBtn}>Back</button>
          </div>
        </div>
      );
    }

    // Join room: enter code
    if (setupMode === 'join') {
      return (
        <div style={styles.center}>
          <div style={styles.card}>
            <div style={styles.title}>
              <h1 style={styles.titleText}>Join Room</h1>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Room Code</label>
              <input
                style={{
                  ...styles.input,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  fontSize: '22px',
                  textAlign: 'center',
                }}
                type="text"
                placeholder="XXXXXX"
                maxLength={6}
                value={joinInput}
                onChange={e => {
                  setJoinInput(e.target.value.toUpperCase());
                  setRoomError('');
                }}
                onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                autoFocus
              />
              {roomError && <div style={styles.errorText}>{roomError}</div>}
            </div>
            <button
              onClick={handleJoinRoom}
              style={{ ...styles.startBtn, backgroundColor: '#7c3aed', marginTop: 0 }}
            >
              Join Room
            </button>
            <button
              onClick={() => {
                setJoinInput('');
                setRoomError('');
                socketRef.current?.disconnect();
                socketRef.current = null;
                setSetupMode('home');
              }}
              style={styles.backBtn}
            >
              Back
            </button>
          </div>
        </div>
      );
    }

    // Waiting: joiner waiting for host to start
    if (setupMode === 'waiting') {
      return (
        <div style={styles.center}>
          <div style={styles.card}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '16px' }}>
                <Users size={48} color="#60a5fa" />
              </div>
              <h2 style={{ ...styles.titleText, fontSize: '22px', marginBottom: '20px' }}>
                Waiting for Host
              </h2>
              <div style={styles.roomCodeBox}>
                <div style={styles.roomCodeLabel}>Room Code</div>
                <div style={{ ...styles.roomCodeText, justifyContent: 'center' }}>{roomCode}</div>
              </div>
              <p style={styles.waitingText}>The host hasn't started the game yet…</p>
              <button onClick={disconnectAndGoHome} style={{ ...styles.backBtn, marginTop: '16px' }}>
                Leave Room
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // ── Game screen ────────────────────────────────────────────────────────────

  return (
    <div style={styles.app}>
      <div style={styles.gridContainer}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>MTG Game Tracker</h1>
          <div style={styles.headerActions}>
            {roomCode && (
              <div style={styles.roomCodeBadge}>
                <span>
                  Room: <strong style={{ color: '#60a5fa' }}>{roomCode}</strong>
                </span>
                <button onClick={copyRoomCode} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                  {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} color="#6b7280" />}
                </button>
              </div>
            )}
            <button onClick={newGame} style={styles.newGameBtn}>New Game</button>
          </div>
        </div>

        <div style={getGridStyle(numPlayers, windowWidth)}>
          {players.map((player, idx) => (
            <div key={player.id} style={getPlayerCardStyle(idx)}>
              <p style={styles.playerName}>{player.name}</p>

              <div style={styles.lifeBox}>
                <button onClick={() => updateLife(player.id, -1)} style={getIconBtnStyle('#dc2626')}>
                  <Minus size={24} color="#fff" />
                </button>
                <div style={styles.lifeCenterDiv}>
                  <div style={styles.lifeNum}>{player.life}</div>
                  <div style={styles.lifeLabel}>Life</div>
                </div>
                <button onClick={() => updateLife(player.id, 1)} style={getIconBtnStyle('#16a34a')}>
                  <Plus size={24} color="#fff" />
                </button>
              </div>

              <div style={styles.sectionHeader}>
                <p style={styles.sectionTitle}>Creatures</p>
                <button onClick={() => startAddCreature(player.id)} style={getIconBtnStyle('#16a34a')}>
                  <Plus size={16} color="#fff" />
                </button>
              </div>

              <div style={styles.creatureList}>
                {addingCreature === player.id && (
                  <div style={styles.formBox}>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Creature name"
                      value={creatureForm.name}
                      onChange={e => setCreatureForm(p => ({ ...p, name: e.target.value }))}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        style={{ ...styles.input, ...styles.inputFlex }}
                        type="number"
                        placeholder="Power"
                        value={creatureForm.power}
                        onChange={e => setCreatureForm(p => ({ ...p, power: e.target.value }))}
                      />
                      <input
                        style={{ ...styles.input, ...styles.inputFlex }}
                        type="number"
                        placeholder="Toughness"
                        value={creatureForm.toughness}
                        onChange={e => setCreatureForm(p => ({ ...p, toughness: e.target.value }))}
                      />
                    </div>
                    <div style={styles.formBtns}>
                      <button onClick={submitCreature} style={styles.addBtn}>Add</button>
                      <button onClick={() => setAddingCreature(null)} style={styles.cancelBtn}>Cancel</button>
                    </div>
                  </div>
                )}

                {player.creatures.map(creature => {
                  const pw = creature.basePower + creature.powerMod;
                  const tg = creature.baseToughness + creature.toughnessMod;
                  return (
                    <div key={creature.id} style={{ ...styles.creatureCard, background: getCreatureBackground(creature.modifiers) }}>
                      <div style={styles.creatureHeader}>
                        <p style={styles.creatureName}>{creature.name}</p>
                        <button
                          onClick={() => removeCreature(player.id, creature.id)}
                          style={styles.removeBtn}
                        >
                          <X size={16} color="#f87171" />
                        </button>
                      </div>

                      {creature.modifiers.length > 0 && (
                        <div style={styles.modifierBadgeRow}>
                          {creature.modifiers.map(mod => (
                            <span key={mod.id} style={{ ...styles.modifierBadge, backgroundColor: mod.color }}>
                              {mod.name}
                              <button
                                onClick={() => removeModifier(player.id, creature.id, mod.id)}
                                style={styles.modifierRemoveBtn}
                              >
                                <X size={10} color="#fff" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={styles.statRow}>
                        <div style={styles.stat}>
                          <div style={styles.statLabel}>Power</div>
                          <div style={styles.statControl}>
                            <button
                              onClick={() => modifyCreature(player.id, creature.id, 'powerMod', -1)}
                              style={getSmallIconBtnStyle('#374151')}
                            >
                              <Minus size={12} color="#fff" />
                            </button>
                            <span style={styles.statNum}>{pw}</span>
                            <button
                              onClick={() => modifyCreature(player.id, creature.id, 'powerMod', 1)}
                              style={getSmallIconBtnStyle('#374151')}
                            >
                              <Plus size={12} color="#fff" />
                            </button>
                          </div>
                        </div>
                        <div style={styles.stat}>
                          <div style={styles.statLabel}>Toughness</div>
                          <div style={styles.statControl}>
                            <button
                              onClick={() => modifyCreature(player.id, creature.id, 'toughnessMod', -1)}
                              style={getSmallIconBtnStyle('#374151')}
                            >
                              <Minus size={12} color="#fff" />
                            </button>
                            <span style={styles.statNum}>{tg}</span>
                            <button
                              onClick={() => modifyCreature(player.id, creature.id, 'toughnessMod', 1)}
                              style={getSmallIconBtnStyle('#374151')}
                            >
                              <Plus size={12} color="#fff" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => startAddModifier(player.id, creature.id)}
                        style={styles.addModifierBtn}
                      >
                        + Add modifier
                      </button>

                      {addingModifier?.pid === player.id && addingModifier?.cid === creature.id && (
                        <div style={styles.modifierFormBox}>
                          <input
                            style={styles.input}
                            type="text"
                            placeholder="Modifier name (e.g. Enchanted)"
                            value={modifierForm.name}
                            onChange={e => setModifierForm(p => ({ ...p, name: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && submitModifier()}
                            autoFocus
                          />
                          <div style={styles.colorSwatchRow}>
                            <span style={styles.colorSwatchLabel}>Color:</span>
                            <input
                              type="color"
                              value={modifierForm.color}
                              onChange={e => setModifierForm(p => ({ ...p, color: e.target.value }))}
                            />
                          </div>
                          <div style={styles.formBtns}>
                            <button onClick={submitModifier} style={styles.addBtn}>Add</button>
                            <button onClick={() => setAddingModifier(null)} style={styles.cancelBtn}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

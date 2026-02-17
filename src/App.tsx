import React, { useState } from 'react';
import { Plus, Minus, X, Users } from 'lucide-react';

const PLAYER_COLORS = [
  { bg: '#1e3a5f', border: '#3b82f6' },
  { bg: '#5f1e1e', border: '#ef4444' },
  { bg: '#1e3d1e', border: '#22c55e' },
  { bg: '#3d1e5f', border: '#a855f7' },
];

const s = {
  app: { minHeight: '100vh', backgroundColor: '#111827', padding: '16px', fontFamily: 'sans-serif' },
  center: { minHeight: '100vh', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'sans-serif' },
  card: { backgroundColor: '#1f2937', borderRadius: '8px', padding: '32px', maxWidth: '400px', width: '100%', border: '2px solid #374151' },
  title: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' },
  titleText: { fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: 0 },
  label: { color: '#d1d5db', marginBottom: '8px', fontWeight: '600', display: 'block' },
  playerBtns: { display: 'flex', gap: '8px' },
  playerBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', border: 'none', backgroundColor: active ? '#2563eb' : '#374151', color: active ? '#fff' : '#d1d5db', fontSize: '16px' }),
  startBtn: { width: '100%', backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '16px', marginTop: '16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerTitle: { fontSize: '28px', fontWeight: 'bold', color: '#fff', margin: 0 },
  newGameBtn: { backgroundColor: '#dc2626', color: '#fff', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  grid: (n) => ({ display: 'grid', gap: '16px', gridTemplateColumns: n === 2 ? 'repeat(2, 1fr)' : n === 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)' }),
  playerCard: (idx) => ({ backgroundColor: PLAYER_COLORS[idx].bg, borderRadius: '8px', padding: '16px', border: `2px solid ${PLAYER_COLORS[idx].border}` }),
  playerName: { fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' },
  lifeBox: { backgroundColor: '#111827', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  lifeNum: { fontSize: '48px', fontWeight: 'bold', color: '#fff', textAlign: 'center', flex: 1 },
  lifeLabel: { fontSize: '12px', color: '#9ca3af', textAlign: 'center' },
  iconBtn: (color) => ({ backgroundColor: color, border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  smallIconBtn: (color) => ({ backgroundColor: color, border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  sectionTitle: { color: '#fff', fontWeight: '600', margin: 0 },
  creatureList: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '384px', overflowY: 'auto' },
  creatureCard: { backgroundColor: '#1f2937', borderRadius: '6px', padding: '12px', border: '1px solid #374151' },
  creatureHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  creatureName: { color: '#fff', fontWeight: '600', fontSize: '14px', margin: 0 },
  statRow: { display: 'flex', gap: '16px' },
  stat: { flex: 1 },
  statLabel: { fontSize: '11px', color: '#9ca3af', marginBottom: '4px' },
  statControl: { display: 'flex', alignItems: 'center', gap: '4px' },
  statNum: { color: '#fff', fontWeight: 'bold', fontSize: '20px', flex: 1, textAlign: 'center' },
  formBox: { backgroundColor: '#374151', borderRadius: '6px', padding: '12px', border: '2px solid #22c55e', display: 'flex', flexDirection: 'column', gap: '8px' },
  input: { width: '100%', backgroundColor: '#1f2937', color: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #4b5563', fontSize: '14px', boxSizing: 'border-box' },
  formBtns: { display: 'flex', gap: '8px' },
  addBtn: { flex: 1, backgroundColor: '#16a34a', color: '#fff', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { flex: 1, backgroundColor: '#4b5563', color: '#fff', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' },
};

export default function MTGTracker() {
  const [gameStarted, setGameStarted] = useState(false);
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([]);
  const [addingCreature, setAddingCreature] = useState(null);
  const [creatureForm, setCreatureForm] = useState({ name: '', power: '1', toughness: '1' });

  const startGame = () => {
    setPlayers(Array.from({ length: numPlayers }, (_, i) => ({
      id: i, name: `Player ${i + 1}`, life: 20, creatures: []
    })));
    setGameStarted(true);
  };

  const updateLife = (pid, delta) =>
    setPlayers(prev => prev.map(p => p.id === pid ? { ...p, life: p.life + delta } : p));

  const startAddCreature = (pid) => {
    setAddingCreature(pid);
    setCreatureForm({ name: '', power: '1', toughness: '1' });
  };

  const submitCreature = () => {
    if (!creatureForm.name.trim()) return;
    setPlayers(prev => prev.map(p =>
      p.id === addingCreature ? {
        ...p, creatures: [...p.creatures, {
          id: Date.now(),
          name: creatureForm.name,
          basePower: parseInt(creatureForm.power) || 1,
          baseToughness: parseInt(creatureForm.toughness) || 1,
          powerMod: 0, toughnessMod: 0
        }]
      } : p
    ));
    setAddingCreature(null);
  };

  const removeCreature = (pid, cid) =>
    setPlayers(prev => prev.map(p =>
      p.id === pid ? { ...p, creatures: p.creatures.filter(c => c.id !== cid) } : p
    ));

  const modifyCreature = (pid, cid, field, delta) =>
    setPlayers(prev => prev.map(p =>
      p.id === pid ? {
        ...p, creatures: p.creatures.map(c =>
          c.id === cid ? { ...c, [field]: c[field] + delta } : c
        )
      } : p
    ));

  if (!gameStarted) {
    return (
      <div style={s.center}>
        <div style={s.card}>
          <div style={s.title}>
            <Users size={48} color="#60a5fa" style={{ marginRight: '12px' }} />
            <h1 style={s.titleText}>MTG Tracker</h1>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={s.label}>Number of Players</label>
            <div style={s.playerBtns}>
              {[2, 3, 4].map(n => (
                <button key={n} onClick={() => setNumPlayers(n)} style={s.playerBtn(numPlayers === n)}>{n}</button>
              ))}
            </div>
          </div>
          <button onClick={startGame} style={s.startBtn}>Start Game</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={s.header}>
          <h1 style={s.headerTitle}>MTG Game Tracker</h1>
          <button onClick={() => setGameStarted(false)} style={s.newGameBtn}>New Game</button>
        </div>

        <div style={s.grid(numPlayers)}>
          {players.map((player, idx) => (
            <div key={player.id} style={s.playerCard(idx)}>
              <p style={s.playerName}>{player.name}</p>

              <div style={s.lifeBox}>
                <button onClick={() => updateLife(player.id, -1)} style={s.iconBtn('#dc2626')}>
                  <Minus size={24} color="#fff" />
                </button>
                <div>
                  <div style={s.lifeNum}>{player.life}</div>
                  <div style={s.lifeLabel}>Life</div>
                </div>
                <button onClick={() => updateLife(player.id, 1)} style={s.iconBtn('#16a34a')}>
                  <Plus size={24} color="#fff" />
                </button>
              </div>

              <div style={s.sectionHeader}>
                <p style={s.sectionTitle}>Creatures</p>
                <button onClick={() => startAddCreature(player.id)} style={s.iconBtn('#16a34a')}>
                  <Plus size={16} color="#fff" />
                </button>
              </div>

              <div style={s.creatureList}>
                {addingCreature === player.id && (
                  <div style={s.formBox}>
                    <input
                      style={s.input}
                      type="text"
                      placeholder="Creature name"
                      value={creatureForm.name}
                      onChange={e => setCreatureForm(p => ({ ...p, name: e.target.value }))}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        style={{ ...s.input, flex: 1 }}
                        type="number"
                        placeholder="Power"
                        value={creatureForm.power}
                        onChange={e => setCreatureForm(p => ({ ...p, power: e.target.value }))}
                      />
                      <input
                        style={{ ...s.input, flex: 1 }}
                        type="number"
                        placeholder="Toughness"
                        value={creatureForm.toughness}
                        onChange={e => setCreatureForm(p => ({ ...p, toughness: e.target.value }))}
                      />
                    </div>
                    <div style={s.formBtns}>
                      <button onClick={submitCreature} style={s.addBtn}>Add</button>
                      <button onClick={() => setAddingCreature(null)} style={s.cancelBtn}>Cancel</button>
                    </div>
                  </div>
                )}

                {player.creatures.map(creature => {
                  const pw = creature.basePower + creature.powerMod;
                  const tg = creature.baseToughness + creature.toughnessMod;
                  return (
                    <div key={creature.id} style={s.creatureCard}>
                      <div style={s.creatureHeader}>
                        <p style={s.creatureName}>{creature.name}</p>
                        <button onClick={() => removeCreature(player.id, creature.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                          <X size={16} color="#f87171" />
                        </button>
                      </div>
                      <div style={s.statRow}>
                        {[['Power', pw, 'powerMod'], ['Toughness', tg, 'toughnessMod']].map(([label, val, field]) => (
                          <div key={field} style={s.stat}>
                            <div style={s.statLabel}>{label}</div>
                            <div style={s.statControl}>
                              <button onClick={() => modifyCreature(player.id, creature.id, field, -1)} style={s.smallIconBtn('#374151')}>
                                <Minus size={12} color="#fff" />
                              </button>
                              <span style={s.statNum}>{val}</span>
                              <button onClick={() => modifyCreature(player.id, creature.id, field, 1)} style={s.smallIconBtn('#374151')}>
                                <Plus size={12} color="#fff" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
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
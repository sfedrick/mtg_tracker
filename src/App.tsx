import React, { useState } from 'react';
import { Plus, Minus, X, Users } from 'lucide-react';

const PLAYER_COLORS = ['bg-blue-900', 'bg-red-900', 'bg-green-900', 'bg-purple-900'];
const BORDER_COLORS = ['border-blue-500', 'border-red-500', 'border-green-500', 'border-purple-500'];

export default function MTGTracker() {
  const [gameStarted, setGameStarted] = useState(false);
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([]);

  const startGame = () => {
    const newPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      name: `Player ${i + 1}`,
      life: 20,
      creatures: []
    }));
    setPlayers(newPlayers);
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setPlayers([]);
  };

  const updateLife = (playerId, delta) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, life: p.life + delta } : p
    ));
  };

  const [addingCreature, setAddingCreature] = useState(null);
  const [creatureForm, setCreatureForm] = useState({ name: '', power: '1', toughness: '1' });

  const startAddCreature = (playerId) => {
    setAddingCreature(playerId);
    setCreatureForm({ name: '', power: '1', toughness: '1' });
  };

  const submitCreature = () => {
    if (!creatureForm.name.trim()) return;
    
    const newCreature = {
      id: Date.now(),
      name: creatureForm.name,
      basePower: parseInt(creatureForm.power) || 1,
      baseToughness: parseInt(creatureForm.toughness) || 1,
      powerMod: 0,
      toughnessMod: 0
    };

    setPlayers(prev => prev.map(p => 
      p.id === addingCreature ? { ...p, creatures: [...p.creatures, newCreature] } : p
    ));
    
    setAddingCreature(null);
  };

  const removeCreature = (playerId, creatureId) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, creatures: p.creatures.filter(c => c.id !== creatureId) } : p
    ));
  };

  const modifyCreature = (playerId, creatureId, field, delta) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? {
        ...p,
        creatures: p.creatures.map(c => 
          c.id === creatureId ? { ...c, [field]: c[field] + delta } : c
        )
      } : p
    ));
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border-2 border-gray-700">
          <div className="flex items-center justify-center mb-6">
            <Users className="w-12 h-12 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">MTG Tracker</h1>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-semibold">Number of Players</label>
            <div className="flex gap-2">
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setNumPlayers(n)}
                  className={`flex-1 py-3 rounded font-bold transition ${
                    numPlayers === n 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">MTG Game Tracker</h1>
          <button
            onClick={resetGame}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            New Game
          </button>
        </div>

        <div className={`grid gap-4 ${numPlayers === 2 ? 'grid-cols-1 md:grid-cols-2' : numPlayers === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
          {players.map((player, idx) => (
            <div key={player.id} className={`${PLAYER_COLORS[idx]} rounded-lg p-4 border-2 ${BORDER_COLORS[idx]}`}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-2">{player.name}</h2>
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                  <button
                    onClick={() => updateLife(player.id, -1)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition"
                  >
                    <Minus className="w-6 h-6" />
                  </button>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{player.life}</div>
                    <div className="text-sm text-gray-400">Life</div>
                  </div>
                  <button
                    onClick={() => updateLife(player.id, 1)}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-semibold">Creatures</h3>
                  <button
                    onClick={() => startAddCreature(player.id)}
                    className="bg-green-600 hover:bg-green-700 text-white p-1 rounded transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {addingCreature === player.id && (
                    <div className="bg-gray-700 rounded p-3 border-2 border-green-500">
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Creature name"
                          value={creatureForm.name}
                          onChange={(e) => setCreatureForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Power"
                            value={creatureForm.power}
                            onChange={(e) => setCreatureForm(prev => ({ ...prev, power: e.target.value }))}
                            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                          />
                          <input
                            type="number"
                            placeholder="Toughness"
                            value={creatureForm.toughness}
                            onChange={(e) => setCreatureForm(prev => ({ ...prev, toughness: e.target.value }))}
                            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={submitCreature}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setAddingCreature(null)}
                            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded font-semibold transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {player.creatures.map(creature => {
                    const totalPower = creature.basePower + creature.powerMod;
                    const totalToughness = creature.baseToughness + creature.toughnessMod;
                    
                    return (
                      <div key={creature.id} className="bg-gray-800 rounded p-3 border border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-semibold text-sm">{creature.name}</span>
                          <button
                            onClick={() => removeCreature(player.id, creature.id)}
                            className="text-red-400 hover:text-red-300 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="text-xs text-gray-400 mb-1">Power</div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => modifyCreature(player.id, creature.id, 'powerMod', -1)}
                                className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded text-xs transition"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-white font-bold text-lg flex-1 text-center">
                                {totalPower}
                              </span>
                              <button
                                onClick={() => modifyCreature(player.id, creature.id, 'powerMod', 1)}
                                className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded text-xs transition"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="text-xs text-gray-400 mb-1">Toughness</div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => modifyCreature(player.id, creature.id, 'toughnessMod', -1)}
                                className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded text-xs transition"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-white font-bold text-lg flex-1 text-center">
                                {totalToughness}
                              </span>
                              <button
                                onClick={() => modifyCreature(player.id, creature.id, 'toughnessMod', 1)}
                                className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded text-xs transition"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
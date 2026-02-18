const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// roomCode -> { gameState: null | { players, numPlayers } }
const rooms = new Map();

function generateRoomCode() {
  // Omit visually ambiguous characters (0/O, 1/I/L)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  } while (rooms.has(code));
  return code;
}

io.on('connection', (socket) => {
  socket.on('create-room', (callback) => {
    const code = generateRoomCode();
    rooms.set(code, { gameState: null });
    socket.join(code);
    socket.data.roomCode = code;
    console.log(`Room ${code} created by ${socket.id}`);
    callback({ roomCode: code });
  });

  socket.on('join-room', ({ roomCode }, callback) => {
    const code = String(roomCode).toUpperCase().trim();
    if (!rooms.has(code)) {
      callback({ error: 'Room not found' });
      return;
    }
    socket.join(code);
    socket.data.roomCode = code;
    const room = rooms.get(code);
    console.log(`${socket.id} joined room ${code}`);
    callback({ gameState: room.gameState });
  });

  socket.on('update-state', (gameState) => {
    const code = socket.data.roomCode;
    if (code && rooms.has(code)) {
      rooms.get(code).gameState = gameState;
      // Broadcast to everyone else in the room
      socket.to(code).emit('state-updated', gameState);
    }
  });

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (code && rooms.has(code)) {
      const roomSockets = io.sockets.adapter.rooms.get(code);
      if (!roomSockets || roomSockets.size === 0) {
        rooms.delete(code);
        console.log(`Room ${code} removed (empty)`);
      }
    }
  });
});

// Serve the Vite build in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`MTG Tracker server running on port ${PORT}`);
});

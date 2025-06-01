const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Store shared document and whiteboard state on server
let documentContent = '';
let whiteboardLines = []; // each line: {x0,y0,x1,y1,color,size}

const userColors = {};
const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6'];

function getUserColor(id) {
  if (!userColors[id]) {
    const color = colors.shift() || '#000000';
    userColors[id] = color;
    colors.push(color); // rotate colors
  }
  return userColors[id];
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send current document and whiteboard state to new user
  socket.emit('init', { documentContent, whiteboardLines });

  // Send user color
  const color = getUserColor(socket.id);
  socket.emit('setColor', color);

  // Notify all clients about new cursor position or user join (optional)
  socket.broadcast.emit('userJoined', { id: socket.id, color });

  // Receive document edits
  socket.on('edit', (content) => {
    documentContent = content;
    socket.broadcast.emit('edit', content);
  });

  // Receive drawing data
  socket.on('draw', (data) => {
    whiteboardLines.push(data);
    socket.broadcast.emit('draw', data);
  });

  // Clear whiteboard broadcast
  socket.on('clearWhiteboard', () => {
    whiteboardLines = [];
    io.emit('clearWhiteboard');
  });

  // Receive cursor positions from clients
  socket.on('cursorMove', (pos) => {
    socket.broadcast.emit('cursorMove', { id: socket.id, pos, color: userColors[socket.id] });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete userColors[socket.id];
    io.emit('userLeft', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

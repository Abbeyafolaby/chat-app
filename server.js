const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main page
app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
console.log('A user connected:', socket.id);

// Notify all clients that a user joined
socket.broadcast.emit('user joined', {
message: 'A user joined the chat',
timestamp: new Date().toLocaleTimeString()
});

// Handle incoming chat messages
socket.on('chat message', (data) => {
console.log('Message received:', data);

// Broadcast message to all connected clients
io.emit('chat message', {
    message: data.message,
    user: data.user || 'Anonymous',
    timestamp: new Date().toLocaleTimeString(),
    socketId: socket.id
});
});

// Handle user typing indicator
socket.on('typing', (data) => {
socket.broadcast.emit('typing', {
    user: data.user || 'Someone',
    isTyping: data.isTyping
});
});

// Handle disconnection
socket.on('disconnect', () => {
console.log('User disconnected:', socket.id);
socket.broadcast.emit('user left', {
    message: 'A user left the chat',
    timestamp: new Date().toLocaleTimeString()
});
});
});

// Start the server
server.listen(PORT, () => {
console.log(`Chat server running on http://localhost:${PORT}`);
});
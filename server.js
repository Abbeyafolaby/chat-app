const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Store room users - in production, use Redis or database
const roomUsers = new Map();

// Available rooms
const availableRooms = ['General', 'Sports', 'Tech', 'Music', 'Gaming'];

// Helper functions
function addUserToRoom(socketId, username, roomName) {
    if (!roomUsers.has(roomName)) {
        roomUsers.set(roomName, new Map());
    }
    roomUsers.get(roomName).set(socketId, {
        id: socketId,
        username: username,
        joinedAt: new Date()
    });
}

function removeUserFromRoom(socketId, roomName) {
    if (roomUsers.has(roomName)) {
        roomUsers.get(roomName).delete(socketId);
        if (roomUsers.get(roomName).size === 0) {
            roomUsers.delete(roomName);
        }
    }
}

function getRoomUsers(roomName) {
    if (!roomUsers.has(roomName)) return [];
    return Array.from(roomUsers.get(roomName).values());
}

function getUserRoom(socketId) {
    for (let [roomName, users] of roomUsers) {
        if (users.has(socketId)) {
            return roomName;
        }
    }
    return null;
}

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get available rooms
app.get('/api/rooms', (req, res) => {
    const roomsWithCounts = availableRooms.map(room => ({
        name: room,
        userCount: roomUsers.has(room) ? roomUsers.get(room).size : 0
    }));
    res.json(roomsWithCounts);
});

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send available rooms to new connection
    socket.emit('available rooms', availableRooms);

    // Handle user joining a room
    socket.on('join room', (data) => {
        const { username, roomName } = data;
        
        // Leave any previous room
        const previousRoom = getUserRoom(socket.id);
        if (previousRoom) {
            socket.leave(previousRoom);
            removeUserFromRoom(socket.id, previousRoom);
            
            // Notify previous room about user leaving
            socket.to(previousRoom).emit('user left', {
                message: `${username} left the room`,
                timestamp: new Date().toLocaleTimeString(),
                username: username
            });
            
            // Update user list for previous room
            io.to(previousRoom).emit('room users', getRoomUsers(previousRoom));
        }

        // Join new room
        socket.join(roomName);
        addUserToRoom(socket.id, username, roomName);

        console.log(`${username} joined room: ${roomName}`);

        // Send confirmation to user
        socket.emit('joined room', {
            roomName: roomName,
            message: `Welcome to ${roomName} room!`,
            timestamp: new Date().toLocaleTimeString()
        });

        // Notify room about new user (except the user who joined)
        socket.to(roomName).emit('user joined', {
            message: `${username} joined the room`,
            timestamp: new Date().toLocaleTimeString(),
            username: username
        });

        // Send updated user list to all users in room
        io.to(roomName).emit('room users', getRoomUsers(roomName));
    });

    // Handle incoming chat messages
    socket.on('chat message', (data) => {
        const userRoom = getUserRoom(socket.id);
        if (!userRoom) {
            socket.emit('error', { message: 'You must join a room first!' });
            return;
        }

        console.log('Message received in room', userRoom + ':', data);

        // Broadcast message to all users in the same room
        io.to(userRoom).emit('chat message', {
            message: data.message,
            user: data.user || 'Anonymous',
            timestamp: new Date().toLocaleTimeString(),
            socketId: socket.id,
            room: userRoom
        });
    });

    // Handle user typing indicator
    socket.on('typing', (data) => {
        const userRoom = getUserRoom(socket.id);
        if (userRoom) {
            socket.to(userRoom).emit('typing', {
                user: data.user || 'Someone',
                isTyping: data.isTyping
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const userRoom = getUserRoom(socket.id);
        const user = userRoom && roomUsers.has(userRoom) ? roomUsers.get(userRoom).get(socket.id) : null;
        
        console.log('User disconnected:', socket.id);
        
        if (userRoom && user) {
            // Remove user from room
            removeUserFromRoom(socket.id, userRoom);
            
            // Notify room about user leaving
            socket.to(userRoom).emit('user left', {
                message: `${user.username} left the room`,
                timestamp: new Date().toLocaleTimeString(),
                username: user.username
            });
            
            // Update user list for room
            io.to(userRoom).emit('room users', getRoomUsers(userRoom));
        }
    });

    // Handle room list request
    socket.on('get rooms', () => {
        const roomsWithCounts = availableRooms.map(room => ({
            name: room,
            userCount: roomUsers.has(room) ? roomUsers.get(room).size : 0
        }));
        socket.emit('rooms list', roomsWithCounts);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Chat server running on http://localhost:${PORT}`);
    console.log(`Available rooms: ${availableRooms.join(', ')}`);
});
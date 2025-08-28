// Initialize Socket.io connection
const socket = io();

// State management
let currentRoom = null;
let currentUsername = null;
let selectedRoom = null;
let typingTimer;
let isTyping = false;

// DOM Elements - Room Selection
const roomSelection = document.getElementById('roomSelection');
const chatApp = document.getElementById('chatApp');
const usernameSetup = document.getElementById('usernameSetup');
const roomsGrid = document.getElementById('roomsGrid');
const joinRoomBtn = document.getElementById('joinRoomBtn');

// DOM Elements - Chat Interface
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const currentRoomDisplay = document.getElementById('currentRoom');
const currentUsernameDisplay = document.getElementById('currentUsername');
const usersList = document.getElementById('usersList');
const userCount = document.getElementById('userCount');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');
const connectionStatus = document.getElementById('connectionStatus');

// Available rooms (will be populated from server)
let availableRooms = ['General', 'Sports', 'Tech', 'Music', 'Gaming'];

// Initialize the application
function initializeApp() {
    setupEventListeners();
    loadRooms();
    usernameSetup.focus();
}

// Setup all event listeners
function setupEventListeners() {
    // Room selection events
    usernameSetup.addEventListener('input', validateForm);
    joinRoomBtn.addEventListener('click', joinSelectedRoom);
    usernameSetup.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && joinRoomBtn.disabled === false) {
            joinSelectedRoom();
        }
    });

    // Chat events
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Leave room event
    leaveRoomBtn.addEventListener('click', leaveCurrentRoom);

    // Typing indicator
    messageInput.addEventListener('input', handleTyping);
}

// Load available rooms
function loadRooms() {
    // Request rooms from server
    socket.emit('get rooms');
}

// Create room option elements
function createRoomOption(room) {
    const roomDiv = document.createElement('div');
    roomDiv.className = 'room-option';
    roomDiv.dataset.roomName = room.name;
    
    roomDiv.innerHTML = `
        <span class="room-name">🏠 ${room.name}</span>
        <span class="room-count">${room.userCount} users</span>
    `;
    
    roomDiv.addEventListener('click', () => selectRoom(room.name, roomDiv));
    return roomDiv;
}

// Select a room
function selectRoom(roomName, roomElement) {
    // Remove selection from other rooms
    document.querySelectorAll('.room-option').forEach(room => {
        room.classList.remove('selected');
    });
    
    // Select current room
    roomElement.classList.add('selected');
    selectedRoom = roomName;
    validateForm();
}

// Validate form before allowing join
function validateForm() {
    const username = usernameSetup.value.trim();
    const hasRoom = selectedRoom !== null;
    
    joinRoomBtn.disabled = !(username.length >= 2 && hasRoom);
}

// Join selected room
function joinSelectedRoom() {
    const username = usernameSetup.value.trim();
    
    if (!username || !selectedRoom) {
        alert('Please enter a username and select a room!');
        return;
    }
    
    if (username.length < 2) {
        alert('Username must be at least 2 characters long!');
        return;
    }
    
    currentUsername = username;
    
    // Send join room request to server
    socket.emit('join room', {
        username: currentUsername,
        roomName: selectedRoom
    });
}

// Switch to chat interface
function showChatInterface(roomName) {
    currentRoom = roomName;
    roomSelection.style.display = 'none';
    chatApp.style.display = 'block';
    
    // Update UI
    currentRoomDisplay.textContent = `🏠 ${roomName}`;
    currentUsernameDisplay.textContent = currentUsername;
    
    // Focus message input
    setTimeout(() => {
        messageInput.focus();
    }, 100);
}

// Leave current room
function leaveCurrentRoom() {
    if (confirm('Are you sure you want to leave this room?')) {
        // Reset state
        currentRoom = null;
        selectedRoom = null;
        
        // Clear messages and users
        messagesDiv.innerHTML = '';
        usersList.innerHTML = '';
        userCount.textContent = '0';
        
        // Show room selection
        roomSelection.style.display = 'flex';
        chatApp.style.display = 'none';
        
        // Clear selected room
        document.querySelectorAll('.room-option').forEach(room => {
            room.classList.remove('selected');
        });
        
        validateForm();
        loadRooms(); // Refresh room counts
    }
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message || !currentRoom) return;
    
    // Display own message immediately
    displayMessage({
        message: message,
        user: currentUsername,
        timestamp: new Date().toLocaleTimeString(),
        room: currentRoom
    }, 'own');
    
    // Send to server
    socket.emit('chat message', {
        message: message,
        user: currentUsername
    });
    
    // Clear input
    messageInput.value = '';
    
    // Stop typing indicator
    if (isTyping) {
        socket.emit('typing', { user: currentUsername, isTyping: false });
        isTyping = false;
    }
}

// Handle typing indicator
function handleTyping() {
    if (!currentRoom) return;
    
    if (!isTyping) {
        isTyping = true;
        socket.emit('typing', { user: currentUsername, isTyping: true });
    }
    
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        isTyping = false;
        socket.emit('typing', { user: currentUsername, isTyping: false });
    }, 1000);
}

// Display message in chat
function displayMessage(data, messageType = 'other') {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', messageType);
    
    if (messageType === 'system') {
        messageElement.innerHTML = `
            <div>${data.message}</div>
            <div class="message-info">${data.timestamp}</div>
        `;
    } else {
        const isOwn = messageType === 'own';
        messageElement.innerHTML = `
            <div>${data.message}</div>
            <div class="message-info">
                ${isOwn ? 'You' : data.user} • ${data.timestamp}
            </div>
        `;
    }
    
    messagesDiv.appendChild(messageElement);
    scrollToBottom();
}

// Update users list
function updateUsersList(users) {
    usersList.innerHTML = '';
    userCount.textContent = users.length;
    
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        
        const isCurrentUser = user.username === currentUsername;
        const joinTime = new Date(user.joinedAt).toLocaleTimeString();
        
        userElement.innerHTML = `
            <div class="user-name">
                ${isCurrentUser ? '👤 ' : ''}${user.username}${isCurrentUser ? ' (You)' : ''}
            </div>
            <div class="user-status">Joined at ${joinTime}</div>
        `;
        
        usersList.appendChild(userElement);
    });
}

// Scroll to bottom of messages
function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Update connection status
function updateConnectionStatus(status, message) {
    connectionStatus.textContent = message;
    connectionStatus.className = `connection-status ${status}`;
}

// Socket Event Listeners
socket.on('available rooms', (rooms) => {
    availableRooms = rooms;
    roomsGrid.innerHTML = '';
    
    rooms.forEach(room => {
        const roomOption = createRoomOption({ name: room, userCount: 0 });
        roomsGrid.appendChild(roomOption);
    });
});

socket.on('rooms list', (rooms) => {
    roomsGrid.innerHTML = '';
    
    rooms.forEach(room => {
        const roomOption = createRoomOption(room);
        roomsGrid.appendChild(roomOption);
    });
});

socket.on('joined room', (data) => {
    showChatInterface(data.roomName);
    displayMessage({
        message: data.message,
        timestamp: data.timestamp
    }, 'system');
});

socket.on('chat message', (data) => {
    // Only display if it's not from the current user
    if (data.socketId !== socket.id) {
        displayMessage(data, 'other');
    }
});

socket.on('user joined', (data) => {
    displayMessage({
        message: data.message,
        timestamp: data.timestamp
    }, 'system');
});

socket.on('user left', (data) => {
    displayMessage({
        message: data.message,
        timestamp: data.timestamp
    }, 'system');
});

socket.on('room users', (users) => {
    updateUsersList(users);
});

socket.on('typing', (data) => {
    if (data.isTyping && data.user !== currentUsername) {
        typingIndicator.textContent = `${data.user} is typing...`;
    } else {
        typingIndicator.textContent = '';
    }
});

socket.on('error', (data) => {
    alert(`Error: ${data.message}`);
});

// Connection status handlers
socket.on('connect', () => {
    console.log('Connected to server');
    updateConnectionStatus('connected', 'Connected');
    
    if (currentRoom) {
        displayMessage({
            message: 'Reconnected to server! 🎉',
            timestamp: new Date().toLocaleTimeString()
        }, 'system');
    }
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateConnectionStatus('disconnected', 'Disconnected');
    
    if (currentRoom) {
        displayMessage({
            message: 'Disconnected from server. Trying to reconnect...',
            timestamp: new Date().toLocaleTimeString()
        }, 'system');
    }
});

socket.on('reconnect', () => {
    console.log('Reconnected to server');
    updateConnectionStatus('connected', 'Connected');
    
    if (currentRoom && currentUsername) {
        // Rejoin room after reconnection
        socket.emit('join room', {
            username: currentUsername,
            roomName: currentRoom
        });
        
        displayMessage({
            message: 'Reconnected and rejoined room! 🎉',
            timestamp: new Date().toLocaleTimeString()
        }, 'system');
    }
});

// Initialize app when page loads
window.addEventListener('load', () => {
    initializeApp();
    
    // Welcome message
    setTimeout(() => {
        if (!currentRoom) {
            console.log('Welcome to Room-Based Chat App!');
        }
    }, 500);
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    if (currentRoom) {
        leaveCurrentRoom();
    }
});
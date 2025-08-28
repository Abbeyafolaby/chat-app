// Initialize Socket.io connection
const socket = io();

// Get DOM elements
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const usernameInput = document.getElementById('usernameInput');
const typingIndicator = document.getElementById('typingIndicator');

// Variables for typing indicator
let typingTimer;
let isTyping = false;

// Function to get username
function getUsername() {
    return usernameInput.value.trim() || 'Anonymous';
}

// Function to scroll to bottom of messages
function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Function to create and display message
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

// Function to send message
function sendMessage() {
    const message = messageInput.value.trim();
    const username = getUsername();
    
    if (message) {
        // Display own message immediately
        displayMessage({
            message: message,
            user: username,
            timestamp: new Date().toLocaleTimeString()
        }, 'own');
        
        // Send message to server
        socket.emit('chat message', {
            message: message,
            user: username
        });
        
        // Clear input
        messageInput.value = '';
        
        // Stop typing indicator
        if (isTyping) {
            socket.emit('typing', { user: username, isTyping: false });
            isTyping = false;
        }
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Typing indicator functionality
messageInput.addEventListener('input', () => {
    const username = getUsername();
    
    if (!isTyping) {
        isTyping = true;
        socket.emit('typing', { user: username, isTyping: true });
    }
    
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        isTyping = false;
        socket.emit('typing', { user: username, isTyping: false });
    }, 1000);
});

// Socket event listeners
socket.on('chat message', (data) => {
    // Only display if it's not from the current user
    if (data.socketId !== socket.id) {
        displayMessage(data, 'other');
    }
});

socket.on('user joined', (data) => {
    displayMessage(data, 'system');
});

socket.on('user left', (data) => {
    displayMessage(data, 'system');
});

socket.on('typing', (data) => {
    if (data.isTyping) {
        typingIndicator.textContent = `${data.user} is typing...`;
    } else {
        typingIndicator.textContent = '';
    }
});

// Connection status handlers
socket.on('connect', () => {
    console.log('Connected to server');
    displayMessage({
        message: 'Connected to chat server! 🎉',
        timestamp: new Date().toLocaleTimeString()
    }, 'system');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    displayMessage({
        message: 'Disconnected from server. Trying to reconnect...',
        timestamp: new Date().toLocaleTimeString()
    }, 'system');
});

socket.on('reconnect', () => {
    console.log('Reconnected to server');
    displayMessage({
        message: 'Reconnected to server! 🎉',
        timestamp: new Date().toLocaleTimeString()
    }, 'system');
});

// Focus on message input when page loads
messageInput.focus();

// Welcome message
window.addEventListener('load', () => {
    setTimeout(() => {
        displayMessage({
            message: 'Welcome to Real-Time Chat! Start typing to begin chatting with others.',
            timestamp: new Date().toLocaleTimeString()
        }, 'system');
    }, 500);
});
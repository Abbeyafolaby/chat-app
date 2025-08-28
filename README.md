# Chat App

A real-time chat application built with WebSockets and Socket.IO, enabling instant messaging with modern features and a clean, responsive interface.

## Description

Simple Chat App is a real-time messaging application that allows users to communicate instantly. Built with modern web technologies, it provides a seamless chat experience. The application is designed to be fast, reliable, and user-friendly.

## Features

### Core Chat Features

- Real-time Messaging: Instant message delivery using WebSockets
- Room-Based Chat: Multiple chat rooms (General, Sports, Tech, Music, Gaming)
- User Management: Username system with user lists per room
- Typing Indicators: See when other users are typing
- Connection Status: Real-time connection status monitoring
- Auto-Reconnection: Automatic reconnection on network issues

## Installation & Usage

### Prerequisites
- Node.js
- MongoDB


### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chat-app.git
   cd simple-chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your_jwt_secret_here
   SOCKET_IO_CORS_ORIGIN=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Usage
1. **Add Username**: input your desired username 
2. **Join Rooms**: Enter existing chat rooms 
3. **Start Chatting**: Send messages and interact with other users in the chat room

## Technologies Used

- **Backend**: Node.js with Express.js
- **Real-time Communication**: Socket.IO

## API Endpoints

**HTTP Routes**

- `GET /` - Serve main chat application

- `GET /api/rooms` - Get available rooms with user counts

## Socket.IO Events
**Client to Server**

- `join room` - Join a specific chat room
- `chat message` - Send message to current room
- `typing` - Send typing indicator status
- `get rooms` - Request list of available rooms

### Server to Client

- `available rooms` - List of available room names
- `rooms list` - Rooms with user counts
- `joined room` - Confirmation of room join
- `chat message` - Receive message from room
- `user joined` - User joined current room notification
- `user left` - User left current room notification
- `room users` - Updated list of users in current room
- `typing` - Typing indicator from other users
- `error` - Error messages


## Author

**Name**
- Name: Abiodun Afolabi
- GitHub: [@Abbeyafolaby](https://github.com/Abbeyafolaby)

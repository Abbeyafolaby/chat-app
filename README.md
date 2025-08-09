# Chat App

A real-time chat application built with WebSockets and Socket.IO, enabling instant messaging with modern features and a clean, responsive interface.

## Description

Simple Chat App is a real-time messaging application that allows users to communicate instantly. Built with modern web technologies, it provides a seamless chat experience. The application is designed to be fast, reliable, and user-friendly.

## Features

- **Real-time Messaging**
  - Instant message delivery using WebSockets
  - Real-time message synchronization across devices
  - Message status indicators (sent, delivered, read)

- **User Experience**
  - User authentication and profiles

- **Technical Features**
  - Socket.IO for real-time communication
  - Connection state management
  - Auto-reconnection on network issues
  - Message queuing for offline users
  - Scalable architecture

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
1. **Register/Login**: Create an account or login to start chatting
2. **Join Rooms**: Enter existing chat rooms or create new ones
3. **Start Chatting**: Send messages, share files, and interact with other users

## Technologies Used

- **Backend**: Node.js with Express.js
- **Real-time Communication**: Socket.IO
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Testing**: Jest, Socket.IO Client for testing

## API Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

**Chat**
- `GET /api/rooms` - Get available chat rooms
- `POST /api/rooms` - Create new chat room
- `GET /api/rooms/:id/messages` - Get room message history
- `POST /api/upload` - Upload file/image

**Users**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile


## Author

**Name**
- Name: Abiodun Afolabi
- GitHub: [@Abbeyafolaby](https://github.com/Abbeyafolaby)

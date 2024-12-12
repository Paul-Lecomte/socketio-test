
# Socket.IO Test Project

This project demonstrates a simple integration of Socket.IO with a React frontend, allowing real-time communication between the client and server. The backend is set up with Socket.IO to emit and receive messages, while the frontend allows sending and receiving messages using WebSockets.

## Things to do
- **Frontend**
  - Create a real frontend that is actually usable

- **Backend**
    - Create a schema to store the messages in a DB to have a message history

## Features

- **Frontend:**
    - Connect and disconnect from the Socket.IO server.
    - Send and receive real-time messages.
    - Use of React with state management for connection handling.

- **Backend:**
    - Set up with Socket.IO to handle client connections.
    - Emit messages from the server to the client and vice versa.

## Setup

### Backend

1. Clone this repository.
2. Navigate to the `backend` directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   node server.js
   ```
   The backend will be running on `http://localhost:4000`.

### Frontend

1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
   The frontend will be running on `http://localhost:3000`.

### Technologies Used

- **Backend:**
    - Node.js
    - Socket.IO

- **Frontend:**
    - React
    - Tailwind CSS
    - Material Tailwind

## Usage

1. Open the frontend in your browser (`http://localhost:3000`).
2. Click the **Login** button to connect to the Socket.IO server.
3. Type a message in the input box and click **Send Message** to send it to the backend.
4. The backend will emit the message back to all connected clients.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

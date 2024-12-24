const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const AppRouter = require('./routers/Routers');
const http = require('http');
const socketIo = require('socket.io');
const { Server } = require("socket.io");


dotenv.config();

const app = express();

// CORS Middleware
const corsOptions = {
    origin: '*', // Replace '*' with your frontend's URL in production (e.g., 'http://localhost:3000')
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Use this before any other middleware or routes

// Body Parser Middleware
app.use(bodyParser.json());


// Static Files
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes

// Database Connection and Server Initialization
let io; // Declare io outside the function for later export
const server = http.createServer(app);

// Initialize WebSocket server using socket.io
io = new socketIo.Server(server, {
    cors: {
        origin: '*', // Replace with actual frontend URL
        methods: ['GET', 'POST'],
    },
});
app.use('/', AppRouter(io));

function generateBase64Id(names) {
    const sortedValues = Object.values(names)
        .sort() // Sort the values alphabetically
        .join(''); // Concatenate them into a single string

    return btoa(sortedValues); // Encode the string to Base64
}

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);


        io.on('connection', (socket) => {
            console.log('A user connected');

            // socket.emit('message', 'Hello from the server!');
            // socket.emit('yourSocketId', socket.id);
            socket.on('message', (msg) => {
                console.log('Message from client:', msg);
                // socket.emit('message', `Server received: ${msg}`);
            });

            socket.on('joinChat', ({ user1Id, user2Id }) => {
                const roomId = generateBase64Id({ user1Id, user2Id });
                socket.join(roomId);
                // socket.to(socketId).emit('joinedChat', roomId);
                socket.emit('joinedChat', {roomId: roomId});
                console.log(`Users joined room: ${roomId}`);
            });



            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });

        server.listen(process.env.PORT || 777, () => {
            console.log('Server is running on port:', process.env.PORT || 777);
        });
    } catch (err) {
        console.error('Error in DB connection:', err);
    }
};

connectdb();

// Export io for other modules
const getIo = () => {
    if (!io) {
        throw new Error('Socket.IO is not initialized');
    }
    return io;
};

// module.exports = { connectdb,getIo };

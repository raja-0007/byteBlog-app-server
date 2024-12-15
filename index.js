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
app.use('/', AppRouter);

// Database Connection and Server Initialization
const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        const server = http.createServer(app);

        // Initialize WebSocket server using socket.io
        const io = new socketIo.Server(server, {
            cors: {
                origin: '*', // Replace with actual frontend URL
                methods: ['GET', 'POST'],
            },
        });
        
        io.on('connection', (socket) => {
            console.log('A user connected');
        
            socket.emit('message', 'Hello from the server!');
        
            socket.on('message', (msg) => {
                console.log('Message from client:', msg);
                socket.emit('message', `Server received: ${msg}`);
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

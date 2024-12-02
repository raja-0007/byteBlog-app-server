const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const AppRouter = require('./routers/Routers');

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

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    },
});
const upload = multer({ storage });

// Static Files
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/', AppRouter);

// Database Connection and Server Initialization
const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        app.listen(process.env.PORT || 7777, () => {
            console.log('Server is connected to:', process.env.PORT || 7777);
        });
    } catch (err) {
        console.error('Error in DB connection:', err);
    }
};
connectdb();

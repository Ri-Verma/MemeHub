const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./config/database');
const userRoutes = require('./routes/userRoute');
const memeRoutes = require('./routes/memeRoute');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/memes', memeRoutes);

app.get('/', (req, res) => {
    res.send('MemeHub API is running');
});

// Create necessary upload directories
const uploadDirs = ['images', 'videos', 'gifs'].map(dir => 
    path.join(__dirname, 'public/uploads', dir)
);

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Initialize database tables
const User = require('./model/userModel');
const Meme = require('./model/memeModel');

const initializeDatabase = async () => {
    try {
        await User.createTable();
        await Meme.createTable();
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database tables:', error);
        process.exit(1);
    }
};

// Start server
initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port: http://localhost:${port}`);
    });
});
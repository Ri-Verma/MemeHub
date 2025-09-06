const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userId = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User created successfully', userId });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, userId: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
};

exports.followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await User.follow(req.user.userId, userId);
        res.json({ message: 'Successfully followed user' });
    } catch (error) {
        res.status(500).json({ message: 'Error following user', error: error.message });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await User.unfollow(req.user.userId, userId);
        res.json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        res.status(500).json({ message: 'Error unfollowing user', error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

exports.register = async (req, res) => {
    try {
        const { username, email, password, bio, profile_pic } = req.body;

        // Check if email already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = await User.create({
            username,
            email,
            password: hashedPassword,
            bio: bio || '',
            profile_pic: profile_pic || ''
        });

        // Fetch full user object
        const newUser = await User.findById(userId);

        // Generate token
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ success: true, user: newUser, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ success: true, user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error during login', error: error.message });
    }
};

exports.followUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await User.follow(req.user.userId, userId);
        res.json({ success: true, message: 'Successfully followed user' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error following user', error: error.message });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await User.unfollow(req.user.userId, userId);
        res.json({ success: true, message: 'Successfully unfollowed user' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error unfollowing user', error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
    }
};


exports.getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const followers = await User.getFollowers(userId);
        res.json({ success: true, followers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching followers', error: error.message });
    }
};

exports.getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const following = await User.getFollowing(userId);
        res.json({ success: true, following });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching following', error: error.message });
    }
};


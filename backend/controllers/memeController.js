const Meme = require('../model/memeModel');
const path = require('path');
const fs = require('fs');

exports.uploadMeme = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileType = path.extname(file.originalname).toLowerCase();
        let type;
        if (['.jpg', '.jpeg', '.png'].includes(fileType)) type = 'image';
        else if (['.gif'].includes(fileType)) type = 'gif';
        else if (['.mp4', '.webm'].includes(fileType)) type = 'video';
        else {
            return res.status(400).json({ message: 'Invalid file type' });
        }

        const memeData = {
            user_id: req.user.userId,
            title,
            description,
            file_path: file.path,
            file_type: type,
            category
        };

        const memeId = await Meme.create(memeData, tags);
        res.status(201).json({ message: 'Meme uploaded successfully', memeId });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading meme', error: error.message });
    }
};

exports.getMemesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const memes = await Meme.getMemesByCategory(category, parseInt(limit), offset);
        res.json(memes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching memes', error: error.message });
    }
};

exports.likeMeme = async (req, res) => {
    try {
        const { memeId } = req.params;
        await Meme.likeMeme(memeId, req.user.userId);
        res.json({ message: 'Meme liked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error liking meme', error: error.message });
    }
};

exports.unlikeMeme = async (req, res) => {
    try {
        const { memeId } = req.params;
        await Meme.unlikeMeme(memeId, req.user.userId);
        res.json({ message: 'Meme unliked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error unliking meme', error: error.message });
    }
};

exports.shareMeme = async (req, res) => {
    try {
        const { memeId } = req.params;
        await Meme.shareMeme(memeId, req.user.userId);
        res.json({ message: 'Meme shared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sharing meme', error: error.message });
    }
};

exports.getAllMemes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const memes = await Meme.getAllMemes(parseInt(limit), offset);
        res.json(memes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching memes', error: error.message });
    }
};

exports.getMemeById = async (req, res) => {
    try {
        const { memeId } = req.params;
        const meme = await Meme.getMemeById(memeId);
        if (!meme) {
            return res.status(404).json({ message: 'Meme not found' });
        }
        res.json(meme);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meme', error: error.message });
    }
};
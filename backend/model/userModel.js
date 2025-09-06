const mysql = require('mysql2');
const db = require('../config/database');

const createTable = async () => {
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();
        
        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(191) UNIQUE NOT NULL,
                email VARCHAR(191) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                profile_pic VARCHAR(255),
                bio TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create follows table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS follows (
                follower_id INT,
                following_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (follower_id, following_id),
                FOREIGN KEY (follower_id) REFERENCES users(id),
                FOREIGN KEY (following_id) REFERENCES users(id)
            )
        `);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const findByEmail = async (email) => {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const create = async (userData) => {
    const [result] = await db.promise().query('INSERT INTO users SET ?', userData);
    return result.insertId;
};

const follow = async (followerId, followingId) => {
    return db.promise().query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', 
        [followerId, followingId]);
};

const unfollow = async (followerId, followingId) => {
    return db.promise().query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', 
        [followerId, followingId]);
};

const getFollowers = async (userId) => {
    const [rows] = await db.promise().query(
        `SELECT u.* FROM users u 
        JOIN follows f ON u.id = f.follower_id 
        WHERE f.following_id = ?`, 
        [userId]
    );
    return rows;
};

const getFollowing = async (userId) => {
    const [rows] = await db.promise().query(
        `SELECT u.* FROM users u 
        JOIN follows f ON u.id = f.following_id 
        WHERE f.follower_id = ?`, 
        [userId]
    );
    return rows;
};

const getAllUsers = async () => {
    const [rows] = await db.promise().query('SELECT id, username, email, profile_pic, bio FROM users');
    return rows;
};

const findById = async (userId) => {
    const [rows] = await db.promise().query(
        'SELECT id, username, email, profile_pic, bio FROM users WHERE id = ?', 
        [userId]
    );
    return rows[0];
};

module.exports = {
    createTable,
    findByEmail,
    create,
    follow,
    unfollow,
    getFollowers,
    getFollowing,
    getAllUsers,
    findById
};

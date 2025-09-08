const db = require("../config/database");

const createTable = async () => {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Create memes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS memes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_path VARCHAR(255) NOT NULL,
        file_type ENUM('image', 'video', 'gif') NOT NULL,
        category VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create meme_tags table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS meme_tags (
        meme_id INT,
        tag VARCHAR(50),
        PRIMARY KEY (meme_id, tag),
        FOREIGN KEY (meme_id) REFERENCES memes(id) ON DELETE CASCADE
      )
    `);

    // Create meme_likes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS meme_likes (
        meme_id INT,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (meme_id, user_id),
        FOREIGN KEY (meme_id) REFERENCES memes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create meme_shares table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS meme_shares (
        id INT PRIMARY KEY AUTO_INCREMENT,
        meme_id INT,
        user_id INT,
        shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meme_id) REFERENCES memes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

// ✅ Create meme + tags
const create = async (memeData, tags = []) => {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query("INSERT INTO memes SET ?", memeData);
    const memeId = result.insertId;

    if (tags && tags.length > 0) {
      const tagValues = tags.map((tag) => [memeId, tag]);
      await connection.query("INSERT INTO meme_tags (meme_id, tag) VALUES ?", [tagValues]);
    }

    await connection.commit();
    return memeId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ✅ Get memes by category
const getMemesByCategory = async (category, limit = 10, offset = 0) => {
  const [rows] = await db.promise().query(
    `SELECT m.*, u.username, COUNT(ml.user_id) as likes_count 
     FROM memes m 
     LEFT JOIN users u ON m.user_id = u.id 
     LEFT JOIN meme_likes ml ON m.id = ml.meme_id 
     WHERE m.category = ? 
     GROUP BY m.id 
     ORDER BY m.created_at DESC 
     LIMIT ? OFFSET ?`,
    [category, limit, offset]
  );
  return rows;
};

// ✅ Get all memes
const getAllMemes = async (limit = 10, offset = 0) => {
  const [rows] = await db.promise().query(
    `SELECT m.*, u.username, COUNT(ml.user_id) as likes_count 
     FROM memes m 
     LEFT JOIN users u ON m.user_id = u.id 
     LEFT JOIN meme_likes ml ON m.id = ml.meme_id 
     GROUP BY m.id 
     ORDER BY m.created_at DESC 
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
};

// ✅ Get meme by ID
const getMemeById = async (memeId) => {
  const [rows] = await db.promise().query(
    `SELECT m.*, u.username, COUNT(ml.user_id) as likes_count 
     FROM memes m 
     LEFT JOIN users u ON m.user_id = u.id 
     LEFT JOIN meme_likes ml ON m.id = ml.meme_id 
     WHERE m.id = ?
     GROUP BY m.id`,
    [memeId]
  );
  return rows[0];
};

// ✅ Likes
const likeMeme = async (memeId, userId) => {
  return db.promise().query("INSERT INTO meme_likes (meme_id, user_id) VALUES (?, ?)", [
    memeId,
    userId,
  ]);
};

const unlikeMeme = async (memeId, userId) => {
  return db.promise().query("DELETE FROM meme_likes WHERE meme_id = ? AND user_id = ?", [
    memeId,
    userId,
  ]);
};

// ✅ Shares
const shareMeme = async (memeId, userId) => {
  return db.promise().query("INSERT INTO meme_shares (meme_id, user_id) VALUES (?, ?)", [
    memeId,
    userId,
  ]);
};

// ✅ Add tags manually if needed
const addTags = async (memeId, tags) => {
  if (!tags || tags.length === 0) return;
  const tagValues = tags.map((tag) => [memeId, tag]);
  return db.promise().query("INSERT INTO meme_tags (meme_id, tag) VALUES ?", [tagValues]);
};

module.exports = {
  createTable,
  create,
  getMemesByCategory,
  getAllMemes,
  getMemeById,
  likeMeme,
  unlikeMeme,
  shareMeme,
  addTags,
};

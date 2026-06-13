const db   = require('../config/db');
const path = require('path');
const fs   = require('fs');

// GET /api/posts  (public — published only)
async function getPosts(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const [rows] = await db.query(
      `SELECT * FROM posts WHERE published = 1
       ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ posts: rows });
  } catch (err) { next(err); }
}

// GET /api/posts/all  (admin — all including unpublished)
async function getAllPosts(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM posts ORDER BY created_at DESC`
    );
    res.json({ posts: rows });
  } catch (err) { next(err); }
}

// GET /api/posts/:id  (public)
async function getPostById(req, res, next) {
  try {
    const [[post]] = await db.query(
      `SELECT * FROM posts WHERE id = ? AND published = 1`,
      [req.params.id]
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (err) { next(err); }
}

// POST /api/posts  (admin)
async function createPost(req, res, next) {
  try {
    const { title, body = null, external_link = null, published = 1 } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const image_path = req.file
      ? `/uploads/posts/${req.file.filename}`
      : null;

    const [r] = await db.query(
      `INSERT INTO posts (title, body, image_path, external_link, published)
       VALUES (?, ?, ?, ?, ?)`,
      [title, body, image_path, external_link || null, published ? 1 : 0]
    );
    const [[post]] = await db.query('SELECT * FROM posts WHERE id = ?', [r.insertId]);
    res.status(201).json({ post });
  } catch (err) { next(err); }
}

// PUT /api/posts/:id  (admin)
async function updatePost(req, res, next) {
  try {
    const [[current]] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!current) return res.status(404).json({ message: 'Post not found' });

    const { title, body, external_link, published } = req.body;

    let image_path = current.image_path;
    if (req.file) {
      // delete old image if exists
      if (current.image_path) {
        const old = path.join(__dirname, '../../', current.image_path);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      image_path = `/uploads/posts/${req.file.filename}`;
    }

    await db.query(
      `UPDATE posts SET
         title         = ?,
         body          = ?,
         image_path    = ?,
         external_link = ?,
         published     = ?
       WHERE id = ?`,
      [
        title          ?? current.title,
        body           !== undefined ? body : current.body,
        image_path,
        external_link  !== undefined ? (external_link || null) : current.external_link,
        published      !== undefined ? (published ? 1 : 0) : current.published,
        req.params.id,
      ]
    );
    const [[post]] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    res.json({ post });
  } catch (err) { next(err); }
}

// DELETE /api/posts/:id  (admin)
async function deletePost(req, res, next) {
  try {
    const [[post]] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.image_path) {
      const filePath = path.join(__dirname, '../../', post.image_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { getPosts, getPostById, getAllPosts, createPost, updatePost, deletePost };

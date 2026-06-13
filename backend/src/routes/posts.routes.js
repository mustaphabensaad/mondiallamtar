const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const ctrl   = require('../controllers/posts.controller');

const setType = (req, res, next) => { req.uploadType = 'posts'; next(); };

router.get('/',       ctrl.getPosts);
router.get('/all',    auth, role('admin'), ctrl.getAllPosts);
router.get('/:id',    ctrl.getPostById);
router.post('/',     auth, role('admin'), setType, upload.single('image'), ctrl.createPost);
router.put('/:id',   auth, role('admin'), setType, upload.single('image'), ctrl.updatePost);
router.delete('/:id',auth, role('admin'), ctrl.deletePost);

module.exports = router;

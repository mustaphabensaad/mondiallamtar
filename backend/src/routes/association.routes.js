const router = require('express').Router();
const ctrl   = require('../controllers/association.controller');

router.get('/', ctrl.getImages);

module.exports = router;

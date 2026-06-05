const router = require('express').Router();
const ctrl   = require('../controllers/group.controller');

router.get('/', ctrl.getGroups);

module.exports = router;

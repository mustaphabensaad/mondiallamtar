const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');
const ctrl   = require('../controllers/knockout.controller');

router.get('/bracket',    ctrl.getBracket);
router.post('/generate',  auth, role('admin'), ctrl.generateKnockout);

module.exports = router;

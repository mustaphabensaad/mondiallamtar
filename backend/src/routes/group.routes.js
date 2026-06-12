const router = require('express').Router();
const ctrl   = require('../controllers/group.controller');
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');

router.get('/',                                            ctrl.getGroups);
router.post('/generate-schedules', auth, role('admin'),   ctrl.generateGroupSchedules);

module.exports = router;

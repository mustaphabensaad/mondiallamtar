const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');
const ctrl   = require('../controllers/draw.controller');

router.get('/',          ctrl.getDrawState);
router.post('/init',     auth, role('admin'), ctrl.initDraw);
router.put('/assign',    auth, role('admin'), ctrl.assignTeam);
router.post('/finalize', auth, role('admin'), ctrl.finalizeDraw);
router.post('/reset',    auth, role('admin'), ctrl.resetDraw);

module.exports = router;

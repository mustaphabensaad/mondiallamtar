const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');
const ctrl   = require('../controllers/admin.controller');

router.use(auth, role('admin'));

router.get('/dashboard',         ctrl.getDashboard);
router.get('/teams/pending',     ctrl.getPendingTeams);
router.put('/teams/:id/approve', ctrl.approveTeam);
router.put('/teams/:id/reject',  ctrl.rejectTeam);

module.exports = router;

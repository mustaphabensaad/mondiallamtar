const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');
const ctrl   = require('../controllers/team.controller');

router.get('/',          ctrl.getTeams);
router.get('/my-team',   auth, role('captain'), ctrl.getMyTeam);
router.get('/:id',       ctrl.getTeam);
router.get('/:id/players', ctrl.getTeamPlayers);

module.exports = router;

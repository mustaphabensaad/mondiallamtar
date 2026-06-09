const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');
const ctrl   = require('../controllers/admin.controller');

router.use(auth, role('admin'));

router.get('/dashboard',              ctrl.getDashboard);
router.get('/teams',                  ctrl.getAllTeams);
router.get('/teams/pending',          ctrl.getPendingTeams);
router.put('/teams/:id/approve',      ctrl.approveTeam);
router.put('/teams/:id/reject',       ctrl.rejectTeam);
router.put('/teams/:id/payment',      ctrl.confirmPayment);
router.get('/players',                ctrl.getAllPlayers);
router.put('/players/:id/validate',   ctrl.validatePlayer);
router.put('/players/:id/suspend',    ctrl.suspendPlayer);
router.post('/fines',                 ctrl.addFine);
router.get('/tournament',             ctrl.getTournamentSettings);
router.put('/tournament',             ctrl.updateTournamentSettings);
router.get('/reports',                ctrl.getReports);

module.exports = router;

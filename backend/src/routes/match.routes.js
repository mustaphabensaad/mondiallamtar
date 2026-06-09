const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');
const ctrl   = require('../controllers/match.controller');

// Public
router.get('/',           ctrl.getMatches);
router.get('/today',      ctrl.getTodayMatches);
router.get('/live',       ctrl.getLiveMatches);
router.get('/:id',        ctrl.getMatch);

// Admin
router.post('/',                       auth, role('admin'), ctrl.createMatch);
router.put('/:id',                     auth, role('admin'), ctrl.updateMatch);
router.post('/:id/start',              auth, role('admin'), ctrl.startMatch);
router.post('/:id/end',                auth, role('admin'), ctrl.endMatch);
router.post('/:id/events',             auth, role('admin'), ctrl.addEvent);
router.delete('/:id/events/:eventId',  auth, role('admin'), ctrl.deleteEvent);
router.put('/:id/score',               auth, role('admin'), ctrl.updateScore);
router.put('/:id/motm',                auth, role('admin'), ctrl.setMotm);

module.exports = router;

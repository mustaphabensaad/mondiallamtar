const router = require('express').Router();
const ctrl   = require('../controllers/match.controller');

router.get('/',       ctrl.getMatches);
router.get('/today',  ctrl.getTodayMatches);
router.get('/live',   ctrl.getLiveMatches);
router.get('/:id',    ctrl.getMatch);

module.exports = router;

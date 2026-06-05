const router = require('express').Router();
const ctrl   = require('../controllers/player.controller');

router.get('/top-scorers',         ctrl.getTopScorers);
router.get('/invite/:token',       ctrl.getInviteInfo);
router.post('/invite/:token',      ctrl.submitInviteForm);

module.exports = router;

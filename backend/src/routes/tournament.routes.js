const router = require('express').Router();
const ctrl   = require('../controllers/tournament.controller');

router.get('/', ctrl.getTournament);

module.exports = router;

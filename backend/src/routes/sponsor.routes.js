const router = require('express').Router();
const ctrl   = require('../controllers/sponsor.controller');

router.get('/', ctrl.getSponsors);

module.exports = router;

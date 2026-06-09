const router  = require('express').Router();
const ctrl    = require('../controllers/player.controller');
const upload  = require('../middleware/upload.middleware');

router.get('/top-scorers',    ctrl.getTopScorers);
router.get('/invite/:token',  ctrl.getInviteInfo);
router.post('/invite/:token', (req, res, next) => {
  req.uploadType = 'players';
  next();
}, upload.single('photo'), ctrl.submitInviteForm);

module.exports = router;

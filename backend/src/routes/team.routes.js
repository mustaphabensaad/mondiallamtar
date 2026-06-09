const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');
const ctrl   = require('../controllers/team.controller');
const upload = require('../middleware/upload.middleware');

const logoUpload = (req, res, next) => { req.uploadType = 'logos'; next(); };

// Static routes MUST come before parameterised /:id
router.get('/my-team',       auth, role('captain', 'admin'), ctrl.getMyTeam);
router.post('/',             auth, role('captain'), logoUpload, upload.single('logo'), ctrl.createTeam);

// Public
router.get('/',              ctrl.getTeams);
router.get('/:id',           ctrl.getTeam);
router.get('/:id/players',   ctrl.getTeamPlayers);

// Captain
router.put('/:id',           auth, role('captain', 'admin'), logoUpload, upload.single('logo'), ctrl.updateTeam);
router.post('/:id/invites',  auth, role('captain'), ctrl.generateInvites);
router.get('/:id/invites',   auth, role('captain', 'admin'), ctrl.getInviteLinks);

module.exports = router;

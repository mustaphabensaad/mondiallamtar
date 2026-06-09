const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');
const ctrl   = require('../controllers/sponsor.controller');

router.get('/',     ctrl.getSponsors);
router.get('/all',  auth, role('admin'), ctrl.getAllSponsors);
router.post('/',    auth, role('admin'), ctrl.createSponsor);
router.put('/:id',  auth, role('admin'), ctrl.updateSponsor);
router.delete('/:id', auth, role('admin'), ctrl.deleteSponsor);

module.exports = router;

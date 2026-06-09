const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');
const ctrl   = require('../controllers/referee.controller');

router.get('/',       ctrl.getReferees);
router.post('/',      auth, role('admin'), ctrl.createReferee);
router.put('/:id',    auth, role('admin'), ctrl.updateReferee);
router.delete('/:id', auth, role('admin'), ctrl.deleteReferee);

module.exports = router;

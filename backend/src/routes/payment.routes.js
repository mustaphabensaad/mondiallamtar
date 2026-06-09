const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const role   = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const ctrl   = require('../controllers/payment.controller');

router.post('/upload-proof',
  auth, role('captain'),
  (req, res, next) => { req.uploadType = 'payments'; next(); },
  upload.single('proof'),
  ctrl.uploadProof
);

router.get('/status', auth, role('captain'), ctrl.getStatus);

// Admin
router.put('/:id/confirm', auth, role('admin'), ctrl.confirmPayment);

module.exports = router;

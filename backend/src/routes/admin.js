const router = require('express').Router();
const {
  getDashboardStats, getAllUsers, verifyUser, verifyHospital,
  deactivateUser, getAllRequests, getChatbotAudit
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/hospitals/:id/verify', verifyHospital);
router.get('/requests', getAllRequests);
router.get('/chatbot-audit', getChatbotAudit);

module.exports = router;

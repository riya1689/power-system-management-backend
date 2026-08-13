import { Router } from 'express';
import { startDataLock, stopDataLock } from '../services/simulator';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { DataLockInterval, Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.post('/start', authorizeRoles(Role.ADMIN, Role.ENGINEER), (req, res) => {
  const { interval } = req.body;
  if (interval !== 'TWO_SECONDS' && interval !== 'FIVE_SECONDS') {
    res.status(400).json({ success: false, message: 'Invalid interval' });
    return;
  }
  startDataLock(interval as DataLockInterval);
  res.json({ success: true, message: `Data Lock started at ${interval}` });
});
router.post('/stop', authorizeRoles(Role.ADMIN, Role.ENGINEER), (req, res) => {
  stopDataLock();
  res.json({ success: true, message: 'Data Lock stopped' });
});
export default router;

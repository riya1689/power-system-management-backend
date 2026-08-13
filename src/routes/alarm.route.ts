import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken, authorizeRoles } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [totalCount, alarms] = await Promise.all([
      prisma.alarm.count(),
      prisma.alarm.findMany({
        include: { parameter: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      })
    ]);

    res.json({ 
      success: true, 
      data: alarms,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch alarms' });
  }
});

router.post('/', authorizeRoles(Role.ADMIN, Role.ENGINEER), async (req, res) => {
  try {
    const { operator, triggerValue, actionName, parameterId } = req.body;
    const alarm = await prisma.alarm.create({
      data: {
        operator,
        triggerValue: parseFloat(triggerValue),
        actionName,
        parameterId,
      },
      include: { parameter: true }
    });
    res.json({ success: true, data: alarm });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create alarm' });
  }
});

router.delete('/:id', authorizeRoles(Role.ADMIN, Role.ENGINEER), async (req, res) => {
  try {
    await prisma.alarm.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Alarm deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete alarm' });
  }
});

// Helper route to get parameters for the dropdown
router.get('/parameters', async (req, res) => {
  try {
    const params = await prisma.parameter.findMany();
    res.json({ success: true, data: params });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch parameters' });
  }
});

export default router;

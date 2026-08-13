import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { parameterId, startDate, endDate, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build the query where clause
    const where: any = {};
    if (parameterId) {
      where.parameterId = parameterId;
    }
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const [totalCount, logs] = await Promise.all([
      prisma.dataLockData.count({ where }),
      prisma.dataLockData.findMany({
        where,
        include: { parameter: true },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limitNum,
      })
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      }
    });
  } catch (error) {
    console.error("History fetch error", error);
    res.status(500).json({ success: false, message: 'Failed to fetch historical data' });
  }
});

// Route specifically for exporting all matching data without pagination
router.get('/export', async (req, res) => {
  try {
    const { parameterId, startDate, endDate } = req.query;
    const where: any = {};
    if (parameterId) where.parameterId = parameterId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const logs = await prisma.dataLockData.findMany({
      where,
      include: { parameter: true },
      orderBy: { timestamp: 'desc' }
    });
    
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch export data' });
  }
});

export default router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', async (req, res) => {
    try {
        const { parameterId, startDate, endDate, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build the query where clause
        const where = {};
        if (parameterId) {
            where.parameterId = parameterId;
        }
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = new Date(startDate);
            if (endDate)
                where.timestamp.lte = new Date(endDate);
        }
        const [totalCount, logs] = await Promise.all([
            prisma_1.default.dataLockData.count({ where }),
            prisma_1.default.dataLockData.findMany({
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
    }
    catch (error) {
        console.error("History fetch error", error);
        res.status(500).json({ success: false, message: 'Failed to fetch historical data' });
    }
});
// Route specifically for exporting all matching data without pagination
router.get('/export', async (req, res) => {
    try {
        const { parameterId, startDate, endDate } = req.query;
        const where = {};
        if (parameterId)
            where.parameterId = parameterId;
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = new Date(startDate);
            if (endDate)
                where.timestamp.lte = new Date(endDate);
        }
        const logs = await prisma_1.default.dataLockData.findMany({
            where,
            include: { parameter: true },
            orderBy: { timestamp: 'desc' }
        });
        res.json({ success: true, data: logs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch export data' });
    }
});
exports.default = router;

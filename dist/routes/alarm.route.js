"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_1 = require("../middlewares/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [totalCount, alarms] = await Promise.all([
            prisma_1.default.alarm.count(),
            prisma_1.default.alarm.findMany({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch alarms' });
    }
});
router.post('/', (0, auth_1.authorizeRoles)(client_1.Role.ADMIN, client_1.Role.ENGINEER), async (req, res) => {
    try {
        const { operator, triggerValue, actionName, parameterId } = req.body;
        const alarm = await prisma_1.default.alarm.create({
            data: {
                operator,
                triggerValue: parseFloat(triggerValue),
                actionName,
                parameterId,
            },
            include: { parameter: true }
        });
        res.json({ success: true, data: alarm });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create alarm' });
    }
});
router.delete('/:id', (0, auth_1.authorizeRoles)(client_1.Role.ADMIN, client_1.Role.ENGINEER), async (req, res) => {
    try {
        await prisma_1.default.alarm.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Alarm deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete alarm' });
    }
});
// Helper route to get parameters for the dropdown
router.get('/parameters', async (req, res) => {
    try {
        const params = await prisma_1.default.parameter.findMany();
        res.json({ success: true, data: params });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch parameters' });
    }
});
exports.default = router;

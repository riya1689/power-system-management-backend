"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const simulator_1 = require("../services/simulator");
const auth_1 = require("../middlewares/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/start', (0, auth_1.authorizeRoles)(client_1.Role.ADMIN, client_1.Role.ENGINEER), (req, res) => {
    const { interval } = req.body;
    if (interval !== 'TWO_SECONDS' && interval !== 'FIVE_SECONDS') {
        res.status(400).json({ success: false, message: 'Invalid interval' });
        return;
    }
    (0, simulator_1.startDataLock)(interval);
    res.json({ success: true, message: `Data Lock started at ${interval}` });
});
router.post('/stop', (0, auth_1.authorizeRoles)(client_1.Role.ADMIN, client_1.Role.ENGINEER), (req, res) => {
    (0, simulator_1.stopDataLock)();
    res.json({ success: true, message: 'Data Lock stopped' });
});
exports.default = router;

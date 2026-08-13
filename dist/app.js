"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const datalock_route_1 = __importDefault(require("./routes/datalock.route"));
const alarm_route_1 = __importDefault(require("./routes/alarm.route"));
const history_route_1 = __importDefault(require("./routes/history.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_route_1.default);
app.use('/api/datalock', datalock_route_1.default);
app.use('/api/alarms', alarm_route_1.default);
app.use('/api/history', history_route_1.default);
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'POWER SYSTEM API is running successfully!',
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
exports.default = app;
// Trigger restart

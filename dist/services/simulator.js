"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopDataLock = exports.startDataLock = exports.startSimulator = exports.seedParameters = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const socket_1 = require("../utils/socket");
let simulatorInterval = null;
let dataLockInterval = null;
let latestLiveData = [];
const seedParameters = async () => {
    const count = await prisma_1.default.parameter.count();
    if (count === 0) {
        console.log('Seeding 10 initial parameters...');
        const params = [
            { name: 'Voltage R', unit: 'V', minValue: 210, maxValue: 240 },
            { name: 'Voltage Y', unit: 'V', minValue: 210, maxValue: 240 },
            { name: 'Voltage B', unit: 'V', minValue: 210, maxValue: 240 },
            { name: 'Current R', unit: 'A', minValue: 10, maxValue: 50 },
            { name: 'Current Y', unit: 'A', minValue: 10, maxValue: 50 },
            { name: 'Current B', unit: 'A', minValue: 10, maxValue: 50 },
            { name: 'Frequency', unit: 'Hz', minValue: 49.5, maxValue: 50.5 },
            { name: 'Active Power', unit: 'kW', minValue: 5, maxValue: 15 },
            { name: 'Reactive Power', unit: 'kVAr', minValue: 1, maxValue: 5 },
            { name: 'Power Factor', unit: 'PF', minValue: 0.8, maxValue: 1.0 },
        ];
        await prisma_1.default.parameter.createMany({ data: params });
        console.log('Parameters seeded successfully.');
    }
};
exports.seedParameters = seedParameters;
const startSimulator = async () => {
    await (0, exports.seedParameters)();
    const parameters = await prisma_1.default.parameter.findMany();
    simulatorInterval = setInterval(async () => {
        latestLiveData = parameters.map((param) => {
            const min = param.minValue || 0;
            const max = param.maxValue || 100;
            const value = Number((Math.random() * (max - min) + min).toFixed(2));
            return {
                parameterId: param.id,
                name: param.name,
                unit: param.unit,
                value,
                timestamp: new Date()
            };
        });
        const io = (0, socket_1.getIO)();
        io.emit('live-data', latestLiveData);
        // Phase 4: Alarm Evaluation
        try {
            const alarms = await prisma_1.default.alarm.findMany();
            for (const alarm of alarms) {
                const liveParam = latestLiveData.find(data => data.parameterId === alarm.parameterId);
                if (liveParam) {
                    let triggered = false;
                    switch (alarm.operator) {
                        case 'GT':
                            triggered = liveParam.value > alarm.triggerValue;
                            break;
                        case 'LT':
                            triggered = liveParam.value < alarm.triggerValue;
                            break;
                        case 'GTE':
                            triggered = liveParam.value >= alarm.triggerValue;
                            break;
                        case 'LTE':
                            triggered = liveParam.value <= alarm.triggerValue;
                            break;
                        case 'EQ':
                            triggered = liveParam.value === alarm.triggerValue;
                            break;
                        case 'NEQ':
                            triggered = liveParam.value !== alarm.triggerValue;
                            break;
                    }
                    const newStatus = triggered ? 'TRIGGERED' : 'NORMAL';
                    if (alarm.status !== newStatus) {
                        await prisma_1.default.alarm.update({
                            where: { id: alarm.id },
                            data: { status: newStatus }
                        });
                        io.emit('alarm-status-changed', { alarmId: alarm.id, status: newStatus, liveValue: liveParam.value });
                    }
                }
            }
        }
        catch (err) {
            console.error("Alarm evaluation error:", err);
        }
    }, 1000);
};
exports.startSimulator = startSimulator;
const startDataLock = (intervalEnum) => {
    if (dataLockInterval)
        clearInterval(dataLockInterval);
    const intervalMs = intervalEnum === 'TWO_SECONDS' ? 2000 : 5000;
    console.log(`Data Lock Started at ${intervalMs}ms interval`);
    dataLockInterval = setInterval(async () => {
        if (latestLiveData.length > 0) {
            const logs = latestLiveData.map((data) => ({
                parameterId: data.parameterId,
                value: data.value,
                timestamp: data.timestamp
            }));
            await prisma_1.default.dataLockData.createMany({ data: logs });
            console.log(`Saved ${logs.length} live data points to Database`);
        }
    }, intervalMs);
};
exports.startDataLock = startDataLock;
const stopDataLock = () => {
    if (dataLockInterval)
        clearInterval(dataLockInterval);
    dataLockInterval = null;
    console.log('Data Lock Stopped');
};
exports.stopDataLock = stopDataLock;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./utils/prisma"));
const socket_1 = require("./utils/socket");
const simulator_1 = require("./services/simulator");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app_1.default);
(0, socket_1.initSocket)(server);
async function bootstrap() {
    try {
        await prisma_1.default.$connect();
        console.log('Database connection successful!');
        await (0, simulator_1.startSimulator)();
        console.log('Live Data Simulator started!');
        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}
process.on('SIGINT', async () => {
    await prisma_1.default.$disconnect();
    console.log('\nDatabase disconnected');
    process.exit(0);
});
bootstrap();

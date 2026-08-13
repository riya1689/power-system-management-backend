"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("./utils/prisma"));
async function main() {
    const password = await bcrypt_1.default.hash('password123', 10);
    const users = [
        { name: 'Admin One', email: 'admin@psm.com', password, role: client_1.Role.ADMIN },
        { name: 'Engineer One', email: 'eng1@psm.com', password, role: client_1.Role.ENGINEER },
        { name: 'Engineer Two', email: 'eng2@psm.com', password, role: client_1.Role.ENGINEER },
        { name: 'Engineer Three', email: 'eng3@psm.com', password, role: client_1.Role.ENGINEER },
        { name: 'Operator One', email: 'op1@psm.com', password, role: client_1.Role.OPERATOR },
        { name: 'Operator Two', email: 'op2@psm.com', password, role: client_1.Role.OPERATOR },
        { name: 'Operator Three', email: 'op3@psm.com', password, role: client_1.Role.OPERATOR },
        { name: 'Operator Four', email: 'op4@psm.com', password, role: client_1.Role.OPERATOR },
    ];
    for (const u of users) {
        const exists = await prisma_1.default.user.findUnique({ where: { email: u.email } });
        if (!exists) {
            await prisma_1.default.user.create({ data: u });
            console.log(`Created: ${u.email}`);
        }
        else {
            console.log(`Already exists: ${u.email}`);
        }
    }
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
});

import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from './utils/prisma';

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const users = [
    { name: 'Admin One', email: 'admin@psm.com', password, role: Role.ADMIN },
    { name: 'Engineer One', email: 'eng1@psm.com', password, role: Role.ENGINEER },
    { name: 'Engineer Two', email: 'eng2@psm.com', password, role: Role.ENGINEER },
    { name: 'Engineer Three', email: 'eng3@psm.com', password, role: Role.ENGINEER },
    { name: 'Operator One', email: 'op1@psm.com', password, role: Role.OPERATOR },
    { name: 'Operator Two', email: 'op2@psm.com', password, role: Role.OPERATOR },
    { name: 'Operator Three', email: 'op3@psm.com', password, role: Role.OPERATOR },
    { name: 'Operator Four', email: 'op4@psm.com', password, role: Role.OPERATOR },
  ];

  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { email: u.email }});
    if (!exists) {
      await prisma.user.create({ data: u });
      console.log(`Created: ${u.email}`);
    } else {
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
    await prisma.$disconnect();
  });

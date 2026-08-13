import dotenv from 'dotenv';
import http from 'http';
import app from './app';
import prisma from './utils/prisma';
import { initSocket } from './utils/socket';
import { startSimulator } from './services/simulator';

dotenv.config();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);
async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Database connection successful!');
    
    await startSimulator();
    console.log('Live Data Simulator started!');

    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\nDatabase disconnected');
  process.exit(0);
});

bootstrap();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dataLockRoutes from './routes/datalock.route';
import alarmRoutes from './routes/alarm.route';
import historyRoutes from './routes/history.route';
import authRoutes from './routes/auth.route';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/datalock', dataLockRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/history', historyRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'POWER SYSTEM API is running successfully!',
  });
});
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default app;
// Trigger restart

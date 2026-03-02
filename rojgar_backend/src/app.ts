import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.route';
import jobRoutes from './routes/job.routes';
import adminRoutes from './routes/admin/admin.routes';

const app: Application = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/profile_pictures', express.static(path.join(process.cwd(), 'public/profile_pictures')));
app.use('/company_logos', express.static(path.join(process.cwd(), 'public/company_logos')));
app.use('/job_logos', express.static(path.join(process.cwd(), 'public/job_logos')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Rojgar API is running' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("ERROR:", err.message);
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

export default app;
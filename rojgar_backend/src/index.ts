import express, { Application, Request, Response } from 'express';
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import cors from 'cors';
import { PORT_NUMBER } from './config';
import { connectDatabase } from './database/mongodb';
import authRoutes from './routes/auth.route';

dotenv.config();

const app: Application = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Server is running' });
});

app.use('/api/auth', authRoutes);

async function start() {
    await connectDatabase();
    app.listen(PORT_NUMBER, () => {
        console.log(`Server running at http://localhost:${PORT_NUMBER}`);
    });
}

start().catch((error) => console.log(error));
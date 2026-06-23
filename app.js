import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import petsRoutes from './routes/pets.routes.js';
import adoptionsRoutes from './routes/adoptions.routes.js';

const app = express();

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed.' });
  }
});

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.VERCEL) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'PetHome Pet Adoption API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/adoptions', adoptionsRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

export default app;

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import petsRoutes from './routes/pets.routes.js';
import adoptionsRoutes from './routes/adoptions.routes.js';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    mongoConfigured: Boolean(process.env.MONGODB_URI),
    jwtConfigured: Boolean(process.env.JWT_SECRET),
    nodeEnv: process.env.NODE_ENV || 'not set',
  });
});

app.use(async (req, res, next) => {
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({
      success: false,
      message: 'MONGODB_URI is not set on Vercel. Add it in Environment Variables and redeploy.',
    });
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed.',
      detail: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
});

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

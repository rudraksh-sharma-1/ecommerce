import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoute.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173'|| 'https://ecommerce-umber-five-95.vercel.app', // Your frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/business', authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

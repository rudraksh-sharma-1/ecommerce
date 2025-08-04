import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();


import authRoutes from './routes/authRoute.js';
import geoAddressRoute from './routes/geoAddressRoute.js'
import warehouseRoute from './routes/warehouseRoute.js'
import productWarehouseRoute  from './routes/productWarehouseRoutes.js';
import productsRoute from './routes/productRoutes.js'
import locationRoute from './routes/locationRoutes.js'
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import orderItemsRoutes from "./routes/orderItemsRoutes.js"
import checkCartAvailabilityRoute from './routes/checkCartAvailabilityRoute.js'
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();
const PORT = process.env.PORT || 8000;
const allowedOrigins = [
  'http://localhost:5173',
  'https://ecommerce-umber-five-95.vercel.app',
  'https://admin-eight-flax.vercel.app',
  'https://ecommerce-six-brown-12.vercel.app',
  'https://www.bigbestmart.com'
];


const corsOptions = {
      origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) { // Allow requests with no origin (like curl, etc.)
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true,
    }
/* app.use(cors({
   origin: function (origin, callback) {
    // allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }, 
  origin: 'http://localhost:5173', //https://ecommerce-umber-five-95.vercel.app http://localhost:5173 Temporarily allowing all origins for development
  credentials: true,
})); */

app.use(cors(corsOptions))

app.use(express.json());
app.use(cookieParser());

app.use('/api/business', authRoutes);
app.use('/api/geo-address', geoAddressRoute);
app.use('/api/warehouse', warehouseRoute);
app.use('/api/productwarehouse', productWarehouseRoute);
app.use('/api/productsroute', productsRoute);
app.use('/api/locationsroute', locationRoute);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/orderItems", orderItemsRoutes);
app.use("/api/check", checkCartAvailabilityRoute);
app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

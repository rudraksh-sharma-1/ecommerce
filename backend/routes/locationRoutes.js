// routes/locationRoutes.js
import express from 'express'
const router = express.Router();
import {getCoordinatesByPincode} from '../controller/locationController.js'

router.get("/get-coordinates", getCoordinatesByPincode);

export default router;

import express from 'express'
const router = express.Router();
import {createGeoAddress} from '../controller/geoAddressController.js'

// POST /api/geo-address
router.post('/createAddress', createGeoAddress);

export default router

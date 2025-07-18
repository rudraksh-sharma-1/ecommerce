import express from "express";
const router = express.Router();
import {
  createGeoAddress,
  updateGeoAddress,
  deleteAddress,
} from "../controller/geoAddressController.js";

// POST /api/geo-address
router.post("/createAddress", createGeoAddress);
router.put("/update/:id", updateGeoAddress);
router.delete("/delete/:id", deleteAddress);

export default router;

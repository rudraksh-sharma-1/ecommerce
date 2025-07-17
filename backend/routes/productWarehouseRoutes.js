import express from 'express'
const router = express.Router();

import {
  mapProductToWarehouse,
  removeProductFromWarehouse,
  getWarehousesForProduct,
  getProductsForWarehouse,
  bulkMapByNames
} from '../controller/productWarehouseController.js'

// Map a single product to warehouse (by ID)
router.post('/map', mapProductToWarehouse);

// Bulk map using names (for admin UI)
router.post('/map-bulk', bulkMapByNames);

// Remove product from warehouse
router.post('/remove', removeProductFromWarehouse);

// Get all warehouses for a product
router.get('/product/:product_id', getWarehousesForProduct);

// Get all products in a warehouse
router.get('/warehouse/:warehouse_id', getProductsForWarehouse);

export default router

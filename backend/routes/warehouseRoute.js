import express from "express"
const router = express.Router();
import  {
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getAllWarehouses
} from '../controller/warehouseController.js'

router.post('/add', createWarehouse);
router.put('/update/:id', updateWarehouse);
router.delete('/delete/:id', deleteWarehouse);
router.get('/list', getAllWarehouses);

export default router

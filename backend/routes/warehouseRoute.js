import express from "express"
const router = express.Router();
import  {
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getAllWarehouses,
  getSingleWarehouse
} from '../controller/warehouseController.js'

router.post('/add', createWarehouse);
router.put('/update/:id', updateWarehouse);
router.delete('/delete/:id', deleteWarehouse);
router.get('/list', getAllWarehouses);
router.get('/listsingle/:id', getSingleWarehouse);

export default router

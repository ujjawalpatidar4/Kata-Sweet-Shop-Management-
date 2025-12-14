import express from 'express';
import { createSweet, getAllSweets, getSweetById, updateSweet, deleteSweet, searchSweets, purchaseSweet, restockSweet } from '../controllers/sweetController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/search', searchSweets);

router.route('/')
  .get(getAllSweets)
  .post(createSweet);

router.route('/:id')
  .get(getSweetById)
  .put(updateSweet)
  .delete(authorize('admin'), deleteSweet);

router.post('/:id/purchase', purchaseSweet);
router.post('/:id/restock', authorize('admin'), restockSweet); 

export default router;

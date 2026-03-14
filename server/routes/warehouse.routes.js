import express from 'express';
import { getAllWarehouses, createWarehouse } from '../controllers/warehouse.controller.js';

const router = express.Router();

router.get('/', getAllWarehouses);
router.post('/', createWarehouse);

export default router;

import express from 'express';
import { getAllLocations, createLocation } from '../controllers/location.controller.js';

const router = express.Router();

router.get('/', getAllLocations);
router.post('/', createLocation);

export default router;

import express from 'express';
import * as shareholderController from '../controllers/shareholderController.js';
import { validateAddShareholders } from '../middlewares/shareholderValidation.js';

const router = express.Router({ mergeParams: true });

// Shareholder routes
router.post('/', validateAddShareholders, shareholderController.addShareholders);

export default router;

import express from 'express';
import * as companyController from '../controllers/companyController.js';
import { validateCreateCompany } from '../middlewares/companyValidation.js';

const router = express.Router();

// Company routes
router.post('/', validateCreateCompany, companyController.createCompany);
router.post('/submit', companyController.createCompanyWithShareholders);
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);

export default router;

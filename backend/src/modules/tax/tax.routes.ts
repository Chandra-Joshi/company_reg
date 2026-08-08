import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/pbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  idParamSchema,
  createTaxFilingSchema,
  updateTaxFilingSchema,
  approveTaxFilingSchema,
  listTaxFilingsQuerySchema,
} from "./tax.validation.js";
import {
  listTaxFilingsHandler,
  getTaxFilingHandler,
  createTaxFilingHandler,
  updateTaxFilingHandler,
  submitTaxFilingHandler,
  decideTaxFilingHandler,
} from "./tax.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("tax.view"), validate({ query: listTaxFilingsQuerySchema }), listTaxFilingsHandler);
router.get("/:id", authorize("tax.view"), validate({ params: idParamSchema }), getTaxFilingHandler);
router.post("/", authorize("tax.create"), validate({ body: createTaxFilingSchema }), createTaxFilingHandler);
router.patch("/:id", authorize("tax.update"), validate({ params: idParamSchema, body: updateTaxFilingSchema }), updateTaxFilingHandler);
router.post("/:id/submit", authorize("tax.submit"), validate({ params: idParamSchema }), submitTaxFilingHandler);
router.post(
  "/:id/approve",
  authorize("tax.approve"),
  validate({ params: idParamSchema, body: approveTaxFilingSchema }),
  decideTaxFilingHandler
);

export default router;

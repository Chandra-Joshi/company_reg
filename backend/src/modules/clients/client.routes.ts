import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/pbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import {
  idParamSchema,
  createClientSchema,
  updateClientSchema,
  assignClientSchema,
  updateKycSchema,
  listClientsQuerySchema,
  uploadDocumentSchema,
  createCommunicationSchema,
} from "./client.validation.js";
import {
  listClientsHandler,
  getClientHandler,
  createClientHandler,
  updateClientHandler,
  deleteClientHandler,
  assignClientHandler,
  updateKycHandler,
  uploadDocumentHandler,
  removeDocumentHandler,
  addCommunicationHandler,
} from "./client.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("client.view"), validate({ query: listClientsQuerySchema }), listClientsHandler);
router.get("/:id", authorize("client.view"), validate({ params: idParamSchema }), getClientHandler);
router.post("/", authorize("client.create"), validate({ body: createClientSchema }), createClientHandler);
router.patch("/:id", authorize("client.update"), validate({ params: idParamSchema, body: updateClientSchema }), updateClientHandler);
router.delete("/:id", authorize("client.delete"), validate({ params: idParamSchema }), deleteClientHandler);

router.patch(
  "/:id/assign",
  authorize("client.assign"),
  validate({ params: idParamSchema, body: assignClientSchema }),
  assignClientHandler
);
router.patch(
  "/:id/kyc",
  authorize("client.update"),
  validate({ params: idParamSchema, body: updateKycSchema }),
  updateKycHandler
);

router.post(
  "/:id/documents",
  authorize("client.update"),
  validate({ params: idParamSchema }),
  upload.single("file"),
  validate({ body: uploadDocumentSchema }),
  uploadDocumentHandler
);
router.delete(
  "/:id/documents/:documentId",
  authorize("client.update"),
  removeDocumentHandler
);

router.post(
  "/:id/communications",
  authorize("client.update"),
  validate({ params: idParamSchema, body: createCommunicationSchema }),
  addCommunicationHandler
);

export default router;

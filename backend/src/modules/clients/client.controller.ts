import type { Request, Response } from "express";
import path from "node:path";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { recordAudit } from "../../utils/audit.js";
import * as clientService from "./client.service.js";

export const listClientsHandler = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await clientService.listClients(req.query as never));
});

export const getClientHandler = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await clientService.getClient(req.params.id));
});

export const createClientHandler = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.createClient(req.body, req.user!.id);
  await recordAudit(req, { action: "client.create", entityType: "Client", entityId: client.id, metadata: { name: client.name } });
  return sendSuccess(res, client, "Client created", 201);
});

export const updateClientHandler = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.updateClient(req.params.id, req.body);
  await recordAudit(req, { action: "client.update", entityType: "Client", entityId: client.id, metadata: req.body });
  return sendSuccess(res, client, "Client updated");
});

export const deleteClientHandler = asyncHandler(async (req: Request, res: Response) => {
  await clientService.deleteClient(req.params.id);
  await recordAudit(req, { action: "client.delete", entityType: "Client", entityId: req.params.id });
  return sendSuccess(res, null, "Client deleted");
});

export const assignClientHandler = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.assignClient(req.params.id, req.body.assignedToId);
  await recordAudit(req, {
    action: "client.assign",
    entityType: "Client",
    entityId: client.id,
    metadata: { assignedToId: req.body.assignedToId },
  });
  return sendSuccess(res, client, "Client assigned");
});

export const updateKycHandler = asyncHandler(async (req: Request, res: Response) => {
  const client = await clientService.updateKyc(req.params.id, req.body.kycStatus);
  await recordAudit(req, {
    action: "client.update",
    entityType: "Client",
    entityId: client.id,
    metadata: { kycStatus: req.body.kycStatus },
  });
  return sendSuccess(res, client, "KYC status updated");
});

export const uploadDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");

  const document = await clientService.addDocument(req.params.id, {
    docType: req.body.docType,
    fileName: req.file.originalname,
    filePath: path.basename(req.file.path),
    uploadedById: req.user!.id,
  });
  await recordAudit(req, {
    action: "client.update",
    entityType: "ClientDocument",
    entityId: document.id,
    metadata: { clientId: req.params.id, docType: document.docType },
  });
  return sendSuccess(res, document, "Document uploaded", 201);
});

export const removeDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  const document = await clientService.removeDocument(req.params.id, req.params.documentId);
  await recordAudit(req, {
    action: "client.update",
    entityType: "ClientDocument",
    entityId: document.id,
    metadata: { clientId: req.params.id, deleted: true },
  });
  return sendSuccess(res, null, "Document removed");
});

export const addCommunicationHandler = asyncHandler(async (req: Request, res: Response) => {
  const communication = await clientService.addCommunication(req.params.id, {
    ...req.body,
    communicatedById: req.user!.id,
  });
  await recordAudit(req, {
    action: "client.update",
    entityType: "ClientCommunication",
    entityId: communication.id,
    metadata: { clientId: req.params.id, type: communication.type },
  });
  return sendSuccess(res, communication, "Communication logged", 201);
});

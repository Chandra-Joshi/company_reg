import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/ApiResponse.js";
import { recordAudit } from "../../utils/audit.js";
import * as taxService from "./tax.service.js";

export const listTaxFilingsHandler = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await taxService.listTaxFilings(req.query as never));
});

export const getTaxFilingHandler = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await taxService.getTaxFiling(req.params.id));
});

export const createTaxFilingHandler = asyncHandler(async (req: Request, res: Response) => {
  const filing = await taxService.createTaxFiling(req.body);
  await recordAudit(req, { action: "tax.create", entityType: "TaxFiling", entityId: filing.id, metadata: { type: filing.type, clientId: filing.clientId } });
  return sendSuccess(res, filing, "Tax filing created", 201);
});

export const updateTaxFilingHandler = asyncHandler(async (req: Request, res: Response) => {
  const filing = await taxService.updateTaxFiling(req.params.id, req.body);
  await recordAudit(req, { action: "tax.update", entityType: "TaxFiling", entityId: filing.id, metadata: req.body });
  return sendSuccess(res, filing, "Tax filing updated");
});

export const submitTaxFilingHandler = asyncHandler(async (req: Request, res: Response) => {
  const filing = await taxService.submitTaxFiling(req.params.id, req.user!.id);
  await recordAudit(req, { action: "tax.submit", entityType: "TaxFiling", entityId: filing.id });
  return sendSuccess(res, filing, "Tax filing submitted");
});

export const decideTaxFilingHandler = asyncHandler(async (req: Request, res: Response) => {
  const filing = await taxService.decideTaxFiling(req.params.id, req.body.approve, req.user!.id, req.body.remarks);
  await recordAudit(req, {
    action: "tax.approve",
    entityType: "TaxFiling",
    entityId: filing.id,
    metadata: { approve: req.body.approve },
  });
  return sendSuccess(res, filing, req.body.approve ? "Tax filing approved" : "Tax filing rejected");
});

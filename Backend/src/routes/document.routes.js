/**
 * Document Routes
 * Handles document upload and management
 */

import { Router } from "express";
import {
  uploadDocuments,
  updateDocumentStatus,
  getConversationDocuments,
  deleteDocument,
} from "../controllers/document.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Upload documents
router.post(
  "/upload",
  upload.array("documents", 10), // Max 10 files
  uploadDocuments
);

// Get documents for a conversation
router.get(
  "/conversation/:conversationId",
  getConversationDocuments
);

// Delete a document
router.delete("/:documentId", deleteDocument);

// Webhook for Python service to update document status
router.patch("/:documentId/status", updateDocumentStatus);

export default router;

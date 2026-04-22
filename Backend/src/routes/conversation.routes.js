/**
 * Conversation Routes
 * Handles conversation and message management
 */

import { Router } from "express";
import {
  getAllConversations,
  getConversationById,
  createConversation,
  sendChatMessage,
  deleteConversation,
  updateConversation,
} from "../controllers/conversation.controller.js";

const router = Router();

// Conversation CRUD operations
router.route("/")
  .get(getAllConversations)      // Get all conversations
  .post(createConversation);     // Create new conversation

router.route("/:conversationId")
  .get(getConversationById)      // Get single conversation with messages
  .patch(updateConversation)     // Update conversation title
  .delete(deleteConversation);   // Delete conversation

// Send message in a conversation
router.post("/:conversationId/messages", sendChatMessage);

export default router;

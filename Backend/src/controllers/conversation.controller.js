/**
 * Conversation Controller
 * Handles conversation management and chat messages
 */

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Conversation } from "../models/Conversation.model.js";
import { Message } from "../models/Message.model.js";
import { Document } from "../models/Document.model.js";
import mongoose from "mongoose";
import axios from "axios";

/**
 * Get all conversations
 * GET /api/v1/conversations
 */
export const getAllConversations = asyncHandler(async (req, res) => {
  // Find all conversations
  const conversations = await Conversation.find({})
    .select("title featureUsed createdAt updatedAt")
    .sort({ updatedAt: -1 }); // Most recent first

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        conversations,
        "Conversations retrieved successfully"
      )
    );
});

/**
 * Get a single conversation with all its messages
 * GET /api/v1/conversations/:conversationId
 */
export const getConversationById = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  // Validate conversation ID
  if (!mongoose.isValidObjectId(conversationId)) {
    throw new ApiError(400, "Invalid conversation ID");
  }

  // Find conversation
  const conversation = await Conversation.findById(conversationId)
    .populate("documents", "fileName fileType status");

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Get all messages in this conversation
  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: "asc" })
    .select("role content createdAt");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { conversation, messages },
        "Conversation details retrieved successfully"
      )
    );
});

/**
 * Create a new conversation
 * POST /api/v1/conversations
 */
export const createConversation = asyncHandler(async (req, res) => {
  const { title, featureUsed } = req.body;

  // Create new conversation
  const conversation = await Conversation.create({
    title: title || "New Chat",
    featureUsed: featureUsed || "Smart_Chat",
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, conversation, "Conversation created successfully")
    );
});

/**
 * Save a chat message (user or assistant)
 * POST /api/v1/conversations/:conversationId/messages
 * Body: { content, role? }  — role defaults to 'user'
 */
export const sendChatMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content, role = 'user' } = req.body;

  // Validate input
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Message content cannot be empty");
  }

  if (!mongoose.isValidObjectId(conversationId)) {
    throw new ApiError(400, "Invalid conversation ID");
  }

  // Find conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Save message to database
  const message = await Message.create({
    conversation: conversationId,
    role: role,
    content: content,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, { message }, "Message saved successfully")
    );
});

/**
 * Delete a conversation and all associated data
 * DELETE /api/v1/conversations/:conversationId
 */
export const deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  // Validate conversation ID
  if (!mongoose.isValidObjectId(conversationId)) {
    throw new ApiError(400, "Invalid conversation ID");
  }

  // Use transaction to ensure all-or-nothing deletion
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find and delete conversation
    const conversation = await Conversation.findByIdAndDelete(conversationId)
      .session(session);

    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversation: conversationId }).session(
      session
    );

    // Find all documents to clean up
    const documents = await Document.find({
      conversation: conversationId,
    }).session(session);

    if (documents.length > 0) {
      // Notify Python service to delete vectors (fire-and-forget)
      axios
        .post(`${process.env.PYTHON_SERVICE_URL}/delete-documents`, {
          documents: documents.map((doc) => ({
            filePath: doc.filePath,
            vectorNamespace: doc.vectorNamespace,
          })),
        })
        .catch((err) => {
          console.error(
            "Failed to trigger document cleanup:",
            err.message
          );
        });

      // Delete document records
      await Document.deleteMany({ conversation: conversationId }).session(
        session
      );
    }

    // Commit transaction
    await session.commitTransaction();

    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, "Conversation deleted successfully")
      );
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    throw new ApiError(
      500,
      error?.message || "Failed to delete conversation"
    );
  } finally {
    session.endSession();
  }
});

/**
 * Update conversation title or feature mode
 * PATCH /api/v1/conversations/:conversationId
 */
export const updateConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { title, featureUsed, isArchived } = req.body;

  // Validate input
  if (title === undefined && featureUsed === undefined && isArchived === undefined) {
    throw new ApiError(400, "Title, featureUsed, or isArchived must be provided");
  }

  if (title && title.trim() === "") {
    throw new ApiError(400, "Title cannot be empty");
  }

  if (!mongoose.isValidObjectId(conversationId)) {
    throw new ApiError(400, "Invalid conversation ID");
  }

  // Build update object
  const updateData = {};
  if (title) updateData.title = title.trim();
  if (featureUsed) updateData.featureUsed = featureUsed;
  if (isArchived !== undefined) updateData.isArchived = isArchived;

  // Update conversation
  const conversation = await Conversation.findByIdAndUpdate(
    conversationId,
    updateData,
    { new: true }
  );

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Conversation updated successfully")
    );
});

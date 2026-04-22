/**
 * Conversation Model
 * Represents a chat conversation between user and AI
 */

import mongoose from "mongoose";
import { FEATURE_MODES } from "../config/constants.js";

const conversationSchema = new mongoose.Schema(
  {
    // Title/name of the conversation
    title: {
      type: String,
      required: true,
      default: "New Chat",
      trim: true,
    },
    // Array of documents attached to this conversation
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    // Feature mode being used in this conversation
    featureUsed: {
      type: String,
      enum: Object.values(FEATURE_MODES),
      default: FEATURE_MODES.SMART,
    },
    // Whether the conversation is archived
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);

export const Conversation = mongoose.model("Conversation", conversationSchema);

import { Schema } from "mongoose";
import { ITopicMessage } from "./ITopicMessage";

export const TopicMessageSchema = new Schema<ITopicMessage>(
  {
    message: { type: String, default: "" },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

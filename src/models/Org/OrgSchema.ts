import { Schema } from "mongoose";
import { EOrgType, EOrgVisibility, IOrg } from "./IOrg";

export const OrgSchema = new Schema<IOrg>(
  {
    orgName: {
      type: {
        en: { type: String },
        fr: { type: String }
      }
    },
    orgUrl: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    redirectUrl: {
      type: String
    },
    orgType: {
      type: String,
      enum: EOrgType,
      required: true
    },
    orgDescription: {
      en: String,
      fr: String
    },
    orgNotes: {
      type: [
        {
          quote: { type: String, required: true, trim: true },
          message: { type: String, trim: true },
          createdAt: { type: String, required: true, trim: true },
          createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
          }
        }
      ],
      default: []
    },
    orgSubscriptions: {
      type: [
        { type: Schema.Types.ObjectId, ref: "Subscription", required: true }
      ],
      default: []
    },
    // orgTopicCategories: {
    //   type: [
    //     {
    //       catId: { type: String, required: true, trim: true },
    //       label: { type: String, required: true, trim: true }
    //     }
    //   ],
    //   default: []
    // },
    // orgTopics: {
    //   type: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    //   default: []
    // },
    orgPassword: { type: String, select: false },
    orgSalt: String,
    orgTabs: {
      type: [{ label: { type: String, trim: true }, url: String }],
      default: undefined
    },
    orgVisibility: {
      type: String,
      enum: EOrgVisibility,
      required: true,
      default: EOrgVisibility.PUBLIC
    },
    orgs: { type: [{ type: Schema.Types.ObjectId, ref: "Org" }], default: [] },
    orgPermissions: {
      type: { anyoneCanAddChildren: Boolean },
      default: undefined
    },
    isApproved: Boolean,
    isArchived: Boolean,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

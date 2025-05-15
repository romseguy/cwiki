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
    orgAddress: {
      type: [{ address: { type: String, trim: true } }],
      default: []
    },
    orgCity: { type: String, trim: true },
    orgLat: Number,
    orgLng: Number,
    orgEmail: { type: [{ email: { type: String, trim: true } }], default: [] },
    orgPhone: { type: [{ phone: { type: String, trim: true } }], default: [] },
    orgWeb: {
      type: [
        {
          url: { type: String, trim: true },
          prefix: { type: String, trim: true }
        }
      ],
      default: []
    },
    orgEventCategories: {
      type: [
        {
          catId: { type: String, required: true, trim: true },
          label: { type: String, required: true, trim: true }
        }
      ],
      default: []
    },
    orgEvents: {
      type: [{ type: Schema.Types.ObjectId, ref: "Event" }],
      default: []
    },
    orgGalleryCategories: {
      type: [
        {
          catId: { type: String, required: true, trim: true },
          label: { type: String, required: true, trim: true }
        }
      ],
      default: []
    },
    orgGalleries: {
      type: [{ type: Schema.Types.ObjectId, ref: "Gallery" }],
      default: []
    },
    orgLists: {
      type: [
        {
          listName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            sparse: true
          },
          subscriptions: {
            type: [
              {
                type: Schema.Types.ObjectId,
                ref: "Subscription"
              }
            ],
            default: []
          }
        }
      ],
      default: []
    },
    // orgProjects: {
    //   type: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    //   default: []
    // },
    orgSubscriptions: {
      type: [
        { type: Schema.Types.ObjectId, ref: "Subscription", required: true }
      ],
      default: []
    },
    orgTopicCategories: {
      type: [
        {
          catId: { type: String, required: true, trim: true },
          label: { type: String, required: true, trim: true }
        }
      ],
      default: []
    },
    orgTopics: {
      type: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
      default: []
    },
    orgStyles: {
      type: Schema.Types.Mixed,
      default: { showTitle: true }
    },
    orgBanner: {
      type: {
        doc: {
          type: Schema.Types.ObjectId,
          ref: "Document"
        },
        height: Number,
        headerHeight: Number,
        width: Number,
        mode: String,
        url: { type: String, trim: true }
      },
      select: false
    },
    orgLogo: {
      type: {
        base64: String,
        width: Number,
        height: Number,
        url: { type: String, trim: true }
      },
      select: false
    },
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

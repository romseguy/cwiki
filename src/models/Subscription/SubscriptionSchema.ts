import { Schema } from "mongoose";
import { EOrgSubscriptionType, ISubscription } from "./ISubscription";

export const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    email: { type: String, select: false },
    phone: { type: String, select: false },
    // IEventSubscription[]
    events: [
      {
        eventId: {
          type: Schema.Types.ObjectId,
          required: true
        },
        event: {
          type: Schema.Types.ObjectId,
          ref: "Event"
        },
        tagTypes: [
          { type: { type: String }, emailNotif: Boolean, pushNotif: Boolean }
        ]
      }
    ],
    // IOrgSubscription[]
    orgs: [
      {
        orgId: {
          type: Schema.Types.ObjectId,
          required: true
        },
        org: {
          type: Schema.Types.ObjectId,
          ref: "Org"
        },
        type: {
          type: String,
          enum: Object.keys(EOrgSubscriptionType).map(
            (key) => EOrgSubscriptionType[key as EOrgSubscriptionType]
          )
        },
        tagTypes: {
          type: [
            { type: { type: String }, emailNotif: Boolean, pushNotif: Boolean }
          ],
          default: []
        },
        eventCategories: {
          type: [
            {
              catId: Number,
              emailNotif: Boolean,
              pushNotif: Boolean
            }
          ],
          default: undefined
        }
      }
    ],
    // ITopicSubscription[]
    topics: [
      {
        emailNotif: Boolean,
        pushNotif: Boolean,
        topic: {
          type: Schema.Types.ObjectId,
          ref: "Topic"
        }
      }
    ]
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

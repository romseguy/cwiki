import { Schema } from "mongoose";
import { IUser } from "./IUser";

export const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      select: false,
      trim: true,
      lowercase: true
    },
    emailCount: Number,
    phone: {
      type: String,
      select: false
    },
    password: {
      type: String,
      select: false
    },
    passwordSalt: String,
    securityCode: {
      type: String,
      select: false
    },
    securityCodeSalt: {
      type: String,
      select: false
    },
    userImage: {
      type: {
        base64: String,
        width: Number,
        height: Number
      },
      select: false
    },
    userName: {
      type: String,
      unique: true,
      trim: true
    },
    userSubscription: {
      type: Schema.Types.Mixed,
      select: false
    },
    isOnline: Boolean,
    suggestedCategoryAt: String,
    userDescription: String
    // userProjects: {
    //   type: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    //   default: []
    // }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

//UserSchema.index({ email: 1, userName: 1 }, { unique: true });

// UserSchema.pre("init", function (next) {
//   if (!this.userName) this.userName = normalize(this.email.replace(/@.+/, ""));
//   return next();
// });

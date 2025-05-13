import { Schema } from "mongoose";
import { ISetting } from "./ISetting";

export const SettingSchema = new Schema<ISetting>(
  {
    settingName: { type: String, required: true, trim: true, unique: true },
    settingValue: { type: String, required: true, trim: true }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

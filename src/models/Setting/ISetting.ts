import { IDocument } from "models/IDocument";

export interface ISetting extends IDocument {
  settingName: string;
  settingValue: string;
}

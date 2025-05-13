import { IDocument } from "models/IDocument";
import { IUser } from "models/User";

export interface IEntity extends IDocument {
  createdBy?: IUser | string;
}

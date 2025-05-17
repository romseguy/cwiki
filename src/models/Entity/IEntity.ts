import { IDocument } from "models/IDocument";
import { IUser } from "models/User";

export interface IEntity extends IDocument {
  createdBy?: IUser | string;
}

export interface IEntityNote extends IEntity {
  _id: string;
  quote: string;
  message?: string;
}

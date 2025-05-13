import { IEntity } from "models/Entity";

export interface ITopicMessage extends Omit<IEntity, "_id"> {
  _id?: string;
  message: string;
}

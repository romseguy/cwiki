import { IEntity } from "./Entity";

export interface INotification {
  _id?: string;
  email?: string;
  phone?: string;
  user?: string;
  createdAt: string;
}

export interface IPushNotification extends INotification {
  entity: IEntity;
  status?: "PENDING" | "OK" | "NOK";
}

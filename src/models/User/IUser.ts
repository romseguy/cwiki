import { Base64Image } from "utils/image";

export interface IUser {
  _id: string;
  createdAt?: string;
  email: string;
  phone?: string;
  password?: string;
  passwordSalt?: string;
  securityCode?: string | null;
  securityCodeSalt?: string | null;
  userName: string;
  userImage?: Base64Image;
  userSubscription?: PushSubscription | null;
  // userSubscription?: {
  //   endpoint: string;
  //   expirationTime: string | null;
  //   keys: {
  //     p256dh: string;
  //     auth: string;
  //   };
  // };
  isOnline: boolean;
  suggestedCategoryAt?: string;
  userDescription?: string;
}

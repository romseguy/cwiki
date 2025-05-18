import { Base64Image } from "utils/image";
import { TOKEN_NAME } from "./";

type UserMetadata = {
  email: string;
  userId: string;
  userImage?: Base64Image;
  userName: string;
  isAdmin?: boolean;
};

export type Session = {
  [TOKEN_NAME]?: string | null;
  user: UserMetadata;
};

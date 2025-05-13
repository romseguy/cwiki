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

export const devSession: any =
  // lilo
  // {
  //   user: {
  //     email: "rom.seguy@lilo.org",
  //     userId: "60e340cb56ef290008d2e75d",
  //     userName: "lilo"
  //   }
  // };
  // admin
  // {
  //   user: {
  //     email: "contact@lebonforum.fr",
  //     userId: "668354c66b0b7a9351b72baf",
  //     userName: "admin"
  //   }
  // };
  null;

import type { MongoClient, Db } from "mongodb";
import type mongoose, { Model } from "mongoose";

export type Models = {
  Org: Model<IOrg, {}, {}>;
  Setting: Model<ISetting, {}, {}>;
  Subscription: Model<ISubscription, {}, {}>;
  Topic: Model<ITopic, {}, {}>;
  User: Model<IUser, {}, {}>;
};

declare global {
  namespace NodeJS {
    interface Global {
      mongo: {
        conn: mongoose.Connection | null;
        models: Models | null;
        promise: Promise<mongoose.Connection> | null;
      };
    }
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      NEXT_PUBLIC_ENV: "development" | "production";
      NEXT_PUBLIC_API: string;
      NEXT_PUBLIC_API2: string;
      NEXT_PUBLIC_SHORT_URL: string;
      //NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY: string;
      DATABASE_URL: string;
      SECRET: string;
      //WEB_PUSH_PRIVATE_KEY: string;
    }
  }
}

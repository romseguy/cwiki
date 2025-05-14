import { IOrg } from "models/Org";
import { OrgSchema } from "models/Org/OrgSchema";
import { ISetting } from "models/Setting";
import { SettingSchema } from "models/Setting/SettingSchema";
import { ISubscription } from "models/Subscription";
import { SubscriptionSchema } from "models/Subscription/SubscriptionSchema";
import { ITopic } from "models/Topic";
import { TopicSchema } from "models/Topic/TopicSchema";
import { IUser } from "models/User";
import { UserSchema } from "models/User/UserSchema";
import type { Db } from "mongodb";
import mongoose, { Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";

let cached = global.mongo;
if (!cached) {
  cached = global.mongo = { conn: null, promise: null, models: null };
}

export let db: Db;
//@ts-expect-error
export let models: {
  Org: Model<IOrg, {}, {}>;
  Setting: Model<ISetting, {}, {}>;
  Subscription: Model<ISubscription, {}, {}>;
  Topic: Model<ITopic, {}, {}>;
  User: Model<IUser, {}, {}>;
} = cached.models || {
  Org: {},
  Setting: {},
  User: {}
};

export default async function database(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler
) {
  if (!cached.models && cached.conn) {
    cached.models = models = {
      Org: cached.conn.model<IOrg>("Org", OrgSchema),
      Setting: cached.conn.model<ISetting>("Setting", SettingSchema),
      Subscription: cached.conn.model<ISubscription>(
        "Subscription",
        SubscriptionSchema
      ),
      Topic: cached.conn.model<ITopic>("Topic", TopicSchema),
      User: cached.conn.model<IUser>("User", UserSchema)
    };
  }

  if (cached.conn && next) return next();

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // const options = {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   useFindAndModify: false,
    //   bufferCommands: false
    // };
    const options = {
      autoIndex: false,
      useUnifiedTopology: true,
      useNewUrlParser: true
    };

    cached.promise = mongoose.createConnection(
      process.env.DATABASE_URL,
      options
    );
    // cached.promise = mongoose
    //   .connect(process.env.DATABASE_URL, options)
    //   .then((mongoose) => {
    //     return mongoose;
    //   });
  }

  cached.conn = await cached.promise;

  if (!cached.models)
    cached.models = models = {
      Org: cached.conn.model<IOrg>("Org", OrgSchema),
      Setting: cached.conn.model<ISetting>("Setting", SettingSchema),
      Subscription: cached.conn.model<ISubscription>(
        "Subscription",
        SubscriptionSchema
      ),
      Topic: cached.conn.model<ITopic>("Topic", TopicSchema),
      User: cached.conn.model<IUser>("User", UserSchema)
    };

  return next ? next() : cached.conn;
}

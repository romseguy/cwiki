import type { Db } from "mongodb";
import mongoose, { Model } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { IOrg } from "models/Org";
import { OrgSchema } from "models/Org/OrgSchema";
//import { ISubscription } from "models/Subscription";
//import { SubscriptionSchema } from "models/Subscription/SubscriptionSchema";
//import { ISetting } from "models/Setting";
//import { SettingSchema } from "models/Setting/SettingSchema";
// import { ITopic } from "models/Topic";
// import { TopicSchema } from "models/Topic/TopicSchema";
import { IUser } from "models/User";
import { UserSchema } from "models/User/UserSchema";
const { getEnv } = require("utils/env");

let cached = global.mongo;
if (!cached) {
  cached = global.mongo = { conn: null, models: null, promise: null };
}
console.log(process.env.DATABASE_URL);
const options: mongoose.ConnectOptions = {
  auth: { username: "lbf", password: process.env.SECRET },
  authSource: "admin",
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferCommands: false,
  useFindAndModify: false,
  useCreateIndex: true
};
const connection = mongoose.createConnection(process.env.DATABASE_URL, {
  autoIndex: false
});
const clientPromise = connection.then((connection) => connection.getClient());
const modelsPromise = connection.then((connection) => {
  return {
    Org: connection.model<IOrg>("Org", OrgSchema),
    // Subscription: connection.model<ISubscription>(
    //   "Subscription",
    //   SubscriptionSchema
    // ),
    //Setting: connection.model<ISetting>("Setting", SettingSchema),
    //Topic: connection.model<ITopic>("Topic", TopicSchema),
    User: connection.model<IUser>("User", UserSchema)
  };
});

export let db: Db;
export let models: {
  Org: Model<IOrg, {}, {}>;
  //Subscription: Model<ISubscription, {}, {}>;
  //Setting: Model<ISetting, {}, {}>;
  //Topic: Model<ITopic, {}, {}>;
  User: Model<IUser, {}, {}>;
};
export default async function database(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler
) {
  let clientDb;

  if (!cached.promise) {
    cached.promise = (await clientPromise).connect().then((client) => {
      clientDb = client.db(
        getEnv() === "development" ? "assolidaires" : "cwiki"
      );
      return {
        client,
        db: clientDb
      };
    });
  }

  if (!cached.conn) {
    cached.conn = await cached.promise;

    if (cached.conn && !cached.conn.db) {
      cached.conn.db = clientDb;
    }
  }

  db = cached.conn.db;

  if (!cached.models) {
    cached.models = await modelsPromise;
  }

  models = cached.models;

  // req.dbClient = cached.conn.client;
  // req.db = cached.conn.db;

  return next();
}

import { ISetting } from "models/Setting";
import { SettingSchema } from "models/Setting/SettingSchema";
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
//@ts-ignore
export let models: {
  Setting: Model<ISetting, {}, {}>;
  User: Model<IUser, {}, {}>;
} = cached.models || {
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
      Setting: cached.conn.model<ISetting>("Setting", SettingSchema),
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
      Setting: cached.conn.model<ISetting>("Setting", SettingSchema),
      User: cached.conn.model<IUser>("User", UserSchema)
    };

  return next ? next() : cached.conn;
}

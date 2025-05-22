import { Document } from "mongodb";
import nextConnect from "next-connect";
import database, { db, models } from "server/database";
import { getSession } from "server/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { createEndpointError } from "utils/errors";

const handler = nextConnect();

handler.use(database);

handler.get<NextApiRequest, NextApiResponse>(async function exportData(
  req,
  res
) {
  const session = await getSession({ req });

  if (!session) {
    return res
      .status(401)
      .json(createEndpointError(new Error("Vous devez être identifié.")));
  }

  // if (!session.user.isAdmin) {
  //   return res
  //     .status(403)
  //     .json(createEndpointError(new Error("Vous devez être administrateur.")));
  // }

  try {
    const collectionKeys = (await db.listCollections().toArray()).map(
      (collection) => collection.name
    );
    const data: Record<string, Document[]> = {};

    for (const key of collectionKeys) {
      data[key] = await db.collection(key).find({}).toArray();
    }

    return res.status(200).json({ data });
  } catch (error) {
    res.status(500).json(createEndpointError(error));
  }
});

// const collectionToModelKeys: {
//   [key: string]: "Event" | "Org" | "Subscription" | "Topic" | "User";
// } = {
//   events: "Event",
//   orgs: "Org",
//   subscriptions: "Subscription",
//   topics: "Topic",
//   users: "User"
// };

// handler.post<NextApiRequest, NextApiResponse>(async function importData(
//   req,
//   res
// ) {
//   const session = await getSession({ req });

//   if (!session) {
//     return res
//       .status(401)
//       .json(createEndpointError(new Error("Vous devez être identifié.")));
//   }

//   // if (!session.user.isAdmin) {
//   //   return res
//   //     .status(403)
//   //     .json(createEndpointError(new Error("Vous devez être administrateur.")));
//   // }

//   try {
//     console.log(`POST /admin/backup: parsing`);
//     const body = JSON.parse(req.body);
//     console.log(`POST /admin/backup: parsed`);

//     if (body.data) {
//       const collections = Object.keys(body.data).map((collectionName) => ({
//         collectionName
//       }));
//       console.log(
//         "🚀 ~ file: backup.ts:89 ~ collections ~ collections:",
//         collections
//       );
//       for (const collection of collections) {
//         const key = collection.collectionName;
//         console.log("🚀 ~ file: backup.ts:97 ~ key:", key);
//         //if (key !== "users") {
//         if (!body.data[key]) {
//           console.log(`POST /admin/backup: could not find body.data[${key}]`);
//         } else {
//           const model = models[collectionToModelKeys[key]];
//           if (!model) {
//             console.log(
//               `POST /admin/backup: could not find model for collection ${key}`
//             );
//           } else {
//             console.log("🚀 ~ file: backup.ts:90 ~ dropping collection:", key);
//             const dropped = await model.collection.drop();
//             console.log("🚀 ~ file: backup.ts:110 ~ dropped:", dropped);

//             let i = 0;
//             for (const o of body.data[key]) {
//               i += 1;
//               await model.create(o);
//             }
//             console.log("🚀 ~ file: backup.ts:90 ~ created models count:", i);
//           }
//         }
//         //}
//       }
//     }

//     res.status(200).json({});
//   } catch (error) {
//     //logEvent({
//     //   type: ServerEventTypes.API_ERROR,
//     //   metadata: {
//     //     error: JSON.stringify(error),
//     //     method: "POST",
//     //     url: `/api/admin/backup`
//     //   }
//     // });
//     res.status(500).json(createEndpointError(error));
//   }
// });

export default handler;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb"
    }
  }
};

import { AddUserPayload, GetUsersParams } from "features/api/usersApi";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { getSession } from "server/auth";
import database, { models } from "server/database";
import { getCurrentId } from "store/utils";
import { createEndpointError } from "utils/errors";
import { logJson, normalize } from "utils/string";
import { unauthorizedEntityUrls } from "utils/url";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.use(database);

handler.get<
  NextApiRequest & {
    query: GetUsersParams;
  },
  NextApiResponse
>(async function getUsers(req, res) {
  // const session = await getSession({ req });

  // if (!session?.user.isAdmin) {
  //   return res
  //     .status(401)
  //     .json(createEndpointError(new Error("Vous devez être administrateur")));
  // }

  try {
    let {
      query: { populate = "", select = "" }
    } = req;

    let selector: GetUsersParams = {};

    let users = await models.User.find(selector, select);

    if (populate) {
      for (const modelKey of populate
        .split(/(\s+)/)
        .filter((e) => e.trim().length > 0)) {
        if ([""].includes(modelKey)) {
          console.log(`GET /users populating ${modelKey} with custom behavior`);
          populate = populate.replace(modelKey, "");
        }
      }

      console.log(`GET /users unhandled keys: ${populate}`);
      users = await Promise.all(
        users.map((user) => user.populate(populate).execPopulate())
      );
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(createEndpointError(error));
  }
});

handler.post<NextApiRequest & { body: AddUserPayload }, NextApiResponse>(
  async function addUser(req, res) {
    const session = await getSession({ req });

    if (!session?.user.isAdmin) {
      return res
        .status(401)
        .json(createEndpointError(new Error("Vous devez être administrateur")));
    }

    try {
      const { body }: { body: AddUserPayload } = req;
      const userName = body.userName.trim();

      if (unauthorizedEntityUrls.includes(userName)) {
        return res
          .status(400)
          .json(
            createEndpointError(
              new Error(`Ce nom d'utilisateur n'est pas autorisé`)
            )
          );
      }

      let newUser = {
        ...body,
        userName
      };

      const event = await models.Event.findOne({ eventUrl: userName });
      const org = await models.Org.findOne({ orgUrl: userName });
      const user = await models.User.findOne({ userName });
      if (event || org || user) {
        const uid = (await getCurrentId()) + 1;
        newUser = {
          ...newUser,
          userName: userName + "-" + uid
        };
      }

      logJson(`POST /users: create`, newUser);
      const doc = await models.User.create(newUser);

      res.status(200).json(doc);
    } catch (error: any) {
      res.status(500).json(createEndpointError(error));
    }
  }
);

export default handler;

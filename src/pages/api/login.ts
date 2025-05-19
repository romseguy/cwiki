import { seal } from "@hapi/iron";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import database, { models } from "server/database";
import { getCurrentId } from "store/utils";
import {
  TOKEN_NAME,
  createCookie,
  sealOptions,
  setAuthToken
} from "utils/auth";
import { createEndpointError } from "utils/errors";
import { normalize } from "utils/string";
import { NextApiRequestWithAuthorizationHeader } from "utils/types";

type LoginPayload = {
  email: string;
  hash: string;
};

const handler = nextConnect<NextApiRequest, NextApiResponse>();
handler.use(database);

handler.get<NextApiRequestWithAuthorizationHeader, NextApiResponse>(
  async function login(req, res) {
    const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ GET /login `;
    console.log(prefix);

    if (!req.headers.authorization) {
      // return res
      //   .status(400)
      //   .json(
      //     createEndpointError(new Error("No request authorization headers"))
      //   );

      return res.status(200).json({});
    }

    try {
      const email = "";
      let user = await models.User.findOne({ email });
      if (!user && email) {
        let userName = normalize(email.replace(/@.+/, ""));

        if (await models.User.findOne({ userName })) {
          const uid = (await getCurrentId()) + 1;
          userName = userName + "-" + uid;
        }

        user = await models.User.create({
          email,
          userName
        });
      }
      if (!user) throw new Error();

      const userToken = {
        email,
        userId: user._id,
        userName: user.userName
      };

      const token = await seal(userToken, process.env.SECRET, sealOptions);
      return setAuthToken(res, token).status(200).json({ authenticated: true });
    } catch (error: any) {
      res.status(500).json(createEndpointError(error));
    }
  }
);

handler.post<NextApiRequest & { body: LoginPayload }, NextApiResponse>(
  async function login(req, res) {
    const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ POST /login `;
    console.log(prefix + "body", req.body);

    try {
      const {
        body: { email, hash }
      }: { body: LoginPayload } = req;
      let user = await models.User.findOne({ email }, "+password");

      if (!user)
        return res
          .status(404)
          .json(
            createEndpointError(
              new Error(`L'utilisateur n'a pas pu être trouvé`)
            )
          );

      if (user.password !== hash)
        return res.status(401).json({ authenticated: false });

      const userToken = {
        email,
        userId: user._id,
        userName: user.userName
      };
      const token = await seal(userToken, process.env.SECRET, sealOptions);
      res.setHeader("Set-Cookie", [
        createCookie(TOKEN_NAME, token),
        createCookie("authed", "true", { httpOnly: false })
      ]);
      return res.status(200).json({ authenticated: true });
    } catch (error: any) {
      res.status(500).json(createEndpointError(error));
    }
  }
);

export default handler;

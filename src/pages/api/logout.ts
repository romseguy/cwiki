import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import database from "server/database";
import { setAuthToken } from "utils/auth";
import { createEndpointError } from "utils/errors";
import { NextApiRequestWithAuthorizationHeader } from "utils/types";

const handler = nextConnect<NextApiRequest, NextApiResponse>();
handler.use(database);
handler.get<NextApiRequestWithAuthorizationHeader, NextApiResponse>(
  async function logout(req, res) {
    try {
      console.log("🚀 ~ logout ~ :");
      return setAuthToken(res, "").status(200).json({});
    } catch (error: any) {
      res.status(500).json(createEndpointError(error));
    }
  }
);

export default handler;

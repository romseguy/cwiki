import { getSession } from "server/auth";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { createEndpointError } from "utils/errors";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.get<NextApiRequest, NextApiResponse>(
  async function getUserSession(req, res) {
    try {
      const session = await getSession({ req });
      res.status(200).json(session ? session : {});
    } catch (error) {
      res.status(500).json(createEndpointError(error));
    }
  }
);

export default handler;

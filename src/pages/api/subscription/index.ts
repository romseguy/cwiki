import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { createEndpointError } from "utils/errors";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.get<NextApiRequest, NextApiResponse>(
  async function getNothing(req, res) {
    return res.status(400).json({});
  }
);

export default handler;

import { AddOrgPayload, GetOrgsParams } from "features/api/orgsApi";
import { EOrgType, EOrgVisibility, IOrg } from "models/Org";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { getSession } from "server/auth";
import database, { models } from "server/database";
import { getCurrentId } from "store/utils";
import { createEndpointError, databaseErrorCodes } from "utils/errors";
import { equals, logJson, normalize } from "utils/string";
import { unauthorizedEntityUrls } from "utils/url";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.use(database);

handler.get<
  NextApiRequest & {
    query: GetOrgsParams;
  },
  NextApiResponse
>(async function getOrgs(req, res) {
  const session = await getSession({ req });

  try {
    let {
      query: { createdBy, orgType, populate = "" }
    } = req;

    let selector: Partial<IOrg> = {
      $or: [
        { orgVisibility: EOrgVisibility.PUBLIC },
        { orgVisibility: EOrgVisibility.FRONT }
      ]
    };

    if (createdBy && typeof createdBy === "string") {
      selector = {
        ...selector,
        createdBy
      };

      if (session && equals(session.user.userId, selector.createdBy))
        delete selector.$or;
    }

    if (orgType && EOrgType[orgType]) selector = { ...selector, orgType };
    let orgs = await models.Org.find(selector);

    if (populate) {
      for (const modelKey of populate
        .split(/(\s+)/)
        .filter((e) => e.trim().length > 0)) {
        if (["orgTopics.org", "orgTopics.topicMessages"].includes(modelKey)) {
          //console.log(`GET /orgs populating ${modelKey} with custom behavior`);
          populate = populate.replace(modelKey, "");
        }

        if (modelKey === "orgTopics.org") {
          for (let org of orgs) {
            org = await org
              .populate({
                path: "orgTopics",
                populate: { path: "org" }
              })
              .execPopulate();
          }
        }

        if (modelKey === "orgTopics.topicMessages") {
          populate = populate.replace("orgTopics", "");
          for (let org of orgs) {
            await org
              .populate({
                path: "orgTopics",
                select: "topicName topicMessages.createdAt"
                //populate: [{ path: "topicMessages", select: "-message" }]
              })
              .execPopulate();
          }
        }
      }

      //console.log(`GET /orgs unhandled keys: ${populate}`);
      orgs = await Promise.all(
        orgs.map((org) => org.populate(populate).execPopulate())
      );
    }

    res.status(200).json(orgs);
  } catch (error) {
    res.status(500).json(createEndpointError(error));
  }
});

handler.post<NextApiRequest & { body: AddOrgPayload }, NextApiResponse>(
  async function addOrg(req, res) {
    const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ POST /orgs `;
    console.log(prefix, req.body);

    const session = await getSession({ req });
    console.log("🚀 ~ addOrg ~ session:", session);

    if (!session) {
      return res
        .status(401)
        .json(createEndpointError(new Error("Vous devez être identifié")));
    }

    try {
      const { body }: { body: AddOrgPayload } = req;
      const orgName = body.orgName;
      const orgUrl = normalize(orgName.en);

      if (unauthorizedEntityUrls.includes(orgUrl)) {
        return res
          .status(400)
          .json(
            createEndpointError(new Error(`Ce nom d'arbre n'est pas autorisé`))
          );
      }

      let newOrg = {
        ...body,
        createdBy: session.user.userId,
        orgName,
        orgUrl,
        isApproved: session.user.isAdmin
      };

      // const org = await models.Org.findOne({ orgUrl });
      // const user = await models.User.findOne({ userName: orgUrl });
      // if (org || user) {
      //   const uid = (await getCurrentId()) + 1;
      //   newOrg = {
      //     ...newOrg,
      //     orgName: orgName + "-" + uid,
      //     orgUrl: orgUrl + "-" + uid
      //   };
      // }

      logJson(`POST /orgs: create`, newOrg);
      const doc = await models.Org.create(newOrg);

      res.status(200).json(doc);
    } catch (error: any) {
      if (error.code && error.code === databaseErrorCodes.DUPLICATE_KEY) {
        res.status(400).json({
          userName: "Ce nom d'utilisateur n'est pas disponible"
        });
      } else {
        res.status(500).json(createEndpointError(error));
      }
    }
  }
);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb"
    }
  }
};

export default handler;

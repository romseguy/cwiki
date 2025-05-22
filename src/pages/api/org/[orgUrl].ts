import {
  DeleteOrgParams,
  EditOrgPayload,
  GetOrgParams
} from "features/api/orgsApi";
import { getRefId } from "models/Entity";
import {
  EOrgType,
  EOrgVisibility,
  getLists,
  orgTypeFull,
  orgTypeFull4
} from "models/Org";
import { ISubscription, getEntitySubscription } from "models/Subscription";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { getSession } from "server/auth";
import database, { models } from "server/database";
import { getClientIp } from "server/ip";
import { ServerEventTypes, logEvent } from "server/logging";
import { hasItems } from "utils/array";
import {
  createEndpointError,
  databaseErrorCodes,
  duplicateError
} from "utils/errors";
import { equals, logJson, normalize } from "utils/string";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.use(database);

handler.get<
  NextApiRequest & {
    query: GetOrgParams;
  },
  NextApiResponse
>(async function getOrg(req, res) {
  const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ GET /org/[orgUrl] `;
  console.log(prefix + "query", req.query);

  let {
    query: { orgUrl, hash, populate = "" }
  } = req;

  try {
    const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ GET /org/${orgUrl} `;
    console.log(prefix);

    let org = await models.Org.findOne({ orgUrl });
    if (!org) org = await models.Org.findOne({ _id: orgUrl });
    if (!org)
      return res
        .status(404)
        .json(
          createEndpointError(
            new Error(`L'arbre ${orgUrl} n'a pas pu être trouvé`)
          )
        );

    //logEvent({
    //   type: ServerEventTypes.API_CALL,
    //   metadata: {
    //     method: "GET",
    //     ip: getClientIp(req),
    //     url: `/api/${orgUrl}`
    //   }
    // });

    const session = await getSession({ req });
    const isCreator =
      equals(getRefId(org), session?.user.userId) || session?.user.isAdmin;

    for (const modelKey of populate
      .split(/(\s+)/)
      .filter((e) => e.trim().length > 0)) {
      if (
        [
          "orgs",
          "orgEvents",
          "orgLists",
          "orgGalleries",
          "orgTopics",
          "orgSubscriptions"
        ].includes(modelKey)
      ) {
        //console.log(prefix + `populating ${modelKey} with custom behavior`);
        populate = populate.replace(modelKey, "");
      }

      if (modelKey === "orgNotes") {
        org = org.populate({
          path: "orgNotes",
          populate: [{ path: "createdBy", select: "_id userName" }]
        });
      }

      if (modelKey === "orgs") {
        org = org.populate({
          path: "orgs",
          populate: [{ path: "createdBy" }]
        });
      }
    }

    org = await org.populate("createdBy", "_id userName").execPopulate();

    // console.log(prefix + `unhandled keys: ${populate}`);

    // let i = 0;
    // for (const orgNote of org.orgNotes) {
    //   console.log("🚀 ~ getOrg ~ orgNote:", orgNote);
    //   const user = await models.User.findOne({ _id: orgNote.createdBy });
    //   console.log("🚀 ~ getOrg ~ user:", user);
    //   org.orgNotes[i]["createdBy"] = user ? user.userName : "anonymous";
    //   ++i;
    // }

    logJson(prefix, org);
    res.status(200).json(org);
  } catch (error: any) {
    console.log(prefix + "ERROR", error);
    if (error.kind === "ObjectId")
      return res
        .status(404)
        .json(
          createEndpointError(
            new Error(`L'arbre ${orgUrl} n'a pas pu être trouvé`)
          )
        );
    res.status(500).json(createEndpointError(error));
  }
});

handler.put<
  NextApiRequest & {
    query: { orgUrl: string };
    body: EditOrgPayload;
  },
  NextApiResponse
>(async function editOrg(req, res) {
  const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ PUT /org/[orgUrl] `;
  console.log(prefix + "query", req.query);
  logJson(prefix + "body", req.body);

  const session = await getSession({ req });
  if (!session && !Array.isArray(req.body.orgNotes)) {
    return res
      .status(401)
      .json(createEndpointError(new Error("Vous devez être identifié")));
  }

  try {
    const _id = req.query.orgUrl;
    let org = await models.Org.findOne({ _id });

    if (!org) {
      return res
        .status(404)
        .json(
          createEndpointError(
            new Error(`L'arbre ${_id} n'a pas pu être trouvé`)
          )
        );
    }

    let { body }: { body: EditOrgPayload } = req;
    const isCreator =
      equals(getRefId(org), session?.user.userId) || session?.user.isAdmin;
    let canEdit = isCreator || Array.isArray(req.body.orgNotes);

    if (!Array.isArray(body)) {
      canEdit =
        canEdit ||
        Array.isArray(body.orgTopicCategories) ||
        Array.isArray(body.orgLists) ||
        (Array.isArray(body.orgs) && org.orgPermissions?.anyoneCanAddChildren);
    }

    if (!canEdit) {
      return res
        .status(403)
        .json(
          createEndpointError(
            new Error(
              `Vous n'avez pas la permission de modifier ${orgTypeFull4(
                org.orgType
              )}`
            )
          )
        );
    }

    let update:
      | {
          $unset?: { [key: string]: number };
          $pull?: { [key: string]: { [key: string]: string } | string };
        }
      | undefined;

    if (Array.isArray(body)) {
      for (const key of body) {
        if (key.includes(".") && key.includes("=")) {
          const matches = key.match(/([^\.]+)\.([^=]+)=(.+)/);

          if (matches && matches.length === 4) {
            // orgLists.listName=string
            // orgTopicCategories.catId=0

            if (
              !isCreator &&
              ["orgLists", "orgTopicCategores"].includes(matches[1])
            ) {
              return res
                .status(401)
                .json(
                  createEndpointError(
                    new Error(
                      `Vous devez être administrateur pour effectuer cette action`
                    )
                  )
                );
            }

            if (matches[1] === "orgTopicCategories") {
              org = await org.populate("orgTopics").execPopulate();
              const topicsBelongingToCategories = org.orgTopics.filter((t) => {
                return t.topicCategory === matches[3];
              });
              if (hasItems(topicsBelongingToCategories)) {
                await models.Topic.updateMany(
                  {
                    _id: {
                      $in: topicsBelongingToCategories.map((t) => t._id)
                    }
                  },
                  { $set: { topicCategory: "" } }
                );
              }
            }

            update = {
              $pull: { [matches[1]]: { [matches[2]]: matches[3] } }
            };
          }
        } else if (key.includes("=")) {
          // orgTopicCategories=string
          const matches = key.match(/([^=]+)=(.+)/);

          if (matches && matches.length === 3) {
            update = {
              $pull: { [matches[1]]: matches[2] }
            };

            if (matches[1] === "orgTopicCategories") {
              await models.Topic.updateMany(
                { topicCategory: matches[2] },
                { topicCategory: null }
              );
            }
          }
        } else {
          update = { $unset: { [key]: 1 } };
        }
      }
    } else {
      if (body.orgName) {
        const orgUrl = normalize(body.orgName.en.trim());
        body = {
          ...body,
          orgName: {
            en: body.orgName.en.trim(),
            fr: (body.orgName.fr || "").trim()
          },
          orgUrl
        };
        if (orgUrl !== org.orgUrl && (await models.Org.findOne({ orgUrl })))
          throw duplicateError();
      }

      if (Array.isArray(body.orgNotes)) {
        let i = 0;
        for (const orgNote of body.orgNotes) {
          if (
            typeof orgNote.createdBy === "object" &&
            orgNote.createdBy.userName === "anonymous"
          ) {
            const user = await models.User.findOne({ userName: "anonymous" });
            if (user) body.orgNotes[i] = { ...orgNote, createdBy: user };
          }
          ++i;
        }
      }

      // if (body.orgs) {
      //   body = { $push: { orgs: body.orgs[0] } };
      // }
      // if (Array.isArray(body.orgLists) && body.orgLists.length > 0) {
      //   if (!isCreator) {
      //     return res
      //       .status(401)
      //       .json(
      //         createEndpointError(
      //           new Error(
      //             `Vous n'avez pas la permission ${orgTypeFull(
      //               org.orgType
      //             )} pour gérer les listes`
      //           )
      //         )
      //       );
      //   }

      //   if (!body.orgLists[0].listName)
      //     return res
      //       .status(400)
      //       .json(createEndpointError(new Error("Liste invalide")));

      //   // TODO: if listName === "Abonnés"
      //   // remove subscriptions.orgs.orgSubscription
      //   // that were in org.orgLists
      //   // but are not in body.org.orgLists
      // }
      // if (body.orgTopicCategories) {
      //   if (!isCreator) {
      //     return res
      //       .status(401)
      //       .json(
      //         createEndpointError(
      //           new Error(
      //             `Vous devez être administrateur pour effectuer cette action`
      //           )
      //         )
      //       );
      //   }
      // }
    }

    logJson(prefix + "update", update);
    logJson(prefix + "body", body);

    await models.Org.findOneAndUpdate({ _id }, update || body);
    res.status(200).json(org);
  } catch (error: any) {
    if (error.code && error.code === databaseErrorCodes.DUPLICATE_KEY)
      return res.status(400).json({
        [error.field || "orgName"]: "Ce nom n'est pas disponible"
      });

    res.status(500).json(createEndpointError(error));
  }
});

handler.delete<
  NextApiRequest & {
    query: DeleteOrgParams;
  },
  NextApiResponse
>(async function removeOrg(req, res) {
  const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ DELETE /org/[orgUrl] `;
  console.log(prefix + "query", req.query);

  const session = await getSession({ req });

  if (!session) {
    return res
      .status(401)
      .json(createEndpointError(new Error("Vous devez être identifié")));
  }

  try {
    const _id = req.query.orgUrl;
    const org = await models.Org.findOne({ _id });

    if (!org) {
      return res
        .status(404)
        .json(
          createEndpointError(
            new Error(`L'arbre ${_id} n'a pas pu être trouvé`)
          )
        );
    }

    if (!equals(org.createdBy, session.user.userId) && !session.user.isAdmin) {
      return res
        .status(403)
        .json(
          createEndpointError(
            new Error(
              "Vous ne pouvez pas supprimer un arbre que vous n'avez pas créé"
            )
          )
        );
    }

    const { deletedCount /*, n, ok */ } = await models.Org.deleteOne({ _id });

    if (deletedCount !== 1) {
      return res
        .status(400)
        .json(
          createEndpointError(
            new Error(`L'arbre ${_id} n'a pas pu être supprimé`)
          )
        );
    }

    // if (req.query.isDeleteOrgEvents) {
    //   /*const { deletedCount, n, ok } = */ await models.Event.deleteMany({
    //     _id: { $in: org.orgEvents }
    //   });
    // }

    res.status(200).json(org);
  } catch (error) {
    res.status(500).json(createEndpointError(error));
  }
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb"
    },
    responseLimit: "8mb"
  }
};

export default handler;

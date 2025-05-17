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

    const select = `+orgPassword ${
      populate.includes("orgLogo") ? "+orgLogo" : ""
    } ${populate.includes("orgBanner") ? "+orgBanner" : ""} ${
      populate.includes("orgDescription") ? "+orgDescription" : ""
    }`;

    let org = await models.Org.findOne({ orgUrl }, select);
    if (!org) org = await models.Org.findOne({ _id: orgUrl }, select);
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

    if (!isCreator) {
      if (org.orgPassword) {
        if (!hash) {
          org = await org.populate("createdBy", "_id userName").execPopulate();
          return res.status(200).json({
            orgName: org.orgName,
            orgSalt: org.orgSalt,
            orgStyles: org.orgStyles,
            orgType: org.orgType,
            orgUrl: org.orgUrl,
            createdAt: org.createdAt,
            createdBy: org.createdBy
          });
        }

        if (org.orgPassword !== hash)
          return res
            .status(403)
            .json(createEndpointError(new Error("Mot de passe incorrect")));

        org.orgPassword = undefined;
      } else if (
        org.orgType === EOrgType.GENERIC ||
        org.orgType === EOrgType.TREETOOLS
      ) {
        const privateNetworks = await models.Org.find(
          {
            orgType: EOrgType.NETWORK,
            orgVisibility: EOrgVisibility.PRIVATE
          },
          "+orgPassword"
        ).populate("orgs");
        const orgNetwork = privateNetworks.find(
          ({ orgs }) => !!orgs.find(({ orgName }) => orgName === org!.orgName)
        );
        const orgBelongsToAtLeastOnePrivateNetwork = !!orgNetwork;

        if (orgBelongsToAtLeastOnePrivateNetwork) {
          if (!hash)
            return res.status(200).json({
              orgName: org.orgName,
              orgSalt: orgNetwork.orgSalt,
              orgStyles: org.orgStyles,
              orgType: org.orgType,
              orgUrl: org.orgUrl
            });

          if (orgNetwork.orgPassword !== hash)
            return res
              .status(403)
              .json(createEndpointError(new Error("Mot de passe incorrect")));
        }
      }
    }

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
        org = await org
          .populate({
            path: "orgNotes",
            populate: [{ path: "createdBy", select: "_id userName" }]
          })
          .execPopulate();
      }

      if (modelKey === "orgs") {
        org = org.populate({
          path: "orgs",
          populate: [
            //{ path: "createdBy" },
            {
              path: "orgTopics",
              select:
                "topicName topicMessages.createdAt topicMessages.updatedAt"
            }
          ]
        });
      }

      if (modelKey === "orgEvents") {
        org = await org
          .populate({
            path: "orgEvents",
            populate: [
              { path: "createdBy", select: "_id userName" },
              { path: "eventOrgs" },
              {
                path: "eventTopics",
                select:
                  "topicName topicMessages.createdAt topicMessages.updatedAt"
              }
            ]
          })
          .execPopulate();

        // for (const orgEvent of org.orgEvents) {
        //   if (orgEvent.forwardedFrom?.eventId) {
        //     const event = await models.Event.findOne({
        //       _id: orgEvent.forwardedFrom.eventId
        //     });
        //     if (event) {
        //       orgEvent.forwardedFrom.eventUrl = orgEvent._id;
        //       orgEvent.eventName = event.eventName;
        //       orgEvent.eventUrl = event.eventUrl;
        //     }
        //   }
        // }

        if (!isCreator) {
          const subscription = await models.Subscription.findOne({
            user: session?.user.userId
          });
          const isFollowed = !!getEntitySubscription({
            org,
            subscription: subscription as ISubscription
          });

          org.orgEvents = org.orgEvents.filter(
            ({ eventVisibility }) =>
              eventVisibility === EEventVisibility.PUBLIC ||
              (eventVisibility === EEventVisibility.FOLLOWERS && isFollowed)
          );
        }
      }

      if (modelKey === "orgLists") {
        org = await org
          .populate({
            path: "orgLists",
            populate: {
              path: "subscriptions",
              select: "+email +phone",
              populate: {
                path: "user",
                select: "+email +phone"
              }
            }
          })
          .execPopulate();

        org = await org
          .populate({
            path: "orgSubscriptions",
            select: "+email +phone",
            populate: {
              path: "user",
              select: "+email +phone"
            }
          })
          .execPopulate();
        org.orgLists = getLists(org);
        // wtf was that?
        // if (!isCreator) {
        //   const subscription = await models.Subscription.findOne({
        //     user: session?.user.userId
        //   });

        //   org.orgLists = subscription
        //     ? org.orgLists.filter(
        //         ({ subscriptions }) =>
        //           !!subscriptions.find(({ _id }) =>
        //             equals(_id, subscription._id)
        //           )
        //       )
        //     : [];
        // }
      }

      if (modelKey === "orgGalleries") {
        org = org.populate({
          path: "orgGalleries",
          populate: [
            {
              path: "galleryDocuments",
              populate: [{ path: "createdBy", select: "_id userName" }]
            },
            { path: "createdBy", select: "_id userName" }
          ]
        });
      }

      if (modelKey === "orgTopics") {
        org = await org
          .populate({
            path: "orgTopics",
            populate: [
              {
                path: "topicMessages",
                populate: { path: "createdBy", select: "_id userName" }
              },
              { path: "createdBy", select: "_id userName" },
              {
                path: "org",
                select: "orgUrl"
              },
              { path: "event", select: "eventUrl" }
            ]
          })
          .execPopulate();

        // for (const orgTopic of org.orgTopics) {
        //   for (const topicMessage of orgTopic.topicMessages) {
        //     if (typeof topicMessage.createdBy === "object") {
        //       if (
        //         !topicMessage.createdBy.userName &&
        //         topicMessage.createdBy.email
        //       ) {
        //         topicMessage.createdBy.userName =
        //           topicMessage.createdBy.email.replace(/@.+/, "");
        //       }
        //       // todo: check this
        //       // topicMessage.createdBy.email = undefined;
        //     }
        //   }
        // }

        // if (!isCreator) {
        //   org = await org.execPopulate();

        //   const subscription = session
        //     ? await models.Subscription.findOne({
        //         user: session.user.userId
        //       })
        //     : null;

        //   org.orgTopics = subscription
        //     ? org.orgTopics.filter(({ topicVisibility }) => {
        //         if (!hasItems(topicVisibility)) return true;

        //         for (const listName of topicVisibility) {
        //           if (listName === "Abonnés") {
        //             if (
        //               getFollowerSubscription({
        //                 org: org as IOrg,
        //                 subscription
        //               })
        //             ) {
        //               return true;
        //             }
        //           }

        //           const orgList = org?.orgLists.find(
        //             (orgList) => orgList.listName === listName
        //           );

        //           return !!orgList?.subscriptions?.find(({ _id }) =>
        //             equals(_id, subscription._id)
        //           );
        //         }
        //       })
        //     : org.orgTopics.filter(
        //         ({ topicVisibility }) => !hasItems(topicVisibility)
        //       );
        // }
      }

      if (modelKey === "orgSubscriptions") {
        org = org.populate({
          path: "orgSubscriptions",
          select: isCreator ? "+email +phone" : undefined,
          populate: {
            path: "user",
            select: isCreator ? "+email" : undefined
          }
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

  if (!session) {
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
    let canEdit = isCreator;

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
        body = {
          ...body,
          orgName: { en: body.orgName.en.trim() },
          orgUrl: normalize(body.orgName.en.trim())
        };

        if (
          body.orgName.en !== org.orgName.en &&
          (await models.Org.findOne({ orgName: body.orgName.en }))
        )
          throw duplicateError();
      }

      // if (body.orgs) {
      //   body = { $push: { orgs: body.orgs[0] } };
      // }

      if (Array.isArray(body.orgLists) && body.orgLists.length > 0) {
        if (!isCreator) {
          return res
            .status(401)
            .json(
              createEndpointError(
                new Error(
                  `Vous n'avez pas la permission ${orgTypeFull(
                    org.orgType
                  )} pour gérer les listes`
                )
              )
            );
        }

        if (!body.orgLists[0].listName)
          return res
            .status(400)
            .json(createEndpointError(new Error("Liste invalide")));

        // TODO: if listName === "Abonnés"
        // remove subscriptions.orgs.orgSubscription
        // that were in org.orgLists
        // but are not in body.org.orgLists
      }

      if (body.orgTopicCategories) {
        if (!isCreator) {
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
      }
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

    if (req.query.isDeleteOrgEvents) {
      /*const { deletedCount, n, ok } = */ await models.Event.deleteMany({
        _id: { $in: org.orgEvents }
      });
    }

    //  await models.Project.deleteMany({
    //   _id: { $in: org.orgProjects }
    // });
    /*const { deletedCount, n, ok } = */ await models.Subscription.deleteMany({
      _id: { $in: org.orgSubscriptions }
    });
    /*const { deletedCount, n, ok } = */ await models.Topic.deleteMany({
      _id: { $in: org.orgTopics }
    });

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

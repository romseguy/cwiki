import { getRefId } from "models/Entity";
import type {
  IEventSubscription,
  IOrgSubscription,
  ISubscription
} from "models/Subscription";
import { IUser } from "models/User";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { getSession } from "server/auth";
import database, { models } from "server/database";
import { createEndpointError } from "utils/errors";
import { emailR } from "utils/regex";
import { equals, logJson } from "utils/string";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.use(database);

handler.get<
  NextApiRequest & { query: { slug: string; populate?: string } },
  NextApiResponse
>(async function getSubscription(req, res) {
  try {
    const {
      query: { slug, populate }
    } = req;

    let selector: { email?: string; _id?: string } = {};

    if (emailR.test(slug)) {
      const user = await models.User.findOne({ email: slug }, "email");
      selector = { email: user?.email || slug };
    } else {
      const user = await models.User.findOne({ _id: slug });
      selector = user ? { email: user.email } : { _id: slug };
    }

    let subscription = await models.Subscription.findOne(selector);

    if (!subscription) {
      return res
        .status(404)
        .json(
          createEndpointError(
            new Error(`L'abonnement ${slug} n'a pas pu être trouvé`)
          )
        );
    }

    if (populate) {
      if (populate.includes("events"))
        subscription = subscription.populate({
          path: "events",
          populate: { path: "event" }
        });

      if (populate.includes("orgs"))
        subscription = subscription.populate({
          path: "orgs",
          populate: { path: "org" }
        });

      if (populate.includes("topics"))
        subscription = subscription.populate({
          path: "topics",
          populate: {
            path: "topic",
            select: "-topicMessage"
          }
        });

      const subPopulate = [];

      if (populate.includes("topics.topic.org"))
        subPopulate.push({ path: "org" });
      if (populate.includes("topics.topic.event"))
        subPopulate.push({ path: "event" });

      if (subPopulate.length > 0)
        subscription = subscription.populate({
          path: "topics",
          populate: {
            path: "topic",
            populate: subPopulate,
            select: "-topicMessage"
          }
        });

      // if (populate.includes("topics.topic.event"))
      //   subscription = subscription.populate({
      //     path: "topics",
      //     populate: {
      //       path: "topic",
      //       populate: {
      //         path: "event"
      //       }
      //     }
      //   });
    } else
      subscription = subscription
        .populate({
          path: "events",
          populate: { path: "event" }
        })
        .populate({
          path: "orgs",
          populate: { path: "org" }
        })
        .populate({
          path: "topics",
          populate: { path: "topic", select: "-topicMessages" }
        });

    subscription = await subscription.execPopulate();
    res.status(200).json(subscription);
  } catch (error) {
    console.log("error", error);
    res.status(500).json(createEndpointError(error));
  }
});

handler.put<
  NextApiRequest & { query: { slug: string }; body: Partial<ISubscription> },
  NextApiResponse
>(async function editSubscription(req, res) {
  const {
    query: { slug },
    body: sub
  } = req;

  const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ PUT /subscription/${slug} `;
  //logJson(prefix, sub);
  logJson(prefix);

  const session = await getSession({ req });

  if (!session) {
    return res
      .status(401)
      .json(createEndpointError(new Error("Vous devez être identifié")));
  }

  if (
    !equals(getRefId(sub.user, "_id"), session.user.userId) &&
    !session.user.isAdmin
  ) {
    return res
      .status(401)
      .json(
        createEndpointError(
          new Error(
            "Vous ne pouvez pas modifier l'abonnement d'une autre personne"
          )
        )
      );
  }

  try {
    let body = req.body;

    const sub = await models.Subscription.replaceOne({ _id: slug }, body);
    //const sub = await models.Subscription.findOneAndUpdate({ _id: slug }, body);

    res.status(200).json({});
  } catch (error) {
    res.status(500).json(createEndpointError(error));
  }
});

handler.delete<
  NextApiRequest & {
    query: { slug: string };
    body: {
      events?: IEventSubscription[];
      orgs?: IOrgSubscription[];
      orgId?: string;
      topicId?: string;
    };
  },
  NextApiResponse
>(async function removeSubscription(req, res) {
  const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ DELETE /subscription/[slug] `;
  console.log(prefix + "query", req.query);
  console.log(prefix + "body", req.body);

  const {
    query: { slug },
    body
  }: {
    query: { slug: string };
    body: {
      events?: IEventSubscription[];
      orgs?: IOrgSubscription[];
      orgId?: string;
      topicId?: string;
    };
  } = req;

  try {
    let subscription = await models.Subscription.findOne({
      _id: slug
    });

    if (!subscription) {
      return res
        .status(404)
        .json(
          createEndpointError(
            new Error(`L'abonnement ${slug} n'a pas pu être trouvé`)
          )
        );
    }

    if (Array.isArray(body.orgs) && body.orgs.length > 0) {
      const { orgId, type } = body.orgs[0];
      logJson(`DELETE /subscription/${slug}: orgId`, orgId);

      const org = await models.Org.findOne({ _id: orgId }).populate(
        "orgSubscriptions"
      );

      if (!org)
        return res
          .status(400)
          .json(
            createEndpointError(
              new Error(`L'atelier ${orgId} n'a pas pu être trouvé`)
            )
          );

      logJson(`DELETE /subscription/${slug}: subscription`, subscription);
      subscription.orgs = subscription.orgs?.filter(
        (orgSubscription: IOrgSubscription) => {
          let keep = true;
          if (
            equals(orgSubscription.orgId, orgId) &&
            orgSubscription.type === type
          ) {
            keep = false;
          }
          return keep;
        }
      );
      await subscription.save();
      logJson(`DELETE /subscription/${slug}: subscription saved`, subscription);

      return doDelete();
    }

    //#region remove subscription from org
    if (body.orgId) {
      let org = await models.Org.findOne({ _id: body.orgId });

      if (!org)
        return res
          .status(400)
          .json(
            createEndpointError(
              new Error(`L'atelier ${body.orgId} n'a pas pu être trouvé`)
            )
          );

      org = org.populate("orgSubscriptions");
      org = org.populate({
        path: "orgLists",
        populate: [{ path: "subscriptions" }]
      });
      org = await org.execPopulate();

      //log("> org.orgSubscriptions", org.orgSubscriptions);
      org.orgSubscriptions = org.orgSubscriptions.filter(
        ({ _id }) => !equals(_id, slug)
      );
      //log("> org.orgSubscriptions", org.orgSubscriptions);

      //log("> org.orgLists", org.orgLists);
      org.orgLists = org.orgLists.map((orgList) => ({
        listName: orgList.listName,
        subscriptions: orgList.subscriptions?.filter(
          ({ _id }) => !equals(_id, slug)
        )
      }));
      //log("> org.orgLists", org.orgLists);

      await org.save();

      //console.log("> subscription.orgs", subscription.orgs);
      subscription.orgs = subscription.orgs?.filter(
        (orgSubscription: IOrgSubscription) =>
          !equals(orgSubscription.orgId, body.orgId)
      );
      //console.log("> subscription.orgs", subscription.orgs);

      await subscription.save();

      return doDelete();
    }
    //#endregion

    if (Array.isArray(body.events) && body.events.length > 0) {
      const { eventId } = body.events[0];
      logJson(prefix + `eventId`, eventId);

      const event = await models.Event.findOne({ _id: eventId }).populate(
        "eventSubscriptions"
      );

      if (!event) {
        return res
          .status(404)
          .json(
            createEndpointError(
              new Error(`L'événement ${eventId} n'a pas pu être trouvé`)
            )
          );
      }

      logJson(prefix + `subscription`, subscription);
      subscription.events = subscription.events?.filter(
        (eventSubscription: IEventSubscription) => {
          let keep = true;
          if (equals(eventSubscription.eventId, eventId)) {
            keep = false;
          }
          return keep;
        }
      );
      await subscription.save();
      logJson(prefix + `subscription saved`, subscription);

      logJson(prefix + `event.eventSubscriptions`, event.eventSubscriptions);
      event.eventSubscriptions = event.eventSubscriptions.filter(
        (s) => !equals(s._id, subscription!._id)
      );
      await event.save();
      logJson(prefix + `event.eventSubscriptions`, event.eventSubscriptions);

      return res.status(200).json(subscription);
    }

    if (body.topicId) {
      subscription = await subscription
        .populate("topics", "topic")
        .execPopulate();

      logJson(`DELETE /subscription/${slug}: body.topicId`, body.topicId);
      logJson(`DELETE /subscription/${slug}: subscription`, subscription);

      subscription.topics = subscription.topics?.filter((topicSubscription) => {
        if (!topicSubscription.topic) return false;
        return !equals(topicSubscription.topic._id, body.topicId);
      });

      await subscription.save();
      logJson(`DELETE /subscription/${slug}: subscription saved`, subscription);

      return res.status(200).json(subscription);
    }

    if (subscription.events)
      for (const eventSubscription of subscription.events) {
        const event = await models.Event.findOne({
          _id: eventSubscription.eventId
        });
        if (!event) continue;
        event.eventSubscriptions = event.eventSubscriptions.filter(
          (subscription) => {
            let keep = true;
            if (
              subscription.events?.find((eventSubscription) =>
                equals(eventSubscription.eventId, event._id)
              )
            )
              keep = false;
            return keep;
          }
        );
        logJson(
          `DELETE /subscription/${subscription._id}: event.eventSubscriptions`,
          event.eventSubscriptions
        );
        await event.save();
      }

    if (subscription.orgs)
      for (const orgSubscription of subscription.orgs) {
        const org = await models.Org.findOne({ _id: orgSubscription.orgId });
        if (!org) continue;
        org.orgSubscriptions = org.orgSubscriptions.filter((subscription) => {
          let keep = true;
          if (
            subscription.orgs?.find((orgSubscription) =>
              equals(orgSubscription.orgId, org._id)
            )
          )
            keep = false;
          return keep;
        });
        logJson(
          `DELETE /subscription/${subscription._id}: org.orgSubscriptions`,
          org.orgSubscriptions
        );
        await org.save();
      }

    return doDelete();

    async function doDelete() {
      const { deletedCount } = await models.Subscription.deleteOne({
        _id: slug
      });

      if (deletedCount !== 1) {
        if (subscription) {
          subscription = await subscription
            .populate("user", "-password")
            .execPopulate();

          const email =
            typeof subscription.user === "object"
              ? subscription.user.email
              : subscription.email;

          return res
            .status(400)
            .json(
              createEndpointError(
                new Error(`L'abonnement de ${email} n'a pas pu être supprimé`)
              )
            );
        }
      }

      res.status(200).json(subscription);
    }
  } catch (error) {
    res.status(500).json(createEndpointError(error));
  }
});

export default handler;

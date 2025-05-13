import { addHours, getUnixTime } from "date-fns";
import { Document } from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { IUser } from "models/User";
import { getSession } from "server/auth";
import database, { models } from "server/database";
import { sendMail } from "server/email";
import { createUserPasswordResetMail, emailR } from "utils/email";
import {
  createEndpointError,
  databaseErrorCodes,
  duplicateError
} from "utils/errors";
import { logJson, normalize, phoneR } from "utils/string";
import { randomNumber } from "utils/randomNumber";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.use(database);

handler.get<
  NextApiRequest & {
    query: {
      slug: string;
      select?: string;
      populate?: string;
    };
  },
  NextApiResponse
>(async function getUser(req, res) {
  const {
    query: { slug, populate, ...query }
  } = req;
  const notFoundResponse = () =>
    res
      .status(404)
      .json(
        createEndpointError(
          new Error(`L'utilisateur ${slug} n'a pas pu être trouvé`)
        )
      );

  try {
    let select = req.query.select;
    const session = await getSession({ req });
    const isSelf =
      session?.user.isAdmin ||
      session?.user.email === slug ||
      session?.user.userName === slug ||
      session?.user.userId === slug;

    if (isSelf) {
      select = "+email +phone +userSubscription";
    } else if (select) select = "+" + select.replaceAll(" ", " +");

    let selector;
    if (emailR.test(slug)) {
      selector = { email: slug };
    } else if (phoneR.test(slug)) {
      selector = { phone: slug };
    }

    let user: (IUser & Document<any, IUser>) | null = null;
    if (selector) {
      user = await models.User.findOne(selector, select);
    } else {
      user = await models.User.findOne({ userName: slug }, select);
      if (!user) user = await models.User.findOne({ _id: slug }, select);
    }

    if (!user) return notFoundResponse();

    if (populate) {
      if (populate.includes("userProjects") && isSelf) {
        user = user.populate({
          path: "userProjects",
          populate: [{ path: "createdBy" }]
        });
        user = await user.execPopulate();
      }
    }

    res.status(200).json(user);
  } catch (error: any) {
    if (error.name === "CastError" && error.value === slug)
      return notFoundResponse();

    res.status(500).json(createEndpointError(error));
  }
});

handler.post<
  NextApiRequest & {
    query: {
      slug: string;
      select?: string;
      populate?: string;
    };
  },
  NextApiResponse
>(async function postResetPasswordMail(req, res) {
  const {
    query: { slug, ...query }
  } = req;
  const notFoundResponse = () =>
    res
      .status(404)
      .json(
        createEndpointError(
          new Error(`L'utilisateur ${slug} n'a pas pu être trouvé`)
        )
      );

  try {
    let select: string | undefined;
    let selector;

    if (emailR.test(slug)) {
      selector = { email: slug };
    }

    let user: (IUser & Document<any, IUser>) | null = null;

    if (selector) {
      user = await models.User.findOne(selector, select);
    }

    if (!user) return notFoundResponse();

    const securityCode = "" + getUnixTime(addHours(Date.now(), 2));
    const securityCodeSalt = "" + randomNumber(3);
    user = await models.User.findOneAndUpdate(selector, {
      securityCode,
      securityCodeSalt
    });

    const mail = createUserPasswordResetMail({
      email: slug,
      securityCode: "" + Number(securityCode) * Number(securityCodeSalt)
    });
    sendMail(mail);

    res.status(200).json({});
  } catch (error) {
    res.status(500).json(createEndpointError(error));
  }
});

handler.put<
  NextApiRequest & {
    query: { slug: string };
    body: IUser;
  },
  NextApiResponse
>(async function editUser(req, res) {
  const session = await getSession({ req });
  const {
    query: { slug },
    body
  }: {
    query: { slug: string };
    body: Partial<IUser>;
  } = req;

  if (!session && !body.password) {
    return res
      .status(401)
      .json(createEndpointError(new Error("Vous devez être identifié")));
  }

  try {
    if (body.password) {
      if (!body.passwordSalt)
        return res.status(400).json(createEndpointError(new Error("No salt")));

      const user = await models.User.findOneAndUpdate(
        { email: slug },
        { ...body, securityCode: null, securityCodeSalt: null }
      );

      return res.status(200).json(user);
    }

    if (body.userName) {
      body.userName = normalize(body.userName);
    }

    let selector: {
      _id?: string;
      email?: string;
      phone?: string;
      userName?: string;
    } = { userName: slug };

    if (emailR.test(slug)) {
      selector = { email: slug };
    } else if (phoneR.test(slug)) {
      selector = { phone: slug };
    }
    let user = await models.User.findOne(selector);

    if (!user) {
      selector = { _id: slug };
      user = await models.User.findOne(selector);

      if (!user) {
        return res
          .status(404)
          .json(
            createEndpointError(new Error(`L'utilisateur ${slug} n'existe pas`))
          );
      }
    }

    if (body.userName && body.userName !== user.userName) {
      const user = await models.User.findOne({ userName: body.userName });
      if (user) throw duplicateError();
    }

    logJson(`PUT /user/${slug}: selector`, selector);
    logJson(`PUT /user/${slug}: body`, body);
    user = await models.User.findOneAndUpdate(selector, body);

    if (!user) {
      return res
        .status(400)
        .json(
          createEndpointError(
            new Error(`L'utilisateur ${slug} n'a pas pu être modifié`)
          )
        );
    }

    res.status(200).json(user);
  } catch (error: any) {
    if (error.code && error.code === databaseErrorCodes.DUPLICATE_KEY) {
      res.status(400).json({
        userName: "Ce nom d'utilisateur n'est pas disponible"
      });
    } else {
      res.status(500).json(createEndpointError(error));
    }
  }
});

export default handler;

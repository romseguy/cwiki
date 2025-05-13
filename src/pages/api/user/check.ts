import { CheckSecurityCodePayload } from "features/api/usersApi";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { getSession } from "server/auth";
import database, { models } from "server/database";
import { emailR } from "utils/email";
import { createEndpointError } from "utils/errors";

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
>(async function checkPassword(req, res) {
  const session = await getSession({ req });

  if (session)
    return res
      .status(400)
      .json(createEndpointError(new Error("Vous êtes déjà identifié")));

  const {
    query: { ...query }
  } = req;
  console.log("🚀 ~ getUser ~ query:", query);

  // try {
  //   const userToken = {
  //     email: data.email,
  //     userId: user._id,
  //     userName: user.userName
  //   };

  //   const token = await seal(userToken, process.env.SECRET, sealOptions);
  //   setTokenCookie(res, token);
  // } catch (error) {}
});

handler.post<
  NextApiRequest & {
    body: CheckSecurityCodePayload;
  },
  NextApiResponse
>(async function checkSecurityCode(req, res) {
  const {
    body: { code, email, ...body }
  } = req;

  const notFoundResponse = () =>
    res
      .status(404)
      .json(
        createEndpointError(new Error(`L'utilisateur n'a pas pu être trouvé`))
      );

  if (!emailR.test(email)) {
    return res
      .status(400)
      .json(createEndpointError(new Error(`email invalide`)));
  }

  const user = await models.User.findOne(
    { email },
    "+securityCode +securityCodeSalt"
  );

  if (!user) {
    return notFoundResponse();
  }

  const { securityCode, securityCodeSalt } = user;

  if (!securityCode || !securityCodeSalt) {
    return res
      .status(400)
      .json(
        createEndpointError(
          new Error(
            `cet utilisateur n'a pas demandé à réinitialiser son mot de passe`
          )
        )
      );
  }

  if (Number(securityCode) * Number(securityCodeSalt) !== Number(code)) {
    return res
      .status(400)
      .json(createEndpointError(new Error(`code invalide`)));
  }

  res.status(200).json(true);
});

export default handler;

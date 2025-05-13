//import { Document } from "mongoose";
import nodemailer, { SendMailOptions as Mail } from "nodemailer";
import { models } from "server/database";
//import api from "utils/api";
import { Session } from "utils/auth";
import { getEnv } from "utils/env";
//import { equals, logJson } from "utils/string";

export const sendMail = async (mail: Mail, session?: Session | null) => {
  try {
    const server = {
      pool: true,
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // use TLS
      auth: {
        user: "rom.seguy@lilo.org",
        pass: process.env.NEXT_PUBLIC_EMAIL_API_KEY // TODO
      }
    };

    if (getEnv() === "production") {
      const transport = nodemailer.createTransport(server);
      await transport.sendMail(mail);
    }

    console.log(`sent notif to ${mail.to}`, mail);

    if (session)
      await models.User.updateOne(
        { userId: session.user.userId },
        { emailCount: "increment" }
      );
  } catch (error: any) {
    console.log("api/email/sendMail error");
    console.error(error);

    if (getEnv() === "development") {
      if (error.command === "CONN") {
        console.log(`sent email to ${mail.to}`, mail);

        if (session)
          await models.User.updateOne(
            { userId: session.user.userId },
            { emailCount: "increment" }
          );
      }
    } else throw error;
  }
};

export const mainBackgroundColor = "#dcd0ff";
export const textColor = "#444444";
export const backgroundColor = "#e6e6fa";
const descriptionBackgroundColor = "#f9f9f9";
const buttonBackgroundColor = "#346df1";
const buttonBorderColor = "#346df1";
const buttonTextColor = "#ffffff";

const linkStyle = (bold?: boolean) =>
  `text-decoration: underline; color: #15c; ${
    bold ? "font-weight: bold;" : ""
  }`;

const title = `
  <a
    href="${process.env.NEXT_PUBLIC_URL}"
    style="${linkStyle(true)}"
  >
    ${process.env.NEXT_PUBLIC_SHORT_URL}
  </a>
`;

export const emailR = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const createUserPasswordResetMail = ({
  email,
  securityCode
}: {
  email: string;
  securityCode: string;
}) => {
  const resetLink = `${process.env.NEXT_PUBLIC_URL}/reset/${email}?code=${securityCode}`;

  return {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Réinitialiser votre mot de passe`,
    html: `
      <body style="background: ${backgroundColor};">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tbody>
            <tr>
              <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                <strong>${process.env.NEXT_PUBLIC_SHORT_URL}</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
          <tr>
            <td align="center" style="padding: 0px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
              <p><a href="${resetLink}">Cliquez sur ce lien pour définir un nouveau mot de passe</a></p>
              <p>Ou copiez-collez le dans votre navigateur : ${resetLink}</p>
              <p>Ce lien est valide 2h.</p>
            </td>
          </tr>
        </table>
      </body>
      `
  };
};

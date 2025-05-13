import { Layout } from "features/layout";
import { NextPageContext } from "next";
import { PageProps } from "./_app";

function Error({
  statusCode,
  message,
  ...props
}: PageProps & {
  statusCode: number;
  message: string;
}) {
  return (
    <Layout pageTitle="Erreur" {...props}>
      {/* {`Une erreur ${
        statusCode ? `(${statusCode})` : ""
      } est survenue : ${message}`} */}
      {`An error ${statusCode ? `(${statusCode})` : ""} occurred : ${message}`}
    </Layout>
  );
}

Error.getInitialProps = (ctx: NextPageContext) => {
  const { res, err } = ctx;
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  const message = err
    ? err.message
    : statusCode === 404
      ? // ? "la page n'a pas été trouvée"
        // : "aucun message d'erreur";
        "the page could not be found"
      : "no error message";
  return { statusCode, message };
};

export default Error;

import { Link } from "features/common";
import { Layout } from "features/layout";
import { useSession } from "hooks/useSession";
import { PageProps } from "./_app";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const IndexPage = (props: PageProps) => {
  const { data: session } = useSession();
  const { t } = useTranslation("common");

  return (
    <Layout pageTitle="Home" {...props}>
      {session ? (
        <>
          <h1>{t("test")}</h1>
          <ul>
            <li>
              <a href={`${session.user.userName}/1`}>1</a>
            </li>
            <li>
              <a href={`${session.user.userName}/2`}>2</a>
            </li>
          </ul>
        </>
      ) : (
        <>
          <Link href="/login" variant="underline">
            Log in
          </Link>{" "}
          to see your trees.
        </>
      )}
    </Layout>
  );
};

// or getServerSideProps: GetServerSideProps<Props> = async ({ locale })
export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"]))
  }
});

export default IndexPage;

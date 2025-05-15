import { VStack } from "@chakra-ui/react";
import { useGetOrgsQuery } from "features/api/orgsApi";
import { EntityButton, Link } from "features/common";
import { Layout } from "features/layout";
import theme from "features/layout/theme";
import { useSession } from "hooks/useSession";
import { EOrgType } from "models/Org";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { PageProps } from "./_app";

const IndexPage = (props: PageProps) => {
  const { data: session } = useSession();
  const { t } = useTranslation("common");
  const orgsQuery = useGetOrgsQuery({ orgType: EOrgType.NETWORK });

  return (
    <Layout pageTitle="Home" {...props}>
      {/* {session ? ( */}
      <>
        <h1>{t("home-list")}</h1>
        <VStack alignItems="start">
          {orgsQuery.data?.map((org) => {
            return <EntityButton key={org._id} org={org} />;
          })}
        </VStack>
      </>
      {/*  ) : (
         <>
           <Link href="/login" variant="underline">
             Log in
           </Link>{" "}
           to see your trees.
         </>
       )} */}
    </Layout>
  );
};

// or getServerSideProps: GetServerSideProps<Props> = async ({ locale })
export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"]))
  }
});

export default IndexPage;

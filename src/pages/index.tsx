import { VStack } from "@chakra-ui/react";
import { useGetOrgsQuery } from "features/api/orgsApi";
import { AppHeading, EntityButton, Link } from "features/common";
import { EntityAddButton } from "features/common/entities/EntityAddButton";
import { Layout } from "features/layout";
import theme from "features/layout/theme";
import { useSession } from "hooks/useSession";
import { EOrgType } from "models/Org";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useState } from "react";
import api from "utils/api";
import { hasItems } from "utils/array";
import { PageProps } from "./_app";

const IndexPage = (props: PageProps) => {
  const { data: session } = useSession();
  const { t } = useTranslation("common");
  const orgsQuery = useGetOrgsQuery({ orgType: EOrgType.NETWORK });

  return (
    <Layout pageTitle={t("home")} {...props}>
      {/* {session ? ( */}
      <VStack>
        <AppHeading>Welcome to CassWiki</AppHeading>
        <AppHeading smaller>{t("home-list")}</AppHeading>
        <VStack alignItems="start">
          {!hasItems(orgsQuery.data) && (
            <EntityAddButton orgType={EOrgType.NETWORK} />
          )}
          {hasItems(orgsQuery.data) &&
            orgsQuery.data?.map((org) => {
              return <EntityButton key={org._id} org={org} />;
            })}
        </VStack>
      </VStack>
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

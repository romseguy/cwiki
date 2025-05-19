import { HStack, Spinner, VStack } from "@chakra-ui/react";
import { useGetOrgsQuery } from "features/api/orgsApi";
import { AppHeading, EntityButton } from "features/common";
import { EntityAddButton } from "features/common/entities/EntityAddButton";
import { Layout } from "features/layout";
import { EOrgType } from "models/Org";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import { hasItems } from "utils/array";
import { PageProps } from "./_app";

const IndexPage = (props: PageProps) => {
  const { t } = useTranslation();
  const orgsQuery = useGetOrgsQuery({ orgType: EOrgType.NETWORK });
  const orgs = orgsQuery.data || [];
  // ?.concat([
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0],
  //   orgsQuery.data[0]
  // ]);
  // let rows = [];
  // for (let i = 0; i <= orgs.length; ++i) {
  //   if (i % 3 === 0) rows.push([orgs[i], orgs[i + 1], orgs[i + 2]]);
  //   ++i;
  // }
  // console.log("🚀 ~ IndexPage ~ components:", rows);

  return (
    <Layout pageTitle={t("home")} {...props}>
      <VStack>
        <AppHeading>{t("welcome")}</AppHeading>
        <AppHeading smaller>{t("home-list")}</AppHeading>
        <VStack alignItems="start">
          {orgsQuery.isLoading && <Spinner />}
          {!orgsQuery.isLoading && !hasItems(orgs) && (
            <EntityAddButton orgType={EOrgType.NETWORK} label={t("add-a")} />
          )}
          {!orgsQuery.isLoading &&
            hasItems(orgs) &&
            orgs.map((org) => {
              return (
                <HStack key={org._id}>
                  <EntityButton org={org} />
                </HStack>
              );
            })}
        </VStack>
      </VStack>
    </Layout>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"]))
  }
});

export default IndexPage;

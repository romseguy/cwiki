import { HStack, VStack } from "@chakra-ui/react";
import { useGetOrgsQuery } from "features/api/orgsApi";
import { AppHeading, EntityButton, Link } from "features/common";
import { EntityAddButton } from "features/common/entities/EntityAddButton";
import { Layout } from "features/layout";
import theme from "features/layout/theme";
import { useSession } from "hooks/useSession";
import { EOrgType } from "models/Org";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect, useState } from "react";
import api from "utils/api";
import { hasItems } from "utils/array";
import { PageProps } from "./_app";

const IndexPage = (props: PageProps) => {
  const { data: session } = useSession();
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
  let rows = [];
  for (let i = 0; i <= orgs.length; ++i) {
    if (i % 3 === 0) rows.push([orgs[i], orgs[i + 1], orgs[i + 2]]);
    ++i;
  }
  console.log("🚀 ~ IndexPage ~ components:", rows);

  return (
    <Layout pageTitle={t("home")} {...props}>
      {/* {session ? ( */}
      <VStack>
        <AppHeading>{t("welcome")}</AppHeading>
        <AppHeading smaller>{t("home-list")}</AppHeading>
        <VStack alignItems="start">
          {!hasItems(orgs) && (
            <EntityAddButton orgType={EOrgType.NETWORK} label={t("add-a")} />
          )}
          {hasItems(orgs) &&
            rows.map((row) => {
              return (
                <HStack>
                  {row.map((org) => (
                    <EntityButton org={org} />
                  ))}
                </HStack>
              );
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

import {
  AddOrgPayload,
  EditOrgPayload,
  useAddOrgMutation,
  useEditOrgMutation,
  useGetOrgQuery
} from "features/api/orgsApi";
import Creatable from "react-select/creatable";
import { Layout } from "features/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { localize } from "utils/localize";
import { useState } from "react";
import { EOrgType } from "models/Org";
import { useTranslation } from "next-i18next";
import { useToast } from "hooks/useToast";
import { css } from "@emotion/react";
import { FormLabel, VStack } from "@chakra-ui/react";
import { AddBranchForm } from "features/forms/AddBranchForm";
import { AppHeading, EntityButton } from "features/common";

const AddBranchPage = ({ ...props }) => {
  const { t } = useTranslation();
  const router = useRouter();
  let [entityUrl] =
    "treeName" in router.query && Array.isArray(router.query.treeName)
      ? router.query.treeName
      : [];
  const query = useGetOrgQuery({
    orgUrl: entityUrl,
    populate: "orgs"
  });
  const org = query.data;

  return (
    <Layout
      pageTitle={
        org ? `Tree : ${localize(org.orgName, router.locale)}` : undefined
      }
      org={org}
      {...props}
    >
      <VStack p={3}>
        <EntityButton org={org} />
        <AppHeading smaller>{t("add-b")}</AppHeading>
        <AddBranchForm
          onSubmit={() => {
            const href = `/a/${org.orgUrl}`;
            router.push(href, href, { shallow: true });
          }}
        />
      </VStack>
    </Layout>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"]))
  }
});

export default AddBranchPage;

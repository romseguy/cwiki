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
import { FormLabel } from "@chakra-ui/react";

const AddBranchPage = ({ ...props }) => {
  const { t } = useTranslation();
  const toast = useToast({ position: "top" });
  const router = useRouter();
  let [entityUrl] =
    "treeName" in router.query && Array.isArray(router.query.treeName)
      ? router.query.treeName
      : [];
  const [addOrg] = useAddOrgMutation();
  const [editOrg] = useEditOrgMutation();
  const query = useGetOrgQuery({
    orgUrl: entityUrl,
    populate: "orgs"
  });
  const org = query.data;
  const [value, setValue] = useState();
  return (
    <Layout
      pageTitle={
        org ? `Tree : ${localize(org.orgName, router.locale)}` : undefined
      }
      {...props}
    >
      <FormLabel>{t("name-label-b")}</FormLabel>
      {/* {query.isLoading && <Spinner />} */}
      {!!org && (
        <Creatable
          css={css`
            div[role="button"] {
              display: none;
            }
          `}
          value={org.orgs.map(({ _id, orgName }) => ({
            label: orgName.en,
            value: _id
          }))}
          isMulti
          options={[]}
          onChange={(options, { action, option }) => {
            console.log("🚀 ~ AddBranchPage ~ action:", action);
            if (action === "select-option") {
              setValue(option.value);
            }
          }}
          onCreateOption={async (orgName: string) => {
            try {
              const payload: AddOrgPayload = {
                orgName: { en: orgName },
                orgType: EOrgType.GENERIC
              };
              const { _id } = await addOrg(payload).unwrap();

              const payload2: EditOrgPayload = {
                orgs: org.orgs.concat([{ _id }])
              };
              await editOrg({ payload: payload2, org }).unwrap();
              toast({ status: "success", title: t("success") });
              router.push(`/a/${entityUrl}`, `/a/${entityUrl}`, {
                shallow: true
              });
            } catch (error) {
              toast({ status: "error", title: t("error") });
            }
          }}
        />
      )}
    </Layout>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"]))
  }
});

export default AddBranchPage;

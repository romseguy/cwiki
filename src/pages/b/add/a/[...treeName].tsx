import { ArrowBackIcon } from "@chakra-ui/icons";
import { Button, Spinner, VStack } from "@chakra-ui/react";
import { useGetOrgQuery } from "features/api/orgsApi";
import { AppHeading } from "features/common";
import { AddBranchForm } from "features/forms/AddBranchForm";
import { Layout } from "features/layout";
import { useSession } from "hooks/useSession";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";
import { useEffect } from "react";
import { FaTree } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectIsSessionLoading } from "store/sessionSlice";
import { localize } from "utils/localize";

const AddBranchPage = ({ ...props }: PageProps) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const isSessionLoading = useSelector(selectIsSessionLoading);

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
  console.log("🚀 ~ AddBranchPage ~ org:", org);

  useEffect(() => {
    if (!isSessionLoading) {
      if (!session) {
        window.localStorage.setItem("path", router.asPath);
        router.push("/login", "/login", { shallow: true });
      } /*else if (!session.user.isAdmin) {
        throw new Error(
          "Vous devez être administrateur pour ajouter un événement"
        );
      }*/
    }
  }, [session, isSessionLoading]);
  if (!session) return null;

  return (
    <Layout
      pageTitle={
        org ? `Tree : ${localize(org.orgName, router.locale)}` : undefined
      }
      org={org}
      {...props}
    >
      {query.isLoading && <Spinner />}
      {!query.isLoading && (
        <VStack p={3}>
          <Button
            leftIcon={
              <>
                <ArrowBackIcon />
                <FaTree />
              </>
            }
            onClick={() => {
              const href = "/a/" + org.orgUrl;
              router.push(href, href, { shallow: true });
            }}
          >
            {localize(org.orgName, router.locale)}
          </Button>
          <AppHeading smaller>{t("add-b")}</AppHeading>
          <AddBranchForm
            onSubmit={() => {
              const href = `/a/${org.orgUrl}`;
              router.push(href, href, { shallow: true });
            }}
          />
        </VStack>
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

import { Flex, HStack, VStack } from "@chakra-ui/react";
import { useGetOrgQuery } from "features/api/orgsApi";
import { EntityButton } from "features/common";
import { Layout } from "features/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";

const TreePage = ({ ...props }: PageProps) => {
  const router = useRouter();
  let [
    entityUrl
    //currentTabLabel = Object.keys(defaultTabs)[0],
    //entityTabItem
  ] =
    "treeName" in router.query && Array.isArray(router.query.treeName)
      ? router.query.treeName
      : [];
  const { data: org } = useGetOrgQuery({ orgUrl: entityUrl });

  return (
    <Layout {...props}>
      <VStack>
        <EntityButton org={org} />
      </VStack>
    </Layout>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"]))
  }
});

export default TreePage;

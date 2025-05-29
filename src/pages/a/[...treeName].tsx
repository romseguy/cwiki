import {
  ArrowBackIcon,
  ChevronRightIcon,
  ChevronUpIcon
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  Heading,
  Icon,
  Spinner,
  Text,
  VStack,
  Flex
} from "@chakra-ui/react";
import { getRunningQueriesThunk } from "features/api";
import {
  DeleteOrgParams,
  EditOrgPayload,
  getOrg,
  useDeleteOrgMutation,
  useEditOrgMutation,
  useGetOrgQuery
} from "features/api/orgsApi";
import {
  DeleteButton,
  DeleteIconButton,
  EntityAddButton,
  EntityButton,
  Link
} from "features/common";
import { EditIconButton } from "features/common/EditIconButton";
import {
  TabContainer,
  TabContainerContent,
  TabContainerHeader
} from "features/common/TabContainer";
import { Layout } from "features/layout";
import { useSession } from "hooks/useSession";
import { useToast } from "hooks/useToast";
import { getRefId } from "models/Entity";
import { EOrgType, IOrg } from "models/Org";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";
import { useEffect, useState } from "react";
import { FaTree } from "react-icons/fa";
import { wrapper } from "store";
import { hasItems } from "utils/array";
import { localize } from "utils/localize";
import { MD_URL, WIKI_URL, normalize } from "utils/string";
import { DescriptionContainer } from "features/org/DescriptionContainer";
import { NotesContainer } from "features/org/NotesContainer";
import { EditForm } from "features/org/EditForm";
import { AppQuery } from "utils/types";
import { formatStringToWikiUrl } from "utils/string/case";

const initialOrgQueryParams = (treeUrl: string) => ({
  orgUrl: treeUrl,
  populate: "orgs orgNotes"
});

const TreePage = ({ isMobile, ...props }: PageProps) => {
  const { data: session } = useSession();
  const toast = useToast({ position: "top" });
  const [deleteOrg] = useDeleteOrgMutation();
  const [editOrg] = useEditOrgMutation();
  const { t } = useTranslation();
  const router = useRouter();
  const routerQ = router.query.treeName || [];
  const [currentTreeAction, setCurrentTreeAction] = useState("");
  const [currentBranchAction, setCurrentBranchAction] = useState("");
  const [currentBranchName, setCurrentBranchName] = useState("");

  const [isBranchesOpen, setIsBranchesOpen] = useState(true);

  const query = useGetOrgQuery(initialOrgQueryParams(routerQ[0]));
  const org = query.data;
  const isCreator = getRefId(org) === session?.user.userId;
  let suborg = org?.orgs?.find(({ orgUrl }) => orgUrl === currentBranchName);

  useEffect(() => {
    setCurrentTreeAction(routerQ[1]);
    setCurrentBranchName(routerQ[2]);
    setCurrentBranchAction(routerQ[3]);
    if (!currentBranchName) {
      suborg = undefined;
    }
  }, [router.query]);

  return (
    <Layout
      isMobile={isMobile}
      pageTitle={
        suborg
          ? `${t("label-b")}: ${localize(suborg.orgName, router.locale)}`
          : org
          ? `${t("label-a")}: ${localize(org.orgName, router.locale)}`
          : undefined
      }
      org={org}
      suborg={suborg}
      {...props}
    >
      <Box m={3}>
        {query.isLoading && <Spinner />}
        {!query.isLoading && org && (
          <>
            <VStack mb={3}>
              <HStack>
                <VStack>
                  {(suborg || currentTreeAction === "edit") && (
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
                  )}

                  <Flex
                    alignItems="center"
                    {...(isMobile ? { flexDirection: "column" } : {})}
                  >
                    {currentTreeAction !== "edit" && (
                      <EntityButton org={org} suborg={suborg} />
                    )}

                    {currentTreeAction !== "edit" && isCreator && (
                      <HStack {...(isMobile ? { mt: 3 } : { ml: 3 })}>
                        <EditIconButton
                          placement="bottom"
                          onClick={() => {
                            const href = suborg
                              ? "/a/" +
                                org.orgUrl +
                                "/b/" +
                                suborg.orgUrl +
                                "/edit"
                              : "/a/" + org.orgUrl + "/edit";
                            router.push(href, href, { shallow: true });
                          }}
                        />
                        <DeleteIconButton
                          label={t("delete")}
                          placement="right"
                          onClick={async () => {
                            try {
                              const params: DeleteOrgParams = {
                                orgId: org._id
                              };
                              await deleteOrg(params).unwrap();
                              toast({
                                status: "success",
                                title: t("success")
                              });
                              router.push("/", "/", { shallow: true });
                            } catch (error) {
                              toast({ status: "error", title: t("error") });
                            }
                          }}
                        />
                      </HStack>
                    )}
                  </Flex>
                </VStack>
              </HStack>

              {currentTreeAction !== "edit" && (
                <>
                  <Link
                    href={
                      suborg
                        ? WIKI_URL + "/" + org.orgUrl + "/" + suborg.orgUrl
                        : WIKI_URL + "/" + org.orgUrl + "/" + org.orgUrl
                    }
                    target="_blank"
                  >
                    {t("wiki")}
                  </Link>
                  <Link
                    href={
                      suborg
                        ? MD_URL + "/" + org.orgUrl + "/" + suborg.orgUrl
                        : MD_URL + "/" + org.orgUrl + "/" + org.orgUrl + ".md"
                    }
                    target="_blank"
                  >
                    {t("md")}
                  </Link>
                </>
              )}
            </VStack>

            {currentTreeAction !== "edit" && currentBranchAction !== "edit" && (
              <>
                <DescriptionContainer
                  currentTabLabel={currentTreeAction}
                  isCreator={isCreator}
                  org={org}
                  suborg={suborg}
                />

                {!suborg && (
                  <TabContainer
                    borderBottomRadius={isBranchesOpen ? undefined : "lg"}
                  >
                    <TabContainerHeader
                      borderBottomRadius={isBranchesOpen ? undefined : "lg"}
                      onClick={() => setIsBranchesOpen(!isBranchesOpen)}
                    >
                      <Icon
                        as={isBranchesOpen ? ChevronUpIcon : ChevronRightIcon}
                        boxSize={6}
                        ml={3}
                        mr={1}
                      />
                      <Heading size="sm">{t("branches")}</Heading>
                    </TabContainerHeader>
                    {isBranchesOpen && (
                      <TabContainerContent p={3}>
                        <VStack alignItems="start">
                          {hasItems(org.orgs) &&
                            org.orgs.map((suborg) => {
                              return (
                                <HStack key={suborg._id}>
                                  <EntityButton
                                    org={org}
                                    suborg={suborg}
                                    tooltipProps={{
                                      label: "Visiter la branche"
                                    }}
                                  />
                                  {isCreator && (
                                    <DeleteButton
                                      isIconOnly
                                      placement="right"
                                      onClick={async () => {
                                        try {
                                          const payload: EditOrgPayload = {
                                            orgs: org.orgs.filter(
                                              ({ _id }) => suborg?._id !== _id
                                            )
                                          };
                                          await editOrg({
                                            payload,
                                            org
                                          }).unwrap();

                                          const payload2: DeleteOrgParams = {
                                            orgId: suborg?._id
                                          };
                                          await deleteOrg(payload2).unwrap();
                                          query.refetch();
                                          toast({
                                            status: t("success"),
                                            title: t("success")
                                          });
                                        } catch (error) {
                                          toast({
                                            status: t("error"),
                                            title: t("error")
                                          });
                                        }
                                      }}
                                    />
                                  )}
                                </HStack>
                              );
                            })}

                          {!hasItems(org.orgs) && isCreator && (
                            <EntityAddButton
                              org={org}
                              orgType={EOrgType.GENERIC}
                            />
                          )}
                          {!hasItems(org.orgs) && !isCreator && (
                            <Text fontStyle="italic">
                              Aucune branches.{" "}
                              {!session && (
                                <>
                                  <Link href="/login" variant="underline">
                                    Connectez-vous
                                  </Link>{" "}
                                  pour en ajouter une.
                                </>
                              )}
                            </Text>
                          )}
                        </VStack>
                      </TabContainerContent>
                    )}
                  </TabContainer>
                )}

                <NotesContainer
                  org={org}
                  suborg={suborg}
                  isCreator={isCreator}
                  isLoading={query.isLoading}
                />
              </>
            )}

            {(currentTreeAction === "edit" ||
              currentBranchAction === "edit") && (
              <EditForm org={org} suborg={suborg} />
            )}
          </>
        )}
        {!query.isLoading && !org && <>{t("not-found-a")}</>}
      </Box>
    </Layout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (ctx) => {
    const { locale, query } = ctx;
    console.log("🚀 ~ query:", query);
    let treeName = "";
    let branchName = "";
    let normalizedTreeName = "";
    let normalizedBranchName = "";

    if (Array.isArray(query.treeName)) {
      treeName = query.treeName[0];
      branchName = query.treeName[1];
    }

    console.log("🚀 ~ treeName:", treeName);
    console.log("🚀 ~ branchName:", branchName);

    if (treeName && typeof treeName === "string") {
      normalizedTreeName = normalize(treeName);
      if (treeName.toLowerCase() !== normalizedTreeName.toLowerCase()) {
        return {
          redirect: {
            permanent: false,
            destination: "/" + normalizedTreeName
          }
        };
      }
      store.dispatch(
        getOrg.initiate(initialOrgQueryParams(normalizedTreeName))
      );

      const [orgQuery] = await Promise.all<[AppQuery<IOrg>]>(
        //@ts-expect-error
        store.dispatch(getRunningQueriesThunk())
      );

      if (orgQuery.error && orgQuery.error.status === 404) {
        return {
          redirect: {
            permanent: false,
            destination:
              WIKI_URL +
              "/" +
              formatStringToWikiUrl(treeName) +
              "/" +
              formatStringToWikiUrl(branchName)
          }
        };
      }
    }

    if (branchName && typeof branchName === "string") {
      normalizedBranchName = normalize(branchName);
      if (
        branchName &&
        branchName.toLowerCase() !== normalizedBranchName.toLowerCase()
      ) {
        return {
          redirect: {
            permanent: false,
            destination: "/" + normalizedTreeName + "/" + normalizedBranchName
          }
        };
      }
      store.dispatch(
        getOrg.initiate(initialOrgQueryParams(normalizedBranchName))
      );

      const [orgQuery] = await Promise.all<[AppQuery<IOrg>]>(
        //@ts-expect-error
        store.dispatch(getRunningQueriesThunk())
      );

      if (orgQuery.error && orgQuery.error.status === 404) {
        return {
          redirect: {
            permanent: false,
            destination:
              WIKI_URL +
              "/" +
              formatStringToWikiUrl(treeName) +
              "/" +
              formatStringToWikiUrl(branchName)
          }
        };
      }
    }

    return {
      props: {
        ...(await serverSideTranslations(locale ?? "en", ["common"]))
      }
    };
  }
);

export default TreePage;

{
  // const [isThreadsOpen, setIsThreadsOpen] = useState(true);
  // const [currentTopicName, setCurrentTopicName] = useState(entityTabItem);
  /* <TabContainer >
            <TabContainerHeader
              borderBottomRadius={isThreadsOpen ? undefined : "lg"}
              onClick={() => setIsThreadsOpen(!isThreadsOpen)}
            >
              <Icon
                as={isThreadsOpen ? ChevronUpIcon : ChevronRightIcon}
                boxSize={6}
                ml={3}
                mr={1}
              />
              <Heading size="sm">{t("threads")}</Heading>
            </TabContainerHeader>

            {isThreadsOpen && (
              <TabContainerContent p={3}>
                {query.data && (
                  <TopicsList
                    addButtonLabel={t("add-t")}
                    currentTopicName={currentTopicName}
                    isCreator
                    isFollowed
                    query={query}
                    subQuery={subQuery}
                  />
                )}
              </TabContainerContent>
            )}
          </TabContainer> */
}

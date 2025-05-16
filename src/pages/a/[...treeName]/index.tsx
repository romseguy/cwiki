import { marked, MarkedOptions } from "marked";
import {
  ChevronRightIcon,
  ChevronUpIcon,
  SmallAddIcon
} from "@chakra-ui/icons";
import {
  Button,
  Heading,
  Icon,
  IconButton,
  Spinner,
  Tooltip,
  VStack
} from "@chakra-ui/react";
import {
  EditOrgPayload,
  useEditOrgMutation,
  useGetOrgQuery
} from "features/api/orgsApi";
import { useGetSubscriptionQuery } from "features/api/subscriptionsApi";
import { EntityAddButton, EntityButton, Link, RTEditor } from "features/common";
import { EditIconButton } from "features/common/EditIconButton";
import {
  TabContainer,
  TabContainerContent,
  TabContainerHeader
} from "features/common/TabContainer";
import { TopicsList } from "features/forum/TopicsList";
import { Layout } from "features/layout";
import { useToast } from "hooks/useToast";
import { sanitize } from "isomorphic-dompurify";
import { EOrgType, orgTypeFull, orgTypeFull2 } from "models/Org";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { FaNewspaper } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectUserEmail } from "store/userSlice";
import {
  capitalize,
  MD_URL,
  transformRTEditorOutput,
  WIKI_URL
} from "utils/string";
import { localize } from "utils/localize";
import { hasItems } from "utils/array";

const TreePage = ({ ...props }: PageProps) => {
  const { t } = useTranslation();
  const toast = useToast({ position: "top" });
  const router = useRouter();
  console.log("🚀 ~ TreePage ~ router:", router.query.treeName);
  let [
    entityUrl,
    currentTabLabel, // = Object.keys(defaultTabs)[0],
    entityTabItem
  ] = router.query.treeName;
  const [isBranch, setIsBranch] = useState(
    currentTabLabel === "b" && !!entityTabItem
  );
  console.log("🚀 ~ TreePage ~ isBranch:", isBranch);

  const query = useGetOrgQuery({
    orgUrl: entityUrl,
    populate: "orgs orgTopics"
  });
  const [editOrg] = useEditOrgMutation();
  const org = query.data;
  const suborg = org?.orgs.find(({ orgUrl }) => orgUrl === entityTabItem);
  let orgDescription = org?.orgDescription || { en: "", fr: "" };
  //const orgDescription = org?.orgDescription;
  const email = useSelector(selectUserEmail);
  const subQuery = useGetSubscriptionQuery({ email });

  const [description, setDescription] = useState<string | undefined>(
    org?.orgDescription
  );
  useEffect(() => {
    if (org) {
      //if (!orgDescription) return setDescription(undefined);
      const newDoc = isMobile
        ? transformRTEditorOutput(orgDescription[router.locale])
        : new DOMParser().parseFromString(
            orgDescription[router.locale],
            "text/html"
          );
      const newDescription = newDoc.body.innerHTML;
      if (description !== newDescription) setDescription(newDescription);
    }
  }, [org, router.locale]);

  const [isAddingDescription, setIsAddingDescription] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(
    currentTabLabel !== "t"
  );
  const [isBranchesOpen, setIsBranchesOpen] = useState(true);
  const [isThreadsOpen, setIsThreadsOpen] = useState(true);

  const [currentTopicName, setCurrentTopicName] = useState(entityTabItem);
  useEffect(() => {
    console.log("🚀 ~ TreePage ~ entityTabItem:", entityTabItem);
    setIsBranch(router.asPath.includes("/b/"));

    if (currentTabLabel === "t") setCurrentTopicName(entityTabItem);
    else if (currentTabLabel === "b") {
      console.log("🚀 ~ useEffect ~ currentTabLabel:", entityTabItem);
    }
  }, [entityTabItem]);

  return (
    <Layout
      pageTitle={
        org ? `Tree : ${localize(org.orgName, router.locale)}` : undefined
      }
      {...props}
    >
      {query.isLoading && <Spinner />}
      {!query.isLoading && (
        <>
          <VStack mb={3}>
            <EntityButton org={org} suborg={suborg} />
            <Link
              href={
                suborg
                  ? "/"
                  : WIKI_URL +
                    "/" +
                    capitalize(org.orgName.en) +
                    "/" +
                    capitalize(org.orgName.en)
              }
              target="_blank"
            >
              {t("wiki")}
            </Link>
            <Link
              href={
                suborg
                  ? "/"
                  : MD_URL +
                    "/" +
                    capitalize(org.orgName.en) +
                    "/" +
                    capitalize(org.orgName.en) +
                    ".md"
              }
              target="_blank"
            >
              {t("md")}
            </Link>
          </VStack>

          <TabContainer
            borderBottomRadius={isDescriptionOpen ? undefined : "lg"}
          >
            <TabContainerHeader
              borderBottomRadius={isDescriptionOpen ? undefined : "lg"}
              onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            >
              <Icon
                as={isDescriptionOpen ? ChevronUpIcon : ChevronRightIcon}
                boxSize={6}
                ml={3}
                mr={1}
              />
              <Heading size="sm">{t("desc-a")}</Heading>

              {org?.orgDescription && (
                <Tooltip
                  hasArrow
                  label="Modifier la description"
                  placement="bottom"
                >
                  <span>
                    <EditIconButton
                      aria-label="Modifier"
                      ml={3}
                      {...(isMobile ? {} : {})}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAddingDescription(true);
                      }}
                    />
                  </span>
                </Tooltip>
              )}
            </TabContainerHeader>

            {isDescriptionOpen && (
              <TabContainerContent
                //bg={isDark ? "gray.600" : "#F7FAFC"}
                p={3}
              >
                {isAddingDescription ? (
                  <>
                    <RTEditor
                      defaultValue={orgDescription[router.locale]}
                      onChange={({ html }) => {
                        setDescription(html);
                      }}
                    />
                    <Button
                      onClick={async () => {
                        setIsAddingDescription(false);
                        const payload: EditOrgPayload = {
                          orgDescription: {
                            fr:
                              !org.orgDescription || !org.orgDescription.fr
                                ? description
                                : orgDescription.fr,
                            en:
                              !org.orgDescription || !org.orgDescription.en
                                ? description
                                : orgDescription.en
                          }
                        };
                        await editOrg({ payload, org }).unwrap();
                        toast({ title: "Success" });
                      }}
                    >
                      {t("submit")}
                    </Button>
                  </>
                ) : description && description.length > 0 ? (
                  <div
                    className="rteditor"
                    dangerouslySetInnerHTML={{
                      __html: sanitize(description)
                    }}
                  />
                ) : true ? (
                  <Tooltip
                    placement="right"
                    label={`Ajouter une présentation ${orgTypeFull2(
                      org?.orgType
                    )}`}
                  >
                    <IconButton
                      aria-label={`Ajouter une présentation ${orgTypeFull2(
                        org?.orgType
                      )}`}
                      alignSelf="flex-start"
                      colorScheme="teal"
                      icon={
                        <>
                          <SmallAddIcon />
                          <FaNewspaper />
                        </>
                      }
                      pr={1}
                      onClick={() => setIsAddingDescription(true)}
                    />
                  </Tooltip>
                ) : (
                  <Text fontStyle="italic">Aucune description.</Text>
                )}
              </TabContainerContent>
            )}
          </TabContainer>

          {!isBranch && (
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
                  <VStack>
                    {hasItems(org.orgs) && org.orgs.map((suborg) => {
                      return <EntityButton org={org} suborg={suborg} />;
                    })}
                    {!hasItems(org.orgs)} && (
                    <EntityAddButton org={org} orgType={EOrgType.GENERIC}/>
                    )}
                  </VStack>
                </TabContainerContent>
              )}
            </TabContainer>
          )}

          <TabContainer borderBottomRadius={isThreadsOpen ? undefined : "lg"}>
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
          </TabContainer>
        </>
      )}
    </Layout>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"]))
  }
});

export default TreePage;

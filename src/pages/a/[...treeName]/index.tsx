import {
  ChevronUpIcon,
  ChevronRightIcon,
  SmallAddIcon
} from "@chakra-ui/icons";
import {
  Button,
  Heading,
  Icon,
  IconButton,
  Tooltip,
  VStack
} from "@chakra-ui/react";
import {
  EditOrgPayload,
  useEditOrgMutation,
  useGetOrgQuery
} from "features/api/orgsApi";
import { useGetSubscriptionQuery } from "features/api/subscriptionsApi";
import { EntityButton, RTEditor } from "features/common";
import { EditIconButton } from "features/common/EditIconButton";
import {
  TabContainer,
  TabContainerHeader,
  TabContainerContent
} from "features/common/TabContainer";
import { TopicsList } from "features/forum/TopicsList";
import { Layout } from "features/layout";
import { useToast } from "hooks/useToast";
import { sanitize } from "isomorphic-dompurify";
import { EOrgType, orgTypeFull, orgTypeFull2 } from "models/Org";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";
import { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import { useTranslation } from "next-i18next";
import { FaNewspaper } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectUserEmail } from "store/userSlice";
import { transformRTEditorOutput } from "utils/string";

const TreePage = ({ ...props }: PageProps) => {
  const { t } = useTranslation();
  const toast = useToast({ position: "top" });
  const router = useRouter();
  let [
    entityUrl,
    currentTabLabel, // = Object.keys(defaultTabs)[0],
    entityTabItem
  ] =
    "treeName" in router.query && Array.isArray(router.query.treeName)
      ? router.query.treeName
      : [];
  const query = useGetOrgQuery({
    orgUrl: entityUrl,
    populate: "orgTopics"
  });
  const [editOrg] = useEditOrgMutation();
  const org = query.data;
  let orgDescription = org?.orgDescription || { en: "", fr: "" };
  //const orgDescription = org?.orgDescription;
  const email = useSelector(selectUserEmail);
  const subQuery = useGetSubscriptionQuery({ email });

  const [description, setDescription] = useState<string | undefined>(
    org?.orgDescription
  );
  const [html, setHtml] = useState("");
  useEffect(() => {
    if (org) {
      if (!orgDescription) return setDescription(undefined);
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
  const [isThreadsOpen, setIsThreadsOpen] = useState(true);
  const [currentTopicName, setCurrentTopicName] = useState(entityTabItem);
  useEffect(() => {
    setCurrentTopicName(entityTabItem);
  }, [entityTabItem]);
  return (
    <Layout pageTitle={org ? `Tree : ${org.orgName}` : undefined} {...props}>
      <VStack mb={3}>
        <EntityButton org={org} />
      </VStack>

      <TabContainer borderBottomRadius={isDescriptionOpen ? undefined : "lg"}>
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
                  onBlur={(html) => {
                    setHtml(html);
                  }}
                />
                <Button
                  onClick={async () => {
                    setIsAddingDescription(false);
                    const payload: EditOrgPayload = {
                      orgDescription: {
                        fr: router.locale === "fr" ? html : orgDescription.fr,
                        en: router.locale === "en" ? html : orgDescription.en
                      }
                    };
                    await editOrg({ payload, org }).unwrap();
                    toast({ title: "Success" });
                  }}
                >
                  Modifier
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
                label={`Ajouter une présentation ${orgTypeFull2(org?.orgType)}`}
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

          <Heading size="sm">Threads</Heading>
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
    </Layout>
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"]))
  }
});

export default TreePage;

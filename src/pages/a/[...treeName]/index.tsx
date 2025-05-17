import { marked, MarkedOptions } from "marked";
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  SmallAddIcon
} from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftAddon,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  VStack
} from "@chakra-ui/react";
import {
  DeleteOrgParams,
  EditOrgPayload,
  getOrg,
  useDeleteOrgMutation,
  useEditOrgMutation,
  useGetOrgQuery
} from "features/api/orgsApi";
import { useGetSubscriptionQuery } from "features/api/subscriptionsApi";
import {
  DeleteButton,
  DeleteIconButton,
  EntityAddButton,
  EntityButton,
  Link,
  RTEditor,
  SelectionPopover
} from "features/common";
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
  normalize,
  transformRTEditorOutput,
  WIKI_URL
} from "utils/string";
import { localize } from "utils/localize";
import { hasItems } from "utils/array";
import { css } from "@emotion/react";
import { useSession } from "hooks/useSession";
import { getRefId } from "models/Entity";
import { wrapper } from "store";
import { getRunningQueriesThunk } from "features/api";

const initialOrgQueryParams = (entityUrl: string) => ({
  orgUrl: entityUrl,
  populate: "orgs orgNotes"
});

const Description = ({ description, onClick }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { t } = useTranslation();
  const [showPopover, setShowPopover] = useState(false);

  return (
    <>
      <Alert status="info" w="30%" m="0 auto">
        <AlertIcon />
        <Flex>{t("select")}</Flex>
      </Alert>
      {/* <div data-selectable>yadyayda</div> */}
      <Box
        data-selectable
        className="rteditor"
        dangerouslySetInnerHTML={{
          __html: sanitize(description)
        }}
        bg={`rgba(${isDark ? "255,255,255,0.1" : "0,0,0,0.1"})`}
        borderRadius={12}
        mt={3}
        p={5}
      />
      <SelectionPopover
        showPopover={showPopover}
        onSelect={() => {
          setShowPopover(true);
        }}
        onDeselect={() => {
          setShowPopover(false);
        }}
      >
        <Button
          colorScheme="orange"
          onClick={() => {
            const selection = window.getSelection().toString();
            onClick(selection);
            setShowPopover(false);
          }}
        >
          {t("select-submit")}
        </Button>
      </SelectionPopover>
    </>
  );
};

const TreePage = ({ ...props }: PageProps) => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const keys = [
    { key: "actions", label: "" },
    { key: "createdBy", label: t("created-by") },
    { key: "quote", label: t("key-quote-note") },
    { key: "message", label: t("key-message-note") }
  ];
  const toast = useToast({ position: "top" });
  const [deleteOrg] = useDeleteOrgMutation();
  const [editOrg] = useEditOrgMutation();
  const email = useSelector(selectUserEmail);
  //const subQuery = useGetSubscriptionQuery({ email });

  const router = useRouter();
  let [
    entityUrl,
    currentTabLabel, // = Object.keys(defaultTabs)[0],
    entityTabItem
  ] = router.query.treeName;
  const query = useGetOrgQuery(initialOrgQueryParams(entityUrl));
  const org = query.data;
  console.log("🚀 ~ TreePage ~ org:", org);
  const orgName = localize(org?.orgName);
  const orgDescription = localize(
    org?.orgDescription || { en: "", fr: "" },
    router.locale
  );
  const suborg = org?.orgs?.find(({ orgUrl }) => orgUrl === entityTabItem);

  const [isBranch, setIsBranch] = useState(
    currentTabLabel === "b" && !!entityTabItem
  );

  const [description, setDescription] = useState<string | undefined>();
  useEffect(() => {
    if (org) {
      let orgDesc = localize(org?.orgDescription, router.locale);
      const newDoc = isMobile
        ? transformRTEditorOutput(orgDesc)
        : new DOMParser().parseFromString(orgDesc, "text/html");
      setDescription(newDoc.body.innerHTML);
    }
    // if (org) {
    //   //if (!orgDescription) return setDescription(undefined);
    //   const newDoc = isMobile
    //     ? transformRTEditorOutput(orgDescription[router.locale])
    //     : new DOMParser().parseFromString(
    //         orgDescription[router.locale],
    //         "text/html"
    //       );
    //   const newDescription = newDoc.body.innerHTML;
    //   if (description !== newDescription) setDescription(newDescription);
    // }
  }, [org, router.locale]);

  const [isAddingDescription, setIsAddingDescription] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(
    currentTabLabel !== "t"
  );
  const [isBranchesOpen, setIsBranchesOpen] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [comment, setComment] = useState<
    { orgNoteId: string; orgNoteMessage?: string } | undefined
  >();

  // const [isThreadsOpen, setIsThreadsOpen] = useState(true);
  // const [currentTopicName, setCurrentTopicName] = useState(entityTabItem);

  useEffect(() => {
    setIsBranch(router.asPath.includes("/b/"));

    // if (currentTabLabel === "t") setCurrentTopicName(entityTabItem);
    // else
    if (currentTabLabel === "b") {
    }
  }, [entityTabItem]);

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
        <Box m={3}>
          <VStack mb={3}>
            <EntityButton org={org} suborg={suborg} />
            <Link
              href={suborg ? "/" : WIKI_URL + "/" + orgName + "/" + orgName}
              target="_blank"
            >
              {t("wiki")}
            </Link>
            <Link
              href={
                suborg ? "/" : MD_URL + "/" + orgName + "/" + orgName + ".md"
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
              <TabContainerContent p={3}>
                {isAddingDescription ? (
                  <>
                    <RTEditor
                      defaultValue={orgDescription}
                      onChange={({ html }) => {
                        setDescription(html);
                      }}
                    />
                    <HStack justifyContent="space-between" mt={3}>
                      <Button
                        colorScheme="red"
                        onClick={() => setIsAddingDescription(false)}
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        colorScheme="green"
                        onClick={async () => {
                          setIsAddingDescription(false);
                          const payload: EditOrgPayload = {
                            orgDescription: {
                              ...org.orgDescription,
                              [router.locale]: description
                            }
                          };
                          await editOrg({ payload, org }).unwrap();
                          toast({ title: t("success") });
                        }}
                      >
                        {t("submit")}
                      </Button>
                    </HStack>
                  </>
                ) : description && description.length > 0 ? (
                  <Description
                    description={description}
                    onClick={async (selection) => {
                      await editOrg({
                        payload: {
                          orgNotes: (org.orgNotes || [])
                            .concat([
                              {
                                quote: selection,
                                createdAt: new Date(),
                                createdBy: session.user.userId
                              }
                            ])
                            .map(({ _id, ...orgNote }) => orgNote)
                        },
                        org
                      }).unwrap();
                      toast({ status: "success", title: t("success") });
                    }}
                  />
                ) : true ? (
                  <Tooltip
                    placement="right"
                    label={`Ajouter une description ${orgTypeFull2(
                      org?.orgType
                    )}`}
                  >
                    <IconButton
                      aria-label={`Ajouter une description ${orgTypeFull2(
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
                    {hasItems(org?.orgs) &&
                      org.orgs.map((suborg) => {
                        return <EntityButton org={org} suborg={suborg} />;
                      })}
                    {!hasItems(org?.orgs) && (
                      <EntityAddButton org={org} orgType={EOrgType.GENERIC} />
                    )}
                  </VStack>
                </TabContainerContent>
              )}
            </TabContainer>
          )}

          <TabContainer>
            <TabContainerHeader
              borderBottomRadius={isNotesOpen ? undefined : "lg"}
              onClick={() => setIsNotesOpen(!isNotesOpen)}
            >
              <Icon
                as={isNotesOpen ? ChevronUpIcon : ChevronRightIcon}
                boxSize={6}
                ml={3}
                mr={1}
              />
              <Heading size="sm">Notes</Heading>
            </TabContainerHeader>

            {isNotesOpen && (
              <TabContainerContent p={3}>
                {query.data && (
                  <VStack>
                    <Table
                      colorScheme="white"
                      css={css`
                        width: 90%;
                        th {
                          font-size: ${isMobile ? "11px" : "inherit"};
                          padding: ${isMobile ? 0 : "4px"};
                        }
                        td {
                          padding: ${isMobile ? "8px 0" : "8px"};
                          padding-right: ${isMobile ? "4px" : "8px"};
                          button {
                            font-size: ${isMobile ? "13px" : "inherit"};
                          }
                        }
                      `}
                    >
                      <Thead>
                        <Tr>
                          {keys.map(({ key, label }) => {
                            return (
                              <Th
                                key={key}
                                //color={isDark ? "white" : "black"}
                                cursor="pointer"
                                //onClick={() => setSelectedOrder(key)}
                                {...(key === "actions"
                                  ? { w: "25px" }
                                  : key === "message"
                                  ? { w: comment ? "50%" : undefined }
                                  : {})}
                              >
                                {label}

                                {/* {selectedOrder ? (
                                  selectedOrder.key === key ? (
                                    selectedOrder.order === "desc" ? (
                                      <ChevronUpIcon {...iconProps} />
                                    ) : (
                                      <ChevronDownIcon {...iconProps} />
                                    )
                                  ) : (
                                    ""
                                  )
                                ) : key === "message" ? (
                                  <ChevronDownIcon {...iconProps} />
                                ) : (
                                  ""
                                )} */}
                              </Th>
                            );
                          })}
                        </Tr>
                      </Thead>

                      <Tbody>
                        {org.orgNotes.map(
                          ({ _id, quote, message, createdBy }) => {
                            const tdProps = { p: isMobile ? 0 : undefined };
                            return (
                              <Tr key={`note-${_id}`}>
                                <Td {...tdProps}>
                                  <DeleteIconButton
                                    label={t("delete-note")}
                                    size="xs"
                                    onClick={async () => {
                                      await editOrg({
                                        payload: {
                                          orgNotes: org.orgNotes.filter(
                                            (orgNote) => orgNote._id !== _id
                                          )
                                        },
                                        org
                                      }).unwrap();
                                    }}
                                  />
                                </Td>
                                <Td {...tdProps}>
                                  {typeof createdBy === "object" &&
                                    createdBy.userName}
                                </Td>
                                <Td {...tdProps}>
                                  <Text>{quote}</Text>
                                </Td>
                                <Td {...tdProps}>
                                  {comment && comment.orgNoteId === _id ? (
                                    <InputGroup>
                                      <InputLeftAddon
                                        children={<CheckCircleIcon />}
                                        onClick={async () => {
                                          const payload: EditOrgPayload = {
                                            orgNotes: org.orgNotes.map(
                                              (orgNote) => {
                                                if (
                                                  orgNote._id ===
                                                  comment.orgNoteId
                                                )
                                                  return {
                                                    ...orgNote,
                                                    message:
                                                      comment.orgNoteMessage
                                                  };

                                                return orgNote;
                                              }
                                            )
                                          };
                                          await editOrg({
                                            payload,
                                            org
                                          }).unwrap();
                                          setComment(undefined);
                                        }}
                                      />
                                      <Input
                                        defaultValue={comment.orgNoteMessage}
                                        onChange={(e) =>
                                          setComment({
                                            ...comment,
                                            orgNoteMessage: e.target.value
                                          })
                                        }
                                      />
                                    </InputGroup>
                                  ) : (
                                    <>
                                      <EditIconButton
                                        label={t("edit-note")}
                                        onClick={() => {
                                          setComment({
                                            orgNoteId: _id,
                                            orgNoteMessage: message
                                          });
                                        }}
                                      />
                                      <Text>{message}</Text>
                                    </>
                                  )}
                                </Td>
                              </Tr>
                            );
                          }
                        )}
                      </Tbody>
                    </Table>
                  </VStack>
                )}
              </TabContainerContent>
            )}
          </TabContainer>

          {session?.user.userId === getRefId(org) && (
            <HStack justifyContent="center" mb={3}>
              <DeleteButton
                label={t("delete")}
                onClick={async () => {
                  const params: DeleteOrgParams = { orgId: org._id };
                  await deleteOrg(params).unwrap();
                }}
              />
            </HStack>
          )}
        </Box>
      )}
    </Layout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (ctx) => {
    if (
      Array.isArray(ctx.query.name) &&
      typeof ctx.query.name[0] === "string"
    ) {
      const entityUrl = ctx.query.name[0];
      const normalizedEntityUrl = normalize(entityUrl);
      if (entityUrl !== normalizedEntityUrl)
        return {
          redirect: { permanent: false, destination: "/" + normalizedEntityUrl }
        };

      store.dispatch(getOrg.initiate(initialOrgQueryParams(entityUrl)));

      const [orgQuery] = await Promise.all(
        store.dispatch(getRunningQueriesThunk())
      );
    }

    const { locale } = ctx;

    return {
      props: {
        ...(await serverSideTranslations(locale ?? "en", ["common"]))
      }
    };
  }
);

export default TreePage;

{
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

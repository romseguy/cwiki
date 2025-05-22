import {
  ArrowBackIcon,
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
  FormControl,
  FormLabel,
  HStack,
  Heading,
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
  VStack,
  useColorMode
} from "@chakra-ui/react";
import { css } from "@emotion/react";
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
import { FooterControl } from "features/common/forms/FooterControl";
import { Layout } from "features/layout";
import { useSession } from "hooks/useSession";
import { useToast } from "hooks/useToast";
import { sanitize } from "isomorphic-dompurify";
import { getRefId } from "models/Entity";
import { EOrgType, orgTypeFull2 } from "models/Org";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { useForm } from "react-hook-form";
import { FaNewspaper, FaTree } from "react-icons/fa";
import { wrapper } from "store";
import { hasItems } from "utils/array";
import { localize } from "utils/localize";
import {
  MD_URL,
  WIKI_URL,
  normalize,
  transformRTEditorOutput
} from "utils/string";

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
      <Alert
        status="info"
        {...(isMobile ? {} : { m: "0 auto", w: "30%", minW: "300px" })}
      >
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
  const toast = useToast({ position: "top" });
  const [deleteOrg] = useDeleteOrgMutation();
  const [editOrg] = useEditOrgMutation();
  const { t } = useTranslation();
  const keys = [
    //{ key: "actions", label: "" },
    { key: "createdBy", label: t("created-by") },
    { key: "quote", label: t("key-quote-n") },
    { key: "message", label: t("key-message-n") }
  ];
  const router = useRouter();
  const [currentTabLabel, setCurrentTabLabel] = useState("");
  const [currentBranchAction, setCurrentBranchAction] = useState("");
  // console.log("🚀 ~ TreePage ~ currentTabLabel:", currentTabLabel);
  const [entityTabItem, setEntityTabItem] = useState("");

  const [isAddingDescription, setIsAddingDescription] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(
    currentTabLabel !== "t"
  );
  const [isBranchesOpen, setIsBranchesOpen] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [comment, setComment] = useState<
    { orgNoteId: string; orgNoteMessage?: string } | undefined
  >();

  const query = useGetOrgQuery(initialOrgQueryParams(router.query.treeName[0]));
  const org = query.data;
  console.log("🚀 ~ TreePage ~ org:", org);
  const orgName = localize(org?.orgName);
  const isCreator = getRefId(org) === session?.user.userId;
  console.log(
    "🚀 ~ TreePage ~ isCreator:",
    isCreator,
    getRefId(org),
    session?.user.userId
  );
  let suborg = org?.orgs?.find(({ orgUrl }) => orgUrl === entityTabItem);
  console.log("🚀 ~ TreePage ~ suborg:", suborg);
  const orgDescription = localize(
    suborg
      ? suborg.orgDescription || { en: "", fr: "" }
      : org
      ? org.orgDescription || { en: "", fr: "" }
      : { en: "", fr: "" },
    router.locale
  );
  // // // // console.log("🚀 ~ TreePage ~ orgDescription:", orgDescription);
  const [description, setDescription] = useState<string | undefined>();
  // // // console.log("🚀 ~ TreePage ~ description:", description);
  let notes = (suborg ? suborg.orgNotes : org ? org.orgNotes : []) || [];

  // const [isThreadsOpen, setIsThreadsOpen] = useState(true);
  // const [currentTopicName, setCurrentTopicName] = useState(entityTabItem);

  useEffect(() => {
    // // console.log("🚀 ~ TreePage ~ onRouterQueryChange:", router.query);
    setCurrentTabLabel(router.query.treeName[1]);
    setEntityTabItem(router.query.treeName[2]);
    setCurrentBranchAction(router.query.treeName[3]);
    if (!entityTabItem) {
      suborg = undefined;
    }
  }, [router.query]);
  useEffect(() => {
    notes = suborg ? suborg.orgNotes : org ? org.orgNotes : [];
    transformDescription();
    function transformDescription() {
      let newDesc = "";
      if (isMobile) {
        newDesc = transformRTEditorOutput(orgDescription).body.innerHTML;
      } else {
        newDesc = new DOMParser().parseFromString(orgDescription, "text/html")
          .body.innerHTML;
      }
      // // console.log("🚀 ~ transformDescription ~ newDesc:", newDesc);
      setDescription(newDesc);
    }
  }, [org, suborg, router.locale]);

  return (
    <Layout
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
                  {(suborg || currentTabLabel === "edit") && (
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
                  <HStack>
                    {currentTabLabel !== "edit" && (
                      <EntityButton org={org} suborg={suborg} />
                    )}

                    {currentTabLabel !== "edit" && isCreator && (
                      <>
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
                        <DeleteButton
                          isIconOnly
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
                      </>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              {currentTabLabel !== "edit" && (
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

            {currentTabLabel !== "edit" && currentBranchAction !== "edit" && (
              <>
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

                    {isCreator && (
                      <EditIconButton
                        aria-label="Modifier"
                        colorScheme="white"
                        placement="right"
                        ml={3}
                        {...(isMobile ? {} : {})}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddingDescription(true);
                        }}
                      />
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
                                    ...(suborg
                                      ? suborg?.orgDescription || {
                                          en: "",
                                          fr: ""
                                        }
                                      : org.orgDescription),
                                    [router.locale || "en"]: description
                                  }
                                };
                                await editOrg({
                                  payload,
                                  org: suborg || org
                                }).unwrap();
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
                            const createdBy = session
                              ? {
                                  _id: session.user.userId
                                }
                              : { userName: "anonymous" };
                            await editOrg({
                              payload: {
                                orgNotes: (org.orgNotes || [])
                                  .concat([
                                    {
                                      quote: selection,
                                      createdAt: new Date(),
                                      createdBy
                                    }
                                  ])
                                  .map(({ _id, ...orgNote }) => orgNote)
                              },
                              org
                            }).unwrap();
                            toast({ status: "success", title: t("success") });
                          }}
                        />
                      ) : isCreator ? (
                        <Tooltip placement="right" label={t("add-n")}>
                          <IconButton
                            aria-label={t("add-n")}
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
                        <Text fontStyle="italic">
                          Aucune description.{" "}
                          <Link href="/login" variant="underline">
                            Connectez-vous
                          </Link>{" "}
                          pour en écrire une.
                        </Text>
                      )}
                    </TabContainerContent>
                  )}
                </TabContainer>

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
                                <HStack>
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
                              <Link href="/login" variant="underline">
                                Connectez-vous
                              </Link>{" "}
                              pour en ajouter une.
                            </Text>
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
                      {query.isLoading && <Spinner />}
                      {!query.isLoading && hasItems(notes) && (
                        <VStack>
                          {hasItems(notes) && (
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
                                {notes.map(
                                  ({ _id, quote, message, ...orgNote }) => {
                                    const createdBy = orgNote.createdBy;
                                    const createdById = getRefId(orgNote);
                                    const isNoteCreator =
                                      createdById === session?.user.userId;
                                    const tdProps = {
                                      p: isMobile ? 0 : undefined
                                    };
                                    return (
                                      <Tr key={`note-${_id}`}>
                                        <Td {...tdProps}>
                                          {isNoteCreator && (
                                            <DeleteIconButton
                                              label={t("delete-n")}
                                              size="xs"
                                              mr={1}
                                              onClick={async () => {
                                                await editOrg({
                                                  payload: {
                                                    orgNotes: notes.filter(
                                                      (orgNote) =>
                                                        orgNote._id !== _id
                                                    )
                                                  },
                                                  org
                                                }).unwrap();
                                              }}
                                            />
                                          )}
                                          {typeof createdBy === "object" &&
                                            createdBy.userName}
                                        </Td>
                                        <Td {...tdProps}>
                                          <Text>{quote}</Text>
                                        </Td>
                                        <Td {...tdProps}>
                                          {comment &&
                                          comment.orgNoteId === _id ? (
                                            <InputGroup>
                                              <InputLeftAddon
                                                children={<CheckCircleIcon />}
                                                onClick={async () => {
                                                  const payload: EditOrgPayload =
                                                    {
                                                      orgNotes:
                                                        org.orgNotes.map(
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
                                                defaultValue={
                                                  comment.orgNoteMessage
                                                }
                                                onChange={(e) =>
                                                  setComment({
                                                    ...comment,
                                                    orgNoteMessage:
                                                      e.target.value
                                                  })
                                                }
                                              />
                                            </InputGroup>
                                          ) : (
                                            <>
                                              {isNoteCreator && (
                                                <EditIconButton
                                                  label={t("edit-n")}
                                                  size="xs"
                                                  onClick={() => {
                                                    setComment({
                                                      orgNoteId: _id,
                                                      orgNoteMessage: message
                                                    });
                                                  }}
                                                />
                                              )}
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
                          )}
                          {!hasItems(notes) && (
                            <Text fontStyle="italic">
                              Aucune notes.{" "}
                              <Link href="/login" variant="underline">
                                Connectez-vous
                              </Link>{" "}
                              pour en ajouter une.
                            </Text>
                          )}
                        </VStack>
                      )}
                      {!query.isLoading && !hasItems(notes) && (
                        <>
                          {isCreator && (
                            <Tooltip placement="right" label={t("add-n")}>
                              <IconButton
                                aria-label={t("add-n")}
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
                          )}
                          {!isCreator && (
                            <Text fontStyle="italic">
                              Aucune notes.{" "}
                              <Link href="/login" variant="underline">
                                Connectez-vous
                              </Link>{" "}
                              pour en ajouter une.
                            </Text>
                          )}
                        </>
                      )}
                      {query.data && (
                        <VStack>
                          {hasItems(notes) && (
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
                                {notes.map(
                                  ({ _id, quote, message, ...orgNote }) => {
                                    const createdBy = orgNote.createdBy;
                                    const createdById = getRefId(orgNote);
                                    const isNoteCreator =
                                      createdById === session?.user.userId;
                                    const tdProps = {
                                      p: isMobile ? 0 : undefined
                                    };
                                    return (
                                      <Tr key={`note-${_id}`}>
                                        <Td {...tdProps}>
                                          {isNoteCreator && (
                                            <DeleteIconButton
                                              label={t("delete-n")}
                                              size="xs"
                                              mr={1}
                                              onClick={async () => {
                                                await editOrg({
                                                  payload: {
                                                    orgNotes: notes.filter(
                                                      (orgNote) =>
                                                        orgNote._id !== _id
                                                    )
                                                  },
                                                  org
                                                }).unwrap();
                                              }}
                                            />
                                          )}
                                          {typeof createdBy === "object" &&
                                            createdBy.userName}
                                        </Td>
                                        <Td {...tdProps}>
                                          <Text>{quote}</Text>
                                        </Td>
                                        <Td {...tdProps}>
                                          {comment &&
                                          comment.orgNoteId === _id ? (
                                            <InputGroup>
                                              <InputLeftAddon
                                                children={<CheckCircleIcon />}
                                                onClick={async () => {
                                                  const payload: EditOrgPayload =
                                                    {
                                                      orgNotes:
                                                        org.orgNotes.map(
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
                                                defaultValue={
                                                  comment.orgNoteMessage
                                                }
                                                onChange={(e) =>
                                                  setComment({
                                                    ...comment,
                                                    orgNoteMessage:
                                                      e.target.value
                                                  })
                                                }
                                              />
                                            </InputGroup>
                                          ) : (
                                            <>
                                              {isNoteCreator && (
                                                <EditIconButton
                                                  label={t("edit-n")}
                                                  size="xs"
                                                  onClick={() => {
                                                    setComment({
                                                      orgNoteId: _id,
                                                      orgNoteMessage: message
                                                    });
                                                  }}
                                                />
                                              )}
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
                          )}
                        </VStack>
                      )}
                    </TabContainerContent>
                  )}
                </TabContainer>
              </>
            )}

            {(currentTabLabel === "edit" || currentBranchAction === "edit") && (
              <EditForm org={org} suborg={suborg} />
            )}
          </>
        )}
        {!query.isLoading && !org && <>{t("not-found-a")}</>}
      </Box>
    </Layout>
  );
};

type FormValues = { treeName: string; formErrorMessage?: string };
const EditForm = ({ org, suborg }) => {
  // // // console.log("🚀 ~ EditForm ~ org:", org);
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast({ position: "top" });
  const [editOrg] = useEditOrgMutation();
  const [isLoading, setIsLoading] = useState(false);
  const defaultValues = {
    treeName: localize(suborg ? suborg.orgName : org.orgName, router.locale)
  };
  const {
    control,
    register,
    handleSubmit,
    errors,
    setError,
    clearErrors,
    setValue,
    getValues,
    formState
  } = useForm<FormValues>({
    defaultValues
  });
  const onSubmit = async (form: { treeName: string }) => {
    console.log("submitted", form);
    setIsLoading(true);
    try {
      const orgName = suborg ? suborg.orgName : org.orgName;
      await editOrg({
        payload: {
          orgName: { ...orgName, [router.locale]: form.treeName }
        },
        org: suborg || org
      }).unwrap();
      toast({ status: "success", title: t("success") });
      setIsLoading(false);
      const href = "/a/" + normalize(form.treeName);
      router.push(href, href, { shallow: true });
    } catch (error) {}
  };
  return (
    <form
      css={css`
        & > div[role="group"] {
          margin-bottom: 12px;
        }
      `}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormControl>
        <FormLabel>{t(suborg ? "name-label-b" : "name-label-a")}</FormLabel>
        <Input
          name="treeName"
          ref={register({
            required: `Veuillez saisir un nom`
          })}
        />
      </FormControl>
      <FooterControl errors={errors} isLoading={isLoading} />
    </form>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (ctx) => {
    if (
      Array.isArray(ctx.query.treeName) &&
      typeof ctx.query.treeName[0] === "string"
    ) {
      const treeName = ctx.query.treeName[0];
      const branchName = ctx.query.treeName[2];
      const normalizedTreeName = normalize(treeName);
      const normalizedBranchName = normalize(branchName);
      if (treeName.toLowerCase() !== normalizedTreeName.toLowerCase())
        return {
          redirect: {
            permanent: false,
            destination: "/" + normalizedTreeName
          }
        };

      if (
        branchName &&
        branchName.toLowerCase() !== normalizedBranchName.toLowerCase()
      )
        return {
          redirect: {
            permanent: false,
            destination: "/" + normalizedTreeName + "/" + normalizedBranchName
          }
        };

      store.dispatch(getOrg.initiate(initialOrgQueryParams(treeName)));

      const [orgQuery] = await Promise.all(
        store.dispatch(getRunningQueriesThunk())
      );

      if (orgQuery.error && orgQuery.error.status === 404) {
        return {
          redirect: {
            permanent: false,
            destination:
              "https://casswiki-quartz.pages.dev/" + treeName + "/" + branchName
          }
        };
      }
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

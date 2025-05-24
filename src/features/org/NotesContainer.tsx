import {
  Icon,
  ChevronUpIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  SmallAddIcon
} from "@chakra-ui/icons";
import {
  Heading,
  Spinner,
  VStack,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  InputGroup,
  InputLeftAddon,
  Input,
  Tooltip,
  IconButton,
  useToast,
  Text
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { EditOrgPayload, useEditOrgMutation } from "features/api/orgsApi";
import {
  TabContainer,
  TabContainerHeader,
  TabContainerContent,
  DeleteIconButton,
  EditIconButton,
  Link
} from "features/common";
import { getRefId } from "models/Entity";
import { useEffect, useState } from "react";
import { FaNewspaper } from "react-icons/fa";
import { hasItems } from "utils/array";
import { useTranslation } from "next-i18next";
import { useSession } from "hooks/useSession";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectIsMobile } from "store/uiSlice";

export const NotesContainer = ({ org, suborg, isCreator, isLoading }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isMobile = useSelector(selectIsMobile);
  const toast = useToast({ position: "top" });
  const { t } = useTranslation();
  const [editOrg] = useEditOrgMutation();
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [comment, setComment] = useState<
    { orgNoteId: string; orgNoteMessage?: string } | undefined
  >();
  const keys = [
    //{ key: "actions", label: "" },
    { key: "createdBy", label: t("created-by") },
    { key: "quote", label: t("key-quote-n") },
    { key: "message", label: t("key-message-n") }
  ];
  let notes = (suborg ? suborg.orgNotes : org ? org.orgNotes : []) || [];
  useEffect(() => {
    notes = suborg ? suborg.orgNotes : org ? org.orgNotes : [];
  }, [org, suborg, router.locale]);

  return (
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
          {isLoading && <Spinner />}
          {!isLoading && !hasItems(notes) && (
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
                    //onClick={() => setIsAddingDescription(true)}
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
          {org && (
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
                    {notes.map(({ _id, quote, message, ...orgNote }) => {
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
                                        (orgNote) => orgNote._id !== _id
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
                            {comment && comment.orgNoteId === _id ? (
                              <InputGroup>
                                <InputLeftAddon
                                  children={<CheckCircleIcon />}
                                  onClick={async () => {
                                    const payload: EditOrgPayload = {
                                      orgNotes: (org.orgNotes || []).map(
                                        (orgNote) => {
                                          if (orgNote._id === comment.orgNoteId)
                                            return {
                                              ...orgNote,
                                              message: comment.orgNoteMessage
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
                    })}
                  </Tbody>
                </Table>
              )}
            </VStack>
          )}
        </TabContainerContent>
      )}
    </TabContainer>
  );
};

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Text,
  Tooltip
} from "@chakra-ui/react";
import { DeleteIconButton, EditIconButton } from "features/common";
import { IEntity, isUser } from "models/Entity";
import { ITopic, isEdit } from "models/Topic";
import { ITopicMessage } from "models/TopicMessage";
import { useRouter } from "next/router";
import React from "react";
import { useSelector } from "react-redux";
import { selectIsMobile } from "store/uiSlice";
import { Session } from "utils/auth";
import * as dateUtils from "utils/date";
import { sanitize } from "utils/string";
import { AppQuery } from "utils/types";

export const TopicMessagesListItem = ({
  refs,
  index,
  isDark,
  isEdit,
  isLoading,
  query,
  mutation,
  session,
  setIsEdit,
  setIsLoading,
  topic,
  topicMessage,
  ...props
}: {
  refs: React.RefObject<any>[];
  index: number;
  isDark: boolean;
  isEdit: isEdit;
  isLoading: Record<string, boolean>;
  mutation: any;
  query: AppQuery<IEntity>;
  session: Session | null;
  setIsEdit: React.Dispatch<React.SetStateAction<isEdit>>;
  setIsLoading: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  topic: ITopic;
  topicMessage: ITopicMessage;
}) => {
  const router = useRouter();
  const isMobile = useSelector(selectIsMobile);
  const [editTopic, editTopicMutation] = mutation;

  //#region topic message
  const { _id, createdBy, createdAt, message } = topicMessage;
  const isU = isUser(createdBy);
  const userName = isU ? createdBy.userName || createdBy._id : createdBy || "";
  const userImage = isU ? createdBy.userImage?.base64 : undefined;
  const userId = isU ? createdBy._id : createdBy;
  const isCreator = userId === session?.user.userId || session?.user.isAdmin;
  const { timeAgo, fullDate } = dateUtils.timeAgo(createdAt);
  //#endregion

  return (
    <Box
      ref={refs[index]}
      key={_id}
      borderRadius={18}
      bg={isDark ? "gray.700" : "#F7FAFC"}
      px={3}
      py={2}
      mb={3}
      data-cy="topic-message"
    >
      <Flex alignItems="start" justifyContent="space-between">
        <Flex alignItems="center">
          <Flex
            alignItems="center"
            cursor="pointer"
            onClick={() =>
              router.push(`/${userName}`, `/${userName}`, { shallow: true })
            }
          >
            <Avatar name={userName} boxSize={10} src={userImage} tabIndex={0} />
            <Text fontWeight="bold" ml={2} tabIndex={0}>
              {userName}
            </Text>
          </Flex>

          <Box as="span" aria-hidden mx={1}>
            ·
          </Box>

          <Tooltip placement="bottom" label={fullDate}>
            <Text fontSize="smaller" suppressHydrationWarning>
              {timeAgo}
            </Text>
          </Tooltip>

          <Box as="span" aria-hidden mx={1}>
            ·
          </Box>

          {isCreator && (
            <>
              <Tooltip placement="bottom" label="Modifier le message">
                <EditIconButton
                  aria-label="Modifier le message"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (_id)
                      setIsEdit({
                        ...isEdit,
                        [_id]: { ...isEdit[_id], isOpen: true }
                      });
                  }}
                />
              </Tooltip>

              <Box as="span" aria-hidden mx={1}>
                ·
              </Box>

              <DeleteIconButton
                isDisabled={query.isLoading || query.isFetching}
                isLoading={typeof _id === "string" && isLoading[_id]}
                placement="bottom"
                header={<>Êtes vous sûr de vouloir supprimer ce message ?</>}
                onClick={async () => {
                  typeof _id === "string" && setIsLoading({ [_id]: true });
                  _id && setIsLoading({ [_id]: true });

                  const payload = {
                    topic: {
                      ...topic,
                      //topicMessages: [{_id}]
                      topicMessages:
                        index === topic.topicMessages.length - 1
                          ? topic.topicMessages.filter((m) => {
                              return m._id !== _id;
                            })
                          : topic.topicMessages.map((m) => {
                              if (m._id === _id) {
                                return {
                                  message: "<i>Message supprimé</i>",
                                  createdBy
                                };
                              }

                              return m;
                            })
                    }
                  };

                  try {
                    await editTopic({
                      payload,
                      topicId: topic._id
                    }).unwrap();

                    _id && setIsLoading({ [_id]: false });
                  } catch (error) {
                    // todo
                    console.error(error);
                  }
                }}
              />
            </>
          )}
        </Flex>

        <Flex flexDir="column">
          {refs[index - 1] && (
            <Button
              aria-label="Message précédent"
              colorScheme="teal"
              leftIcon={<ChevronLeftIcon />}
              height="30px"
              size="sm"
              onClick={() => {
                refs[index - 1].current.scrollIntoView();
              }}
            >
              Message précédent
            </Button>
          )}
          {refs[index + 1] && (
            <Button
              aria-label="Message suivant"
              colorScheme="teal"
              rightIcon={<ChevronRightIcon />}
              height="30px"
              size="sm"
              onClick={() => {
                refs[index + 1].current.scrollIntoView();
              }}
            >
              Message suivant
            </Button>
          )}
        </Flex>
      </Flex>

      <Box className="rteditor" mt={2}>
        <div
          dangerouslySetInnerHTML={{
            // __html: isMobile
            //   ? transformTopicMessage(sanitize(message))
            //   : sanitize(message)
            __html: sanitize(message)
          }}
        />
      </Box>
    </Box>
  );
};

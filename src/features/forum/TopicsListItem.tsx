import {
  ChevronRightIcon,
  ChevronUpIcon,
  CopyIcon,
  EditIcon,
  EmailIcon
} from "@chakra-ui/icons";
import {
  Badge,
  BoxProps,
  Button,
  Icon,
  IconButton,
  Link,
  Table,
  Tbody,
  Tr,
  Td,
  Tooltip,
  Box,
  Flex,
  Spinner,
  Text,
  useToast,
  HStack
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  FaBellSlash,
  FaBell,
  FaChevronDown,
  FaCircle,
  FaSlash,
  FaFolder,
  FaFolderOpen,
  FaThumbtack,
  FaRetweet
} from "react-icons/fa";
import { css } from "@emotion/react";
import {
  DeleteButton,
  DeleteIconButton,
  EditIconButton,
  GridItem,
  PushPinIcon,
  PushPinSlashIcon
} from "features/common";
import { TopicMessageForm } from "features/forms/TopicMessageForm";
import { NotifModalState } from "features/modals/EntityNotifModal";
import { useScroll } from "hooks/useScroll";
import { getCategoryLabel, IEntity, isOrg } from "models/Entity";
import { ITopic, isEdit } from "models/Topic";
import { Session } from "utils/auth";
import * as dateUtils from "utils/date";
import { ServerError } from "utils/errors";
import { normalize } from "utils/string";
import { AppQuery, AppQueryWithData } from "utils/types";
import { TopicMessagesList } from "./TopicMessagesList";
import { TopicsListItemShare } from "./TopicsListItemShare";
import { TopicsListItemSubscribers } from "./TopicsListItemSubscribers";
import { TopicsListItemVisibility } from "./TopicsListItemVisibility";
import {
  useAddSubscriptionMutation,
  useDeleteSubscriptionMutation
} from "features/api/subscriptionsApi";
import {
  useEditTopicMutation,
  useDeleteTopicMutation
} from "features/api/topicsApi";
import { ISubscription } from "models/Subscription";
import { TopicModalState } from "./TopicsList";
import { removeProps } from "utils/object";

interface TopicsListItemProps {
  baseUrl?: string;
  isMobile: boolean;
  session: Session | null;
  currentTopicName?: string;
  isCreator: boolean;
  isSubbedToTopic: boolean;
  isCurrent: boolean;
  isTopicCreator: boolean;
  isDark: boolean;
  query: AppQueryWithData<IEntity>;
  subQuery: AppQuery<ISubscription>;
  //isLoading: boolean;
  //setIsLoading: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  // selectedCategories?: string[];
  // setSelectedCategories: React.Dispatch<
  //   React.SetStateAction<string[] | undefined>
  // >;
  topic: ITopic;
  topicIndex: number;
  // notifyModalState: NotifModalState<ITopic>;
  // setNotifyModalState: React.Dispatch<
  //   React.SetStateAction<NotifModalState<ITopic>>
  // >;
  topicModalState: TopicModalState;
  setTopicModalState: React.Dispatch<React.SetStateAction<TopicModalState>>;
  // topicCopyModalState: TopicModalState;
  // setTopicCopyModalState: React.Dispatch<React.SetStateAction<TopicModalState>>;
  onClick?: (topic: ITopic, isCurrent: boolean) => void;
  // onDeleteClick: (topic: ITopic, isCurrent: boolean) => void;
  // onEditClick: (topic: ITopic) => void;
  // onNotifClick: (topic: ITopic) => void;
  // onSubscribeClick: (topic: ITopic, isSubbedToTopic: boolean) => void;
}

export const TopicsListItem = ({
  isMobile,
  session,
  currentTopicName,
  isCreator,
  isCurrent,
  isDark,
  isSubbedToTopic,
  isTopicCreator,
  query,
  subQuery,
  //isLoading,
  //setIsLoading,
  selectedCategories,
  setSelectedCategories,
  topic,
  topicIndex,
  // notifyModalState,
  // setNotifyModalState,
  topicModalState,
  setTopicModalState,
  // topicCopyModalState,
  // setTopicCopyModalState,
  // onClick,
  // onDeleteClick,
  // onEditClick,
  // onNotifClick,
  // onSubscribeClick,
  ...props
}: BoxProps & TopicsListItemProps) => {
  const router = useRouter();
  const toast = useToast({ position: "top" });
  const [executeScroll, elementToScrollRef] = useScroll<HTMLDivElement>();
  const [addSubscription] = useAddSubscriptionMutation();
  const [deleteSubscription] = useDeleteSubscriptionMutation();
  const [editTopic, editTopicMutation] = useEditTopicMutation();
  const [deleteTopic] = useDeleteTopicMutation();

  //#region entity
  const entity = query.data;
  //const isE = isEvent(entity);
  const isO = isOrg(entity);
  const baseUrl =
    props.baseUrl ||
    `/a/${/*isE ? entity.eventUrl :*/ isO ? entity.orgUrl : entity._id}/t`;
  const topicCategories = /*isE
    ? entity.eventTopicCategories
    :*/ isO ? entity.orgTopicCategories : [];
  //#endregion

  //#region topic
  // const hasCategorySelected = !!selectedCategories?.find(
  //   (category) => category === topic.topicCategory
  // );
  const { timeAgo, fullDate } = dateUtils.timeAgo(topic.createdAt, true);
  // const topicCategoryLabel =
  //   typeof topic.topicCategory === "string"
  //     ? getCategoryLabel(topicCategories, topic.topicCategory)
  //     : "";
  const topicCreatedByUserName =
    typeof topic.createdBy === "object"
      ? topic.createdBy.userName || topic.createdBy.email?.replace(/@.+/, "")
      : "";
  // const s =
  //   !topic.topicNotifications.length || topic.topicNotifications.length > 1
  //     ? "s"
  //     : "";
  //#endregion

  //#region local
  const [isAnswering, setIsAnswering] = useState(false);
  const [isEdit, setIsEdit] = useState<isEdit>({});
  const isEditing = Object.keys(isEdit).reduce(
    (acc, key) => (isEdit[key] && isEdit[key].isOpen ? ++acc : acc),
    0
  );
  const [isHover, setIsHover] = useState(false);
  const [_isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const isLoading = _isLoading[topic._id];
  //#endregion

  //#region handlers
  const onClick =
    props.onClick ||
    (async () => {
      if (!isCurrent) {
        const url = `${baseUrl}/${normalize(topic.topicName)}`;
        await router.push(url, url, { shallow: true });
        executeScroll();
      } else {
        const url = baseUrl;
        await router.push(url, url, { shallow: true });
      }
    });
  const onDeleteClick = async () => {
    try {
      setIsLoading({
        [topic._id]: true
      });
      const deletedTopic = await deleteTopic(topic._id).unwrap();
      toast({
        title: `${deletedTopic.topicName} a été supprimé !`,
        status: "success"
      });
      router.push(baseUrl, baseUrl, { shallow: true });
    } catch (error: ServerError | any) {
      toast({
        title:
          error.data.message ||
          `La discussion ${topic.topicName} n'a pas pu être supprimée`,
        status: "error"
      });
    } finally {
      setIsLoading({
        [topic._id]: false
      });
    }
  };
  const onEditClick = () => {
    setTopicModalState({
      ...topicModalState,
      isOpen: true,
      topic
    });
  };
  // const onNotifClick = () => {
  //   setNotifyModalState({
  //     ...notifyModalState,
  //     entity: topic
  //   });
  // };
  const onSubscribeClick = async () => {
    if (!subQuery.data || !isSubbedToTopic) {
      try {
        setIsLoading({
          [topic._id]: true
        });
        await addSubscription({
          topics: [
            {
              topic: topic,
              emailNotif: true,
              pushNotif: true
            }
          ],
          user: session?.user.userId
        });
        toast({
          title: `Vous êtes abonné à la discussion ${topic.topicName}`,
          status: "success"
        });
      } catch (error) {
        console.error(error);
        toast({
          title: `Vous n'avez pas pu être abonné à la discussion ${topic.topicName}`,
          status: "error"
        });
      } finally {
        setIsLoading({
          [topic._id]: false
        });
      }
    } else if (isSubbedToTopic) {
      const unsubscribe = confirm(
        `Êtes vous sûr de vouloir vous désabonner de la discussion : ${topic.topicName} ?`
      );

      if (unsubscribe) {
        try {
          setIsLoading({
            [topic._id]: true
          });
          await deleteSubscription({
            subscriptionId: subQuery.data._id,
            topicId: topic._id
          });
          toast({
            title: `Vous êtes désabonné de ${topic.topicName}`,
            status: "success"
          });
        } catch (error) {
          console.error(error);
          toast({
            title: `Vous n'avez pas pu être désabonné à la discussion ${topic.topicName}`,
            status: "error"
          });
        } finally {
          setIsLoading({
            [topic._id]: false
          });
        }
      }
    }
  };
  //#endregion

  useEffect(() => {
    if (isCurrent) {
      executeScroll();
    }
  }, []);

  return (
    <Box ref={elementToScrollRef} {...removeProps(props, ["onClick"])}>
      <Flex
        alignItems={isMobile ? "flex-start" : "center"}
        flexDir={isMobile ? "column" : "row"}
        borderTopRadius="xl"
        borderBottomRadius={!isCurrent ? "lg" : undefined}
        bg={
          topicIndex % 2 === 0
            ? isDark
              ? "gray.600"
              : "orange.200"
            : isDark
            ? "gray.500"
            : "orange.100"
        }
        cursor="pointer"
        py={1}
        _hover={{ bg: isDark ? "#314356" : "orange.300" }}
        onClick={onClick}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {/* Left area */}
        <Flex
          flexDirection="column"
          flexGrow={1}
          //px={2}
          ml={2}
        >
          {/* Header */}
          <Table
            css={css`
              td {
                border: none;
                padding: 0;
              }
              td:last-of-type {
                width: 100%;
              }
            `}
          >
            <Tbody>
              <Tr>
                <Td>
                  <Tooltip label={`${topic.topicMessages.length} message(s)`}>
                    <Box pos="relative" mr={3}>
                      {isCurrent ? (
                        <Icon
                          as={FaFolderOpen}
                          //alignSelf="center"
                          boxSize={7}
                          color={isDark ? "teal.200" : "teal"}
                        />
                      ) : (
                        <Icon
                          as={FaFolder}
                          boxSize={7}
                          color={isDark ? "teal.200" : "teal"}
                        />
                      )}
                      {topic.topicMessages.length > 0 && (
                        <Badge
                          bgColor={isDark ? "teal.600" : "teal.100"}
                          color={isDark ? "white" : "black"}
                          pos="absolute"
                          variant="solid"
                          left={1}
                        >
                          {topic.topicMessages.length}
                        </Badge>
                      )}
                    </Box>
                  </Tooltip>
                </Td>

                {/* <Td>
                  <HStack>
                    {topic.topicCategory && (
                      <Tooltip
                        label={
                          !hasCategorySelected
                            ? `Afficher les discussions de la catégorie ${topicCategoryLabel}`
                            : ""
                        }
                        hasArrow
                      >
                        <Button
                          //alignSelf="flex-start"
                          colorScheme={hasCategorySelected ? "pink" : "teal"}
                          size="sm"
                          fontSize="small"
                          fontWeight="normal"
                          height="auto"
                          py={1}
                          px={1}
                          onClick={(e) => {
                            e.stopPropagation();

                            if (hasCategorySelected)
                              setSelectedCategories(
                                selectedCategories!.filter(
                                  (category) => category !== topic.topicCategory
                                )
                              );
                            else if (topic.topicCategory)
                              setSelectedCategories([
                                ...(selectedCategories || []),
                                topic.topicCategory
                              ]);
                          }}
                        >
                          {topicCategoryLabel}
                        </Button>
                      </Tooltip>
                    )}

                    
                  </HStack>
                </Td> */}

                <Td>
                  <Text fontWeight="bold">{topic.topicName}</Text>
                </Td>
              </Tr>
            </Tbody>
          </Table>

          {/* SubHeader */}
          <Flex
            alignItems="center"
            flexWrap="wrap"
            fontSize="smaller"
            color={isDark ? "white" : "purple"}
            ml={10}
          >
            <Tooltip label="Aller à la page de l'utilisateur">
              <Link
                href={`/${topicCreatedByUserName}`}
                _hover={{
                  color: isDark ? "white" : "white",
                  textDecoration: "underline"
                }}
              >
                {topicCreatedByUserName}
              </Link>
            </Tooltip>

            <Box as="span" aria-hidden mx={1}>
              ·
            </Box>

            <Tooltip
              placement="bottom"
              label={`Discussion créée le ${fullDate}`}
            >
              <Text
                cursor="default"
                // _hover={{
                //   color: isDark ? "white" : "white"
                // }}
                onClick={(e) => e.stopPropagation()}
                suppressHydrationWarning
              >
                {timeAgo}
              </Text>
            </Tooltip>

            {/* <Box as="span" aria-hidden mx={1}>
              ·
            </Box> */}

            {/* <TopicsListItemVisibility
              query={query}
              topic={topic}
              //icon props
              color={isDark ? "white" : "purple"}
              cursor="default"
              css={css`
                vertical-align: middle;
              `}
              onClick={(e) => e.stopPropagation()}
            /> */}

            {/* <Box as="span" aria-hidden mx={1}>
              ·
            </Box> */}

            {/* <TopicsListItemShare
              aria-label="Partager la discussion"
              topic={topic}
              color={isDark ? "white" : "purple"}
            /> */}

            {isCreator && (
              <>
                <Box as="span" aria-hidden mx={1}>
                  ·
                </Box>
                {/* <Link
                      _hover={{
                        color: isDark ? "white" : "white",
                        textDecoration: "underline"
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNotifClick(topic);
                      }}
                    > */}
                {/* <Text cursor="default" onClick={(e) => e.stopPropagation()}>
                  {topic.topicNotifications.length} membre{s} invité{s}
                </Text> */}
                {/* </Link> */}
              </>
            )}
          </Flex>
        </Flex>

        {/* Right area */}
        <Flex
          alignItems="center"
          // pt={3}
          // pb={2}
          ml={2}
          {...(isMobile ? { pb: 1, pt: 3 } : {})}
        >
          {isLoading && <Spinner mr={3} mt={1} mb={2} />}

          {!isLoading && session && (
            <>
              {isCreator && (
                <>
                  <Tooltip
                    placement="bottom"
                    label="Envoyer des invitations à la discussion"
                  >
                    <IconButton
                      aria-label="Envoyer des invitations à la discussion"
                      icon={<EmailIcon />}
                      variant="outline"
                      colorScheme="blue"
                      mr={3}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNotifClick();
                      }}
                    />
                  </Tooltip>

                  {/* <Tooltip placement="bottom" label="Épingler la discussion">
                    <IconButton
                      aria-label="Épingler la discussion"
                      icon={
                        topic.isPinned ? <PushPinSlashIcon /> : <PushPinIcon />
                      }
                      variant="outline"
                      colorScheme="teal"
                      mr={3}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setIsLoading({
                          [topic._id]: true
                        });
                        try {
                          await editTopic({
                            payload: { topic: { isPinned: !topic.isPinned } },
                            topicId: topic._id
                          }).unwrap();
                          query.refetch();
                        } catch (error: ServerError | any) {
                          toast({
                            title:
                              error.data.message ||
                              `La discussion ${topic.topicName} n'a pas pu être épinglée`,
                            status: "error"
                          });
                        } finally {
                          setIsLoading({
                            [topic._id]: false
                          });
                        }
                      }}
                    />
                  </Tooltip> */}

                  {/* <Tooltip placement="bottom" label="Copier la discussion">
                    <IconButton
                      aria-label="Copier la discussion"
                      icon={<CopyIcon />}
                      variant="outline"
                      colorScheme="teal"
                      mr={3}
                      onClick={async (e) => {
                        e.stopPropagation();
                        // setIsLoading({
                        //   [topic._id]: true
                        // });

                        setTopicCopyModalState({ isOpen: true, topic });

                        // setIsLoading({
                        //   [topic._id]: false
                        // });
                      }}
                    />
                  </Tooltip> */}
                </>
              )}

              {isTopicCreator && (
                <>
                  <Tooltip placement="bottom" label="Modifier la discussion">
                    <IconButton
                      aria-label="Modifier la discussion"
                      icon={<EditIcon />}
                      colorScheme="green"
                      variant="outline"
                      mr={3}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick();
                      }}
                    />
                  </Tooltip>

                  <DeleteButton
                    header={
                      <>
                        Êtes vous sûr de vouloir supprimer la discussion
                        <Text display="inline" color="red" fontWeight="bold">
                          {` ${topic.topicName}`}
                        </Text>{" "}
                        ?
                      </>
                    }
                    isIconOnly
                    isSmall={false}
                    label="Supprimer la discussion"
                    mr={3}
                    placement="bottom"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick();
                    }}
                    data-cy="topic-list-item-delete"
                  />
                </>
              )}
            </>
          )}

          {!isLoading && (
            <Flex>
              {session && (
                <Tooltip
                  label={
                    isSubbedToTopic
                      ? "Se désabonner de la discussion"
                      : "S'abonner à la discussion"
                  }
                >
                  <IconButton
                    aria-label={
                      isSubbedToTopic
                        ? "Se désabonner de la discussion"
                        : "S'abonner à la discussion"
                    }
                    icon={isSubbedToTopic ? <FaBellSlash /> : <FaBell />}
                    variant="outline"
                    colorScheme="blue"
                    mr={3}
                    onClick={async (e) => {
                      e.stopPropagation();
                      onSubscribeClick();
                    }}
                    data-cy={
                      isSubbedToTopic
                        ? "topic-list-item-unsubscribe"
                        : "topic-list-item-subscribe"
                    }
                  />
                </Tooltip>
              )}

              <Tooltip
                placement="left"
                label={`${isCurrent ? "Fermer" : "Ouvrir"} la discussion`}
              >
                <IconButton
                  aria-label={`${
                    isCurrent ? "Fermer" : "Ouvrir"
                  } la discussion`}
                  icon={
                    isCurrent ? (
                      <ChevronUpIcon boxSize={9} />
                    ) : (
                      <ChevronRightIcon boxSize={9} />
                    )
                  }
                  bg="transparent"
                  height="auto"
                  minWidth={0}
                  _hover={{
                    background: "transparent",
                    color: isDark ? "teal.100" : "white"
                  }}
                />
              </Tooltip>
            </Flex>
          )}
        </Flex>
      </Flex>

      {isCurrent && (
        <Box bg={isDark ? "#314356" : "orange.50"}>
          {/*
          <GridItem px={3} py={2} data-cy="topic-subscribers">
            <TopicsListItemSubscribers
              topic={topic}
              isSubbedToTopic={isSubbedToTopic}
            />
          </GridItem>
          */}

          <TopicMessagesList
            isEdit={isEdit}
            query={query}
            setIsEdit={setIsEdit}
            topic={topic}
            p={3}
            pb={0}
          />

          {!isEditing && (
            <>
              <Box
                borderBottomRadius="xl"
                p={3}
                pt={0}
                {...(isAnswering
                  ? {}
                  : {
                      display: "flex",
                      justifyContent: "flex-end"
                    })}
              >
                {!isAnswering && (
                  <>
                    {session ? (
                      <Button
                        colorScheme="teal"
                        onClick={() => {
                          setIsAnswering(true);
                        }}
                      >
                        Ajouter un message
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          router.push("/login", "/login", { shallow: true });
                        }}
                      >
                        Se connecter pour ajouter un message
                      </Button>
                    )}
                  </>
                )}

                {isAnswering && (
                  <TopicMessageForm
                    //formats={formats.filter((f) => f !== "size")}
                    isDisabled={topic.topicMessagesDisabled}
                    isLoading={isLoading}
                    query={query}
                    setIsLoading={(bool) => {
                      setIsLoading({ [topic._id]: bool });
                    }}
                    topic={topic}
                    onSubmit={() => {
                      setIsAnswering(false);
                    }}
                  />
                )}
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

TopicsListItem.whyDidYouRender = false;

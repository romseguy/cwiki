import { AddIcon, CheckCircleIcon } from "@chakra-ui/icons";
import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  BoxProps,
  HStack,
  IconButton,
  Select,
  Spinner,
  Text,
  useColorMode
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
//import { useAddTopicNotifMutation } from "features/api/topicsApi";
import { Button } from "features/common";
// import {
//   NotifModalState,
//   EntityNotifModal
// } from "features/modals/EntityNotifModal";
import {
  //TopicCopyFormModal,
  TopicFormModal
} from "features/modals/TopicFormModal";
import { useSession } from "hooks/useSession";
import {
  //getCategoryLabel,
  getRefId,
  IEntity,
  //isEvent,
  isOrg
} from "models/Entity";
import { ISubscription } from "models/Subscription";
import { ETopicsListOrder, ITopic } from "models/Topic";
import { hasItems } from "utils/array";
import { normalize } from "utils/string";
import { AppQuery, AppQueryWithData } from "utils/types";
import { TopicsListItem } from "./TopicsListItem";
import { selectIsMobile } from "store/uiSlice";
import { EditOrgPayload, useEditOrgMutation } from "features/api/orgsApi";
import { useTranslation } from "next-i18next";
//import { useEditEventMutation } from "features/api/eventsApi";

export type TopicModalState = {
  isOpen: boolean;
  topic?: ITopic;
};

export const TopicsList = ({
  query,
  subQuery,
  currentTopicName,
  addButtonLabel,
  ...props
}: Omit<BoxProps, "children"> & {
  children?: ({
    currentTopic
  }: // selectedCategories,
  // setSelectedCategories,
  // notifyModalState,
  // setNotifyModalState,
  // topicModalState,
  // setTopicModalState,
  // topicCopyModalState,
  // setTopicCopyModalState
  {
    currentTopic: ITopic | null;
    // selectedCategories?: string[];
    // setSelectedCategories: React.Dispatch<
    //   React.SetStateAction<string[] | undefined>
    // >;
    // notifyModalState: NotifModalState<ITopic>;
    // setNotifyModalState: React.Dispatch<
    //   React.SetStateAction<NotifModalState<ITopic>>
    // >;
    // topicModalState: TopicModalState;
    // setTopicModalState: React.Dispatch<React.SetStateAction<TopicModalState>>;
    // topicCopyModalState: TopicModalState;
    // setTopicCopyModalState: React.Dispatch<
    //   React.SetStateAction<TopicModalState>
    // >;
  }) => React.ReactNode;
  query: AppQueryWithData<IEntity>;
  subQuery: AppQuery<ISubscription>;
  isCreator: boolean;
  isFollowed?: boolean;
  currentTopicName?: string;
  addButtonLabel?: string;
}) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const isMobile = useSelector(selectIsMobile);
  const router = useRouter();
  const { data: session } = useSession();

  const [editOrg] = useEditOrgMutation();
  //const [editEvent] = useEditEventMutation();
  //const addTopicNotifMutation = useAddTopicNotifMutation();

  //#region local state
  const entity = query.data;
  //const isE = isEvent(entity);
  const isO = isOrg(entity);
  //const edit = isO ? editOrg : editEvent;
  const edit = editOrg;
  // const [selectedCategories, setSelectedCategories] = useState<string[]>();
  // const [selectedLists, setSelectedLists] = useState<IOrgList[]>();
  const defaultOrder = isO
    ? entity.orgTopicOrder
    : /*: isE
    ? entity.eventTopicOrder*/
      ETopicsListOrder.NEWEST;
  const [selectedOrder, setSelectedOrder] = useState<ETopicsListOrder>(
    defaultOrder || ETopicsListOrder.NEWEST
  );
  // const topicCategories = useMemo(
  //   () =>
  //     /*isE
  //       ? entity.eventTopicCategories
  //       :*/ isO ? entity.orgTopicCategories : [] || [],
  //   [entity]
  // );
  const topics = useMemo(() => {
    return (
      /*isE ? entity.eventTopics :*/ (isO ? entity.orgTopics : [])
        .filter((topic: ITopic) => {
          // if (hasItems(selectedCategories) || hasItems(selectedLists)) {
          //   let belongsToCategory = false;
          //   let belongsToList = false;

          //   if (
          //     Array.isArray(selectedCategories) &&
          //     selectedCategories.length > 0
          //   ) {
          //     if (
          //       topic.topicCategory &&
          //       selectedCategories.find(
          //         (selectedCategory) => selectedCategory === topic.topicCategory
          //       )
          //     )
          //       belongsToCategory = true;
          //   }

          //   if (isE || (isO && entity.orgUrl === "forum"))
          //     return belongsToCategory;

          //   if (Array.isArray(selectedLists) && selectedLists.length > 0) {
          //     if (hasItems(topic.topicVisibility)) {
          //       let found = false;

          //       for (let i = 0; i < topic.topicVisibility.length; i++)
          //         for (let j = 0; j < selectedLists.length; j++)
          //           if (selectedLists[j].listName === topic.topicVisibility[i])
          //             found = true;

          //       if (found) belongsToList = true;
          //     }
          //   }

          //   return belongsToCategory || belongsToList;
          // }

          return true;
        })
        .sort((topicA, topicB) => {
          // if (topicA.isPinned && !topicB.isPinned) return -1;
          // if (!topicA.isPinned && topicB.isPinned) return 1;

          if (selectedOrder === ETopicsListOrder.ALPHA)
            return topicA.topicName > topicB.topicName ? 1 : -1;

          if (selectedOrder === ETopicsListOrder.OLDEST)
            return topicA.createdAt! < topicB.createdAt! ? -1 : 1;

          return topicA.createdAt! > topicB.createdAt! ? -1 : 1;
        }) || []
    );
  }, [
    entity,
    //selectedCategories, selectedLists,
    selectedOrder
  ]);
  const currentTopic = useMemo(() => {
    if (
      !currentTopicName ||
      ["ajouter", "a"].includes(currentTopicName) ||
      !hasItems(topics)
    )
      return null;

    const topic = topics.find((topic) => {
      if (normalize(topic.topicName) === normalize(currentTopicName))
        return true;

      return topic._id === currentTopicName;
    });

    return topic || null;
  }, [currentTopicName, topics]);
  // const refs = useMemo(
  //   () =>
  //     topics.reduce((acc: Record<string, React.RefObject<any>>, value) => {
  //       acc[value._id] = React.createRef();
  //       return acc;
  //     }, {}),
  //   [topics]
  // );
  //const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  // useEffect(() => {
  //   if (currentTopic && !isLoading[currentTopic._id]) {
  //     const topicRef = refs[currentTopic._id].current;
  //     if (topicRef) {
  //       topicRef.scrollIntoView({
  //         behavior: "smooth",
  //         block: "start"
  //       });
  //     }
  //   }
  // }, [currentTopic, isLoading]);
  //#endregion

  //#region topic modal state
  const [topicModalState, setTopicModalState] = useState<TopicModalState>({
    isOpen: !!currentTopicName && ["ajouter", "a"].includes(currentTopicName)
  });
  const onClose = () => {
    setTopicModalState({
      ...topicModalState,
      isOpen: false,
      topic: undefined
    });
    // setTopicCopyModalState({
    //   ...topicCopyModalState,
    //   isOpen: false,
    //   topic: undefined
    // });
  };
  const onAddClick = () => {
    if (!session) {
      router.push("/login", "/login", { shallow: true });
      return;
    }

    setTopicModalState({ ...topicModalState, isOpen: true });
  };
  //#endregion

  // const [topicCopyModalState, setTopicCopyModalState] =
  //   useState<TopicModalState>({
  //     isOpen: false
  //   });

  // const [notifyModalState, setNotifyModalState] = useState<
  //   NotifModalState<ITopic>
  // >({});

  return (
    <Flex {...props} flexDirection="column">
      <Flex justifyContent="space-between">
        <Button colorScheme="teal" leftIcon={<AddIcon />} onClick={onAddClick}>
          {addButtonLabel || "Ajouter une discussion"}
        </Button>

        {!!query.data && (
          <HStack>
            <Box w="150px">
              <Select
                defaultValue={defaultOrder}
                onChange={(e) => {
                  //@ts-expect-error
                  setSelectedOrder(e.target.value);
                }}
              >
                <option value={ETopicsListOrder.ALPHA}>A-Z</option>
                {/* <option value={ETopicsListOrder.PINNED}>Épinglé</option> */}
                <option value={ETopicsListOrder.NEWEST}>Plus récent</option>
                <option value={ETopicsListOrder.OLDEST}>Plus ancien</option>
              </Select>
            </Box>
            {props.isCreator && (
              <IconButton
                aria-label="Sauvegarder"
                icon={<CheckCircleIcon />}
                onClick={async () => {
                  try {
                    const payload: EditOrgPayload = {
                      [isO ? "orgTopicOrder" : "eventTopicOrder"]: selectedOrder
                    };
                    const res = await edit({
                      [/*isE ? "eventId" :*/ isO ? "orgId" : "entityId"]:
                        entity._id,
                      payload
                    }).unwrap();
                  } catch (error) {}
                }}
              />
            )}
          </HStack>
        )}
      </Flex>

      {!!query.data && (
        <Box
          mb={5}
          {...(isMobile
            ? {}
            : { display: "flex", justifyContent: "space-between" })}
        >
          {/* {query.data && (props.isCreator || topicCategories.length > 0) && (
            <Flex flexDirection="column" mb={3}>
              <AppHeading smaller>Catégories</AppHeading>

              <TopicsListCategories
                query={query}
                isCreator={props.isCreator}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
              />
            </Flex>
          )} */}

          {/* {isO &&
            session &&
            hasItems(entity.orgLists) && (
              <Flex flexDirection="column" mb={3}>
                <AppHeading smaller>Listes</AppHeading>
                <TopicsListOrgLists
                  org={entity}
                  isCreator={props.isCreator}
                  selectedLists={selectedLists}
                  session={session}
                  setSelectedLists={setSelectedLists}
                  subQuery={subQuery}
                />
              </Flex>
            )} */}
        </Box>
      )}

      {props.children ? (
        props.children({
          currentTopic,
          // selectedCategories,
          // setSelectedCategories,
          // notifyModalState,
          // setNotifyModalState,
          topicModalState,
          setTopicModalState
          // topicCopyModalState,
          // setTopicCopyModalState
        })
      ) : (
        <Box data-cy="topic-list">
          {query.isLoading ? (
            <Spinner />
          ) : !topics.length ? (
            <Alert status="warning" mb={3}>
              <AlertIcon />
              <Flex flexDirection="column">
                <Text>{t("nothing")}</Text>

                {/* {(selectedCategories && selectedCategories.length >= 1) ||
                (selectedLists && selectedLists.length >= 1) ? (
                  <>
                    {selectedLists &&
                    selectedLists.length >= 1 &&
                    selectedCategories &&
                    selectedCategories.length >= 1 ? (
                      <>
                        Aucune discussions appartenant :
                        <List listStyleType="square" ml={5}>
                          <ListItem mb={1}>
                            aux catégories :
                            {selectedCategories.map((catId, index) => (
                              <>
                                <TopicCategoryTag key={index} mx={1}>
                                  {getCategoryLabel(topicCategories, catId)}
                                </TopicCategoryTag>
                                {index !== selectedCategories.length - 1 &&
                                  "ou"}
                              </>
                            ))}
                          </ListItem>
                          <ListItem>
                            aux listes :
                            {selectedLists.map(({ listName }, index) => (
                              <>
                                <TopicCategoryTag mx={1}>
                                  {listName}
                                </TopicCategoryTag>
                                {index !== selectedLists.length - 1 && "ou"}
                              </>
                            ))}
                          </ListItem>
                        </List>
                      </>
                    ) : selectedCategories && selectedCategories.length >= 1 ? (
                      <Box>
                        {selectedCategories.length === 1 ? (
                          <>
                            Aucune discussions appartenant à la catégorie{" "}
                            <TopicCategoryTag>
                              {getCategoryLabel(
                                topicCategories,
                                selectedCategories[0]
                              )}
                            </TopicCategoryTag>
                          </>
                        ) : (
                          <>
                            Aucune discussions appartenant aux catégories
                            {selectedCategories.map((catId, index) => (
                              <>
                                <TopicCategoryTag key={index} mx={1}>
                                  {getCategoryLabel(topicCategories, catId)}
                                </TopicCategoryTag>
                                {index !== selectedCategories.length - 1 &&
                                  "ou"}
                              </>
                            ))}
                          </>
                        )}
                      </Box>
                    ) : selectedLists && selectedLists.length >= 1 ? (
                      <Box>
                        {selectedLists.length === 1 ? (
                          <>
                            Aucune discussions appartenant à la liste{" "}
                            <TopicCategoryTag>
                              {selectedLists[0].listName}
                            </TopicCategoryTag>
                          </>
                        ) : (
                          <>
                            Aucune discussions appartenant aux listes
                            {selectedLists.map(({ listName }, index) => (
                              <>
                                <TopicCategoryTag mx={1}>
                                  {listName}
                                </TopicCategoryTag>
                                {index !== selectedLists.length - 1 && "ou"}
                              </>
                            ))}
                          </>
                        )}
                      </Box>
                    ) : (
                      <>todo</>
                    )}
                  </>
                ) : (
                  <Text>Aucune discussions.</Text>
                )} */}
              </Flex>
            </Alert>
          ) : (
            topics.map((topic, topicIndex) => {
              const isCurrent = topic._id === currentTopic?._id;
              const isTopicCreator =
                props.isCreator || getRefId(topic) === session?.user.userId;
              const isSubbedToTopic = !!subQuery.data?.topics?.find(
                (topicSubscription) => {
                  if (!topicSubscription.topic) return false;
                  return topicSubscription.topic._id === topic._id;
                }
              );

              return (
                <TopicsListItem
                  key={topic._id}
                  isMobile={isMobile}
                  session={session}
                  isCreator={props.isCreator}
                  query={query}
                  subQuery={subQuery}
                  currentTopicName={currentTopicName}
                  topic={topic}
                  topicIndex={topicIndex}
                  isSubbedToTopic={isSubbedToTopic}
                  isCurrent={isCurrent}
                  isTopicCreator={isTopicCreator}
                  isDark={isDark}
                  //isLoading={isLoading[topic._id] || query.isLoading}
                  //setIsLoading={setIsLoading}
                  // selectedCategories={selectedCategories}
                  // setSelectedCategories={setSelectedCategories}
                  // notifyModalState={notifyModalState}
                  // setNotifyModalState={setNotifyModalState}
                  topicModalState={topicModalState}
                  setTopicModalState={setTopicModalState}
                  // topicCopyModalState={topicCopyModalState}
                  // setTopicCopyModalState={setTopicCopyModalState}
                  mb={topicIndex < topics.length - 1 ? 5 : 0}
                  // onClick={onClick}
                  // onDeleteClick={onDeleteClick}
                  // onEditClick={onEditClick}
                  // onNotifClick={onNotifClick}
                  // onSubscribeClick={onSubscribeClick}
                />
              );
            })
          )}
        </Box>
      )}

      {/* {session && (
        <EntityNotifModal
          query={query}
          mutation={addTopicNotifMutation}
          setModalState={setNotifyModalState}
          modalState={notifyModalState}
          session={session}
        />
      )} */}

      {topicModalState.isOpen && (
        <TopicFormModal
          {...topicModalState}
          query={query}
          subQuery={subQuery}
          isCreator={props.isCreator}
          isFollowed={props.isFollowed}
          onCancel={onClose}
          onSubmit={async (topic) => {
            // const topicName = normalize(topic.topicName);
            // const url = `${baseUrl}/${topicName}`;
            // await router.push(url, url, { shallow: true });
            query.refetch();
            onClose();
          }}
          onClose={onClose}
        />
      )}

      {/* {topicCopyModalState.isOpen && (
        <TopicCopyFormModal
          {...topicCopyModalState}
          query={query}
          subQuery={subQuery}
          session={session}
          isCreator={props.isCreator}
          isFollowed={props.isFollowed}
          onCancel={onClose}
          onSubmit={async (topic) => {
            // const topicName = normalize(topic.topicName);
            // const url = `${baseUrl}/${topicName}`;
            // await router.push(url, url, { shallow: true });
            //query.refetch();
            onClose();
          }}
          onClose={onClose}
        />
      )} */}
    </Flex>
  );
};

TopicsList.whyDidYouRender = false;

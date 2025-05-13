import {
  Box,
  BoxProps,
  Button,
  Flex,
  HStack,
  VStack,
  useColorMode
} from "@chakra-ui/react";

import { TopicMessageForm } from "features/forms/TopicMessageForm";
import { useScroll } from "hooks/useScroll";
import { IEntity, isEvent, isOrg } from "models/Entity";
import { ISubscription } from "models/Subscription";
import { ITopic, isEdit } from "models/Topic";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Session } from "utils/auth";
import { normalize } from "utils/string";
import { AppQuery, AppQueryWithData } from "utils/types";
import { TopicMessagesList } from "./TopicMessagesList";
import { TopicModalState } from "./TopicsList";
import {
  TopicsListItemHeader,
  TopicsListItemHeaderDetails
} from "./TopicsListItemHeader";
import { TopicsListItemHeaderButtons } from "./TopicsListItemHeaderButtons";

interface TopicsListItemProps {
  isMobile: boolean;
  session: Session | null;
  currentTopicName?: string;
  setCurrentTopicName: Dispatch<SetStateAction<string>>;
  isCreator: boolean;
  isSubbedToTopic: boolean;
  isCurrent: boolean;
  isTopicCreator: boolean;
  query: AppQueryWithData<IEntity>;
  subQuery: AppQuery<ISubscription>;
  selectedCategories?: string[];
  setSelectedCategories: React.Dispatch<
    React.SetStateAction<string[] | undefined>
  >;
  topic: ITopic;
  topicIndex: number;
  topicModalState: TopicModalState;
  setTopicModalState: React.Dispatch<React.SetStateAction<TopicModalState>>;
}

export const TopicsListItem = ({
  isMobile,
  session,
  currentTopicName,
  setCurrentTopicName,
  isCreator,
  isCurrent,
  isSubbedToTopic,
  isTopicCreator,
  query,
  subQuery,
  selectedCategories,
  setSelectedCategories,
  topic,
  topicIndex,
  topicModalState,
  setTopicModalState,
  ...props
}: Omit<BoxProps, "onClick"> & TopicsListItemProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();
  const [executeScroll, elementToScrollRef] = useScroll<HTMLDivElement>();

  //#region entity
  const entity = query.data;
  //const isE = isEvent(entity);
  const isO = isOrg(entity);
  const baseUrl = `/${
    // isE ? entity.eventUrl :
    isO ? (topic.event ? topic.event.eventUrl : entity.orgUrl) : entity._id
  }/discussions`;
  const topicCategories =
    // isE ? entity.eventTopicCategories :
    isO ? entity.orgTopicCategories : [];
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

  const onClick = async () => {
    if (!isCurrent) {
      setCurrentTopicName(topic.topicName);
      //const url = `${baseUrl}/${normalize(topic.topicName)}`;
      // let url = baseUrl;
      // url += isO && topic.event ? "" : `/${normalize(topic.topicName)}`;

      // await router.push(url, url, { shallow: true });
      // executeScroll();
    } else {
      // const url = baseUrl;
      // await router.push(url, url, { shallow: true });
    }
  };

  useEffect(() => {
    if (isCurrent) {
      executeScroll();
    }
  }, []);

  return (
    <Box ref={elementToScrollRef} {...props}>
      {/*Header */}
      {/* <Flex
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
      > */}
      <Box
        as={isMobile ? VStack : HStack}
        justifyContent="space-between"
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
        _hover={{ bg: isDark ? "#314356" : "orange.300" }}
        pr={isMobile ? 1 : 0}
        pt={isMobile ? 1 : 0}
        onClick={onClick}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        pb={isMobile ? 3 : 0}
      >
        {/* <Flex
          flexDirection="column"
          flexGrow={1}
          //px={2}
          ml={2}
        > */}
        <VStack
          spacing={0}
          width="100%"
          alignItems="flex-start"
          pb={1}
          pl={2}
          pt={isMobile ? 0 : 1}
        >
          <TopicsListItemHeader
            query={query}
            topic={topic}
            isCurrent={isCurrent}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />

          <TopicsListItemHeaderDetails
            query={query}
            topic={topic}
            isCurrent={isCurrent}
          />
        </VStack>

        {/* <TopicsListItemHeaderButtons
          query={query}
          subQuery={subQuery}
          topic={topic}
          executeScroll={executeScroll}
          isCreator={isCreator}
          isCurrent={isCurrent}
          isSubbedToTopic={isSubbedToTopic}
          isTopicCreator={isTopicCreator}
          topicModalState={topicModalState}
          setTopicModalState={setTopicModalState}
        /> */}
      </Box>

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
            query={query}
            topic={topic}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            isTopicLoading={isLoading}
            setIsTopicLoading={setIsLoading}
            px={3}
            pt={3}
          />

          {/* {!isEditing && (
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
          )} */}
        </Box>
      )}
    </Box>
  );
};

TopicsListItem.whyDidYouRender = false;

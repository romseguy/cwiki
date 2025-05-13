import { CalendarIcon, ChatIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Flex,
  FlexProps,
  HStack,
  Icon,
  Link,
  StackProps,
  Text,
  Tooltip,
  VStack,
  useColorMode
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { CategoryTag } from "features/common";
import {
  EEntityCategoryKey,
  IEntity,
  IEntityCategory,
  getCategoryLabel,
  isEvent,
  isOrg
} from "models/Entity";
import { ITopic } from "models/Topic";
import React from "react";
import { FaFolder, FaFolderOpen, FaUserCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { selectIsMobile } from "store/uiSlice";
import { hasItems } from "utils/array";
import * as dateUtils from "utils/date";
import { AppQueryWithData } from "utils/types";
import { TopicsListItemShare } from "./TopicsListItemShare";
import { TopicsListItemVisibility } from "./TopicsListItemVisibility";

interface TopicsListItemHeader {
  isCurrent: boolean;
  query: AppQueryWithData<IEntity>;
  selectedCategories?: string[];
  setSelectedCategories: React.Dispatch<
    React.SetStateAction<string[] | undefined>
  >;
  topic: ITopic;
}

export const TopicsListItemHeader = ({
  isCurrent,
  query,
  selectedCategories,
  setSelectedCategories,
  topic,
  ...props
}: StackProps & TopicsListItemHeader) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const isMobile = useSelector(selectIsMobile);

  //#region entity
  const entity = query.data;
  //const isE = isEvent(entity);
  const isO = isOrg(entity);
  // const event = isO
  //   ? entity.orgEvents.find(({ _id }) => _id === topic.topicName)
  //   : undefined;
  // const isEventTopic = !!event;
  const isEventTopic = false;
  //#endregion

  //#region topic
  // const topicCategories: IEntityCategory[] =
  //   entity[
  //     // isE ? EEntityCategoryKey.eventTopicCategories :
  //     EEntityCategoryKey.orgTopicCategories
  //   ];
  // const hasCategorySelected = !!selectedCategories?.find(
  //   (category) => category === topic.topicCategory
  // );
  // const topicCategoryLabel =
  //   typeof topic.topicCategory === "string"
  //     ? getCategoryLabel(topicCategories, topic.topicCategory)
  //     : "";
  //#endregion

  const title = (
    <Text
      as="span"
      fontWeight="bold"
      {...(isEventTopic
        ? {
            fontSize: "larger",
            pt: 1
          }
        : {})}
    >
      {/* {event ? event.eventName : topic.topicName} */}
      {topic.topicName}
    </Text>
  );

  const elements = (
    <>
      <HStack>
        <Tooltip label={`${topic.topicMessages.length} message(s)`}>
          <Box pos="relative" mt={isMobile ? 0 : 2}>
            <Icon
              as={isCurrent ? FaFolderOpen : FaFolder}
              boxSize={7}
              color={isDark ? "teal.200" : "teal"}
            />

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

        {isO && isEventTopic ? <CalendarIcon /> : <Icon as={ChatIcon} />}

        <VStack spacing={0} alignItems="flex-start" justifyContent="flex-end">
          <HStack>
            <Text
              as="span"
              whiteSpace={!isMobile ? "nowrap" : undefined}
              {...(isEventTopic
                ? {
                    color: isDark ? "teal.200" : "teal",
                    fontWeight: "bold",
                    fontSize: "larger",
                    pt: 1
                  }
                : {})}
            >
              Discussion{isEventTopic && "s de l'événement"} :{" "}
            </Text>
            {title}
          </HStack>

          {/* {!event && topic.topicCategory && (
            <HStack>
              <Text as="span">Catégorie :</Text>
              <Text as="span">
                <CategoryTag
                  bgColor={
                    hasCategorySelected
                      ? isDark
                        ? "pink.200"
                        : "pink.500"
                      : "teal.500"
                  }
                  fontWeight={hasCategorySelected ? "bold" : undefined}
                  tooltipProps={{ placement: "right" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategories(
                      //@ts-expect-error
                      hasCategorySelected ? [] : [topic.topicCategory]
                    );
                  }}
                >
                  {topicCategoryLabel}
                </CategoryTag>
              </Text>
            </HStack>
          )} */}
        </VStack>
      </HStack>
    </>
  );

  if (isMobile)
    return (
      <VStack alignItems="flex-start" spacing={0} {...props}>
        {elements}
      </VStack>
    );

  return <HStack {...props}>{elements}</HStack>;
};

interface TopicsListItemHeaderDetailsProps {
  query: AppQueryWithData<IEntity>;
  topic: ITopic;
  isCurrent: boolean;
}

export const TopicsListItemHeaderDetails = ({
  query,
  topic,
  isCurrent,
  ...props
}: Omit<FlexProps, "onClick"> & TopicsListItemHeaderDetailsProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const isMobile = useSelector(selectIsMobile);

  //#region topic
  const { timeAgo, fullDate } = dateUtils.timeAgo(topic.createdAt, true);
  const topicCreatedByUserName =
    typeof topic.createdBy === "object"
      ? topic.createdBy.userName || topic.createdBy.email?.replace(/@.+/, "")
      : "";
  // const s =
  //   !topic.topicNotifications.length || topic.topicNotifications.length > 1
  //     ? "s"
  //     : "";

  const length = 450;
  let firstMessage;
  if (hasItems(topic.topicMessages)) {
    firstMessage = topic.topicMessages[0].message
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "");
    if (firstMessage.length > length) {
      const sub = firstMessage.substring(0, length);
      firstMessage = sub.substring(0, sub.lastIndexOf(" "));
    }
  }
  //#endregion

  return (
    <VStack alignItems="flex-start">
      {/* first message preview */}
      {!isCurrent && (
        <Box>
          <Text
            fontSize="smaller"
            fontStyle="italic"
            dangerouslySetInnerHTML={{
              __html: !firstMessage ? "" : firstMessage + "..."
            }}
          />
        </Box>
      )}

      <Box>
        <HStack>
          {/* <Tooltip label="Aller à la page de l'utilisateur"> */}
          <FaUserCircle />
          <Link
            href={`/${topicCreatedByUserName}`}
            _hover={{
              color: isDark ? "white" : "white",
              textDecoration: "underline"
            }}
            suppressHydrationWarning
          >
            {topicCreatedByUserName}
          </Link>
          {/* </Tooltip> */}

          {/* <Box as="span" aria-hidden mx={1}>
            ·
          </Box> */}

          {/* <Tooltip placement="bottom" label={`Discussion créée le ${fullDate}`}>
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
          </Tooltip> */}

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
        </HStack>
      </Box>
    </VStack>
  );
};

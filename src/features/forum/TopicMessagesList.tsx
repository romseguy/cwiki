import { Box, useColorMode, FlexProps, Spinner } from "@chakra-ui/react";
import { useToast } from "hooks/useToast";

import React, { useState } from "react";
import { useEditTopicMutation } from "features/api/topicsApi";
import { useSession } from "hooks/useSession";
import { IEntity } from "models/Entity";
import { isEdit, ITopic } from "models/Topic";
import { AppQuery } from "utils/types";
import { TopicMessagesListItem } from "./TopicMessagesListItem";
import { TopicMessagesListItemEdit } from "./TopicMessagesListItemEdit";

export const TopicMessagesList = ({
  query,
  topic,
  isEdit,
  setIsEdit,
  isTopicLoading,
  setIsTopicLoading,
  ...props
}: FlexProps & {
  query: AppQuery<IEntity>;
  topic: ITopic;
  isEdit: isEdit;
  setIsEdit: React.Dispatch<React.SetStateAction<isEdit>>;
  isTopicLoading: boolean;
  setIsTopicLoading: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}) => {
  const { data: session } = useSession();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // https://redux-toolkit.js.org/rtk-query/api/created-api/hooks#signature-1
  const mutation = useEditTopicMutation();

  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  if (!topic) return null;

  return (
    <Box {...props}>
      {isTopicLoading || query.isLoading || query.isFetching ? (
        <Spinner />
      ) : (
        topic.topicMessages.map((topicMessage, index) => {
          const { _id } = topicMessage;
          const isEditing =
            typeof _id === "string" &&
            Object.keys(isEdit).length > 0 &&
            isEdit[_id] &&
            isEdit[_id].isOpen;

          if (isEditing)
            return (
              <TopicMessagesListItemEdit
                key={`topic-messages-list-item-edit-${index}`}
                isEdit={isEdit}
                isLoading={isLoading}
                mutation={mutation}
                setIsEdit={setIsEdit}
                setIsLoading={setIsLoading}
                topic={topic}
                topicMessage={topicMessage}
              />
            );

          return (
            <TopicMessagesListItem
              key={`topic-messages-list-item-${index}`}
              index={index}
              isDark={isDark}
              isEdit={isEdit}
              isLoading={isLoading}
              isTopicLoading={isTopicLoading}
              mutation={mutation}
              query={query}
              session={session}
              setIsEdit={setIsEdit}
              setIsLoading={setIsLoading}
              setIsTopicLoading={setIsTopicLoading}
              topic={topic}
              topicMessage={topicMessage}
              mb={3}
            />
          );
        })
      )}
    </Box>
  );
};

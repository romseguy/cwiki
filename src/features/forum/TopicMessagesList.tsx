import { Box, FlexProps, useColorMode } from "@chakra-ui/react";
import { useEditTopicMutation } from "features/api/topicsApi";
import { useSession } from "hooks/useSession";
import { IEntity } from "models/Entity";
import { ITopic, isEdit } from "models/Topic";
import React, { useState } from "react";
import { AppQuery } from "utils/types";
import { TopicMessagesListItem } from "./TopicMessagesListItem";
import { TopicMessagesListItemEdit } from "./TopicMessagesListItemEdit";

export const TopicMessagesList = ({
  isEdit,
  setIsEdit,
  topic,
  query,
  ...props
}: FlexProps & {
  isEdit: isEdit;
  setIsEdit: React.Dispatch<React.SetStateAction<isEdit>>;
  topic: ITopic;
  query: AppQuery<IEntity>;
}) => {
  const { data: session } = useSession();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // https://redux-toolkit.js.org/rtk-query/api/created-api/hooks#signature-1
  const mutation = useEditTopicMutation();

  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const refs = topic.topicMessages.reduce(
    (acc: React.RefObject<any>[], cur) => {
      return acc.concat([React.createRef()]);
    },
    []
  );

  if (!topic) return null;

  return (
    <Box {...props}>
      {topic.topicMessages.map((topicMessage, index) => {
        const { _id } = topicMessage;
        // const isEditing =
        //   typeof _id === "string" &&
        //   Object.keys(isEdit).length > 0 &&
        //   isEdit[_id] &&
        //   isEdit[_id].isOpen;

        // if (isEditing)
        //   return (
        //     <TopicMessagesListItemEdit
        //       key={`topic-messages-list-item-edit-${index}`}
        //       isEdit={isEdit}
        //       isLoading={isLoading}
        //       mutation={mutation}
        //       setIsEdit={setIsEdit}
        //       setIsLoading={setIsLoading}
        //       topic={topic}
        //       topicMessage={topicMessage}
        //     />
        //   );

        return (
          <TopicMessagesListItem
            key={`topic-messages-list-item-${index}`}
            index={index}
            refs={refs}
            isDark={isDark}
            isEdit={isEdit}
            isLoading={isLoading}
            mutation={mutation}
            query={query}
            session={session}
            setIsEdit={setIsEdit}
            setIsLoading={setIsLoading}
            topic={topic}
            topicMessage={topicMessage}
          />
        );
      })}
    </Box>
  );
};

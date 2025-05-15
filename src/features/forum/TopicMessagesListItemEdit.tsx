import { Button, Flex } from "@chakra-ui/react";
import { RTEditor } from "features/common";
import { useScroll } from "hooks/useScroll";
import { isUser } from "models/Entity";
import { ITopic, isEdit } from "models/Topic";
import { ITopicMessage } from "models/TopicMessage";
import React, { useEffect, useState } from "react";
import { getStoredValue } from "utils/string/getStoredValue";

export const TopicMessagesListItemEdit = ({
  mutation,
  isEdit,
  isLoading,
  setIsEdit,
  setIsLoading,
  topic,
  topicMessage,
  ...props
}: {
  mutation: any;
  isEdit: isEdit;
  isLoading: Record<string, boolean>;
  setIsEdit: React.Dispatch<React.SetStateAction<isEdit>>;
  setIsLoading: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  topic: ITopic;
  topicMessage: ITopicMessage;
}) => {
  const [editTopic, editTopicMutation] = mutation;

  //#region topic message
  const { _id, createdBy, message } = topicMessage;
  const isU = isUser(createdBy);
  //#endregion

  const [executeScroll, elementToScrollRef] = useScroll<HTMLDivElement>();
  const [defaultValue, setDefaultValue] = useState("");
  //const [value, setValue] = useState("");

  useEffect(() => {
    executeScroll();
    const storedValue = getStoredValue(_id);
    if (storedValue) setDefaultValue(storedValue);
    else setDefaultValue(message);
  }, []);

  // for ts
  if (!_id) return null;

  return (
    <Flex ref={elementToScrollRef} flexDirection="column" pt={1} pb={3}>
      <RTEditor
        //formats={formats.filter((f) => f !== "size")}
        defaultValue={defaultValue}
        //value={value}
        height={500}
        onChange={({ html }) => {
          const value = getStoredValue(_id);
          if (value !== html)
            localStorage.setItem(_id, `{"value": ${JSON.stringify(html)}}`);
        }}
        placeholder="Contenu de votre message"
      />

      <Flex alignItems="center" justifyContent="space-between" mt={3}>
        <Button
          onClick={() =>
            setIsEdit({
              ...isEdit,
              [_id]: { ...isEdit[_id], isOpen: false }
            })
          }
        >
          Annuler
        </Button>

        <Button
          colorScheme="green"
          isDisabled={editTopicMutation.isLoading}
          isLoading={editTopicMutation.isLoading}
          onClick={async () => {
            const newMessage = getStoredValue(_id) || defaultValue;
            localStorage.removeItem(_id);
            await editTopic({
              topicId: topic._id,
              payload: {
                topic,
                topicMessage: {
                  _id,
                  message: newMessage
                  //messageHtml: newMessage
                }
              }
            }).unwrap();
            setIsEdit({
              ...isEdit,
              [_id]: { ...isEdit[_id], isOpen: false }
            });
          }}
          data-cy="topic-message-edit-submit"
        >
          Modifier
        </Button>
      </Flex>
    </Flex>
  );
};

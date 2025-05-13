import { ChatIcon, EditIcon, SmallAddIcon } from "@chakra-ui/icons";
import {
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay
} from "@chakra-ui/react";
import { useToast } from "hooks/useToast";

import { Modal } from "features/common";
import { TopicForm } from "features/forms/TopicForm";
import { IEntity } from "models/Entity";
import { ISubscription } from "models/Subscription";
import { ITopic } from "models/Topic";
import React from "react";
import { AppQuery, AppQueryWithData } from "utils/types";

export const TopicFormModal = (props: {
  query: AppQueryWithData<IEntity>;
  subQuery: AppQuery<ISubscription>;
  topic?: ITopic;
  isOpen: boolean;
  isCreator?: boolean;
  isFollowed?: boolean;
  onCancel: () => void;
  onClose: () => void;
  onSubmit: (topic?: Partial<ITopic>) => void;
}) => {
  return (
    <Modal {...props} closeOnOverlayClick={false}>
      <ModalOverlay>
        <ModalContent maxWidth="xl" mt={9}>
          <ModalHeader display="flex" alignItems="center">
            {props.topic ? (
              <>
                <ChatIcon mr={3} />
                <EditIcon mr={2} />
                Modifier la discussion
              </>
            ) : (
              <>
                <ChatIcon mr={3} />
                <SmallAddIcon mr={2} />
                Ajouter une discussion
              </>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TopicForm {...props} />
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
